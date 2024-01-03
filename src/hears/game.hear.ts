import { Markup, Telegraf } from 'telegraf'
import { IBotContext } from '../context/context.interface'
import { game, gameMode } from '../const'
import { Command } from '../commands/command.class'
import { mongoClient } from '../services/mongo'
import { deleteLastMessage, setInitialSession } from '../utils'

export const markupFlags = [
    // Markup.button.callback('3', '3'),
    Markup.button.callback('10', '10'),
    Markup.button.callback('20', '20'),
    Markup.button.callback('30', '30'),
    Markup.button.callback('40', '40'),
    Markup.button.callback('50', '50'),
]

export class GameHear extends Command {
    constructor(bot: Telegraf<IBotContext>) {
        super(bot)
    }

    handle(): void {
        this.bot.hears(game, async (ctx) => {
            if (!ctx.session) ctx.session = setInitialSession()

            const { id, first_name } = ctx.from
            const { idLastMessage } = ctx.session

            const mode = await mongoClient.getMode(id)
            if (mode === 'GAME') {
                ctx.reply('Вы уже находитесь в режиме игры.')
                return
            }

            deleteLastMessage(idLastMessage, ctx)

            await mongoClient.setMode(id, 'GAME', first_name)
            ctx.reply(gameMode)

            const message = await ctx.reply(
                'Выберите количество флагов.',
                Markup.inlineKeyboard([markupFlags])
            )

            ctx.session.idLastMessage = message.message_id
        })
    }
}
