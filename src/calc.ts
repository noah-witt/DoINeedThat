const YEAR_TIME_VALUE_TABLE_TEMPLATE: string = '<tr><th scope="row" class="yFromNow"></th><td class="valueAtY"></td><td class="yearNum"></td></tr>';
const YEAR_TIME_VALUE_TABLE_YEARS: number[] = [5,10,15,20,25,30,40,50,60];
const GRAPH_YEARS_OUT: number = 40;
const ASSUMED_RATE_OF_RETURN = 12;
let key: string;
function initCalcPage():void {
    const urlParams = new URLSearchParams(window.location.search);
    const price: number = parseFloat(urlParams.get('price'));
    key = urlParams.get('key');
    $('.amtDisplay').text(moneyFormater(price));
    //hide buttons when user code.
    if(key.startsWith('USER_')) $('.smtBtn').hide();
    //@ts-ignore
    const today = moment();
    drawTimeValueTable(price, today);
    drawTimeValueTableWeekly(price, today);
    drawTimeValueTableDay(price, today);
    drawTimeValueTableYear(price, today);
    drawGraphMulti($('#TimeValueCanvas')[0], [{
        name: "Value Over Time",
        points: pointDataFutereValueWithAdd(price, ASSUMED_RATE_OF_RETURN, GRAPH_YEARS_OUT*365, 0, 365, today),
    }, {
        name: "Value Over Time If Ammount Saved Every Week",
        points: pointDataFutereValueWithAdd(price, ASSUMED_RATE_OF_RETURN, GRAPH_YEARS_OUT*365, price, 7, today),
    }, {
        name: "Value Over Time If Ammount Saved Every Day",
        points: pointDataFutereValueWithAdd(price, ASSUMED_RATE_OF_RETURN, GRAPH_YEARS_OUT*365, price, 1, today),
    }, {
        name: "Value Over Time If Ammount Saved Every Year",
        points: pointDataFutereValueWithAdd(price, ASSUMED_RATE_OF_RETURN, GRAPH_YEARS_OUT*365, price, 365, today),
    }]);
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
        (() => {
            const $tablerow = $("#TimeValueChart tfoot tr");
            const yearOffset: number = parseFloat($tablerow.find('.yFromNow input').val().toString());
            $tablerow.find('.valueAtY').text(moneyFormatedFVal(price, ASSUMED_RATE_OF_RETURN, yearOffset));
            const target = today.clone().add(yearOffset, 'years');
            $tablerow.find('.yearNum').text(target.year());
        })();
        //update year
        (() => {
            const $tablerow = $("#TimeValueChartYear tfoot tr");
            const yearOffset: number = parseFloat($tablerow.find('.yFromNow input').val().toString());
            const endDate = today.clone().add(yearOffset, 'years');
            //sum amount from each savingevent
            const total = futereValueWithAdd(price, ASSUMED_RATE_OF_RETURN, Math.round(yearOffset*365.25), price, 365);
            $tablerow.find('.valueAtY').text(moneyFormater(total));
            $tablerow.find('.yearNum').text(endDate.year());
        })();
        //update Week
        (() => {
            const $tablerow = $("#TimeValueChartWeek tfoot tr");
            const yearOffset: number = parseFloat($tablerow.find('.yFromNow input').val().toString());
            const weeks = Math.round(yearOffset*52);
            const endDate = today.clone().add(weeks, 'weeks');
            //sum amount from each savingevent
            const total = futereValueWithAdd(price, ASSUMED_RATE_OF_RETURN, weeks*7, price, 7);
            $tablerow.find('.valueAtY').text(moneyFormater(total));
            $tablerow.find('.yearNum').text(endDate.year());
        })();
        //update day
        (() => {
            const $tablerow = $("#TimeValueChartDay tfoot tr");
            const yearOffset: number = parseFloat($tablerow.find('.yFromNow input').val().toString());
            const days = Math.round(yearOffset*365.25);
            const endDate = today.clone().add(days, 'days');
            //sum amount from each savingevent
            const total = futereValueWithAdd(price, ASSUMED_RATE_OF_RETURN, days, price, 1);
            $tablerow.find('.valueAtY').text(moneyFormater(total));
            $tablerow.find('.yearNum').text(endDate.year());
        })();

    });
}
interface point {
    x: number;
    y: number;
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
    return;
}

interface dataset {
    type: string;
    mode: string;
    scaleID: string;
    value: number;
    borderColor: string;
    borderWidth: number;
    label: {
        enabled: boolean;
        content: string;
    }
}


interface set {
    points: point[];
    name: string;
}

function drawGraphMulti(el: HTMLElement, sets: set[]): Chart {
    const datasets = [];
    sets.forEach((points) => {
        datasets.push({
            showLine: true,
            label: points.name,
            data: points.points,
        });
    });
    //@ts-ignore
    const chart = new Chart(el.getContext('2d'), {
        data: {
            datasets,
        },
        type: 'scatter',
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                    },
                }],
            },
        },
    });
    return chart;
}

function drawTimeValueTableWeekly(price: number, today: any): void {
    YEAR_TIME_VALUE_TABLE_YEARS.forEach((yearOffset) => {
        const weeks = Math.round(yearOffset*52);
        const endDate = today.clone().add(weeks, 'weeks');
        //sum amount from each savingevent
        const total = futereValueWithAdd(price, ASSUMED_RATE_OF_RETURN, weeks*7, price, 7);
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
        const total = futereValueWithAdd(price, ASSUMED_RATE_OF_RETURN, days, price, 1);
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
        const total = futereValueWithAdd(price, ASSUMED_RATE_OF_RETURN, Math.round(yearOffset*365.25), price, 365);
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
    const x: number = (1+interestRate/100);
    const fValue: number =presentValue*(Math.pow(x,numberOfPeriods));
    return fValue;
}

function futereValueWithAdd(presentValue: number, interestRate: number, days: number, addAmt: number, dayPerAdd: number): number {
    let total = futureValue(presentValue, interestRate, days/365);
    for(let i=0; i<(days/dayPerAdd); i++) total += futureValue(addAmt, ASSUMED_RATE_OF_RETURN, (days-(i*dayPerAdd))/365 );
    return total;
}

function pointDataFutereValueWithAdd(presentValue: number, interestRate: number,
                                     days: number, addAmt: number, dayPerAdd: number, start: any): point[] {
    const years = days/365.0;
    const points: point[] = [{x: parseFloat(start.format("YYYY")), y:parseFloat(presentValue.toFixed(2))}];
    for(let i=0; i<years; i++) {
        points.push({
            x: parseFloat(start.clone().add(i,'years').format("YYYY")),
            y: parseFloat(futereValueWithAdd(presentValue, interestRate, (i*365.0), addAmt, dayPerAdd).toFixed(2)),
        });
    }
    return points;
}

initCalcPage();
