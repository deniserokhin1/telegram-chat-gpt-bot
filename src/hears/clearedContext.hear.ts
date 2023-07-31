import { Telegraf } from 'telegraf'
import { IBotContext } from '../context/context.interface'
import { clearContext, cleared } from '../const'
import { Command } from '../commands/command.class'
import { mongoClient } from '../services/mongo'
import { deleteLastMessage, setInitialSession } from '../utils'

export class ClearContextHear extends Command {
    constructor(bot: Telegraf<IBotContext>) {
        super(bot)
    }

    handle(): void {
        this.bot.hears(clearContext, async (ctx) => {
            if (!ctx.session) ctx.session = setInitialSession()

            const { id } = ctx.from
            const { idLastMessage } = ctx.session

            deleteLastMessage(idLastMessage, ctx)
            await mongoClient.deleteMessages(id)

            await ctx.reply(cleared)
        })
    }
}
