import { Telegraf, Markup, session } from 'telegraf'
import { message } from 'telegraf/filters'
import { code } from 'telegraf/format'
import config from 'config'
import { ogg } from './ogg.js'
import { openai } from './openai.js'
import {
    GAME,
    WEATHER,
    YANDEX,
    aiGuide,
    chatGPT,
    chatGPTMode,
    clearContext,
    cleared,
    errorResponse,
    game,
    gameMode,
    helloMessage,
    loadingMessage,
    longRead,
    readMode,
    weather,
    weatherMessage,
    weatherMode,
} from './const.js'
import { setInitialSession, setNewMessage } from './utils.js'
import { weatherCL } from './weather.js'
import { country } from './countries.js'

const bot = new Telegraf(
    config.get(
        process.env.NODE_ENV === 'development' ? 'TELEGRAM_TOKEN_DEV' : 'TELEGRAM_TOKEN'
    )
)

bot.use(session())

bot.command('start', async (ctx) => {
    ctx.session = setInitialSession()
    await ctx.reply(
        helloMessage,
        Markup.keyboard([[chatGPT], [game], [weather], [clearContext]]).resize()
    )
})

bot.hears(clearContext, async (ctx) => {
    try {
        if (ctx.session.game.lastMessageId) {
            await ctx.deleteMessage(ctx.session.game.lastMessageId)
            ctx.session.game.lastMessageId = null
        }
        ctx.session = setInitialSession()
        await ctx.reply(cleared)
    } catch (error) {
        console.log('Error while clear context', error)
    }
})

bot.hears(longRead, async (ctx) => setMode(ctx, YANDEX, readMode))
bot.hears(weather, async (ctx) => setMode(ctx, WEATHER, weatherMode))
bot.hears(chatGPT, async (ctx) => setMode(ctx, null, chatGPTMode))
bot.hears(game, async (ctx) => setMode(ctx, GAME, gameMode))

bot.action('europe', async (ctx) => {
    await ctx.answerCbQuery()
    await ctx.editMessageText('Вы выбрали Европу.')
    handleRegionAction(ctx, 'europe')
})
bot.action('americas', async (ctx) => {
    await ctx.answerCbQuery()
    await ctx.editMessageText('Вы выбрали Западное полушарие.')
    handleRegionAction(ctx, 'americas')
})
bot.action('asia', async (ctx) => {
    await ctx.answerCbQuery()
    await ctx.editMessageText('Вы выбрали Азию.')
    handleRegionAction(ctx, 'asia')
})
bot.action('africa', async (ctx) => {
    await ctx.answerCbQuery()
    await ctx.editMessageText('Вы выбрали Африку.')
    handleRegionAction(ctx, 'africa')
})
bot.action('all', async (ctx) => {
    await ctx.answerCbQuery()
    await ctx.editMessageText('Вы выбрали весь мир.')
    handleRegionAction(ctx, 'all')
})

bot.action('right', async (ctx) => {
    await ctx.answerCbQuery()
    await ctx.deleteMessage(ctx.update.callback_query.message.id)
    handleAnswer(ctx, 'right')
})
bot.action('wrong', async (ctx) => {
    await ctx.answerCbQuery()
    await ctx.deleteMessage(ctx.update.callback_query.message.id)
    handleAnswer(ctx, 'wrong')
})

bot.action('10', async (ctx) => {
    await ctx.answerCbQuery()
    await ctx.editMessageText('Вы выбрали 10 флагов.')
    startFlagsGame(ctx, 10)
})
bot.action('20', async (ctx) => {
    await ctx.answerCbQuery()
    await ctx.editMessageText('Вы выбрали 20 флагов.')
    startFlagsGame(ctx, 20)
})
bot.action('30', async (ctx) => {
    await ctx.answerCbQuery()
    await ctx.editMessageText('Вы выбрали 30 флагов.')
    startFlagsGame(ctx, 30)
})
bot.action('40', async (ctx) => {
    await ctx.answerCbQuery()
    await ctx.editMessageText('Вы выбрали 40 флагов.')
    startFlagsGame(ctx, 40)
})

bot.action('50', async (ctx) => {
    await ctx.answerCbQuery()
    await ctx.editMessageText('Вы выбрали 50 флагов.')
    startFlagsGame(ctx, 50)
})

function handleAnswer(ctx, typeAnswer) {
    let textResponse = null

    switch (typeAnswer) {
        case 'wrong':
            textResponse = `❌ ${
                ctx.session.game.shuffledCountries[ctx.session.game.step].country
            } — верный ответ.`
            answerResponse(textResponse, ctx)

            ctx.session.game.erros ??= []
            ctx.session.game.erros = [
                ...ctx.session.game.erros,
                ctx.session.game.shuffledCountries[ctx.session.game.step].country,
            ]
            break

        case 'right':
            textResponse = `✅ ${
                ctx.session.game.shuffledCountries[ctx.session.game.step].country
            } — верный ответ.`
            answerResponse(textResponse, ctx)
            break

        default:
            break
    }
}

async function answerResponse(response, ctx) {
    await ctx.reply(response)
    if (ctx.session.game.step === ctx.session.game.countSteps - 1) {
        await ctx.reply('Конец игры. Считаем статистику.')
        getResponse('', ctx)
            .then(async (result) => {
                await ctx.reply(result)
                ctx.session.game.countSteps = null
                ctx.session.game.lastMessageId = null
            })
            .catch((e) => {
                console.log('Error while getting finale response', e)
            })
        return
    }
    ctx.session.game.step += 1
    getAnswer(ctx)
}

async function setMode(ctx, mode, replyMessage) {
    try {
        ctx.session ??= setInitialSession()
        ctx.session.mode = mode
        await ctx.reply(replyMessage)

        if (ctx.session.game.lastMessageId) {
            await ctx.deleteMessage(ctx.session.game.lastMessageId)
            ctx.session.game.lastMessageId = null
        }

        if (mode !== GAME) return

        const message = await ctx.reply(
            'Выберите количество флагов.',
            Markup.inlineKeyboard([
                [
                    Markup.button.callback('10', '10'),
                    Markup.button.callback('20', '20'),
                    Markup.button.callback('30', '30'),
                    Markup.button.callback('40', '40'),
                    Markup.button.callback('50', '50'),
                ],
            ])
        )
        ctx.session.game.lastMessageId = message.message_id
    } catch (error) {
        console.log(`Error while setting ${mode} mode`, error)
    }
}

async function startFlagsGame(ctx, countSteps) {
    ctx.session.game.countSteps = countSteps
    const message = await ctx.reply(
        'Выберите регион',
        Markup.inlineKeyboard([
            [
                Markup.button.callback('Азия', 'asia'),
                Markup.button.callback('Африка', 'africa'),
                Markup.button.callback('Европа', 'europe'),
            ],
            [
                Markup.button.callback('Зап. полушарие', 'americas'),
                Markup.button.callback('Мир', 'all'),
            ],
        ])
    )
    ctx.session.game.lastMessageId = message.message_id
}

function getRandomCountries(ctx) {
    const shuffledArray = ctx.session.game.allCountries
        .sort(() => Math.random() - 0.5)
        .slice(0, ctx.session.game.countSteps)

    ctx.session.game.shuffledCountries = shuffledArray
}

async function getAnswer(ctx) {
    try {
        const countries = [ctx.session.game.shuffledCountries[ctx.session.game.step]]

        while (countries.length < 4) {
            const randomIndex = Math.floor(
                Math.random() * ctx.session.game.allCountries.length
            )

            if (countries.includes(ctx.session.game.allCountries[randomIndex])) continue
            countries.push(ctx.session.game.allCountries[randomIndex])
        }

        const answers = countries
            .map((i, index) => {
                const item = [
                    Markup.button.callback(i.country, index === 0 ? 'right' : 'wrong'),
                ]
                return item
            })
            .sort(() => Math.random() - 0.5)

        await ctx.reply(ctx.session.game.shuffledCountries[ctx.session.game.step].flag)
        const message = await ctx.reply(
            'Выберите правильный вариант.',
            Markup.inlineKeyboard(answers)
        )
        ctx.session.game.lastMessageId = message.message_id
    } catch (error) {
        console.log('Error while getting new question', e)
    }
}

function handleRegionAction(ctx, region) {
    country
        .getCountries(region)
        .then(async (result) => {
            ctx.session.game.allCountries = [...result]

            getRandomCountries(ctx)

            getAnswer(ctx)
        })
        .catch((error) =>
            console.log(`Error while getting countries for ${region}: ${error}`)
        )
}

bot.on(message('text'), async (ctx) => {
    try {
        if (ctx.session.mode === GAME) {
            await ctx.reply(
                'Вы сейчас находитесь в режиме игры. Чтобы закончить игру, измените режим взаимодействия с ботом.'
            )
            return
        }
        ctx.session ??= setInitialSession()

        ctx.reply(code(loadingMessage))
        const text = ctx.message.text

        ctx.sendChatAction('typing')

        getResponse(text, ctx)
            .then(async (result) => {
                if (ctx.session.mode === WEATHER) {
                    await ctx.reply(result.emoji)
                    await ctx.reply(result.text)
                    return
                }
                await ctx.reply(result)
            })
            .catch((error) => {
                console.log('error:', error)
                const errorCode = error.message.replace(/\D/g, '')
                const responseForUser = errorResponse[errorCode]
                ctx.reply(responseForUser ? responseForUser : errorResponse['0'])
            })
    } catch (e) {
        console.log('Error while get text response')
    }
})

bot.on(message('voice'), async (ctx) => {
    try {
        if (ctx.session.mode === GAME) {
            await ctx.reply(
                'Вы сейчас находитесь в режиме игры. Чтобы закончить игру, измените режим взаимодействия с ботом.'
            )
            return
        }

        ctx.session ??= setInitialSession()

        ctx.reply(code(loadingMessage))

        const userId = String(ctx.message.from.id)
        const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id)

        const oggPath = await ogg.create(link.href, userId)
        const mp3Path = await ogg.toMp3(oggPath, userId)

        ctx.sendChatAction('typing')

        openai.transcription(mp3Path).then(({ data }) => {
            ctx.reply(code(`Ваш запрос: ${data.text}`))
            getResponse(data.text, ctx)
                .then((result) => ctx.reply(result.toString()))
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
    ctx.sendChatAction('typing')

    if (ctx.session.mode === WEATHER) {
        return new Promise((resolve, reject) => {
            weatherCL
                .getWeather(text.replace(/\.$/, ''))
                .then((result) => {
                    resolve(weatherMessage(result.data))
                })
                .catch((e) => {
                    console.log('###### error ######:', e)
                    const error = new Error()
                    error.statusCode = e.statusCode
                    error.message = e.message
                    return reject(error)
                })
        })
    }

    if (ctx.session.mode === GAME) {
        if (text) {
            const newUserMessage = setNewMessage(openai.roles.SYSTEM, text)
            ctx.session.game.messages.push(newUserMessage)
        } else {
            const aiScript = setNewMessage(
                openai.roles.SYSTEM,
                aiGuide(ctx.session.game.countSteps, ctx.session.game.erros || '[]')
            )
            ctx.session.game.messages.push(aiScript)
        }

        return new Promise((resolve, reject) => {
            openai
                .chat(ctx.session.game.messages)
                .then((response) => {
                    const replyContent = response.data.choices[0].message.content
                    const newServerMessage = setNewMessage(
                        openai.roles.ASSISTANT,
                        replyContent
                    )
                    ctx.session.game.messages.push(newServerMessage)
                    resolve(replyContent)
                })
                .catch((e) => {
                    reject({
                        statusCode: e.statusCode,
                        message: e.message,
                    })
                })
        })
    }

    const newUserMessage = setNewMessage(openai.roles.USER, text)
    ctx.session.messages.push(newUserMessage)

    return new Promise((resolve, reject) => {
        openai
            .chat(ctx.session.messages)
            .then((response) => {
                const replyContent = response.data.choices[0].message.content
                const newServerMessage = setNewMessage(
                    openai.roles.ASSISTANT,
                    replyContent
                )
                ctx.session.messages.push(newServerMessage)
                resolve(replyContent)
            })
            .catch((e) => {
                reject({
                    statusCode: e.statusCode,
                    message: e.message,
                })
            })
    })
}

bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))

console.log(process.env.NODE_ENV)
