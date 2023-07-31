import { Telegraf } from 'telegraf'
import { IBotContext } from '../context/context.interface'
import { weather, weatherMode } from '../const'
import { Command } from '../commands/command.class'
import { mongoClient } from '../services/mongo'
import { deleteLastMessage, setInitialSession } from '../utils'

export class WeatherHear extends Command {
    constructor(bot: Telegraf<IBotContext>) {
        super(bot)
    }

    handle(): void {
        this.bot.hears(weather, async (ctx) => {
            if (!ctx.session) ctx.session = setInitialSession()

            const { id, first_name } = ctx.from
            const { idLastMessage } = ctx.session

            mongoClient.setMode(id, 'WEATHER', first_name)

            deleteLastMessage(idLastMessage, ctx)

            await ctx.reply(weatherMode)
        })
    }
}
