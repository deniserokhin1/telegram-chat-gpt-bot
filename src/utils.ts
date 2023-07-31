import { unlink } from 'fs/promises'
import { ChatCompletionRequestMessageRoleEnum } from 'openai'
import { IBotContext, ISessionData } from './context/context.interface'
import { NarrowedContext } from 'telegraf'
import { Update, Message } from 'telegraf/types'

export async function removeFile(path: string) {
    try {
        await unlink(path)
    } catch (e: any) {
        console.log('Error while removing file', e.message)
    }
}

export function setChatMessage(
    role: ChatCompletionRequestMessageRoleEnum,
    content: string
) {
    return { role, content }
}

export function setInitialSession(): ISessionData {
    return {
        countSteps: 0,
        allCountries: [],
        shuffledCountries: [],
        idLastMessage: 0,
        flagStep: 0,
        errors: [],
    }
}

export async function deleteLastMessage(
    id: number | null,
    ctx: NarrowedContext<
        IBotContext & {
            match: RegExpExecArray
        },
        {
            message: Update.New & Update.NonChannel & Message.TextMessage
            update_id: number
        }
    >
) {
    ctx.session = setInitialSession()
    if (!id) return
    await ctx.deleteMessage(id)
    ctx.session.idLastMessage = null
}
