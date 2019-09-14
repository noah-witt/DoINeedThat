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
    return __awaiter(this, void 0, void 0, function* () {
        const status = doINeedThatStatus;
        if (!status.enabled)
            return;
        if (status.siteConfig.checkoutPrompt) {
            //now check to see if page matches regex.
            const path = window.location.pathname;
            if (compareRegex(path, status.siteConfig.checkoutPage)) {
                //checkout page.
                let price;
                try {
                    yield sleep(250);
                    const priceText = $(status.siteConfig.totalPrice).text().replace(/[^0-9.-]+/g, "");
                    const priceTemp = parseFloat(priceText);
                    // tslint:disable-next-line: no-string-throw
                    if (isNaN(priceTemp))
                        throw ('not correct');
                    price = priceTemp;
                }
                catch (err) {
                    price = parseFloat(prompt('enter total price.'));
                }
                const key = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                let locked = true;
                chrome.runtime.sendMessage({ key, type: 'register' });
                chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
                    if (msg.type !== 'unlock')
                        return false;
                    //unlock
                    locked = false;
                    return true;
                });
                chrome.runtime.sendMessage({ target: "/pages/calc.html?price=" + price + '&key=' + key, type: 'openTab' });
            }
            return;
        }
    });
}
//freze loader for time
function frezeForTime(ms) {
    const start = new Date();
    let now = new Date();
    const data = [];
    while (now.valueOf() < start.valueOf() + ms) {
        data.push(now.valueOf());
        data.push(data);
        now = new Date();
    }
}
const sleep = (milliseconds) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
};
function sendMsg() {
    const promise = new Promise((resolve) => {
        chrome.runtime.sendMessage({ hostname: location.hostname, type: 'get' }, (response) => {
            resolve(response);
        });
    });
    return promise;
}
function compareRegex(val, regex) {
    if (!Array.isArray(regex))
        regex = [regex];
    let found = false;
    regloop: for (let i = 0; i < regex.length; i++) {
        const exp = new RegExp(regex[i]);
        if (exp.test(val)) {
            found = true;
            break regloop;
        }
    }
    return found;
}
initCotent();
