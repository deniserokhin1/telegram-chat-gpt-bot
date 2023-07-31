import axios from 'axios'
import { ICountry } from '../models/types'

class Country {
    async getCountries(region: string) {
        const path = region === 'all' ? 'all' : `region/${region}`

        let arrayCountries = null

        try {
            const result = await axios.get<ICountry[]>(
                `https://restcountries.com/v3.1/${path}`
            )

            arrayCountries = result.data.map((i) => {
                return {
                    country: i.translations.rus.common,
                    flag: i.flag,
                }
            })

            return arrayCountries
        } catch (e) {
            console.log('Error while getting CountriesAPI server response', e)
        }
    }
}

export const countriesClass = new Country()
