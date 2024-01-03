import { IBotContext, IMessage } from '../context/context.interface'
import { errorResponse, loadingMessage, weatherConditions } from '../const'
import { Command } from '../commands/command.class'
import { message } from 'telegraf/filters'
import { code } from 'telegraf/format'
import { setChatMessage } from '../utils'
import { openai } from '../services/openai'
import { ChatCompletionRequestMessageRoleEnum } from 'openai'
import { NarrowedContext, Telegraf } from 'telegraf'
import { IErrorResponseOpenAI } from '../models/types'
import { eventEmitter } from './voice'
import { Update, Message } from 'telegraf/types'
import { weatherClass } from '../services/weather'
import { mongoClient } from '../services/mongo'

export class TextHandler extends Command {
    constructor(bot: Telegraf<IBotContext>) {
        super(bot)

        eventEmitter.on('voicetotext', (ctx, voicetotext) => {
            this.prepareRequest(ctx, voicetotext)
        })
    }

    handle(): void {
        this.bot.on(message('text'), (ctx) => {
            this.prepareRequest(ctx)
        })
    }

    async prepareRequest(
        ctx: NarrowedContext<
            IBotContext,
            Update.MessageUpdate<Record<'text', {}> & Message.TextMessage & {}>
        >,
        voicetotext?: string
    ) {
        try {
            const text = voicetotext ? voicetotext : ctx.message.text

            const { id } = ctx.from
            const mode = await mongoClient.getMode(id)

            switch (mode) {
                case 'CHAT':
                    await ctx.reply(code(loadingMessage))
                    ctx.sendChatAction('typing')

                    const newUserMessage = setChatMessage(
                        ChatCompletionRequestMessageRoleEnum.User,
                        text
                    )

                    await mongoClient.addNewMessage(id, newUserMessage)
                    const messages: IMessage[] = await mongoClient.getMessages(id)

                    this.getAIResponse(messages, ctx)
                    break

                case 'WEATHER':
                    this.getWeatherResponse(text, ctx)
                    break

                default:
                    break
            }
        } catch (e) {
            console.log('Error while preparing request', e)
            ctx.reply('Пожалуйста, выполните команду /start')
        }
    }

    getAIResponse(
        messages: IMessage[],
        ctx: NarrowedContext<
            IBotContext,
            Update.MessageUpdate<Record<'text', {}> & Message.TextMessage>
        >
    ) {
        openai
            .chat(messages)
            .then(async (response) => {
                const replyContent = response.data.choices[0].message?.content
                ctx.reply(replyContent as string)

                const newServerMessage = setChatMessage(
                    ChatCompletionRequestMessageRoleEnum.System,
                    replyContent as string
                )

                const { id } = ctx.from
                mongoClient.addNewMessage(id, newServerMessage)
            })
            .catch((e: IErrorResponseOpenAI) => {
                console.log('Error while getting text response from OpenAI')
                const response = errorResponse[e.code] ? errorResponse[e.code] : errorResponse.null
                ctx.reply(response)
            })
    }

    getWeatherResponse(
        city: string,
        ctx: NarrowedContext<
            IBotContext,
            Update.MessageUpdate<Record<'text', {}> & Message.TextMessage & {}>
        >
    ) {
        weatherClass
            .getWeather(city)
            .then(async (result) => {
                const emojiWeather = weatherConditions[result?.data.weather[0].id]
                const currentTemp = `${Math.round(result?.data.main.temp)}°C`

                await ctx.reply(emojiWeather)
                await ctx.reply(`<b>${currentTemp}</b>`, { parse_mode: 'HTML' })
            })
            .catch((e) => {
                console.log('Error while getting weather', e)
                ctx.reply(
                    'Вероятно, была допущена ошибка. Пожалуйста, проверьте правописание и попробуйте еще раз.'
                )
            })
    }
}
