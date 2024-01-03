import { Telegraf } from 'telegraf'
import { IBotContext } from '../context/context.interface'
import { chatGPTMode, clearContext, cleared } from '../const'
import { Command } from '../commands/command.class'
import { mongoClient } from '../services/mongo'
import { deleteLastMessage, setInitialSession } from '../utils'

export class ClearContextHear extends Command {
    constructor(bot: Telegraf<IBotContext>) {
        super(bot)
    }

    handle(): void {
        this.bot.hears(clearContext, async (ctx) => {
            try {
                if (!ctx.session) ctx.session = setInitialSession()

                const { id, first_name } = ctx.from
                const { idLastMessage } = ctx.session

                deleteLastMessage(idLastMessage, ctx)
                await mongoClient.deleteMessages(id)
                mongoClient.setMode(id, 'CHAT', first_name)

                await ctx.reply(cleared)
                await ctx.reply(chatGPTMode)
            } catch (e) {
                console.log('Error while clearing context.', e)
            }
        })
    }
}
