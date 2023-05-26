import { Telegraf, session, Markup } from 'telegraf'
import { message } from 'telegraf/filters'
import { code } from 'telegraf/format'
import config from 'config'
import { ogg } from './ogg.js'
import { openai } from './openai.js'

const INITIAL_SESSION = {
    messages: [],
}

const bot = new Telegraf(
    config.get(
        process.env.NODE_ENV === 'development'
            ? 'TELEGRAM_TOKEN_DEV'
            : 'TELEGRAM_TOKEN'
    )
)

console.log(process.env.NODE_ENV)

bot.use(session())

bot.command('new', async (ctx) => {
    ctx.session = INITIAL_SESSION
    await ctx.reply('Жду вашего сообщения.')
})

bot.command('start', async (ctx) => {
    ctx.session = INITIAL_SESSION
    await ctx.reply(
        '👋 Привет! Я Telegram бот, разработанный Денисом Ерохиным на платформе Node.js с использованием библиотеки Telegraf.js. Я работаю на базе API OpenAI. Вы можете общаться со мной текстом и голосом.',
        Markup.keyboard([
            ['🗑️ Очистить контекст'], // Row1 with 2 buttons
        ])
            .oneTime()
            .resize()
    )
})

bot.hears('🗑️ Очистить контекст', (ctx) => {
    ctx.session = INITIAL_SESSION
    ctx.reply('Жду вашего сообщения.')
})

bot.on(message('voice'), async (ctx) => {
    ctx.session ??= INITIAL_SESSION
    try {
        await ctx.reply(code('Сообщение приянл. Жду ответ от сервера.'))

        const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id)
        const userId = String(ctx.message.from.id)

        const oggPath = await ogg.create(link.href, userId)
        const mp3Path = await ogg.toMp3(oggPath, userId)

        const text = await openai.transcription(mp3Path)
        await ctx.reply(`Ваш запрос: ${text}`)

        ctx.session.messages.push({ role: openai.roles.USER, content: text })

        const responce = await openai.chat(ctx.session.messages)

        ctx.session.messages.push({
            role: openai.roles.ASSISTANT,
            content: responce.content,
        })

        await ctx.reply(responce.content)
    } catch (error) {
        console.log('Error', error)
    }
})

bot.on(message('text'), async (ctx) => {
    ctx.session ??= INITIAL_SESSION
    try {
        await ctx.reply(code('Сообщение приянл. Жду ответ от сервера.'))

        const text = ctx.message.text

        ctx.session.messages.push({ role: openai.roles.USER, content: text })

        const responce = await openai.chat(ctx.session.messages)

        ctx.session.messages.push({
            role: openai.roles.ASSISTANT,
            content: responce.content,
        })

        await ctx.reply(responce.content)
    } catch (error) {
        console.log('Error', error)
    }
})

bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))