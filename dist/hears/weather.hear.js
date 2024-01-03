"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeatherHear = void 0;
const const_1 = require("../const");
const command_class_1 = require("../commands/command.class");
const mongo_1 = require("../services/mongo");
const utils_1 = require("../utils");
class WeatherHear extends command_class_1.Command {
    constructor(bot) {
        super(bot);
    }
    handle() {
        this.bot.hears(const_1.weather, async (ctx) => {
            if (!ctx.session)
                ctx.session = (0, utils_1.setInitialSession)();
            const { id, first_name } = ctx.from;
            const { idLastMessage } = ctx.session;
            mongo_1.mongoClient.setMode(id, 'WEATHER', first_name);
            (0, utils_1.deleteLastMessage)(idLastMessage, ctx);
            await ctx.reply(const_1.weatherMode);
        });
    }
}
exports.WeatherHear = WeatherHear;
