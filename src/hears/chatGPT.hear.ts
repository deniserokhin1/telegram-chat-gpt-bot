import { Telegraf } from 'telegraf'
import { IBotContext } from '../context/context.interface'
import { chatGPT, chatGPTMode } from '../const'
import { Command } from '../commands/command.class'
import { mongoClient } from '../services/mongo'
import { deleteLastMessage, setInitialSession } from '../utils'

export class ChatGPTHear extends Command {
    constructor(bot: Telegraf<IBotContext>) {
        super(bot)
    }

    handle(): void {
        this.bot.hears(chatGPT, async (ctx) => {
            if (!ctx.session) ctx.session = setInitialSession()

            const { id, first_name } = ctx.from
            const { idLastMessage } = ctx.session

            mongoClient.setMode(id, 'OPENAI', first_name)

            deleteLastMessage(idLastMessage, ctx)

            await ctx.reply(chatGPTMode)
        })
    }
}
