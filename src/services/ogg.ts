import axios from 'axios'
// ядро библиотеки
import ffmpeg from 'fluent-ffmpeg'
// то что позволяет конвертировать
import installer from '@ffmpeg-installer/ffmpeg'
import { createWriteStream } from 'fs'
import { dirname, resolve } from 'path'
import { removeFile } from '../utils'

// создаем путь до корневой папки, в которой лежит код
// const __dirname = dirname(fileURLToPath(import.meta.url))

class OggConverter {
    constructor() {
        // устанавливаем путь до конвертора
        ffmpeg.setFfmpegPath(installer.path)
    }

    toMp3(oggFile: string, output: string) {
        try {
            // с помощью dirname(oggFile) получаем путь до ogg файла
            const outputPath = resolve(dirname(oggFile), `${output}.mp3`)

            return new Promise<string>((resolve, reject) => {
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
        } catch (error: any) {
            console.log('Error while converting to mp3', error.message)
        }
    }

    async create(url: string, filename: string) {
        try {
            // создаем путь до места, где будет лежать ogg файл
            const oggPath = resolve(__dirname, '../voices', `${filename}.ogg`)

            // указываем, что хотим получить ответ в виде потока
            const response = await axios({
                method: 'get',
                url,
                responseType: 'stream',
            })

            // создаем поток для записи
            const stream = createWriteStream(oggPath)
            // записываем результат запроса в поток
            response.data.pipe(stream)

            // дожидаемся окончания записи
            return new Promise<string>((resolve) => {
                stream.on('finish', () => {
                    resolve(oggPath)
                })
            })
        } catch (error: any) {
            console.log('Error while creating ogg', error.message)
        }
    }
}

export const ogg = new OggConverter()
