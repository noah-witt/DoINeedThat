var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const doINeedThatStatus = { enabled: false };
function initCotent() {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield sendMsg();
        if (typeof result === 'undefined')
            return;
        doINeedThatStatus.siteConfig = result;
        doINeedThatStatus.enabled = true;
        interfere();
        return;
    });
}
function interfere() {
    const status = doINeedThatStatus;
    if (!status.enabled)
        return;
    if (status.siteConfig.pause) {
        frezeForTime(status.siteConfig.pauseTimeMs);
    }
}
//freze loader for time
function frezeForTime(ms) {
    console.log(ms);
    const start = new Date();
    let now = new Date();
    const data = [];
    while (now.valueOf() < start.valueOf() + ms) {
        data.push(now.valueOf());
        data.push(data);
        now = new Date();
    }
}
function sendMsg() {
    const promise = new Promise((resolve) => {
        chrome.runtime.sendMessage({ hostname: location.hostname }, (response) => resolve(response));
    });
    return promise;
}
initCotent();
