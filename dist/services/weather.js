"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.weatherClass = void 0;
const axios_1 = __importDefault(require("axios"));
const config_service_1 = require("../config/config.service");
class Weather {
    constructor(apiYaKey) {
        this.token = apiYaKey;
    }
    async getWeather(city) {
        const params = {
            q: city,
            units: 'metric',
            lang: 'ru',
            appid: this.token,
        };
        const urlParams = new URLSearchParams(params);
        const queryString = urlParams.toString();
        try {
            const result = await (0, axios_1.default)(`https://api.openweathermap.org/data/2.5/weather?${queryString}`);
            return result;
        }
        catch (e) {
            console.log('Error while getting WeatherAPI server response', e);
        }
    }
}
exports.weatherClass = new Weather(config_service_1.configService.get('WEATHER'));
