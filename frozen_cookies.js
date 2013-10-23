// Global Variables
var FrozenCookies = {};

// Load external libraries
FrozenCookies.loadInterval = setInterval(function() {
  if (Game && Game.ready) {
    clearInterval(FrozenCookies.loadInterval);
    FrozenCookies.loadInterval = 0;
    fcInit();
  }
}, 1000);

function fcInit() {
    var script_list = [
    'http://ajax.googleapis.com/ajax/libs/jqueryui/1.10.3/jquery-ui.min.js',
    'http://underscorejs.org/underscore-min.js',
    'http://calebevans.me/projects/jcanvas/resources/jcanvas/jcanvas.min.js',
    'https://raw.github.com/Icehawk78/FrozenCookies/development/cc_upgrade_prerequisites.js',
    'https://raw.github.com/Icehawk78/FrozenCookies/development/fc_button.js'
  ]
  var done = 0;
  var jquery = document.createElement('script');
  jquery.setAttribute('type', 'text/javascript');
  jquery.setAttribute('src', 'http://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js');
  jquery.onload = function() {
    script_list.forEach(function(url,id){
      $.getScript(url,function() {
        done++;
        if (done>=script_list.length)
        {
          setOverrides();
          FCStart();
        }
      });
    });
  };
  document.head.appendChild(jquery);
  FrozenCookies.frequency = 100;
  FrozenCookies.efficiencyWeight = 1.15;
  FrozenCookies.preferenceValues = [
    {'autoBuy' : ["Autobuy OFF","Autobuy ON"]},
    {'autoGC' : ["Autoclick GC OFF", "Autoclick GC ON"]},
    {'simulatedGCPercent' : ["GC for Calculations: 0%","GC for Calculations: Actual Ratio","GC for Calculations: 100%"]},
    {'numberDisplay' : ["Raw Numbers","Full Word (million, billion)","Initials (M, B)","SI Units (M, G, T)", "Scientific Notation (x10¹²)"]}
  ];
  FrozenCookies.numberDisplay = preferenceParse('numberDisplay', 1);
  FrozenCookies.autoBuy = preferenceParse('autoBuy', 0);
  FrozenCookies.autoGC = preferenceParse('autoGC', 0);
  FrozenCookies.autoClick = preferenceParse('autoClick', 0);
  FrozenCookies.autoFrenzy = preferenceParse('autoFrenzy', 0);
  FrozenCookies.simulatedGCPercent = preferenceParse('simulatedGCPercent', 1);
  FrozenCookies.non_gc_time = Number(localStorage.getItem('nonFrenzyTime'));
  FrozenCookies.gc_time = Number(localStorage.getItem('frenzyTime'));
  FrozenCookies.last_gc_state = (Game.frenzy > 0);
  FrozenCookies.last_gc_time = Date.now();
  FrozenCookies.cookieClickSpeed = preferenceParse('cookieClickSpeed',0);
  FrozenCookies.frenzyClickSpeed = preferenceParse('frenzyClickSpeed',0);
  FrozenCookies.initial_clicks = 0;
  FrozenCookies.lastHCAmount = Number(localStorage.getItem('lastHCAmount'));
  FrozenCookies.lastHCTime = Number(localStorage.getItem('lastHCTime'));
  FrozenCookies.prevLastHCTime = Number(localStorage.getItem('prevLastHCTime'));
  FrozenCookies.maxHCPercent = Number(localStorage.getItem('maxHCPercent'));
  FrozenCookies.blacklist = localStorage.getItem('blacklist');
  FrozenCookies.lastCPS = Game.cookiesPs;
  FrozenCookies.lastCookieCPS = 0;
  FrozenCookies.lastUpgradeCount = 0;
  FrozenCookies.currentBank = {'cost': 0, 'efficiency' : 0};
  FrozenCookies.targetBank = {'cost': 0, 'efficiency' : 0};
  FrozenCookies.disabledPopups = true;
  FrozenCookies.processing = false;
  
  FrozenCookies.cookieBot = 0;
  FrozenCookies.autoclickBot = 0;
  FrozenCookies.frenzyClickBot = 0;
  
  // Caching
  
  FrozenCookies.caches = {};
  FrozenCookies.caches.nextPurchase = {};
  FrozenCookies.caches.recommendationList = [];
  FrozenCookies.caches.buildings = [];
  FrozenCookies.caches.upgrades = [];
  
  Game.prefs.autoBuy = FrozenCookies.autoBuy;
  Game.prefs.autoGC = FrozenCookies.autoGC;
  Game.prefs.autoClick = FrozenCookies.autoClick;
  Game.prefs.autoFrenzy = FrozenCookies.autoFrenzy;
}

function setOverrides() {
  if (!blacklist[FrozenCookies.blacklist]) {
    FrozenCookies.blacklist = 'none';
  }
  nextPurchase(true);
  Beautify = function(value) {return fcBeautify(value);}
  Game.sayTime = function(time,detail) {return timeDisplay(time/Game.fps);}
  Game.oldReset = Game.Reset;
  Game.Reset = function(override) {fcReset(override);}
  Game.Win = function(what) {return fcWin(what);}
  Game.oldBackground = Game.DrawBackground;
  Game.DrawBackground = function() {Game.oldBackground(); updateTimers();}
  // Remove the following when turning on tooltop code
  Game.RebuildStore();
  Game.RebuildUpgrades();
/*
  eval("Game.Draw = " + Game.Draw.toString()
    .replace(/if \(Game.cookies>=me.price\) l\('product'\+me.id\).className='product enabled'; else l\('product'\+me.id\).className='product disabled';/, '(Game.cookies >= me.price) ? $("#product"+me.id).addClass("enabled").removeClass("disabled") : $("#product"+me.id).addClass("disabled").removeClass("enabled");')
    .replace(/if \(Game.cookies>=me.basePrice\) l\('upgrade'\+i\).className='crate upgrade enabled'; else l\('upgrade'\+i\).className='crate upgrade disabled';/, '(Game.cookies >= me.basePrice) ? $("#upgrade"+me.id).addClass("enabled").removeClass("disabled") : $("#upgrade"+me.id).addClass("disabled").removeClass("enabled");'));
  Game.RebuildStore=function(recalculate) {rebuildStore(recalculate);}
  Game.RebuildUpgrades=function(recalculate) {rebuildUpgrades(recalculate);}
  Game.RebuildStore(true);
  Game.RebuildUpgrades(true);
*/
}

function preferenceParse(setting, defaultVal) {
  var value = localStorage.getItem(setting);
  if (typeof(value) == 'undefined' || value == null || isNaN(Number(value))) {
    value = defaultVal;
    localStorage.setItem(setting, value);
  }
  return Number(value);
}

// var full_history = [];  // This may be a super leaky thing

function fcBeautify (value) {
  var notationValue = '';
  var negative = false;
  if (value < 0) {
    negative = true;
    value *= -1;
  }
  if (FrozenCookies.numberDisplay) {
    var notationList = [['', ' million', ' billion', ' trillion', ' quadrillion', ' quintillion', ' sextillion', ' septillion'],
                        ['', ' M', ' B', ' T', ' Qa', ' Qi', ' Sx', ' Sp'],
                        ['', ' M', ' G', ' T', ' P', ' E', ' Z', ' Y'],
                        ['', '*10⁶', '*10⁹', '*10¹²', '*10¹⁵', '*10¹⁸', '*10²¹', '*10²⁴']
                        ];
    var notation = notationList[FrozenCookies.numberDisplay-1];
    var base = 0;
    if (value >= 1000000 && Number.isFinite(value)) {
      value /= 1000;
      while(value >= 1000){
        value /= 1000;
        base++;
      }
      if (base > notation.length) {
        value = Math.POSITIVE_INFINITY;
      } else {
        notationValue = notation[base];
      }
    }
    value = Math.round(value * 1000) / 1000.0;
  }
  if (!Number.isFinite(value)) {
    return 'Infinity';
  } else {
    var output = value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + notationValue;
    return negative ? '-' + output : output;
  }
}

function timeDisplay(seconds) {
  if (seconds === '---' || seconds === 0) {
    return 'Done!';
  } else if (seconds == Number.POSITIVE_INFINITY) {
    return 'Never!'
  }
  seconds = Math.floor(seconds);
  var days, hours, minutes;
  days = Math.floor(seconds / (24 * 60 * 60));
  days = (days > 0) ? Beautify(days) + 'd ' : '';
  seconds %= (24 * 60 * 60);
  hours = Math.floor(seconds / (60 * 60));
  hours = (hours > 0) ? Beautify(hours) + 'h ' : '';
  seconds %= (60 * 60);
  minutes = Math.floor(seconds / 60);
  minutes = (minutes > 0) ? minutes + 'm ' : '';
  seconds %= 60;
  seconds = (seconds > 0) ? seconds + 's' : '';
  return (days + hours + minutes + seconds).trim();
}

function fcReset(bypass) {
  Game.oldReset(bypass);
  FrozenCookies.nonFrenzyTime = 0;
  FrozenCookies.frenzyTime = 0;
  FrozenCookies.last_gc_state = (Game.frenzy > 0);
  FrozenCookies.last_gc_time = Date.now();
  FrozenCookies.lastHCAmount = Game.HowMuchPrestige(Game.cookiesEarned + Game.cookiesReset);
  FrozenCookies.lastHCTime = Date.now();
  FrozenCookies.maxHCPercent = 0;
  FrozenCookies.prevLastHCTime = Date.now();
  FrozenCookies.lastCps = 0;
  updateLocalStorage();
  recommendationList(true);
}

function updateLocalStorage() {
  localStorage.numberDisplay = FrozenCookies.numberDisplay;
  localStorage.autoBuy = FrozenCookies.autoBuy;
  localStorage.autoGC = FrozenCookies.autoGC;
  localStorage.autoClick = FrozenCookies.autoClick;
  localStorage.autoFrenzy = FrozenCookies.autoFrenzy;
  localStorage.frenzyClickSpeed = FrozenCookies.frenzyClickSpeed;
  localStorage.cookieClickSpeed = FrozenCookies.cookieClickSpeed;
  localStorage.simulatedGCPercent = FrozenCookies.simulatedGCPercent;
  localStorage.blacklist = FrozenCookies.blacklist;
  localStorage.nonFrenzyTime = FrozenCookies.non_gc_time;
  localStorage.frenzyTime = FrozenCookies.gc_time;
  localStorage.lastHCAmount = FrozenCookies.lastHCAmount;
  localStorage.maxHCPercent = FrozenCookies.maxHCPercent;
  localStorage.lastHCTime = FrozenCookies.lastHCTime;
  localStorage.prevLastHCTime = FrozenCookies.prevLastHCTime;
}

function divCps(value, cps) {
  var result = 0;
  if (value) {
    if (cps) {
      result = value / cps;
    } else {
      result = Number.POSITIVE_INFINITY;
    }
  }
  return result;
}

function nextHC(tg) {
  var futureHC = Math.ceil(Math.sqrt((Game.cookiesEarned + Game.cookiesReset)/0.5e12+0.25)-0.5);
  var nextHC = futureHC*(futureHC+1)*0.5e12;
  var toGo = nextHC - (Game.cookiesEarned + Game.cookiesReset);
  return tg ? toGo : timeDisplay(divCps(toGo, Game.cookiesPs));
}

function copyToClipboard (text) {
  window.prompt ("Copy to clipboard: Ctrl+C, Enter", text);
}
 
function getBuildingSpread () {
  return Game.ObjectsById.map(function(a){return a.amount;}).join('/')
}

// Press 'b' to pop up a copyable window with building spread. 
document.addEventListener('keydown', function(event) {
  if(event.keyCode == 66) {
    copyToClipboard(getBuildingSpread());
  }
});

// Press 'a' to toggle autobuy.
document.addEventListener('keydown', function(event) {
  if(event.keyCode == 65) {
    Game.Toggle('autoBuy','autobuyButton','Autobuy OFF','Autobuy ON');
    toggleFrozen('autoBuy');
  }
});

// Press 'c' to toggle auto-GC
document.addEventListener('keydown', function(event) {
  if(event.keyCode == 67) {
    Game.Toggle('autoGC','autogcButton','Autoclick GC OFF','Autoclick GC ON');
    toggleFrozen('autoGC');
  }
});

function writeFCButton(setting) {
  var current = FrozenCookies[setting];
}

function getSpeed(current) {
  var newSpeed = prompt('How many times per second do you want to click? (Current maximum is 250 clicks per second)',current);
  if (typeof(newSpeed) == 'undefined' || newSpeed == null || isNaN(Number(newSpeed)) || Number(newSpeed) < 0 || Number(newSpeed) > 250) {
    newSpeed = current;
  }
  return Number(newSpeed);
}

function updateCookieClickSpeed() {
  var newSpeed = getSpeed(FrozenCookies.cookieClickSpeed);
  if (newSpeed != FrozenCookies.cookieClickSpeed) {
    FrozenCookies.cookieClickSpeed = newSpeed;
    updateLocalStorage();
    FCStart();
  }
}

function updateFrenzyClickSpeed() {
  var newSpeed = getSpeed(FrozenCookies.frenzyClickSpeed);
  if (newSpeed != FrozenCookies.frenzyClickSpeed) {
    FrozenCookies.frenzyClickSpeed = newSpeed;
    updateLocalStorage();
    FCStart();
  }
}

function toggleFrozen(setting) {
  if (!Number(localStorage.getItem(setting))) {
    localStorage.setItem(setting,1);
    FrozenCookies[setting] = 1;
    Game.prefs[setting] = 1;
  } else {
    localStorage.setItem(setting,0);
    FrozenCookies[setting] = 0;
    Game.prefs[setting] = 0;
  }
  FCStart();
}

function getProbabilityList() {
  return cumulativeProbabilityList[Game.Has('Lucky day') + Game.Has('Serendipity')];
}

function cumulativeProbability(start, stop) {
  return 1 - ((1 - getProbabilityList()[stop]) / (1 - getProbabilityList()[start]));
}

function probabilitySpan(start, endProbability) {
  var startProbability = getProbabilityList()[start];
  return _.sortedIndex(getProbabilityList(), (startProbability + endProbability - startProbability * endProbability));
}

function baseCps() {
  var frenzyMod = (Game.frenzy > 0) ? Game.frenzyPower : 1;
  return Game.cookiesPs / frenzyMod;
}

function baseClickingCps(clickSpeed) {
  var clickFrenzyMod = (Game.clickFrenzy > 0) ? 777 : 1;
  var frenzyMod = (Game.frenzy > 0) ? Game.frenzyPower : 1;
  var cpc = Game.mouseCps() / (clickFrenzyMod * frenzyMod);
  return clickSpeed * cpc;
}

function cookieValue(bankAmount) {
  var cps = baseCps();
  var clickCps = baseClickingCps(FrozenCookies.autoClick * FrozenCookies.cookieClickSpeed);
  var frenzyCps = FrozenCookies.autoFrenzy ? baseClickingCps(FrozenCookies.autoFrenzy * FrozenCookies.frenzyClickSpeed) : clickCps;
  var luckyMod = Game.Has('Get lucky') ? 2 : 1;
  var clickFrenzyMod = (Game.clickFrenzy > 0) ? 777 : 1
  var wrathValue = Game.elderWrath;
  var value = 0;
  // Clot
  value -= cookieInfo.clot.odds[wrathValue] * (cps + clickCps) * luckyMod * 66 * 0.5;
  // Frenzy
  value += cookieInfo.frenzy.odds[wrathValue] * (cps + clickCps) * luckyMod * 77 * 7;
  // Blood
  value += cookieInfo.blood.odds[wrathValue] * (cps + clickCps) * luckyMod * 666 * 6;
  // Chain
  value += cookieInfo.chain.odds[wrathValue] * calculateChainValue(bankAmount, cps, (7 - (wrathValue / 3)));
  // Ruin
  value -= cookieInfo.ruin.odds[wrathValue] * (Math.min(bankAmount * 0.05, cps * 60 * 10) + 13);
  // Frenzy + Ruin
  value -= cookieInfo.frenzyRuin.odds[wrathValue] * (Math.min(bankAmount * 0.05, cps * 60 * 10 * 7) + 13);
  // Clot + Ruin
  value -= cookieInfo.clotRuin.odds[wrathValue] * (Math.min(bankAmount * 0.05, cps * 60 * 10 * 0.5) + 13);
  // Lucky
  value += cookieInfo.lucky.odds[wrathValue] * (Math.min(bankAmount * 0.1, cps * 60 * 20) + 13);
  // Frenzy + Lucky
  value += cookieInfo.frenzyLucky.odds[wrathValue] * (Math.min(bankAmount * 0.1, cps * 60 * 20 * 7) + 13);
  // Clot + Lucky
  value += cookieInfo.clotLucky.odds[wrathValue] * (Math.min(bankAmount * 0.1, cps * 60 * 20 * 0.5) + 13);
  // Click
  value += cookieInfo.click.odds[wrathValue] * frenzyCps * luckyMod * 13 * 777;
  // Frenzy + Click
  value += cookieInfo.click.odds[wrathValue] * frenzyCps * luckyMod * 13 * 777 * 7;
  // Clot + Click
  value += cookieInfo.click.odds[wrathValue] * frenzyCps * luckyMod * 13 * 777 * 0.5;
  // Blah
  value += 0;
  return value;
}

function calculateChainValue(bankAmount, cps, digit) { 
  x = Math.min(bankAmount, (cps * 60 * 60 * 6 * 4));
  n = Math.floor(Math.log((9*x)/(4*digit))/Math.LN10);
  return 125 * Math.pow(9,(n-3)) * digit;
}

/* Old way, less efficient
function calculateChainValue(bankAmount, cps) {
  var payoutTotal = 0;
  var payoutNext = '6';
  var step = 1;
  var remainingProbability = 1;
  while (payoutNext < bankAmount * 0.25 || payoutNext <= cps * 60 * 60 * 6) {
    step += 1;
    payoutTotal += remainingProbability * 0.1 * payoutNext;
    remainingProbability -= remainingProbability * 0.1
    payoutNext += '6';
  }
  payoutTotal += remainingProbability * payoutNext.substr(0,payoutNext.length-1);
  return payoutTotal;
}
*/

function luckyBank() {
  return baseCps() * 60 * 20 * 10;
}

function luckyFrenzyBank() {
  return baseCps() * 60 * 20 * 7 * 10;
}

function chainBank() {
//  More exact
  var digit = 7 - Math.floor(Game.elderWrath / 3);
  return 4 * Math.floor(digit / 9 * Math.pow(10, Math.floor(Math.log(194400*baseCps()/digit)/Math.LN10 )));
//  return baseCps() * 60 * 60 * 6 * 4;
}

function cookieEfficiency(startingPoint, bankAmount) {
  var results = Number.MAX_VALUE;
  var currentValue = cookieValue(startingPoint);
  var bankValue = cookieValue(bankAmount);
  var bankCps = gcPs(bankValue);
  if (bankCps > 0) {
    if (bankAmount <= startingPoint) {
      results = 0;
    } else {
      var cost = Math.max(0,(bankAmount - startingPoint));
      var deltaCps = gcPs(bankValue - currentValue);
      results = divCps(cost, deltaCps);
    }
  }
  return results;
}

function bestBank(minEfficiency) {
  var results = {};
  var bankLevels = [0, luckyBank(), luckyFrenzyBank(), chainBank()].sort(function(a,b){return b-a;}).map(function(bank){
    return {'cost': bank, 'efficiency': cookieEfficiency(Game.cookies, bank)};
  }).filter(function(bank){
    return (bank.efficiency <= minEfficiency) ? bank : null;
  });
  return bankLevels[0];
}

function weightedCookieValue(useCurrent) {
  var cps = baseCps();
  var lucky_mod = Game.Has('Get lucky');
  var base_wrath = lucky_mod ? 401.835 * cps : 396.51 * cps;
//  base_wrath += 192125500000;
  var base_golden = lucky_mod ? 2804.76 * cps : 814.38 * cps;
  if (Game.cookiesEarned >= 100000) {
    var remainingProbability = 1;
    var startingValue = '6666';
    var rollingEstimate = 0;
    for (var i = 5; i < Math.min(Math.floor(Game.cookies).toString().length,12); i++) {
      startingValue += '6';
      rollingEstimate += 0.1 * remainingProbability * startingValue;
      remainingProbability -= remainingProbability * 0.1;
    }
    rollingEstimate += remainingProbability * startingValue;
//    base_golden += 10655700000;
    base_golden += rollingEstimate * 0.0033;
    base_wrath += rollingEstimate * 0.0595;
  }
  if (useCurrent && Game.cookies < maxLuckyValue() * 10) {
    if (lucky_mod) {
      base_golden -= ((1200 * cps) - Math.min(1200 * cps, Game.cookies * 0.1)) * 0.49 * 0.5 + (maxLuckyValue() - (Game.cookies * 0.1)) * 0.49 * 0.5;
    } else {
      base_golden -= (maxLuckyValue() - (Game.cookies * 0.1)) * 0.49;
      base_wrath  -= (maxLuckyValue() - (Game.cookies * 0.1)) * 0.29;
    }
  }
  return Game.elderWrath / 3.0 * base_wrath + (3 - Game.elderWrath) / 3.0 * base_golden;
}

function maxLuckyValue() {
  var gcMod = Game.Has('Get lucky') ? 8400 : 1200;
  return baseCps() * gcMod;
}

function maxCookieTime() {
  return Game.goldenCookie.maxTime
}

function gcPs(gcValue) {
  var averageGCTime = probabilitySpan(0, 0.5) / Game.fps;
  gcValue /= averageGCTime;
  gcValue *= FrozenCookies.simulatedGCPercent;
  return gcValue;
}

function gcEfficiency() {
  if (gcPs(weightedCookieValue()) <= 0) {
    return Number.MAX_VALUE;
  }
  var cost = Math.max(0,(maxLuckyValue() * 10 - Game.cookies));
  var deltaCps = gcPs(weightedCookieValue() - weightedCookieValue(true));
  return divCps(cost, deltaCps);
}

function delayAmount() {
  return bestBank(nextChainedPurchase().efficiency).cost;
/*
  if (nextChainedPurchase().efficiency > gcEfficiency() || (Game.frenzy && Game.Has('Get lucky'))) {
    return maxLuckyValue() * 10;
  } else if (weightedCookieValue() > weightedCookieValue(true)) {
    return Math.min(maxLuckyValue() * 10, Math.max(0,(nextChainedPurchase().efficiency - (gcEfficiency() * baseCps())) / gcEfficiency()));
  } else {
   return 0;
  }
*/
}

// Use this for changes to future efficiency calcs
function purchaseEfficiency(price, deltaCps, baseDeltaCps, currentCps) {
  var efficiency = Number.POSITIVE_INFINITY;
  if (deltaCps > 0) {
    efficiency = FrozenCookies.efficiencyWeight * divCps(price, currentCps) + divCps(price, deltaCps);
  }
  return efficiency;
}

function recommendationList(recalculate) {
  if (recalculate) {
    FrozenCookies.caches.recommendationList = addScores(upgradeStats(recalculate).concat(buildingStats(recalculate)).sort(function(a,b){return (a.efficiency - b.efficiency)}));
  }
  return FrozenCookies.caches.recommendationList;
//  return upgradeStats(recalculate).concat(buildingStats(recalculate)).sort(function(a,b){return (a.efficiency - b.efficiency)});
}

function addScores(recommendations) {
  var filteredList = recommendations.filter(function(a){return a.efficiency < Number.POSITIVE_INFINITY && a.efficiency > Number.NEGATIVE_INFINITY;})
  if (filteredList.length > 0) {
    var minValue = Math.log(recommendations[0].efficiency);
    var maxValue = Math.log(recommendations[filteredList.length - 1].efficiency);
    var spread = maxValue - minValue;
    recommendations.forEach(function(purchaseRec, index){
      if (purchaseRec.efficiency < Number.POSITIVE_INFINITY && purchaseRec.efficiency > Number.NEGATIVE_INFINITY) {
        var purchaseValue = Math.log(purchaseRec.efficiency);
        var purchaseSpread = purchaseValue - minValue;
        recommendations[index].efficiencyScore = 1 - (purchaseSpread / spread);
      } else {
        recommendations[index].efficiencyScore = 0;
      }
    });
  } else {
    recommendations.forEach(function(purchaseRec,index){recommendations[index].efficiencyScore = 0;});
  }
  return recommendations;
}

function nextPurchase(recalculate) {
  if (recalculate) {
    var recList = recommendationList(recalculate);
    var purchase = recList[0];
    if (purchase.type == 'upgrade' && unfinishedUpgradePrereqs(Game.UpgradesById[purchase.id])) {
      var prereqList = unfinishedUpgradePrereqs(Game.UpgradesById[purchase.id]);
      purchase = recList.filter(function(a){return prereqList.some(function(b){return b.id == a.id && b.type == a.type})})[0];
    }
    FrozenCookies.caches.nextPurchase = purchase;
  }
  return FrozenCookies.caches.nextPurchase;
//  return purchase;
}

function nextChainedPurchase() {
  return recommendationList()[0];
}

function buildingStats(recalculate) {
  if (recalculate) {
    var buildingBlacklist = blacklist[FrozenCookies.blacklist].buildings;
    var currentBank = bestBank(0).cost;
    FrozenCookies.caches.buildings = Game.ObjectsById.map(function (current, index) {
      if (buildingBlacklist === true || _.contains(buildingBlacklist, current.id)) {
        return null;
      }
      var baseCpsOrig = baseCps();
      var cpsOrig = baseCpsOrig + gcPs(cookieValue(Math.min(Game.cookies, currentBank))) + baseClickingCps(FrozenCookies.autoClick * FrozenCookies.cookieClickSpeed);
      var existing_achievements = Game.AchievementsById.map(function(item,i){return item.won});
      buildingToggle(current);
      var baseCpsNew = baseCps();
      var cpsNew = baseCpsNew + gcPs(cookieValue(currentBank)) + baseClickingCps(FrozenCookies.autoClick * FrozenCookies.cookieClickSpeed);
      buildingToggle(current, existing_achievements);
      var deltaCps = cpsNew - cpsOrig;
      var baseDeltaCps = baseCpsNew - baseCpsOrig;
      var efficiency = purchaseEfficiency(current.price, deltaCps, baseDeltaCps, cpsOrig)
      return {'id' : current.id, 'efficiency' : efficiency, 'base_delta_cps' : baseDeltaCps, 'delta_cps' : deltaCps, 'cost' : current.price, 'purchase' : current, 'type' : 'building'};
    });
  }
  return FrozenCookies.caches.buildings;
}

function upgradeStats(recalculate) {
  if (recalculate) {
    var upgradeBlacklist = blacklist[FrozenCookies.blacklist].upgrades;
    var currentBank = bestBank(0).cost;
    FrozenCookies.caches.upgrades = Game.UpgradesById.map(function (current) {
      if (!current.bought) {
        var needed = unfinishedUpgradePrereqs(current);
        if (upgradeBlacklist === true || _.contains(upgradeBlacklist, current.id) || (!current.unlocked && !needed)) {
          return null;
        }
        var baseCpsOrig = baseCps();
        var cpsOrig = baseCpsOrig + gcPs(cookieValue(Math.min(Game.cookies, currentBank))) + baseClickingCps(FrozenCookies.autoClick * FrozenCookies.cookieClickSpeed);
        var existing_achievements = Game.AchievementsById.map(function(item,i){return item.won});
        var existing_wrath = Game.elderWrath;
        var reverseFunctions = upgradeToggle(current);
        var baseCpsNew = baseCps();
        var cpsNew = baseCpsNew + gcPs(cookieValue(currentBank)) + baseClickingCps(FrozenCookies.autoClick * FrozenCookies.cookieClickSpeed);
        upgradeToggle(current, existing_achievements, reverseFunctions);
        Game.elderWrath = existing_wrath;
        var deltaCps = cpsNew - cpsOrig;
        var baseDeltaCps = baseCpsNew - baseCpsOrig;
        var cost = upgradePrereqCost(current);
        var efficiency = purchaseEfficiency(cost, deltaCps, baseDeltaCps, cpsOrig)
        return {'id' : current.id, 'efficiency' : efficiency, 'base_delta_cps' : baseDeltaCps, 'delta_cps' : deltaCps, 'cost' : cost, 'purchase' : current, 'type' : 'upgrade'};
      }
    }).filter(function(a){return a;});
  }
  return FrozenCookies.caches.upgrades;
}

function upgradePrereqCost(upgrade) {
  var cost = upgrade.basePrice;
  if (upgrade.unlocked) {
    return cost;
  }
  var prereqs = upgradeJson.filter(function(a){return a.id == upgrade.id;});
  if (prereqs.length) {
    prereqs = prereqs[0];
    cost += prereqs.buildings.reduce(function(sum,item,index) {
      var building = Game.ObjectsById[index];
      if (item && building.amount < item) {
        for (var i = building.amount; i < item; i++) {
          sum += building.basePrice * Math.pow(Game.priceIncrease, i);
        }
      }
      return sum;
    },0);
    cost += prereqs.upgrades.reduce(function(sum,item) {
      var reqUpgrade = Game.UpgradesById[item];
      if (!upgrade.bought) {
        sum += upgradePrereqCost(reqUpgrade);
      }
      return sum;
    }, 0);
  }
  return cost;
}

function unfinishedUpgradePrereqs(upgrade) {
  if (upgrade.unlocked) {
    return null;
  }
  var needed = [];
  var prereqs = upgradeJson.filter(function(a){return a.id == upgrade.id;});
  if (prereqs.length) {
    prereqs = prereqs[0];
    prereqs.buildings.forEach(function(a, b) {
      if (a && Game.ObjectsById[b].amount < a) {
        needed.push({'type' : 'building', 'id' : b});
      }
    });
    prereqs.upgrades.forEach(function(a) {
      if (!Game.UpgradesById[a].bought) {
        var recursiveUpgrade = Game.UpgradesById[a];
        var recursivePrereqs = unfinishedUpgradePrereqs(recursiveUpgrade);
        if (recursiveUpgrade.unlocked) {
          needed.push({'type' : 'upgrade', 'id' : a});
        } else if (!recursivePrereqs) {
          // Research is being done.
        } else {
          recursivePrereqs.forEach(function(a) {
            if (!needed.some(function(b){return b.id == a.id && b.type == a.type;})) {
              needed.push(a);
            }
          });
        }
      }
    });
  }
  return needed.length ? needed : null;
}

function upgradeToggle(upgrade, achievements, reverseFunctions) {
  if (!achievements) {
    upgrade.bought = 1;
    Game.UpgradesOwned += 1;
    reverseFunctions = buyFunctionToggle(upgrade);
  } else {
    upgrade.bought = 0;
    Game.UpgradesOwned -= 1;
    buyFunctionToggle(reverseFunctions);
    Game.AchievementsOwned = 0;
    achievements.forEach(function(won, index){
      var achievement = Game.AchievementsById[index];
      achievement.won = won;
      if (won && achievement.hide < 3) {
        Game.AchievementsOwned += 1;
      }
    });
  }
  Game.recalculateGains = 1;
  Game.CalculateGains();
  return reverseFunctions;
}

function buildingToggle(building, achievements) {
  if (!achievements) {
    building.amount += 1;
    building.bought += 1;
    Game.BuildingsOwned += 1;
  } else {
    building.amount -= 1;
    building.bought -= 1;
    Game.BuildingsOwned -= 1;
    Game.AchievementsOwned = 0;
    achievements.forEach(function(won, index){
      var achievement = Game.AchievementsById[index];
      achievement.won = won;
      if (won && achievement.hide < 3) {
        Game.AchievementsOwned += 1;
      }
    });
  }
  Game.recalculateGains = 1;
  Game.CalculateGains();
}

function buyFunctionToggle(upgrade) {
  if (upgrade && !upgrade.length) {
    if (!upgrade.buyFunction) {
      return null;
    }
    var ignoreFunctions = [
      /Game\.Lock\('.*'\)/,
      /Game\.Unlock\('.*'\)/,
      /Game\.Objects\['.*'\]\.drawFunction\(\)/,
      /Game\.SetResearch\('.*'\)/,
      /Game\.Upgrades\['.*'\]\.basePrice=.*/
    ];
    var buyFunctions = upgrade.buyFunction.toString()
      .replace(/\n/g, '')
      .replace(/function\s*\(\)\s*{(.+)\s*}/, "$1")
      .split(';')
      .map(function(a){return a.trim().replace(/\+\+/,'+=1').replace(/\-\-/,'-=1');})
      .filter(function(a){
        ignoreFunctions.forEach(function(b){a = a.replace(b,'')});
        return a != '';
      });
    
    if (buyFunctions.length == 0) {
      return null;
    }
    
    var reversedFunctions = buyFunctions.map(function(a){
      var reversed = '';
      var achievementMatch = /Game\.Win\('(.*)'\)/.exec(a);
      if (a.split('+=').length > 1) {
        reversed = a.split('+=').join('-=');
      } else if (a.split('-=').length > 1) {
        reversed = a.split('-=').join('+=');
      } else if (achievementMatch && Game.Achievements[achievementMatch[1]].won == 0) {
        reversed = 'Game.Achievements[\'' + achievementMatch[1] + '\'].won=0';
      } else if (a.split('=').length > 1) {
        reversed = a.split('=')[0] + '=' + eval(a.split('=')[0]);
      }
      return reversed;
    });
    buyFunctions.forEach(function(f) {eval(f);});
    return reversedFunctions;
  } else if (upgrade && upgrade.length) {
    upgrade.forEach(function(f) {eval(f);});
  }
  return null;
}

function fcWin(what) {
  if (typeof what==='string') {
    if (Game.Achievements[what]) {
      if (Game.Achievements[what].won==0) {
        Game.Achievements[what].won=1;
        if (!FrozenCookies.disabledPopups) {
          Game.Popup('Achievement unlocked :<br>'+Game.Achievements[what].name+'<br> ');
        }
        if (Game.Achievements[what].hide!=3) {
          Game.AchievementsOwned++;
        }
        Game.recalculateGains=1;
      }
    }
  } else {
    for (var i in what) {Game.Win(what[i]);}
  }
}

function shouldClickGC() {
//  return Game.goldenCookie.life > 0 && gc_click_percent > 0 && Game.missedGoldenClicks + Game.goldenClicks >= 0 && ((Game.goldenClicks / (Game.missedGoldenClicks + Game.goldenClicks) <= gc_click_percent) || (Game.missedGoldenClicks + Game.goldenClicks == 0));
  return Game.goldenCookie.life > 0 && FrozenCookies.autoGC;
}

function autoFrenzyClick() {
  if (Game.clickFrenzy > 0 && !autoclickBot) {
    FrozenCookies.autoclickBot = setInterval(function(){Game.ClickCookie();}, 1000 / FrozenCookies.frenzyClickSpeed);
  } else if (Game.clickFrenzy == 0 && FrozenCookies.autoclickBot) {
    clearInterval(FrozenCookies.autoclickBot);
    FrozenCookies.autoclickBot = 0;
    if (FrozenCookies.autoClick && FrozenCookies.cookieClickSpeed) {
      FrozenCookies.autoclickBot = setInterval(function(){Game.ClickCookie();}, 1000 / FrozenCookies.cookieClickSpeed);
    }
  }
}

function autoCookie() {
  if (!FrozenCookies.processing) {
    FrozenCookies.processing = true;
    if (Game.cookieClicks < FrozenCookies.initial_clicks) {
      for (var i=0; i<FrozenCookies.initial_clicks; i++) {
        Game.ClickCookie();
      }
    }
//     Handle possible lag issues? Only recalculate when CPS changes.
    if (FrozenCookies.lastHCAmount < Game.HowMuchPrestige(Game.cookiesEarned + Game.cookiesReset)) {
      FrozenCookies.lastHCAmount = Game.HowMuchPrestige(Game.cookiesEarned + Game.cookiesReset);
      FrozenCookies.prevLastHCTime = FrozenCookies.lastHCTime;
      var currHCPercent = (60 * 60 * (FrozenCookies.lastHCAmount - Game.prestige['Heavenly chips'])/((FrozenCookies.lastHCTime - Game.startDate)/1000));
      if (currHCPercent > FrozenCookies.maxHCPercent) {
        FrozenCookies.maxHCPercent = currHCPercent;
      }
      FrozenCookies.lastHCTime = Date.now();
      updateLocalStorage();
    }
    if (FrozenCookies.lastCPS != Game.cookiesPs) {
      FrozenCookies.recalculateCaches = true;
      FrozenCookies.lastCPS = Game.cookiesPs;
    }
    var recommendation = nextPurchase(FrozenCookies.recalculateCaches);
    FrozenCookies.recalculateCaches = false;
    var currentBank = bestBank(0);
    if (FrozenCookies.currentBank.cost != currentBank.cost) {
      FrozenCookies.recalculateCaches = true;
      FrozenCookies.currentBank = currentBank;
    }
    var targetBank = bestBank(recommendation.efficiency);
    if (FrozenCookies.targetBank.cost != targetBank.cost) {
      FrozenCookies.recalculateCaches = true;
      FrozenCookies.targetBank = targetBank;
    }
    var currentCookieCPS = gcPs(cookieValue(currentBank.cost));
    if (FrozenCookies.lastCookieCPS != currentCookieCPS) {
      FrozenCookies.recalculateCaches = true;
      FrozenCookies.lastCookieCPS = currentCookieCPS;
    }
    var currentUpgradeCount = Game.UpgradesInStore.length;
    if (FrozenCookies.lastUpgradeCount != currentUpgradeCount) {
      FrozenCookies.recalculateCaches = true;
      FrozenCookies.lastUpgradeCount = currentUpgradeCount;
    }
    if (FrozenCookies.recalculateCaches) {
      recommendation = nextPurchase(FrozenCookies.recalculateCaches);
      FrozenCookies.recalculateCaches = false;
    }
//    var store = (recommendation.type == 'building') ? Game.ObjectsById : Game.UpgradesById;
//    var purchase = store[recommendation.id];
    if (FrozenCookies.autoBuy && Game.cookies >= delayAmount() + recommendation.cost) {
      recommendation.time = Date.now() - Game.startDate;
//      full_history.push(recommendation);  // Probably leaky, maybe laggy?
      recommendation.purchase.clickFunction = null;
      disabledPopups = false;
//      console.log(purchase.name + ': ' + Beautify(recommendation.efficiency) + ',' + Beautify(recommendation.delta_cps));
      recommendation.purchase.buy();
      disabledPopups = true;
      FrozenCookies.recalculateCaches = true;
      autoCookie();
    }
    if (shouldClickGC()) {
      Game.goldenCookie.click();
      Game.goldenCookie.life = 0;
//      full_history.push({'type' : 'golden_cookie', 'time' : Date.now() - initial_load_time});  // Probably leaky, maybe laggy?
    }
    if ((Game.frenzy > 0) != FrozenCookies.last_gc_state) {
      if (FrozenCookies.last_gc_state) {
        FrozenCookies.gc_time += Date.now() - FrozenCookies.last_gc_time;
      } else {
        FrozenCookies.non_gc_time += Date.now() - FrozenCookies.last_gc_time;
      }
      updateLocalStorage();
      FrozenCookies.last_gc_state = (Game.frenzy > 0);
      FrozenCookies.last_gc_time = Date.now();
    }
    FrozenCookies.processing = false;
  }
}

function FCStart() {
  //  To allow polling frequency to change, clear intervals before setting new ones.
  
  if (FrozenCookies.cookieBot) {
    clearInterval(FrozenCookies.cookieBot);
    FrozenCookies.cookieBot = 0;
  }
  if (FrozenCookies.autoclickBot) {
    clearInterval(FrozenCookies.autoclickBot);
    FrozenCookies.autoclickBot = 0;
  }
  
  // Now create new intervals with their specified frequencies.
  
  if (FrozenCookies.frequency) {
    FrozenCookies.cookieBot = setInterval(function() {autoCookie();}, FrozenCookies.frequency);
  }
  
  if (FrozenCookies.autoClick && FrozenCookies.cookieClickSpeed) {
    FrozenCookies.autoclickBot = setInterval(function() {Game.ClickCookie();}, 1000 / FrozenCookies.cookieClickSpeed);
  } else if (FrozenCookies.autoFrenzy && FrozenCookies.frenzyClickSpeed > 0) {
    FrozenCookies.frenzyClickBot = setInterval(function() {autoFrenzyClick();}, FrozenCookies.frequency);
  }
  
  FCMenu();
}
