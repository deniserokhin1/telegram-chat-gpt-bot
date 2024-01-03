"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MODE = void 0;
const telegraf_1 = require("telegraf");
const config_service_1 = require("./config/config.service");
const start_command_1 = require("./commands/start.command");
const clearedContext_hear_1 = require("./hears/clearedContext.hear");
const text_1 = require("./input/text");
const voice_1 = require("./input/voice");
const chatGPT_hear_1 = require("./hears/chatGPT.hear");
const weather_hear_1 = require("./hears/weather.hear");
const game_hear_1 = require("./hears/game.hear");
const flags_actions_1 = require("./actions/flags.actions");
exports.MODE = process.env.mode === 'development' ? 'DEV' : 'PROD';
class Bot {
    constructor(configService) {
        this.configService = configService;
        this.commands = [];
        this.hears = [];
        this.input = [];
        this.actions = [];
        this.bot = new telegraf_1.Telegraf(this.configService.get(`TELEGRAM_TOKEN_${exports.MODE}`));
        this.bot.use((0, telegraf_1.session)());
    }
    init() {
        this.commands = [new start_command_1.StartCommand(this.bot)];
        this.hears = [
            new clearedContext_hear_1.ClearContextHear(this.bot),
            new weather_hear_1.WeatherHear(this.bot),
            new chatGPT_hear_1.ChatGPTHear(this.bot),
            new game_hear_1.GameHear(this.bot),
        ];
        this.input = [new text_1.TextHandler(this.bot), new voice_1.VoiceHandler(this.bot)];
        this.actions = [new flags_actions_1.FlagsActions(this.bot)];
        this.commands.forEach((command) => command.handle());
        this.hears.forEach((command) => command.handle());
        this.input.forEach((command) => command.handle());
        this.actions.forEach((command) => command.handle());
        this.bot.launch();
    }
}
const bot = new Bot(config_service_1.configService);
bot.init();
process.once('SIGINT', () => bot.bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.bot.stop('SIGTERM'));
