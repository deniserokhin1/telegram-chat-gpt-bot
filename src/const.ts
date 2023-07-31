const facts = [
    'Как вы знаете, Земля имеет очень большой размер. Однако, если бы вы сжали ее до размера мячика для гольфа, то она стала бы черной дырой. Еще один интересный факт: звезда Betelgeuse находится на расстоянии 640 световых лет от Земли и одна из крупнейших звезд в нашей галактике. Она такая большая, что если бы она была на месте Солнца, то ее радиус выходил бы за орбиту Юпитера!',
    'Существует международный конкурс улыбок, который проводится с 1997 года в Японии. Участники соревнуются в том, кто имеет самую красивую и привлекательную улыбку. Во время конкурса участники проходят специальные тесты и интервью, а потом жюри определяет победителя. Кто бы мог подумать, что улыбка может быть настолько важной, что даже существует конкурс на ее лучшую версию!',
    'Во время своей жизни великий композитор Людвиг ван Бетховен был частично глухим, что не помешало ему создать некоторые известнейшие произведения классической музыки, в том числе "Лунную сонату", "Девятую симфонию" и "Юмореску". Интересно, что он продолжал создавать музыку, не слыша своих шедевров в полном объеме.',
    'Все пингвины на самом деле не живут на льду, как мы иногда думаем. Некоторые виды пингвинов живут на островах, которые находятся далеко от льда, например, на островах Галапагос или на южной половине Африки. Некоторые виды пингвинов также живут в более теплых водах, плавая в поисках еды и возвращаясь на берег только для размножения и гнездования.',
]

export const loadingMessage = 'Отправка запроса... Пожалуйста, подождите.'
export const clearContext = '🗑️ Очистить контекст'
export const longRead = '🏎 Пересказ статьи'
export const weather = '🌦 Узнать погоду'
export const chatGPT = '🤖 ChatGPT'
export const game = '🎮 Игра "Флаги"'
export const helloMessage =
    '👋 Привет! Я Telegram бот, разработанный Денисом Ерохиным на платформе Node.js с использованием библиотеки Telegraf.js. Я работаю на базе API OpenAI. Вы можете общаться со мной текстом и голосом.'

export const cleared = 'Контекст очищен.'
export const readMode = 'Вы вошли в режим чтения статьи.'
export const weatherMode = 'Введите название города, чтобы узнать погоду.'
export const chatGPTMode = 'Вы вошли в режим общения с ИИ.'
export const gameMode = 'Вы вошли в режим игры.'
export const YANDEX = 'YANDEX'
export const OPENAI = 'OPENAI'
export const WEATHER = 'WEATHER'
export const GAME = 'GAME'

interface IErrorResponse {
    [key: number]: string
    400: string
    429: string
    503: string
    null: string
}

export const errorResponse: IErrorResponse = {
    400: 'Произошла ошибка. Возможно плохая связь. Очистите контекст и попробуйте ещё раз.',
    429: 'Превышен лимит запросов в минуту. Попробуйте сделать запрос через одну минуту.',
    503: 'Бот сбился. Пожалуйста, повторите запрос.',
    null: 'Произошла непредвиденная ошибка. Очистите контекст и попробуйте ещё раз чуть позже.',
}

export const regions = {
    europe: 'Europe',
    asia: 'Asia',
    oceania: 'Oceania',
    americas: 'Americas',
    africa: 'Africa',
}

export function setAIGuide(counSteps: number, erros: string[]) {
    return `В игре 'Флаги' было задано ${counSteps} вопросов. Ошибки: ${
        erros.length ? erros : erros.length
    }. Пришли кратку статистику по этой игре.`
}

interface IWeatherConditions {
    [key: number]: string
}

export const weatherConditions: IWeatherConditions = {
    200: '⛈️',
    201: '⛈️',
    202: '⛈️',
    210: '⛈️',
    211: '⛈️',
    212: '⛈️',
    221: '⛈️',
    230: '⛈️',
    231: '⛈️',
    232: '⛈️',
    300: '🌧️',
    301: '🌧️',
    302: '🌧️',
    310: '🌧️',
    311: '🌧️',
    312: '🌧️',
    313: '🌧️',
    314: '🌧️',
    321: '🌧️',
    500: '🌧️',
    501: '🌧️',
    502: '🌧️',
    503: '🌧️',
    504: '🌧️',
    511: '🌧️',
    520: '🌧️',
    521: '🌧️',
    522: '🌧️',
    531: '🌧️',
    600: '❄️',
    601: '❄️',
    602: '❄️',
    611: '❄️',
    612: '❄️',
    613: '❄️',
    615: '❄️',
    616: '❄️',
    620: '❄️',
    621: '❄️',
    622: '❄️',
    701: '🌫️',
    711: '🚬',
    721: '🌫️',
    731: '💨',
    741: '🌫️',
    751: '🏖️',
    761: '💨',
    762: '🌋',
    771: '🌬️',
    781: '🌪️',
    800: '☀️',
    801: '☁️',
    802: '☁️',
    803: '☁️',
    804: '☁️',
}

// const weatherResponse = (data) => {
//     return `
//     🌡️ Текущая температура: ${data.main.temp}°C
//     🌡️ Ощущается как: ${data.main.feels_like}°C
//     🔽 Минимальная температура сегодня: ${data.main.temp_min}°C
//     🔼 Максимальная температура сегодня: ${data.main.temp_max}°C
//     💧 Влажность: ${data.main.humidity}%
//     `
// }

// export const weatherMessage = (data) => {
//     const dateOptions = { hour: 'numeric', minute: 'numeric' }
//     const sunriseTime = new Date(data.sys.sunrise * 1000).toLocaleTimeString(
//         'ru-RU',
//         dateOptions
//     )
//     const sunsetTime = new Date(data.sys.sunset * 1000).toLocaleTimeString(
//         'ru-RU',
//         dateOptions
//     )

//     return {
//         emoji: weatherConditions[data.weather[0].id],
//         text: `
//         ${data.name}, ${countries[data.sys.country]}
//         🌡️ Текущая температура: ${Math.round(data.main.temp)}°C
//         🌡️ Ощущается как: ${Math.round(data.main.feels_like)}°C
//         🔽 Мин. температура: ${Math.round(data.main.temp_min)}°C
//         🔼 Макс. температура: ${Math.round(data.main.temp_max)}°C
//         💧 Влажность: ${data.main.humidity}%
//         🌬️ Скорость ветра: ${data.wind.speed} м/с
//         ☁️ Облачность: ${data.clouds.all}%
//         ☀️ Восход: ${sunriseTime}
//         🌅 Закат: ${sunsetTime}
//         `,
//     }
// }