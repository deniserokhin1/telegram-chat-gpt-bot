export type Mode = 'development' | 'production'

export interface IErrorResponseOpenAI {
    code: number
    message: string
}

export type Type = 'countFlags' | 'region' | 'answer'
export type Action =
    | '3'
    | '10'
    | '20'
    | '30'
    | '40'
    | '50'
    | 'europe'
    | 'africa'
    | 'americas'
    | 'asia'
    | 'all'
    | 'right'
    | 'wrong'
    | 'play-again'
    | 'stop-play'

export interface IActions {
    action: Action
    text: string
    type?: Type
    callback: any
}

export type AnswerAction = Extract<Action, 'right' | 'wrong'>

export interface IResultCountriesArray {
    country: string
    flag: string
}

export interface ICountry {
    name: {
        common: string
        official: string
        nativeName: {
            fra: {
                official: string
                common: string
            }
        }
    }
    tld: string[]
    cca2: string
    ccn3: string
    cca3: string
    cioc: string
    independent: boolean
    status: string
    unMember: boolean
    currencies: {
        [code: string]: {
            name: string
            symbol: string
        }
    }
    idd: {
        root: string
        suffixes: string[]
    }
    capital: string[]
    altSpellings: string[]
    region: string
    subregion: string
    languages: {
        [code: string]: string
    }
    translations: {
        [lang: string]: {
            official: string
            common: string
        }
    }
    latlng: number[]
    landlocked: boolean
    borders: string[]
    area: number
    demonyms: {
        eng: {
            f: string
            m: string
        }
        fra: {
            f: string
            m: string
        }
    }
    flag: string
    maps: {
        googleMaps: string
        openStreetMaps: string
    }
    population: number
    gini: {
        [year: number]: number
    }
    fifa: string
    car: {
        signs: string[]
        side: string
    }
    timezones: string[]
    continents: string[]
    flags: {
        png: string
        svg: string
        alt: string
    }
    coatOfArms: {
        png: string
        svg: string
    }
    startOfWeek: string
    capitalInfo: {
        latlng: number[]
    }
}
