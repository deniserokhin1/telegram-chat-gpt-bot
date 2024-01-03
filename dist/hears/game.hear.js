"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameHear = exports.markupFlags = void 0;
const telegraf_1 = require("telegraf");
const const_1 = require("../const");
const command_class_1 = require("../commands/command.class");
const mongo_1 = require("../services/mongo");
const utils_1 = require("../utils");
exports.markupFlags = [
    // Markup.button.callback('3', '3'),
    telegraf_1.Markup.button.callback('10', '10'),
    telegraf_1.Markup.button.callback('20', '20'),
    telegraf_1.Markup.button.callback('30', '30'),
    telegraf_1.Markup.button.callback('40', '40'),
    telegraf_1.Markup.button.callback('50', '50'),
];
class GameHear extends command_class_1.Command {
    constructor(bot) {
        super(bot);
    }
    handle() {
        this.bot.hears(const_1.game, async (ctx) => {
            if (!ctx.session)
                ctx.session = (0, utils_1.setInitialSession)();
            const { id, first_name } = ctx.from;
            const { idLastMessage } = ctx.session;
            const mode = await mongo_1.mongoClient.getMode(id);
            if (mode === 'GAME') {
                ctx.reply('Вы уже находитесь в режиме игры.');
                return;
            }
            (0, utils_1.deleteLastMessage)(idLastMessage, ctx);
            await mongo_1.mongoClient.setMode(id, 'GAME', first_name);
            ctx.reply(const_1.gameMode);
            const message = await ctx.reply('Выберите количество флагов.', telegraf_1.Markup.inlineKeyboard([exports.markupFlags]));
            ctx.session.idLastMessage = message.message_id;
        });
    }
}
exports.GameHear = GameHear;
