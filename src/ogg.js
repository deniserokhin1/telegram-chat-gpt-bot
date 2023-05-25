import axios from 'axios'
// ядро библиотеки
import ffmpeg from 'fluent-ffmpeg'
// то что позволяет конвертировать
import installer from '@ffmpeg-installer/ffmpeg'
import { createWriteStream } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { removeFile } from './utils.js'

// создаем путь до корневой папки, в которой лежит код
const __dirname = dirname(fileURLToPath(import.meta.url))

class OggConverter {
    constructor() {
        // устанавливаем путь до конвертора
        ffmpeg.setFfmpegPath(installer.path)
    }

    toMp3(oggFile, output) {
        try {
            // с помощью dirname(oggFile) получаем путь до ogg файла
            const outputPath = resolve(dirname(oggFile), `${output}.mp3`)

            return new Promise((resolve, reject) => {
                ffmpeg(oggFile)
                    .inputOption('-t 30')
                    .output(outputPath)
                    .on('end', () => {
                        removeFile(oggFile)
                        resolve(outputPath)
                    })
                    .on('error', (error) => {
                        reject(error.message)
                    })
                    .run()
            })
        } catch (error) {
            console.log('Error while converting to mp3', error.message)
        }
    }

    async create(url, filename) {
        try {
            // создаем путь до места, где будет лежать ogg файл
            const oggPath = resolve(__dirname, '../voices', `${filename}.ogg`)

            // указываем, что хотим получить ответ в виде потока
            const responce = await axios({
                method: 'get',
                url,
                responseType: 'stream',
            })

            // создаем поток для записи
            const stream = createWriteStream(oggPath)
            // записываем результат запроса в поток
            responce.data.pipe(stream)

            // дожидаемся окончания записи
            await new Promise((resolve) => {
                stream.on('finish', () => {
                    resolve(oggPath)
                })
            })

            return oggPath
        } catch (error) {
            console.log('Error while creating ogg', error.message)
        }
    }
}

export const ogg = new OggConverter()
