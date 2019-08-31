interface site {
    config: string;
    matches: string[];
}

interface configList {
    sites: site[];
}

interface siteConfig {
    name: string;
    slowImg: boolean;
    checkoutPage: string[];
    checkoutPrompt: boolean;
}

async function doIneedThat_init(): Promise<void> {
    console.log('need that');
    const configUrl = chrome.runtime.getURL('/configs/list.json');
    console.log(configUrl);
    const config: configList = await doIneedThat_reqJson(configUrl);
    console.log(config);
    let matchingSite: site;
    loop: for(let i=0; i< config.sites.length; i++) {
        const s: site = config.sites[i];
        for(let j=0; j < s.matches.length;j++) {
            const reg = new RegExp(s.matches[j]);
            if(!reg.test) continue;
            //passed reg exp;
            matchingSite = s;
            break loop;
        }
    }
    if(typeof matchingSite === 'undefined') return;
    //match found.
    const cfgUrl = chrome.runtime.getURL('/configs/'+matchingSite.config);
    const cfg: siteConfig = await doIneedThat_reqJson(cfgUrl);
    console.log(cfg);
}

async function doIneedThat_reqJson(url): Promise<any> {
    return new Promise(function (resolve, reject) {
        let xhr = new XMLHttpRequest();
        xhr.overrideMimeType("application/json");
        xhr.open("GET", url);
        xhr.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                resolve(JSON.parse(xhr.response));
            } else {
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
}
doIneedThat_init();