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
    scroll: boolean;
    linkDelay: boolean;
    totalPrice: string;
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

async function interfere(): Promise<void> {
    const status = doINeedThatStatus;
    if(!status.enabled) return;
    if(status.siteConfig.pause) {
        frezeForTime(status.siteConfig.pauseTimeMs);
    }
    if(status.siteConfig.checkoutPrompt) {
        //now check to see if page matches regex.
        const path = window.location.pathname;
        if(compareRegex(path, status.siteConfig.checkoutPage)) {
            //checkout page.
            let price: number;
            try {
                const priceText = $(status.siteConfig.totalPrice).text().replace(/[^0-9.-]+/g,"");
                const priceTemp = parseFloat(priceText);
                // tslint:disable-next-line: no-string-throw
                if(isNaN(priceTemp)) throw('not correct');
                price = priceTemp;
            } catch(err) {
                price = parseFloat(prompt('enter total price.'));
            }
            const key= Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            let locked: boolean = true;
            chrome.runtime.sendMessage({key, type:'register'});
            chrome.runtime.onMessage.addListener((msg , sender, sendResponse): boolean => {
                if(msg.type!=='unlock') return false;
                //unlock
                if(msg.reject) alert('close this tab');
                locked = false;
                return true;
            });
            chrome.runtime.sendMessage({target:"/pages/calc.html?price="+price+'&key='+key, type:'openTab'});
            while(locked) {
                alert('Confirm This Order In the New Tab. Or Close This Tab.');
                await sleep(1);
            }
        }
        return;
    }
    if(status.siteConfig.scroll) {
        window.onscroll = () => {
            frezeForTime(2000);
        };
    }
    if(status.siteConfig.linkDelay) {
        $('a:not([onclick])').click(()=> {
            frezeForTime(1200);
            return true;
        });
    }
}


//freze loader for time
function frezeForTime(ms: number) {
    const start = new Date();
    let now = new Date();
    const data= [];
    while(now.valueOf()<start.valueOf()+ms) {
        data.push(now.valueOf());
        data.push(data);
        now = new Date();
    }
}

const sleep = (milliseconds: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

function sendMsg(): Promise<siteConfig> {
    const promise: Promise<siteConfig>= new Promise((resolve) => {
        chrome.runtime.sendMessage({hostname:location.hostname, type:'get'}, (response)=> {
            resolve(response);
        });
    });
    return promise;
}

function compareRegex(val: string, regex: string|string[]): boolean {
    if(!Array.isArray(regex)) regex = [regex];
    let found: boolean = false;
    regloop: for(let i=0; i<regex.length; i++) {
        const exp = new RegExp(regex[i]);
        if(exp.test(val)) {
            found = true;
            break regloop;
        }
    }
    return found;
}
initCotent();
