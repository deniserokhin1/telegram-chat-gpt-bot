"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ogg = void 0;
const axios_1 = __importDefault(require("axios"));
// ядро библиотеки
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
// то что позволяет конвертировать
const ffmpeg_1 = __importDefault(require("@ffmpeg-installer/ffmpeg"));
const fs_1 = require("fs");
const path_1 = require("path");
const utils_1 = require("../utils");
// создаем путь до корневой папки, в которой лежит код
// const __dirname = dirname(fileURLToPath(import.meta.url))
class OggConverter {
    constructor() {
        // устанавливаем путь до конвертора
        fluent_ffmpeg_1.default.setFfmpegPath(ffmpeg_1.default.path);
    }
    toMp3(oggFile, output) {
        try {
            // с помощью dirname(oggFile) получаем путь до ogg файла
            const outputPath = (0, path_1.resolve)((0, path_1.dirname)(oggFile), `${output}.mp3`);
            return new Promise((resolve, reject) => {
                (0, fluent_ffmpeg_1.default)(oggFile)
                    .inputOption('-t 30')
                    .output(outputPath)
                    .on('end', () => {
                    (0, utils_1.removeFile)(oggFile);
                    resolve(outputPath);
                })
                    .on('error', (error) => {
                    reject(error.message);
                })
                    .run();
            });
        }
        catch (error) {
            console.log('Error while converting to mp3', error.message);
        }
    }
    async create(url, filename) {
        try {
            // создаем путь до места, где будет лежать ogg файл
            const oggPath = (0, path_1.resolve)(__dirname, '../voices', `${filename}.ogg`);
            // указываем, что хотим получить ответ в виде потока
            const response = await (0, axios_1.default)({
                method: 'get',
                url,
                responseType: 'stream',
            });
            // создаем поток для записи
            const stream = (0, fs_1.createWriteStream)(oggPath);
            // записываем результат запроса в поток
            response.data.pipe(stream);
            // дожидаемся окончания записи
            return new Promise((resolve) => {
                stream.on('finish', () => {
                    resolve(oggPath);
                });
            });
        }
        catch (error) {
            console.log('Error while creating ogg', error.message);
        }
    }
}
exports.ogg = new OggConverter();
