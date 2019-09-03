const YEAR_TIME_VALUE_TABLE_TEMPLATE: string = '<tr><th scope="row" class="yFromNow"></th><td class="valueAtY"></td><td class="yearNum"></td></tr>';
const YEAR_TIME_VALUE_TABLE_YEARS: number[] = [5,10,15,20,25,30,40,50,60];
const ASSUMED_RATE_OF_RETURN = 12;
let key: string;
function initCalcPage():void {
    const urlParams = new URLSearchParams(window.location.search);
    const price: number = parseFloat(urlParams.get('price'));
    key = urlParams.get('key');
    console.log(key);
    $('.amtDisplay').text(moneyFormater(price));
    //@ts-ignore
    const today = moment();
    drawTimeValueTable(price, today);
    $('.worthIt').click(() => {
        inform(false);
    });
    $('.notWorthIt').click(() => {
        inform(false);
    });
}

function drawTimeValueTable(price: number, today: any): void {
    YEAR_TIME_VALUE_TABLE_YEARS.forEach((yearOffset) => {
        const $tablerow = $(YEAR_TIME_VALUE_TABLE_TEMPLATE);
        $tablerow.find('.yFromNow').text(yearOffset);
        $tablerow.find('.valueAtY').text(moneyFormatedFVal(price, ASSUMED_RATE_OF_RETURN, yearOffset));
        const target = today.clone().add(yearOffset, 'years');
        $tablerow.find('.yearNum').text(target.year());
        $('#TimeValueChart tbody').append($tablerow);
    });
}

function moneyFormatedFVal(presentValue: number, interestRate: number, numberOfPeriods: number): string {
    const fVal = futureValue(presentValue, interestRate, numberOfPeriods);
    return moneyFormater(fVal);
}

function moneyFormater(money: number): string {
    const moneyRounded = money.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    const moneyString = '$'+moneyRounded;
    return moneyString;
}

function inform(reject: boolean): void {
    //inform bg page to forward messege to tab.
    chrome.runtime.sendMessage({type: 'unlock', key, reject});
    console.log({type: 'unlock', key, reject});
}

//futere value calculator.
function futureValue(presentValue: number, interestRate: number, numberOfPeriods: number): number {
    const x=(1+interestRate/100);
    const fValue=presentValue*(Math.pow(x,numberOfPeriods));
    return fValue;
}

initCalcPage();