"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextHandler = void 0;
const const_1 = require("../const");
const command_class_1 = require("../commands/command.class");
const filters_1 = require("telegraf/filters");
const format_1 = require("telegraf/format");
const utils_1 = require("../utils");
const openai_1 = require("../services/openai");
const openai_2 = require("openai");
const voice_1 = require("./voice");
const weather_1 = require("../services/weather");
const mongo_1 = require("../services/mongo");
class TextHandler extends command_class_1.Command {
    constructor(bot) {
        super(bot);
        voice_1.eventEmitter.on('voicetotext', (ctx, voicetotext) => {
            this.prepareRequest(ctx, voicetotext);
        });
    }
    handle() {
        this.bot.on((0, filters_1.message)('text'), (ctx) => {
            this.prepareRequest(ctx);
        });
    }
    async prepareRequest(ctx, voicetotext) {
        try {
            const text = voicetotext ? voicetotext : ctx.message.text;
            const { id } = ctx.from;
            const mode = await mongo_1.mongoClient.getMode(id);
            switch (mode) {
                case 'CHAT':
                    await ctx.reply((0, format_1.code)(const_1.loadingMessage));
                    ctx.sendChatAction('typing');
                    const newUserMessage = (0, utils_1.setChatMessage)(openai_2.ChatCompletionRequestMessageRoleEnum.User, text);
                    await mongo_1.mongoClient.addNewMessage(id, newUserMessage);
                    const messages = await mongo_1.mongoClient.getMessages(id);
                    this.getAIResponse(messages, ctx);
                    break;
                case 'WEATHER':
                    this.getWeatherResponse(text, ctx);
                    break;
                default:
                    break;
            }
        }
        catch (e) {
            console.log('Error while preparing request', e);
            ctx.reply('Пожалуйста, выполните команду /start');
        }
    }
    getAIResponse(messages, ctx) {
        openai_1.openai
            .chat(messages)
            .then(async (response) => {
            const replyContent = response.data.choices[0].message?.content;
            ctx.reply(replyContent);
            const newServerMessage = (0, utils_1.setChatMessage)(openai_2.ChatCompletionRequestMessageRoleEnum.System, replyContent);
            const { id } = ctx.from;
            mongo_1.mongoClient.addNewMessage(id, newServerMessage);
        })
            .catch((e) => {
            console.log('Error while getting text response from OpenAI');
            const response = const_1.errorResponse[e.code] ? const_1.errorResponse[e.code] : const_1.errorResponse.null;
            ctx.reply(response);
        });
    }
    getWeatherResponse(city, ctx) {
        weather_1.weatherClass
            .getWeather(city)
            .then(async (result) => {
            const emojiWeather = const_1.weatherConditions[result?.data.weather[0].id];
            const currentTemp = `${Math.round(result?.data.main.temp)}°C`;
            await ctx.reply(emojiWeather);
            await ctx.reply(`<b>${currentTemp}</b>`, { parse_mode: 'HTML' });
        })
            .catch((e) => {
            console.log('Error while getting weather', e);
            ctx.reply('Вероятно, была допущена ошибка. Пожалуйста, проверьте правописание и попробуйте еще раз.');
        });
    }
}
exports.TextHandler = TextHandler;
