import { unlink } from 'fs/promises'

export async function removeFile(path) {
    try {
        await unlink(path)
    } catch (e) {
        console.log('Error while removing file', e.message)
    }
}

export function setNewMessage(role, content) {
    return { role, content }
}

export function setInitialSession() {
    return {
        messages: [],
        mode: '',
        game: setInitialGame(),
    }
}

export function setInitialGame() {
    return {
        allCountries: null,
        shuffledCountries: null,
        messages: [],
        step: 0,
        countSteps: 0,
        lastMessageId: null,
        erros: null,
    }
}
