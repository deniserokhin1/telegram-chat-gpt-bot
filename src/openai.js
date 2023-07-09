import { Configuration, OpenAIApi } from 'openai'
import config from 'config'
import { createReadStream } from 'fs'

class OpenAI {
    roles = {
        ASSISTANT: 'assistant',
        USER: 'user',
        SYSTEM: 'system',
    }
    constructor(apiKey) {
        const configuration = new Configuration({
            apiKey,
        })
        this.openai = new OpenAIApi(configuration)
    }

    async chat(messages) {
        try {
            return await this.openai.createChatCompletion({
                model: 'gpt-3.5-turbo',
                messages,
            })
        } catch (e) {
            console.log('Error while getting server response', e.message)
            const error = new Error()
            error.statusCode = e.statusCode
            error.message = e.message
            return Promise.reject(error)
        }
    }

    async transcription(filePath) {
        try {
            return await this.openai.createTranscription(
                createReadStream(filePath),
                'whisper-1'
            )
        } catch (e) {
            console.log('Error while transcription', e.message)
        }
    }
}

export const openai = new OpenAI(config.get('OPENAI_KEY'))
