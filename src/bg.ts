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

interface keyItem {
    source: chrome.runtime.MessageSender;
    id: string;
}
interface keyStore {
    [key: string]: keyItem
}
let list;
const keys: keyStore = {};
async function initBG() {
    list = await $.getJSON('/configs/list.json');
}

async function pullData(url: string): Promise<siteConfig> {
    let matchingSite: site;
    loop: for(let i=0; i< list.sites.length; i++) {
        const s: site = list.sites[i];
        for(let j=0; j < s.matches.length;j++) {
            const reg = new RegExp(s.matches[j]);
            if(!reg.test(url)) continue;
            //passed reg exp;
            matchingSite = s;
            break loop;
        }
    }
    if(typeof matchingSite === 'undefined') return;
    //match found.
    const cfgUrl = chrome.runtime.getURL('/configs/'+matchingSite.config);
    const cfg: siteConfig = await $.getJSON(cfgUrl);
    return cfg;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch(request.type) {
        case 'get':
            pullData(request.hostname).then((response) => {
                sendResponse(response);
            }).catch((err)=> {
                console.error(err);
            });
            break;
        case 'openTab':
            const url = chrome.runtime.getURL(request.target);
            chrome.tabs.create({ url });
            break;
        case 'register' :
            keys[request.key] = ({source: sender, id:request.key});
            break;
        case 'unlock' :
            const key = keys[request.key];
            console.log({key, sender, request});
            chrome.tabs.sendMessage(key.source.tab.id, {type: 'unlock', reject: request.reject});
    }
    return true;
});

initBG();
