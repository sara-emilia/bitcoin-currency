let submitBtn = document.getElementById("submitBtn");
let textTrade = document.getElementById("textTrade");
let textTrend = document.getElementById("textTrend");
let textVolume = document.getElementById("textVolume");
let totalVolume = [];
let marketValue = [];
let prices = [];
let dateFrom;
let dateTo;

//#region max-variable to date range max
var today = new Date();
var dd = today.getDate();
var mm = today.getMonth() + 1;
var yyyy = today.getFullYear();

if (dd < 10) {
  dd = "0" + dd;
}

if (mm < 10) {
  mm = "0" + mm;
}

today = yyyy + "-" + mm + "-" + dd;
document.getElementById("dateBegin").setAttribute("max", today);
document.getElementById("dateEnd").setAttribute("max", today);

//#endregion

//#region UNIX-timestamps
document.getElementById("dateBegin").addEventListener("change", function () {
  let input = this.value;
  let dateBegin = new Date(input);
  dateBegin = dateBegin.getTime() / 1000;
  dateFrom = dateBegin;
});

document.getElementById("dateEnd").addEventListener("change", function () {
  let input = this.value;
  let dateEnd = new Date(input);
  dateEnd = dateEnd.getTime() / 1000 + 3600;
  dateTo = dateEnd;
});

function unixConvert(date) {
  let dateConvert = date;
  dateConvert = new Date(dateConvert).toLocaleDateString("en-US");
  return dateConvert;
}
//#endregion

//#region data-analysis
function downwardTrend(value) {
  marketValue = value;
  let dateCount_1 = 0;
  let dateCount_2 = 0;
  let priceCompare = 0;
  let startDate = 0;
  let saveStart = 0;
  let endDate = 0;
  let saveEnd = 0;
  Object.keys(marketValue).forEach((item) => {
    if (item === 0 || item % 24 === 0) {
      if (priceCompare > marketValue[item][1] || priceCompare === 0) {
        dateCount_1 = dateCount_1 + 1;
        priceCompare = marketValue[item][1];
        endDate = marketValue[item][0];
        if (startDate === 0) {
          startDate = marketValue[item][0];
        }
      } else {
        dateCount_2 = dateCount_1;
        dateCount_1 = 0;
        priceCompare = 0;
        saveStart = startDate;
        startDate = 0;
        saveEnd = endDate;
        endDate = 0;
      }
    }
  });
  dateCount_1 = compareCounts(dateCount_1, dateCount_2);
  let dates = compareDates(startDate, endDate, saveStart, saveEnd);
  textTrend.innerHTML = `The volume decreased ${dateCount_1} days in a row for the inputs ${dates}`;
}

function compareDates(startDate, endDate, saveStart, saveEnd) {
  startDate = startDate;
  endDate = endDate;
  saveStart = saveStart;
  saveEnd = saveEnd;
  if (endDate - startDate > saveEnd - saveStart) {
    startDate = unixConvert(startDate);
    endDate = unixConvert(endDate);
    return `from ${startDate} and to ${endDate}.`;
  } else {
    saveStart = unixConvert(saveStart);
    saveEnd = unixConvert(saveEnd);
    return `from ${saveStart} and to ${saveEnd}.`;
  }
}

function compareCounts(count_1, count_2) {
  count_1 = count_1;
  count_2 = count_2;
  if (count_1 > count_2) {
    return count_1;
  } else {
    return count_2;
  }
}

function tradingVolume(value) {
  let tradeVolume = value;
  let volume = 0;
  let unixDate = 0;
  Object.keys(tradeVolume).forEach((item) => {
    if (volume < tradeVolume[item][1]) {
      volume = tradeVolume[item][1];
      unixDate = tradeVolume[item][0];
    }
  });
  unixDate = unixConvert(unixDate);
  textVolume.innerHTML = `The highest trading volume was on ${unixDate} and the total was ${volume} €.`;
}

function timeMachine(value) {
  prices = value;
  let tradeDates;
  let trade = false;
  priceCompare = prices[0][1];
  Object.keys(prices).forEach((item) => {
    if (priceCompare > marketValue[item][1] && trade === false) {
      priceCompare = marketValue[item][1];
    } else if (priceCompare < marketValue[item][1]) {
      trade = true;
      tradeDates = whenToTrade(prices);
      textTrade.innerHTML = `${tradeDates}`;
    }
  });
  if (trade === false) {
    textTrade.innerHTML = "Don't buy nor sell Bitcoins right now.";
  }
}

function whenToTrade(value) {
  prices = value;
  let sellPrice = prices[0][1];
  let buyPrice = prices[0][1];
  let sellDate;
  let buyDate;
  Object.keys(prices).forEach((item) => {
    if (sellPrice < prices[item][1] || sellPrice === prices[item][1]) {
      sellPrice = prices[item][1];
      sellDate = prices[item][0];
    } else if (buyPrice > prices[item][1] || buyPrice === prices[item][1]) {
      buyPrice = prices[item][1];
      buyDate = prices[item][0];
    }
  });
  sellDate = unixConvert(sellDate);
  buyDate = unixConvert(buyDate);
  return `Sell your Bitcoins on ${sellDate} and buy Bitcoins on ${buyDate}.`;
}

//#endregion

function getData() {
  fetch(
    `https://coingecko.p.rapidapi.com/coins/bitcoin/market_chart/range?from=${dateFrom}&vs_currency=eur&to=${dateTo}`,
    {
      method: "GET",
      headers: {
        "x-rapidapi-host": "coingecko.p.rapidapi.com",
        "x-rapidapi-key": "d9d62cb83fmsh056049c0df54e77p111410jsn5a280572f461",
      },
    }
  )
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      let allData = data;
      prices = allData.prices;
      marketValue = allData.market_caps;
      totalVolume = allData.total_volumes;
      downwardTrend(marketValue);
      tradingVolume(totalVolume);
      timeMachine(prices);
    })
    .catch((err) => {
      console.error("ERROR: Failed to fetch", err);
    });
}

submitBtn.addEventListener("click", () => {
  getData();
});
