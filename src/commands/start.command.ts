import { Markup, Telegraf } from 'telegraf'
import { Command } from './command.class'
import { IBotContext } from '../context/context.interface'
import { chatGPT, clearContext, game, helloMessage, weather } from '../const'
import { mongoClient } from '../services/mongo'
import { setInitialSession } from '../utils'

export class StartCommand extends Command {
    constructor(bot: Telegraf<IBotContext>) {
        super(bot)
    }

    handle(): void {
        this.bot.start((ctx) => {
            ctx.reply(
                helloMessage,
                Markup.keyboard([[chatGPT, weather], [game], [clearContext]]).resize()
            )

            const { first_name, id } = ctx.from
            mongoClient.addNewUser(first_name, id, 'CHAT')

            ctx.session = setInitialSession()
        })
    }
}
