var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
let list;
function initBG() {
    return __awaiter(this, void 0, void 0, function* () {
        list = yield $.getJSON('/configs/list.json');
    });
}
function pullData(url) {
    return __awaiter(this, void 0, void 0, function* () {
        let matchingSite;
        loop: for (let i = 0; i < list.sites.length; i++) {
            const s = list.sites[i];
            for (let j = 0; j < s.matches.length; j++) {
                const reg = new RegExp(s.matches[j]);
                if (!reg.test(url))
                    continue;
                //passed reg exp;
                matchingSite = s;
                break loop;
            }
        }
        if (typeof matchingSite === 'undefined')
            return;
        //match found.
        const cfgUrl = chrome.runtime.getURL('/configs/' + matchingSite.config);
        const cfg = yield $.getJSON(cfgUrl);
        return cfg;
    });
}
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.type) {
        case 'get':
            pullData(request.hostname).then((response) => {
                sendResponse(response);
            }).catch((err) => {
                console.error(err);
            });
            break;
        case 'openTab':
            const url = chrome.runtime.getURL(request.target);
            chrome.tabs.create({ url });
            break;
    }
    return true;
});
initBG();
