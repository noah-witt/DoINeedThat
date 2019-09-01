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

let list;
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

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    console.log(request);
    sendResponse(await pullData(request.hostname));
    return;
});

initBG();
