import { Telegraf, session } from 'telegraf'
import { IConfigService } from './config/config.interface'
import { configService } from './config/config.service'
import { IBotContext } from './context/context.interface'
import { Command } from './commands/command.class'
import { StartCommand } from './commands/start.command'
import { Mode } from './models/types'
import { ClearContextHear } from './hears/clearedContext.hear'
import { TextHandler } from './input/text'
import { VoiceHandler } from './input/voice'
import { ChatGPTHear } from './hears/chatGPT.hear'
import { WeatherHear } from './hears/weather.hear'
import { GameHear } from './hears/game.hear'
import { FlagsActions } from './actions/flags.actions'

const MODE = (process.env.mode as Mode) === 'development' ? 'DEV' : 'PROD'

class Bot {
    bot: Telegraf<IBotContext>
    commands: Command[] = []
    hears: Command[] = []
    input: Command[] = []
    actions: Command[] = []

    constructor(private readonly configService: IConfigService) {
        this.bot = new Telegraf<IBotContext>(this.configService.get(`TELEGRAM_TOKEN_${MODE}`))
        this.bot.use(session())
    }

    init() {
        this.commands = [new StartCommand(this.bot)]
        this.hears = [
            new ClearContextHear(this.bot),
            new WeatherHear(this.bot),
            new ChatGPTHear(this.bot),
            new GameHear(this.bot),
        ]
        this.input = [new TextHandler(this.bot), new VoiceHandler(this.bot)]
        this.actions = [new FlagsActions(this.bot)]

        this.commands.forEach((command) => command.handle())
        this.hears.forEach((command) => command.handle())
        this.input.forEach((command) => command.handle())
        this.actions.forEach((command) => command.handle())

        this.bot.launch()
    }
}

const bot = new Bot(configService)

bot.init()
process.once('SIGINT', () => bot.bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.bot.stop('SIGTERM'))
