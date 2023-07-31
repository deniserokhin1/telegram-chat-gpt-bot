import { Markup, NarrowedContext, Telegraf } from 'telegraf'
import { Update, CallbackQuery } from 'telegraf/types'
import { IBotContext } from '../context/context.interface'
import { Command } from '../commands/command.class'
import { AnswerAction, IActions, IResultCountriesArray } from '../models/types'
import { countriesClass } from '../services/countries'
import { openai } from '../services/openai'
import { setChatMessage, setInitialSession } from '../utils'
import { ChatCompletionRequestMessageRoleEnum } from 'openai'
import { setAIGuide } from '../const'

export class FlagsActions extends Command {
    actions: IActions[] = []

    constructor(bot: Telegraf<IBotContext>) {
        super(bot)

        this.randomizeCountriesArray = this.randomizeCountriesArray.bind(this)
        this.regionHandle = this.regionHandle.bind(this)
        this.sendRegions = this.sendRegions.bind(this)
        this.answerHandle = this.answerHandle.bind(this)

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
                text: '— верный ответ',
                type: 'answer',
                callback: this.answerHandle,
            },
        ]
    }

    handle(): void {
        this.actions.forEach((item) => {
            const { callback, text, type, action } = item

            this.bot.action(action, async (ctx) => {
                await ctx.answerCbQuery()
                const { message } = ctx.update.callback_query

                type === 'answer'
                    ? await ctx.deleteMessage(message?.message_id)
                    : await ctx.editMessageText(text)

                callback(ctx, action)
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
            .then(async (result: IResultCountriesArray[] | undefined) => {
                if (!result) return
                ctx.session.allCountries = [...result]
                this.randomizeCountriesArray(ctx, result)
            })
            .catch((error: any) =>
                console.log(`Error while getting countries for ${region}: ${error}`)
            )
    }

    async randomizeCountriesArray(
        ctx: NarrowedContext<
            IBotContext & { match: RegExpExecArray },
            Update.CallbackQueryUpdate<CallbackQuery>
        >,
        countriesArray: IResultCountriesArray[]
    ) {
        const shuffledArray = countriesArray
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
                        Markup.button.callback(
                            i.country,
                            index === 0 ? 'right' : 'wrong'
                        ),
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

        const { shuffledCountries, errors, flagStep: step } = ctx.session

        const country = shuffledCountries[step].country

        typeAnswer === 'wrong'
            ? (textResponse = `❌ ${country} — верный ответ.`)
            : (textResponse = `✅ ${country} — верный ответ.`)

        if (typeAnswer === 'wrong') ctx.session.errors.push(country)

        this.nextStep(ctx, textResponse)
    }

    async nextStep(
        ctx: NarrowedContext<
            IBotContext & { match: RegExpExecArray },
            Update.CallbackQueryUpdate<CallbackQuery>
        >,
        response: string
    ) {
        await ctx.reply(response)
        const { countSteps, flagStep: step, errors } = ctx.session

        if (step >= countSteps - 1) {
            await ctx.reply('Конец игры. Считаем статистику.')

            const guideForAI = setAIGuide(countSteps, errors)
            console.log('guideForAI:', guideForAI)

            const data = [
                setChatMessage(ChatCompletionRequestMessageRoleEnum.User, guideForAI),
            ]

            openai.chat(data).then(async (response) => {
                const replyContent = response.data.choices[0].message?.content
                ctx.reply(replyContent as string)
            })
            ctx.session.idLastMessage = 0
            ctx.session.errors = []
            return
        }
        ctx.session.flagStep += 1
        this.getQuestion(ctx)
    }
}
