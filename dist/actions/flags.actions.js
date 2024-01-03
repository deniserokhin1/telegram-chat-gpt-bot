"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlagsActions = void 0;
const telegraf_1 = require("telegraf");
const command_class_1 = require("../commands/command.class");
const countries_1 = require("../services/countries");
const openai_1 = require("../services/openai");
const utils_1 = require("../utils");
const openai_2 = require("openai");
const const_1 = require("../const");
const mongo_1 = require("../services/mongo");
const game_hear_1 = require("../hears/game.hear");
class FlagsActions extends command_class_1.Command {
    constructor(bot) {
        super(bot);
        this.actions = [];
        this.randomizeCountriesArray = this.randomizeCountriesArray.bind(this);
        this.regionHandle = this.regionHandle.bind(this);
        this.sendRegions = this.sendRegions.bind(this);
        this.answerHandle = this.answerHandle.bind(this);
        this.startGameAgain = this.startGameAgain.bind(this);
        this.stopPlay = this.stopPlay.bind(this);
        this.actions = [
            // {
            //     action: '3',
            //     type: 'countFlags',
            //     text: 'Вы выбрали 3 флага.',
            //     callback: this.sendRegions,
            // },
            {
                action: '10',
                type: 'countFlags',
                text: 'Вы выбрали 10 флагов.',
                callback: this.sendRegions,
            },
            {
                action: '20',
                type: 'countFlags',
                text: 'Вы выбрали 20 флагов.',
                callback: this.sendRegions,
            },
            {
                action: '30',
                type: 'countFlags',
                text: 'Вы выбрали 30 флагов.',
                callback: this.sendRegions,
            },
            {
                action: '40',
                type: 'countFlags',
                text: 'Вы выбрали 40 флагов.',
                callback: this.sendRegions,
            },
            {
                action: '50',
                type: 'countFlags',
                text: 'Вы выбрали 50 флагов.',
                callback: this.sendRegions,
            },
            {
                action: 'europe',
                type: 'region',
                text: 'Вы выбрали Европу.',
                callback: this.regionHandle,
            },
            {
                action: 'asia',
                type: 'region',
                text: 'Вы выбрали Азию.',
                callback: this.regionHandle,
            },
            {
                action: 'africa',
                type: 'region',
                text: 'Вы выбрали Африку.',
                callback: this.regionHandle,
            },
            {
                action: 'all',
                type: 'region',
                text: 'Вы выбрали весь мир.',
                callback: this.regionHandle,
            },
            {
                action: 'americas',
                type: 'region',
                text: 'Вы выбрали зап. полушарие.',
                callback: this.regionHandle,
            },
            {
                action: 'right',
                type: 'answer',
                text: '— верный ответ',
                callback: this.answerHandle,
            },
            {
                action: 'wrong',
                type: 'answer',
                text: '— верный ответ',
                callback: this.answerHandle,
            },
            {
                action: 'play-again',
                type: 'answer',
                text: 'Играем ещё раз.',
                callback: this.startGameAgain,
            },
            {
                action: 'stop-play',
                type: 'answer',
                text: 'Вы вошли в режим общения с ИИ.',
                callback: this.stopPlay,
            },
        ];
    }
    handle() {
        this.actions.forEach((item) => {
            const { callback, text, type, action } = item;
            this.bot.action(action, async (ctx) => {
                try {
                    const { message } = ctx.update.callback_query;
                    await ctx.answerCbQuery();
                    type === 'answer'
                        ? await ctx.deleteMessage(message?.message_id)
                        : await ctx.editMessageText(text);
                    callback(ctx, action);
                }
                catch (error) {
                    console.log(`Error while handling action. Error: ${error}`);
                }
            });
        });
    }
    async sendRegions(ctx, countSteps) {
        ctx.session = (0, utils_1.setInitialSession)();
        ctx.session.countSteps = Number(countSteps);
        const message = await ctx.reply('Выберите регион', telegraf_1.Markup.inlineKeyboard([
            [
                telegraf_1.Markup.button.callback('Азия', 'asia'),
                telegraf_1.Markup.button.callback('Африка', 'africa'),
                telegraf_1.Markup.button.callback('Европа', 'europe'),
            ],
            [
                telegraf_1.Markup.button.callback('Зап. полушарие', 'americas'),
                telegraf_1.Markup.button.callback('Мир', 'all'),
            ],
        ]));
        ctx.session.idLastMessage = message.message_id;
    }
    regionHandle(ctx, region) {
        countries_1.countriesClass
            .getCountries(region)
            .then((result) => {
            if (!result)
                return;
            ctx.session.allCountries = [...result];
            this.randomizeCountriesArray(ctx, result);
        })
            .catch((error) => console.log(`Error while getting countries for ${region}: ${error}`));
    }
    randomizeCountriesArray(ctx, countriesArray) {
        const shuffledArray = [...countriesArray]
            .sort(() => Math.random() - 0.5)
            .slice(0, ctx.session.countSteps);
        ctx.session.shuffledCountries = shuffledArray;
        this.getQuestion(ctx);
    }
    async getQuestion(ctx) {
        try {
            const { allCountries, shuffledCountries, flagStep: step } = ctx.session;
            const four_countries = [shuffledCountries[step]];
            while (four_countries.length < 4) {
                const randomIndex = Math.floor(Math.random() * allCountries.length);
                if (four_countries.includes(allCountries[randomIndex]))
                    continue;
                four_countries.push(allCountries[randomIndex]);
            }
            const buttonsAnswer = four_countries
                .map((i, index) => {
                const item = [
                    telegraf_1.Markup.button.callback(i.country, index === 0 ? 'right' : 'wrong'),
                ];
                return item;
            })
                .sort(() => Math.random() - 0.5);
            await ctx.reply(shuffledCountries[step].flag);
            const message = await ctx.reply('Выберите правильный вариант.', telegraf_1.Markup.inlineKeyboard(buttonsAnswer));
            ctx.session.idLastMessage = message.message_id;
        }
        catch (e) {
            console.log('Error while getting new question', e);
        }
    }
    answerHandle(ctx, typeAnswer) {
        let textResponse = null;
        const { shuffledCountries, flagStep: step } = ctx.session;
        const country = shuffledCountries[step]?.country;
        if (!country)
            return;
        typeAnswer === 'wrong'
            ? (textResponse = `❌ ${country} — верный ответ.`)
            : (textResponse = `✅ ${country} — верный ответ.`);
        if (typeAnswer === 'wrong')
            ctx.session.errors.push(country);
        ctx.reply(textResponse);
        this.nextStep(ctx);
    }
    async nextStep(ctx) {
        const { countSteps, flagStep: step, errors } = ctx.session;
        if (step < countSteps - 1) {
            ctx.session.flagStep += 1;
            this.getQuestion(ctx);
            return;
        }
        await ctx.reply(const_1.endFlagGame);
        const guideForAI = (0, utils_1.setAIGuide)(countSteps, errors);
        const dataForAI = [(0, utils_1.setChatMessage)(openai_2.ChatCompletionRequestMessageRoleEnum.User, guideForAI)];
        openai_1.openai
            .chat(dataForAI)
            .then(async (response) => {
            const replyContent = response.data.choices[0].message?.content;
            await ctx.reply(replyContent);
            this.wantPlayAgain(ctx);
        })
            .catch((e) => {
            console.log('Error while getting statistic response from OpenAI', e);
        });
    }
    async wantPlayAgain(ctx) {
        const message = await ctx.reply('Сыграть ещё раз?', telegraf_1.Markup.inlineKeyboard([
            [
                telegraf_1.Markup.button.callback('Да', 'play-again'),
                telegraf_1.Markup.button.callback('Нет', 'stop-play'),
            ],
        ]));
        ctx.session.idLastMessage = message.message_id;
    }
    async startGameAgain(ctx) {
        const message = await ctx.reply('Выберите количество флагов.', telegraf_1.Markup.inlineKeyboard([game_hear_1.markupFlags]));
        ctx.session.idLastMessage = message.message_id;
    }
    async stopPlay(ctx) {
        const first_name = ctx.from?.first_name;
        const id = ctx.from?.id;
        ctx.session.idLastMessage = null;
        if (id && first_name) {
            mongo_1.mongoClient.setMode(id, 'CHAT', first_name);
            await ctx.reply(const_1.chatGPTMode);
        }
    }
}
exports.FlagsActions = FlagsActions;
