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
    pause: boolean;
    pauseTimeMs: number;
}

interface statusConfig {
    siteConfig?: siteConfig;
    enabled: boolean;
}

const doINeedThatStatus: statusConfig = {enabled:false};
async function initCotent(): Promise<void> {
    const result = await sendMsg();
    if(typeof result === 'undefined') return;
    doINeedThatStatus.siteConfig = result;
    doINeedThatStatus.enabled = true;
    interfere();
    return;
}

function interfere(): void {
    const status = doINeedThatStatus;
    if(!status.enabled) return;
    if(status.siteConfig.pause) {
        frezeForTime(status.siteConfig.pauseTimeMs);
    }
}

//freze loader for time
function frezeForTime(ms: number) {
    console.log(ms);
    const start = new Date();
    let now = new Date();
    const data= [];
    while(now.valueOf()<start.valueOf()+ms) {
        data.push(now.valueOf());
        data.push(data);
        now = new Date();
    }
}

function sendMsg(): Promise<siteConfig> {
    const promise: Promise<siteConfig>= new Promise((resolve) => {
        chrome.runtime.sendMessage({hostname:location.hostname}, (response)=>resolve(response));
    });
    return promise;
}
initCotent();