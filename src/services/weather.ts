import axios from 'axios'
import { configService } from '../config/config.service'

class Weather {
    token: string
    constructor(apiYaKey: string) {
        this.token = apiYaKey
    }

    async getWeather(city: string) {
        const params = {
            q: city,
            units: 'metric',
            lang: 'ru',
            appid: this.token,
        }
        const urlParams = new URLSearchParams(params)
        const queryString = urlParams.toString()
        try {
            const result = await axios(
                `https://api.openweathermap.org/data/2.5/weather?${queryString}`
            )
            return result
        } catch (e) {
            console.log('Error while getting WeatherAPI server response', e)
        }
    }
}

export const weatherClass = new Weather(configService.get('WEATHER'))
