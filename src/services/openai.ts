import { Configuration, OpenAIApi } from 'openai'
import { createReadStream } from 'fs'
import { IMessage } from '../context/context.interface'
import { IErrorResponseOpenAI } from '../models/types'
import { configService } from '../config/config.service'

class OpenAI {
    openai: OpenAIApi
    error: IErrorResponseOpenAI = { code: 200, message: '' }

    constructor(apiKey: string) {
        const configuration = new Configuration({
            apiKey,
        })
        this.openai = new OpenAIApi(configuration)
    }

    async chat(messages: IMessage[]) {
        console.log('messages:', messages)
        try {
            return await this.openai.createChatCompletion({
                model: 'gpt-3.5-turbo',
                messages,
            })
        } catch (e: any) {
            console.log('Error while getting server response from OpenAI')
            this.error.code = e.response.status
            this.error.message = e.response.data.error.message
            return Promise.reject(this.error)
        }
    }

    async transcription(filePath: string) {
        try {
            return await this.openai.createTranscription(
                //@ts-ignore
                createReadStream(filePath),
                'whisper-1'
            )
        } catch (e: any) {
            console.log('Error while transcription', e.message)
        }
    }
}

export const openai = new OpenAI(configService.get('OPENAI_KEY'))
