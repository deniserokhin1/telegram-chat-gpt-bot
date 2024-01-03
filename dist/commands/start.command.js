"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StartCommand = void 0;
const telegraf_1 = require("telegraf");
const command_class_1 = require("./command.class");
const const_1 = require("../const");
const mongo_1 = require("../services/mongo");
const utils_1 = require("../utils");
class StartCommand extends command_class_1.Command {
    constructor(bot) {
        super(bot);
    }
    handle() {
        this.bot.start((ctx) => {
            ctx.reply(const_1.helloMessage, telegraf_1.Markup.keyboard([[const_1.chatGPT, const_1.weather], [const_1.game], [const_1.clearContext]]).resize());
            const { first_name, id } = ctx.from;
            mongo_1.mongoClient.addNewUser(first_name, id, 'CHAT');
            ctx.session = (0, utils_1.setInitialSession)();
        });
    }
}
exports.StartCommand = StartCommand;
