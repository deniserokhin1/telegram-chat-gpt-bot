"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoiceHandler = exports.eventEmitter = void 0;
const events_1 = require("events");
const filters_1 = require("telegraf/filters");
const format_1 = require("telegraf/format");
const command_class_1 = require("../commands/command.class");
const ogg_1 = require("../services/ogg");
const openai_1 = require("../services/openai");
exports.eventEmitter = new events_1.EventEmitter();
class VoiceHandler extends command_class_1.Command {
    constructor(bot) {
        super(bot);
    }
    handle() {
        this.bot.on((0, filters_1.message)('voice'), async (ctx) => {
            try {
                const userId = String(ctx.message.from.id);
                const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id);
                const oggPath = await ogg_1.ogg.create(link.href, userId);
                const mp3Path = await ogg_1.ogg.toMp3(oggPath, userId);
                ctx.sendChatAction('typing');
                //@ts-ignore
                openai_1.openai.transcription(mp3Path).then(({ data }) => {
                    ctx.reply((0, format_1.code)(`Ваш запрос: ${data.text}`));
                    exports.eventEmitter.emit('voicetotext', ctx, data.text);
                });
            }
            catch (error) {
                console.log('Error while get text from voice');
            }
        });
    }
}
exports.VoiceHandler = VoiceHandler;
