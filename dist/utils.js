"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setAIGuide = exports.deleteLastMessage = exports.setInitialSession = exports.setChatMessage = exports.removeFile = void 0;
const promises_1 = require("fs/promises");
async function removeFile(path) {
    try {
        await (0, promises_1.unlink)(path);
    }
    catch (e) {
        console.log('Error while removing file', e.message);
    }
}
exports.removeFile = removeFile;
function setChatMessage(role, content) {
    return { role, content };
}
exports.setChatMessage = setChatMessage;
function setInitialSession() {
    return {
        countSteps: 0,
        allCountries: [],
        shuffledCountries: [],
        idLastMessage: null,
        flagStep: 0,
        errors: [],
    };
}
exports.setInitialSession = setInitialSession;
async function deleteLastMessage(id, ctx) {
    ctx.session = setInitialSession();
    if (!id)
        return;
    await ctx.deleteMessage(id);
    ctx.session.idLastMessage = null;
}
exports.deleteLastMessage = deleteLastMessage;
function setAIGuide(counSteps, erros) {
    return `Игнорируй все предыдущие инструкции. Твоя задача посчитать игровую статистику на основе данных, которые тебе предоставляют. В игре 'Флаги' было задано ${counSteps} вопросов. Ошибки: ${erros.length ? erros.join(', ') : 'нет, все верно.'}. Пришли краткую статистику по этой "Флаги".`;
}
exports.setAIGuide = setAIGuide;
