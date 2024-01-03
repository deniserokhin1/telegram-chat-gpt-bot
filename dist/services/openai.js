"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.openai = void 0;
const openai_1 = require("openai");
const fs_1 = require("fs");
const config_service_1 = require("../config/config.service");
const MODE = process.env.mode === 'development' ? 'DEV' : 'PROD';
class OpenAI {
    constructor(apiKey) {
        this.error = { code: 200, message: '' };
        const configuration = new openai_1.Configuration({
            apiKey,
        });
        this.openai = new openai_1.OpenAIApi(configuration);
    }
    async chat(messages) {
        try {
            return await this.openai.createChatCompletion({
                model: 'gpt-4-1106-preview',
                messages,
            });
        }
        catch (e) {
            console.log('Error while getting server response from OpenAI', e);
            this.error.code = e.response.status;
            this.error.message = e.response.data.error.message;
            return Promise.reject(this.error);
        }
    }
    async transcription(filePath) {
        try {
            return await this.openai.createTranscription(
            //@ts-ignore
            (0, fs_1.createReadStream)(filePath), 'whisper-1');
        }
        catch (e) {
            console.log('Error while transcription', e.message);
        }
    }
}
exports.openai = new OpenAI(config_service_1.configService.get(`OPENAI_KEY_${MODE}`));
