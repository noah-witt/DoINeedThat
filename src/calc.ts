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
    drawGraph($('#TimeValueCanvasOnce')[0], pointDataFutereValueWithAdd(price, ASSUMED_RATE_OF_RETURN, GRAPH_YEARS_OUT*365, 0, 365, today));
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
function drawGraph(el: HTMLElement, points: point[]): Chart {
    //find static points to pick.
    let minVal = Number.MAX_SAFE_INTEGER;
    let minP = points[0];
    let maxVal = Number.MIN_SAFE_INTEGER;
    let maxP = points[0];
    points.forEach((p) => {
        if(maxVal<p.y) {
            maxVal = p.y;
            maxP = p;
        }
        if(minVal>p.y) {
            minVal = p.y;
            minP = p;
        }
    });
    const targetVal = maxVal*1.1; //extra 10%
    let now = 1000;
    const lineSets: dataset[] = [];
    while(now<targetVal) {
        lineSets.push({
            type: 'line',
            mode: 'horizontal',
            scaleID: 'y-axis-0',
            value: now,
            borderColor: 'blue',
            borderWidth: 4,
            label: {
              enabled: false,
              content: moneyFormater(now),
            },
          });
        now*=10;
    }
    console.log(lineSets);
    //@ts-ignore
    const chart = new Chart(el.getContext('2d'), {
        data: {
            datasets: [{
                showLine: true,
                backgroundColor: 'green',
                label: '$ over time',
                data: points,
            }],
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
            annotation: {
                annotations: lineSets,
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
    drawGraph($('#TimeValueCanvasWeek')[0], pointDataFutereValueWithAdd(price, ASSUMED_RATE_OF_RETURN, GRAPH_YEARS_OUT*365, price, 7, today));
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
    drawGraph($('#TimeValueCanvasDay')[0], pointDataFutereValueWithAdd(price, ASSUMED_RATE_OF_RETURN, GRAPH_YEARS_OUT*365, price, 1, today));
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
    drawGraph($('#TimeValueCanvasYear')[0], pointDataFutereValueWithAdd(price, ASSUMED_RATE_OF_RETURN, GRAPH_YEARS_OUT*365, price, 365, today));
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
