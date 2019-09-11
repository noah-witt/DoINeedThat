function openPage() {
    //load in price and round to 2 places
    let priceString = $("input.amtEnter").val()+"";
    priceString = parseFloat(priceString).toFixed(2);
    const price = parseFloat(priceString);
    //generate random impossible key
    const key=  "USER_"+Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    //open page
    chrome.runtime.sendMessage({target:"/pages/calc.html?price="+price+'&key='+key, type:'openTab'});
}
$('button.enterView').click(() => {
    openPage();
});
