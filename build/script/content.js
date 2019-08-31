var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function doIneedThat_init() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('need that');
        const configUrl = chrome.runtime.getURL('/configs/list.json');
        console.log(configUrl);
        const config = yield doIneedThat_reqJson(configUrl);
        console.log(config);
        let matchingSite;
        loop: for (let i = 0; i < config.sites.length; i++) {
            const s = config.sites[i];
            for (let j = 0; j < s.matches.length; j++) {
                const reg = new RegExp(s.matches[j]);
                if (!reg.test)
                    continue;
                //passed reg exp;
                matchingSite = s;
                break loop;
            }
        }
        if (typeof matchingSite === 'undefined')
            return;
        //match found.
        const cfgUrl = chrome.runtime.getURL('configs/' + matchingSite.config);
        const cfg = yield doIneedThat_reqJson(cfgUrl);
        console.log(cfg);
    });
}
function doIneedThat_reqJson(url) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(function (resolve, reject) {
            let xhr = new XMLHttpRequest();
            xhr.overrideMimeType("application/json");
            xhr.open("GET", url);
            xhr.onload = function () {
                if (this.status >= 200 && this.status < 300) {
                    resolve(JSON.parse(xhr.response));
                }
                else {
                    reject({
                        status: this.status,
                        statusText: xhr.statusText
                    });
                }
            };
            xhr.onerror = function () {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            };
            xhr.send();
        });
    });
}
doIneedThat_init();
