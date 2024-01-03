import { Markup, NarrowedContext, Telegraf } from 'telegraf'
import { Update, CallbackQuery } from 'telegraf/types'
import { IBotContext } from '../context/context.interface'
import { Command } from '../commands/command.class'
import { AnswerAction, IActions, IResultCountriesArray } from '../models/types'
import { countriesClass } from '../services/countries'
import { openai } from '../services/openai'
import { setAIGuide, setChatMessage, setInitialSession } from '../utils'
import { ChatCompletionRequestMessageRoleEnum } from 'openai'
import { chatGPTMode, endFlagGame } from '../const'
import { mongoClient } from '../services/mongo'
import { markupFlags } from '../hears/game.hear'

export class FlagsActions extends Command {
    actions: IActions[] = []

    constructor(bot: Telegraf<IBotContext>) {
        super(bot)

        this.randomizeCountriesArray = this.randomizeCountriesArray.bind(this)
        this.regionHandle = this.regionHandle.bind(this)
        this.sendRegions = this.sendRegions.bind(this)
        this.answerHandle = this.answerHandle.bind(this)
        this.startGameAgain = this.startGameAgain.bind(this)
        this.stopPlay = this.stopPlay.bind(this)

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
        ]
    }

    handle(): void {
        this.actions.forEach((item) => {
            const { callback, text, type, action } = item

            this.bot.action(action, async (ctx) => {
                try {
                    const { message } = ctx.update.callback_query

                    await ctx.answerCbQuery()

                    type === 'answer'
                        ? await ctx.deleteMessage(message?.message_id)
                        : await ctx.editMessageText(text)

                    callback(ctx, action)
                } catch (error) {
                    console.log(`Error while handling action. Error: ${error}`)
                }
            })
        })
    }

    async sendRegions(
        ctx: NarrowedContext<
            IBotContext & {
                match: RegExpExecArray
            },
            Update.CallbackQueryUpdate<CallbackQuery>
        >,
        countSteps: number | string
    ) {
        ctx.session = setInitialSession()
        ctx.session.countSteps = Number(countSteps)

        const message = await ctx.reply(
            'Выберите регион',
            Markup.inlineKeyboard([
                [
                    Markup.button.callback('Азия', 'asia'),
                    Markup.button.callback('Африка', 'africa'),
                    Markup.button.callback('Европа', 'europe'),
                ],
                [
                    Markup.button.callback('Зап. полушарие', 'americas'),
                    Markup.button.callback('Мир', 'all'),
                ],
            ])
        )
        ctx.session.idLastMessage = message.message_id
    }

    regionHandle(
        ctx: NarrowedContext<
            IBotContext & { match: RegExpExecArray },
            Update.CallbackQueryUpdate<CallbackQuery>
        >,
        region: string
    ) {
        countriesClass
            .getCountries(region)
            .then((result: IResultCountriesArray[] | undefined) => {
                if (!result) return
                ctx.session.allCountries = [...result]
                this.randomizeCountriesArray(ctx, result)
            })
            .catch((error: any) =>
                console.log(`Error while getting countries for ${region}: ${error}`)
            )
    }

    randomizeCountriesArray(
        ctx: NarrowedContext<
            IBotContext & { match: RegExpExecArray },
            Update.CallbackQueryUpdate<CallbackQuery>
        >,
        countriesArray: IResultCountriesArray[]
    ) {
        const shuffledArray = [...countriesArray]
            .sort(() => Math.random() - 0.5)
            .slice(0, ctx.session.countSteps)
        ctx.session.shuffledCountries = shuffledArray
        this.getQuestion(ctx)
    }

    async getQuestion(
        ctx: NarrowedContext<
            IBotContext & { match: RegExpExecArray },
            Update.CallbackQueryUpdate<CallbackQuery>
        >
    ) {
        try {
            const { allCountries, shuffledCountries, flagStep: step } = ctx.session

            const four_countries = [shuffledCountries[step]]

            while (four_countries.length < 4) {
                const randomIndex = Math.floor(Math.random() * allCountries.length)
                if (four_countries.includes(allCountries[randomIndex])) continue
                four_countries.push(allCountries[randomIndex])
            }

            const buttonsAnswer = four_countries
                .map((i, index) => {
                    const item = [
                        Markup.button.callback(i.country, index === 0 ? 'right' : 'wrong'),
                    ]
                    return item
                })
                .sort(() => Math.random() - 0.5)

            await ctx.reply(shuffledCountries[step].flag)

            const message = await ctx.reply(
                'Выберите правильный вариант.',
                Markup.inlineKeyboard(buttonsAnswer)
            )

            ctx.session.idLastMessage = message.message_id
        } catch (e) {
            console.log('Error while getting new question', e)
        }
    }

    answerHandle(
        ctx: NarrowedContext<
            IBotContext & { match: RegExpExecArray },
            Update.CallbackQueryUpdate<CallbackQuery>
        >,
        typeAnswer: AnswerAction
    ) {
        let textResponse = null

        const { shuffledCountries, flagStep: step } = ctx.session

        const country = shuffledCountries[step]?.country

        if (!country) return

        typeAnswer === 'wrong'
            ? (textResponse = `❌ ${country} — верный ответ.`)
            : (textResponse = `✅ ${country} — верный ответ.`)

        if (typeAnswer === 'wrong') ctx.session.errors.push(country)

        ctx.reply(textResponse)

        this.nextStep(ctx)
    }

    async nextStep(
        ctx: NarrowedContext<
            IBotContext & { match: RegExpExecArray },
            Update.CallbackQueryUpdate<CallbackQuery>
        >
    ) {
        const { countSteps, flagStep: step, errors } = ctx.session

        if (step < countSteps - 1) {
            ctx.session.flagStep += 1
            this.getQuestion(ctx)
            return
        }

        await ctx.reply(endFlagGame)

        const guideForAI = setAIGuide(countSteps, errors)

        const dataForAI = [setChatMessage(ChatCompletionRequestMessageRoleEnum.User, guideForAI)]

        openai
            .chat(dataForAI)
            .then(async (response) => {
                const replyContent = response.data.choices[0].message?.content
                await ctx.reply(replyContent as string)
                this.wantPlayAgain(ctx)
            })
            .catch((e) => {
                console.log('Error while getting statistic response from OpenAI', e)
            })
    }

    async wantPlayAgain(
        ctx: NarrowedContext<
            IBotContext & { match: RegExpExecArray },
            Update.CallbackQueryUpdate<CallbackQuery>
        >
    ) {
        const message = await ctx.reply(
            'Сыграть ещё раз?',
            Markup.inlineKeyboard([
                [
                    Markup.button.callback('Да', 'playAgain'),
                    Markup.button.callback('Нет', 'stopPlay'),
                ],
            ])
        )

        ctx.session.idLastMessage = message.message_id
    }

    async startGameAgain(
        ctx: NarrowedContext<
            IBotContext & { match: RegExpExecArray },
            Update.CallbackQueryUpdate<CallbackQuery>
        >
    ) {
        const message = await ctx.reply(
            'Выберите количество флагов.',
            Markup.inlineKeyboard([markupFlags])
        )

        ctx.session.idLastMessage = message.message_id
    }

    async stopPlay(
        ctx: NarrowedContext<
            IBotContext & { match: RegExpExecArray },
            Update.CallbackQueryUpdate<CallbackQuery>
        >
    ) {
        const first_name = ctx.from?.first_name
        const id = ctx.from?.id

        ctx.session.idLastMessage = null

        if (id && first_name) {
            mongoClient.setMode(id, 'CHAT', first_name)
            await ctx.reply(chatGPTMode)
        }
    }
}
