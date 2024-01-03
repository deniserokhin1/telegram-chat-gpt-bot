"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClearContextHear = void 0;
const const_1 = require("../const");
const command_class_1 = require("../commands/command.class");
const mongo_1 = require("../services/mongo");
const utils_1 = require("../utils");
class ClearContextHear extends command_class_1.Command {
    constructor(bot) {
        super(bot);
    }
    handle() {
        this.bot.hears(const_1.clearContext, async (ctx) => {
            try {
                if (!ctx.session)
                    ctx.session = (0, utils_1.setInitialSession)();
                const { id, first_name } = ctx.from;
                const { idLastMessage } = ctx.session;
                (0, utils_1.deleteLastMessage)(idLastMessage, ctx);
                await mongo_1.mongoClient.deleteMessages(id);
                mongo_1.mongoClient.setMode(id, 'CHAT', first_name);
                await ctx.reply(const_1.cleared);
                await ctx.reply(const_1.chatGPTMode);
            }
            catch (e) {
                console.log('Error while clearing context.', e);
            }
        });
    }
}
exports.ClearContextHear = ClearContextHear;
