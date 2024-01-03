"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configService = exports.ConfigService = void 0;
const dotenv_1 = require("dotenv");
class ConfigService {
    constructor() {
        const { error, parsed } = (0, dotenv_1.config)();
        if (error) {
            throw new Error('There is not file .env');
        }
        if (!parsed) {
            throw new Error('File .env is empty');
        }
        this.config = parsed;
    }
    get(key) {
        const res = this.config[key];
        if (!res) {
            throw new Error('There is not such key');
        }
        return res;
    }
}
exports.ConfigService = ConfigService;
exports.configService = new ConfigService();
