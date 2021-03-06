/*Noah Witt <noah@noah-witt.com> 0x564499DBBC6CA56A
Contect Script*/
interface site {
    config: string;
    matches: string[];
}

interface configList {
    sites: site[];
}

interface siteConfig {
    name: string;
    checkoutPage: string[];
    checkoutPrompt: boolean;
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
    if(status.siteConfig.checkoutPrompt) {
        //now check to see if page matches regex.
        const path = window.location.pathname;
        if(compareRegex(path, status.siteConfig.checkoutPage)) {
            //checkout page.
            let price: number;
            try {
                await sleep(250);
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
                locked = false;
                return true;
            });
            chrome.runtime.sendMessage({target:"/pages/calc.html?price="+price+'&key='+key, type:'openTab'});
        }
        return;
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
