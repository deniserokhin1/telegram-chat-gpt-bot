import axios from 'axios'

class Country {
    async getCountries(region) {
        const q = region && region !== 'all' ? `region/${region}` : 'all'
        let arrayCountries = null
        try {
            const result = await axios(`https://restcountries.com/v3.1/${q}`)
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

export const country = new Country()
