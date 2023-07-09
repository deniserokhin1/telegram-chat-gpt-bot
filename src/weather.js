import config from 'config'
import axios from 'axios'

class Weather {
    constructor(apiYaKey) {
        this.token = apiYaKey
    }

    async getWeather(city) {
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

export const weatherCL = new Weather(config.get('WEATHER'))
