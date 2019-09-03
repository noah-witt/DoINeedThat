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

function interfere(): void {
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
            alert('You should think about this choice before you buy. Go Look at your budget.');
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
            window.open(chrome.runtime.getURL('/pages/calc.html'));
            chrome.runtime.sendMessage({target:"/pages/calc.htm?price="+price, type:'openTab'});
        }

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
