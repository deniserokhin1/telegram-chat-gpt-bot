import { ObjectId } from 'mongodb'
import { ChatCompletionRequestMessageRoleEnum } from 'openai'
import { Context } from 'telegraf'
import { IResultCountriesArray } from '../models/types'

export interface IBotContext extends Context {
    session: ISessionData
}

export interface IMessage {
    role: ChatCompletionRequestMessageRoleEnum
    content: string
}

export interface ISessionData {
    shuffledCountries: IResultCountriesArray[]
    allCountries: IResultCountriesArray[]
    countSteps: number
    idLastMessage: number | null
    flagStep: number
    errors: string[]
}

export type Mode = 'OPENAI' | 'WEATHER' | 'GAME'

export interface UserDocument {
    _id: ObjectId
    first_name: string
    id: number
    mode: string
    messages: IMessage[]
}
