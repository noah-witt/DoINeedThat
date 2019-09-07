const YEAR_TIME_VALUE_TABLE_TEMPLATE: string = '<tr><th scope="row" class="yFromNow"></th><td class="valueAtY"></td><td class="yearNum"></td></tr>';
const YEAR_TIME_VALUE_TABLE_YEARS: number[] = [5,10,15,20,25,30,40,50,60];
const ASSUMED_RATE_OF_RETURN = 12;
let key: string;
function initCalcPage():void {
    const urlParams = new URLSearchParams(window.location.search);
    const price: number = parseFloat(urlParams.get('price'));
    key = urlParams.get('key');
    $('.amtDisplay').text(moneyFormater(price));
    //@ts-ignore
    const today = moment();
    drawTimeValueTable(price, today);
    drawTimeValueTableWeekly(price, today);
    drawTimeValueTableDay(price, today);
    drawTimeValueTableYear(price, today);
    $('.worthIt').click(() => {
        inform(true);
    });
    $('.notWorthIt').click(() => {
        inform(false);
    });
    $('tfoot tr .yFromNow input').change((event) => {
        //@ts-ignore
        const today = moment();
        //change to inputs.
        //update basic;
        ((today) => {
            const $tablerow = $("#TimeValueChart tfoot tr");
            const yearOffset: number = parseFloat($tablerow.find('.yFromNow input').val().toString());
            $tablerow.find('.valueAtY').text(moneyFormatedFVal(price, ASSUMED_RATE_OF_RETURN, yearOffset));
            const target = today.clone().add(yearOffset, 'years');
            $tablerow.find('.yearNum').text(target.year());
        })(today);
        //update year
        ((today) => {
            const $tablerow = $("#TimeValueChartYear tfoot tr");
            const yearOffset: number = parseFloat($tablerow.find('.yFromNow input').val().toString());
            const endDate = today.clone().add(yearOffset, 'years');
            //sum amount from each savingevent
            let total = 0;
            for(let i=0; i<yearOffset; i++) total += futureValue(price, ASSUMED_RATE_OF_RETURN, (yearOffset-i));
            $tablerow.find('.valueAtY').text(moneyFormater(total));
            $tablerow.find('.yearNum').text(endDate.year());
        })(today);
        //update Week
        ((today) => {
            const $tablerow = $("#TimeValueChartWeek tfoot tr");
            const yearOffset: number = parseFloat($tablerow.find('.yFromNow input').val().toString());
            const weeks = Math.round(yearOffset*52);
            const endDate = today.clone().add(weeks, 'weeks');
            //sum amount from each savingevent
            let total = 0;
            for(let i=0; i<weeks; i++) total += futureValue(price, ASSUMED_RATE_OF_RETURN, (weeks-i)/52.0);
            $tablerow.find('.valueAtY').text(moneyFormater(total));
            $tablerow.find('.yearNum').text(endDate.year());
        })(today);
        //update day
        ((today) => {
            const $tablerow = $("#TimeValueChartDay tfoot tr");
            const yearOffset: number = parseFloat($tablerow.find('.yFromNow input').val().toString());
            const days = Math.round(yearOffset*365.25);
            const endDate = today.clone().add(days, 'days');
            //sum amount from each savingevent
            let total = 0;
            for(let i=0; i<days; i++) total += futureValue(price, ASSUMED_RATE_OF_RETURN, (days-i)/365.25);
            $tablerow.find('.valueAtY').text(moneyFormater(total));
            $tablerow.find('.yearNum').text(endDate.year());
        })(today);

    });
}

function drawTimeValueTable(price: number, today: any): void {
    const days: string[] = [price.toString()];
    const values: number[] = [parseInt(today.format("YYYY"), 10)];
    YEAR_TIME_VALUE_TABLE_YEARS.forEach((yearOffset) => {
        const $tablerow = $(YEAR_TIME_VALUE_TABLE_TEMPLATE);
        $tablerow.find('.yFromNow').text(yearOffset);
        $tablerow.find('.valueAtY').text(moneyFormatedFVal(price, ASSUMED_RATE_OF_RETURN, yearOffset));
        const target = today.clone().add(yearOffset, 'years');
        $tablerow.find('.yearNum').text(target.year());
        $('#TimeValueChart tbody').append($tablerow);
        days.push(target.format("YYYY"));
        values.push(futureValue(price, ASSUMED_RATE_OF_RETURN, yearOffset));
    });
    //@ts-ignore
    const ctx = document.getElementById('TimeValueCanvas').getContext('2d');
    //@ts-ignore
    const chart = new Chart(ctx, {
        labels: days,
        type: 'line',
        dataset: [{
            label: 'dollars',
            data: values,
        }],
    });
    return;
}

function drawTimeValueTableWeekly(price: number, today: any): void {
    YEAR_TIME_VALUE_TABLE_YEARS.forEach((yearOffset) => {
        const weeks = Math.round(yearOffset*52);
        const endDate = today.clone().add(weeks, 'weeks');
        //sum amount from each savingevent
        let total = 0;
        for(let i=0; i<weeks; i++) total += futureValue(price, ASSUMED_RATE_OF_RETURN, (weeks-i)/52.0);
        const $tablerow = $(YEAR_TIME_VALUE_TABLE_TEMPLATE);
        $tablerow.find('.yFromNow').text(yearOffset);
        $tablerow.find('.valueAtY').text(moneyFormater(total));
        $tablerow.find('.yearNum').text(endDate.year());
        $('#TimeValueChartWeek tbody').append($tablerow);
    });
    return;
}

function drawTimeValueTableDay(price: number, today: any): void {
    YEAR_TIME_VALUE_TABLE_YEARS.forEach((yearOffset) => {
        const days = Math.round(yearOffset*365.25);
        const endDate = today.clone().add(days, 'days');
        //sum amount from each savingevent
        let total = 0;
        for(let i=0; i<days; i++) total += futureValue(price, ASSUMED_RATE_OF_RETURN, (days-i)/365.25);
        const $tablerow = $(YEAR_TIME_VALUE_TABLE_TEMPLATE);
        $tablerow.find('.yFromNow').text(yearOffset);
        $tablerow.find('.valueAtY').text(moneyFormater(total));
        $tablerow.find('.yearNum').text(endDate.year());
        $('#TimeValueChartDay tbody').append($tablerow);
    });
    return;
}

function drawTimeValueTableYear(price: number, today: any): void {
    YEAR_TIME_VALUE_TABLE_YEARS.forEach((yearOffset) => {
        const endDate = today.clone().add(yearOffset, 'years');
        //sum amount from each savingevent
        let total = 0;
        for(let i=0; i<yearOffset; i++) total += futureValue(price, ASSUMED_RATE_OF_RETURN, (yearOffset-i));
        const $tablerow = $(YEAR_TIME_VALUE_TABLE_TEMPLATE);
        $tablerow.find('.yFromNow').text(yearOffset);
        $tablerow.find('.valueAtY').text(moneyFormater(total));
        $tablerow.find('.yearNum').text(endDate.year());
        $('#TimeValueChartYear tbody').append($tablerow);
    });
    return;
}

function moneyFormatedFVal(presentValue: number, interestRate: number, numberOfPeriods: number): string {
    const fVal = futureValue(presentValue, interestRate, numberOfPeriods);
    return moneyFormater(fVal);
}

//formats string $1,123,123.45
function moneyFormater(money: number): string {
    const moneyRounded = money.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    const moneyString = '$'+moneyRounded;
    return moneyString;
}

function inform(reject: boolean): void {
    //inform bg page to forward messege to tab.
    chrome.runtime.sendMessage({type: 'unlock', key, reject: !reject});
    sleepCalc(250).then(() => {
        chrome.tabs.getCurrent((tab) => {
            chrome.tabs.remove(tab.id);
        });
    });
}


const sleepCalc = (milliseconds: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

//futere value calculator.
function futureValue(presentValue: number, interestRate: number, numberOfPeriods: number): number {
    const x=(1+interestRate/100);
    const fValue=presentValue*(Math.pow(x,numberOfPeriods));
    return fValue;
}

initCalcPage();
