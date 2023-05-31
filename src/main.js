import { Telegraf, Markup, session,  } from 'telegraf'
import { message } from 'telegraf/filters'
import { code } from 'telegraf/format'
import config from 'config'
import { ogg } from './ogg.js'
import { openai } from './openai.js'
import { clearContext, errorResponse, loadingMessage } from './const.js'

function setInitialSession() {
    return { messages: [] }
}

const bot = new Telegraf(
    config.get(process.env.NODE_ENV === 'development' ? 'TELEGRAM_TOKEN_DEV' : 'TELEGRAM_TOKEN')
)

bot.use(session())

bot.command('start', async (ctx) => {
    ctx.session = setInitialSession()

    await ctx.reply(
        '👋 Привет! Я Telegram бот, разработанный Денисом Ерохиным на платформе Node.js с использованием библиотеки Telegraf.js. Я работаю на базе API OpenAI. Вы можете общаться со мной текстом и голосом.',
        Markup.keyboard([[clearContext]]).resize()
    )
})

bot.hears(clearContext, (ctx) => {
    try {
        ctx.session = setInitialSession()

        ctx.reply('Контекст очищен.')
    } catch (error) {
        console.log('Error while clear context', error)
    }
})

bot.on(message('text'), async (ctx) => {
    try {
        ctx.session ??= setInitialSession()

        ctx.reply(code(loadingMessage))
        ctx.sendChatAction('typing')

        const text = ctx.message.text

        getResponse(text, ctx)
            .then((result) => ctx.reply(result))
            .catch((error) => {
                const errorCode = error.message.replace(/\D/g, '')
                ctx.reply(errorResponse[errorCode])
            })
    } catch (e) {
        console.log('Error while get text response')
    }
})

bot.on(message('voice'), async (ctx) => {
    try {
        ctx.session ??= setInitialSession()

        ctx.reply(code(loadingMessage))
        ctx.sendChatAction('typing')

        const userId = String(ctx.message.from.id)
        const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id)

        const oggPath = await ogg.create(link.href, userId)
        const mp3Path = await ogg.toMp3(oggPath, userId)

        openai.transcription(mp3Path).then(({ data }) => {
            ctx.reply(code(`Ваш запрос: ${data.text}`))
            getResponse(data.text, ctx)
                .then((result) => ctx.reply(result))
                .catch((error) => {
                    const errorCode = error.message.replace(/\D/g, '')
                    ctx.reply(errorResponse[errorCode])
                })
        })
    } catch (error) {
        console.log('Error while get text from voice')
    }
})

function getResponse(text, ctx) {
    const newUserMessage = setNewMessage(openai.roles.USER, text)
    ctx.session.messages.push(newUserMessage)

    return new Promise((resolve, reject) => {
        openai
            .chat(ctx.session.messages)
            .then((response) => {
                resolve(response.data.choices[0].message.content)
            })
            .catch((e) => {
                reject({
                    statusCode: e.statusCode,
                    message: e.message,
                })
            })
    })
}

function setNewMessage(role, content) {
    return { role, content }
}

bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))

console.log(process.env.NODE_ENV)
