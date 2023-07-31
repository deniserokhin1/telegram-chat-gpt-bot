import { IBotContext } from '../context/context.interface'
import { loadingMessage } from '../const'
import { Command } from '../commands/command.class'
import { message } from 'telegraf/filters'
import { code } from 'telegraf/format'
import { openai } from '../services/openai'
import { Telegraf } from 'telegraf'
import { ogg } from '../services/ogg'
import { EventEmitter } from 'events'

export const eventEmitter = new EventEmitter()

export class VoiceHandler extends Command {
    constructor(bot: Telegraf<IBotContext>) {
        super(bot)
    }

    handle(): void {
        this.bot.on(message('voice'), async (ctx) => {
            try {
                const userId = String(ctx.message.from.id)
                const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id)

                const oggPath = await ogg.create(link.href, userId)
                const mp3Path = await ogg.toMp3(oggPath as string, userId)

                ctx.sendChatAction('typing')

                //@ts-ignore
                openai.transcription(mp3Path as string).then(({ data }) => {
                    ctx.reply(code(`Ваш запрос: ${data.text}`))
                    eventEmitter.emit('voicetotext', ctx, data.text)
                })
            } catch (error) {
                console.log('Error while get text from voice')
            }
        })
    }
}
