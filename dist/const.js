"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.weatherConditions = exports.regions = exports.errorResponse = exports.GAME = exports.WEATHER = exports.OPENAI = exports.YANDEX = exports.gameMode = exports.chatGPTMode = exports.weatherMode = exports.readMode = exports.cleared = exports.endFlagGame = exports.helloMessage = exports.game = exports.chatGPT = exports.weather = exports.longRead = exports.clearContext = exports.loadingMessage = void 0;
const facts = [
    'Как вы знаете, Земля имеет очень большой размер. Однако, если бы вы сжали ее до размера мячика для гольфа, то она стала бы черной дырой. Еще один интересный факт: звезда Betelgeuse находится на расстоянии 640 световых лет от Земли и одна из крупнейших звезд в нашей галактике. Она такая большая, что если бы она была на месте Солнца, то ее радиус выходил бы за орбиту Юпитера!',
    'Существует международный конкурс улыбок, который проводится с 1997 года в Японии. Участники соревнуются в том, кто имеет самую красивую и привлекательную улыбку. Во время конкурса участники проходят специальные тесты и интервью, а потом жюри определяет победителя. Кто бы мог подумать, что улыбка может быть настолько важной, что даже существует конкурс на ее лучшую версию!',
    'Во время своей жизни великий композитор Людвиг ван Бетховен был частично глухим, что не помешало ему создать некоторые известнейшие произведения классической музыки, в том числе "Лунную сонату", "Девятую симфонию" и "Юмореску". Интересно, что он продолжал создавать музыку, не слыша своих шедевров в полном объеме.',
    'Все пингвины на самом деле не живут на льду, как мы иногда думаем. Некоторые виды пингвинов живут на островах, которые находятся далеко от льда, например, на островах Галапагос или на южной половине Африки. Некоторые виды пингвинов также живут в более теплых водах, плавая в поисках еды и возвращаясь на берег только для размножения и гнездования.',
];
exports.loadingMessage = 'Отправка запроса... Пожалуйста, подождите.';
exports.clearContext = '🗑️ Очистить контекст';
exports.longRead = '🏎 Пересказ статьи';
exports.weather = '🌦 Узнать погоду';
exports.chatGPT = '🤖 ChatGPT';
exports.game = '🎮 Игра "Флаги"';
exports.helloMessage = '👋 Привет! Я Telegram бот, разработанный Денисом Ерохиным на платформе Node.js с использованием библиотеки Telegraf.js. Я работаю на базе API OpenAI. Вы можете общаться со мной текстом и голосом.';
exports.endFlagGame = 'Конец игры. Считаем статистику.';
exports.cleared = 'Контекст очищен.';
exports.readMode = 'Вы вошли в режим чтения статьи.';
exports.weatherMode = 'Введите название города, чтобы узнать погоду.';
exports.chatGPTMode = 'Вы вошли в режим общения с ИИ.';
exports.gameMode = 'Вы вошли в режим игры.';
exports.YANDEX = 'YANDEX';
exports.OPENAI = 'OPENAI';
exports.WEATHER = 'WEATHER';
exports.GAME = 'GAME';
exports.errorResponse = {
    400: 'Произошла ошибка. Возможно плохая связь. Очистите контекст и попробуйте ещё раз.',
    429: 'Превышен лимит запросов в минуту. Попробуйте сделать запрос через одну минуту.',
    503: 'Бот сбился. Пожалуйста, повторите запрос.',
    null: 'Произошла непредвиденная ошибка. Очистите контекст и попробуйте ещё раз чуть позже.',
};
exports.regions = {
    europe: 'Europe',
    asia: 'Asia',
    oceania: 'Oceania',
    americas: 'Americas',
    africa: 'Africa',
};
exports.weatherConditions = {
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
};
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
