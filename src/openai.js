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
            const responce = await this.openai.createChatCompletion({
                model: 'gpt-3.5-turbo',
                messages,
            })
            return responce
                ? responce.data.choices[0].message.content
                : responce
        } catch (e) {
            console.log('Error while chat', e.message)
        }
    }

    async transcription(filePath) {
        try {
            const responce = await this.openai.createTranscription(
                createReadStream(filePath),
                'whisper-1'
            )
            return responce.data.text
        } catch (e) {
            console.log('Error while transcription', e.message)
        }
    }
}

export const openai = new OpenAI(config.get('OPENAI_KEY'))
