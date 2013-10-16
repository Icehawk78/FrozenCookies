// Load external libraries

if (true) {
  var script_list = [
    'https://raw.github.com/caleb531/jcanvas/master/jcanvas.js',
    'http://underscorejs.org/underscore-min.js',
    'https://raw.github.com/Icehawk78/FrozenCookies/master/cc_upgrade_prerequisites.js',
    'https://raw.github.com/Icehawk78/FrozenCookies/master/fc_button.js'
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
          FCStart();
        }
      });
    });
  };
  document.head.appendChild(jquery);
}

// Global Variables

//var autoBuy = localStorage.getItem('autobuy');
var frequency = 100;  // Too fast and we bump into ourselves, and that's BAD.
var efficiencyWeight = 1.15;
var preferenceValues = [
  {'autobuy' : [0,1]},
  {'autogc' : [0,1]},
  {'autofrenzy' : [0,1,10,25,50,100,250]},
  {'autoclick' : [0,1,10,25,50,100,250]},
  {'simulategc' : [0,1,2]},
  {'numberdisplay' : [0,1,2,3]}
];
Game.prefs['autobuy'] = Number(localStorage.getItem('autobuy'));
Game.prefs['autogc'] = Number(localStorage.getItem('autogc'));
if (!localStorage.getItem('simulategc')) {
  localStorage.setItem('simulategc', 1);
}
var simulatedGCPercent = Number(localStorage.getItem('simulategc'));
var non_gc_time = Number(localStorage.getItem('nonFrenzyTime'));
var gc_time = Number(localStorage.getItem('frenzyTime'));
var last_gc_state = (Game.frenzy > 0);
var last_gc_time = Date.now();
var cookie_click_speed = 0;
var clickFrenzySpeed = 0;
var initial_clicks = 0;
// var full_history = [];  // This may be a super leaky thing

var lastHCAmount = Number(localStorage.getItem('lastHCAmount'));
var lastHCTime = Number(localStorage.getItem('lastHCTime'));
var prevLastHCTime = Number(localStorage.getItem('prevLastHCTime'));

var lastCPS = Game.cookiesPs;
var recalculateCaches = true;
var disabledPopups = true;

// Store the setInterval ids here for the various processes.
var cookieBot = 0;
var autoclickBot = 0;

function Beautify (value) {
  var notation = ['', ' million', ' billion', ' trillion', ' quadrillion', ' quintillion', ' sextillion', ' septillion'];
  var base = 0;
  var negative = false;
  if (value < 0) {
    negative = true;
    value *= -1;
  }
  if (value >= 1000000 && Number.isFinite(value)) {
    value /= 1000;
    while(value >= 1000){
      value /= 1000;
      base++;
    }
  }
  value = Math.round(value * 1000) / 1000.0;
  if (!Number.isFinite(value) || base > notation.length) {
    return 'Infinity';
  } else {
    var output = value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + notation[base];
    return negative ? '-' + output : output;
  }
}

Game.RebuildStore();
Game.RebuildUpgrades();

function showGCTimes() {
  return "\nNormal CPS: " + timeDisplay(non_gc_time / 1000) + "\nGC CPS:     " + timeDisplay(gc_time / 1000) + "\nPercentage GC: " + (gc_time * 1.0) / (non_gc_time + gc_time);
}

function timeDisplay(seconds) {
  if (seconds === '---' || seconds === 0) { return 'Done!'; }
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

Game.sayTime = function(time,detail) {return timeDisplay(time/Game.fps);}

function updateLocalStorage() {
  localStorage.setItem('simulategc', simulatedGCPercent);
  localStorage.setItem('nonFrenzyTime', non_gc_time);
  localStorage.setItem('frenzyTime', gc_time);
  localStorage.setItem('lastHCAmount', lastHCAmount);
  localStorage.setItem('lastHCTime', lastHCTime);
  localStorage.setItem('prevLastHCTime', prevLastHCTime);
}

Game.oldReset = Game.Reset;

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
    Game.Toggle('autobuy','autobuyButton','Autobuy OFF','Autobuy ON');
    toggleFrozen('autobuy');
  }
});

// Press 'c' to toggle auto-GC
document.addEventListener('keydown', function(event) {
  if(event.keyCode == 67) {
    Game.Toggle('autogc','autogcButton','Autoclick GC OFF','Autoclick GC ON');
    toggleFrozen('autogc');
  }
});

function writeFCButton(setting) {
  
}

function toggleFrozen(setting) {
  if (!Number(localStorage.getItem(setting))) {
    localStorage.setItem(setting,1);
//    Game.prefs[setting] = 1;
  } else {
    localStorage.setItem(setting,0);
//    Game.prefs[setting] = 0;
  }
  FCStart();
}

function cumulativeProbability(start, stop) {
  return 1 - ((1 - cumulativeProbabilityList[stop]) / (1 - cumulativeProbabilityList[start]));
}

function probabilitySpan(start, endProbability) {
  var startProbability = cumulativeProbabilityList[start];
  return _.sortedIndex(cumulativeProbabilityList, (startProbability + endProbability - startProbability * endProbability));
}

function baseCps() {
  var frenzy_mod = (Game.frenzy > 0) ? Game.frenzyPower : 1;
  return Game.cookiesPs / frenzy_mod;
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
  var baseCookieTime = Game.fps * 60 * 15;
  if (Game.Has('Lucky day')) baseCookieTime/=2;
  if (Game.Has('Serendipity')) baseCookieTime/=2;
  if (Game.Has('Gold hoard')) baseCookieTime=0.01;
  return baseCookieTime;
}

function gcPs(gcValue) {
  var averageGCTime = maxCookieTime() * 19 / 900
  gcValue /= averageGCTime;
  gcValue *= simulatedGCPercent;
  return gcValue;
}

function gcEfficiency() {
  if (gcPs(weightedCookieValue()) <= 0) {
    return Number.MAX_VALUE;
  }
  var cost = Math.max(0,(maxLuckyValue() * 10 - Game.cookies));
  var deltaCps = gcPs(weightedCookieValue() - weightedCookieValue(true));
// removed, pending verification of efficacy
//  return  efficiencyWeight * divCps(cost, Game.cookiesPs) + divCps(cost, deltaCps);
  return divCps(cost, deltaCps);
}

function delayAmount() {
  if (nextChainedPurchase().efficiency > gcEfficiency() || Game.goldenCookie.delay < Game.frenzy) {
    return maxLuckyValue() * 10;
  } else if (weightedCookieValue() > weightedCookieValue(true)) {
    return Math.min(maxLuckyValue() * 10, Math.max(0,(nextChainedPurchase().efficiency - (gcEfficiency() * baseCps())) / gcEfficiency()));
  } else {
   return 0;
  }
}

function recommendationList() {
  return upgradeStats().concat(buildingStats()).sort(function(a,b){return (a.efficiency - b.efficiency)});
}

//var cachedNextPurchase = null;
function nextPurchase() {
//  if (recalculateCaches) {
    var recList = recommendationList();
    var purchase = recList[0];
    if (purchase.type == 'upgrade' && unfinishedUpgradePrereqs(Game.UpgradesById[purchase.id])) {
      var prereqList = unfinishedUpgradePrereqs(Game.UpgradesById[purchase.id]);
      purchase = recList.filter(function(a){return prereqList.some(function(b){return b.id == a.id && b.type == a.type})})[0];
    }
//    cachedNextPurchase = purchase;
//  }
//  return cachedNextPurchase;
  return purchase;
}

function nextChainedPurchase() {
  return recommendationList()[0];
}

//var cachedBuildings = null;
function buildingStats() {
//  if (recalculateCaches) {
//    cachedBuildings = Game.ObjectsById.map(function (current, index) {
  return Game.ObjectsById.map(function (current, index) {
    var baseCpsOrig = baseCps();
    var cpsOrig = baseCpsOrig + gcPs(weightedCookieValue(true));
    var existing_achievements = Game.AchievementsById.map(function(item,i){return item.won});
    buildingToggle(current);
    var baseCpsNew = baseCps();
    var cpsNew = baseCpsNew + gcPs(weightedCookieValue(true));
    buildingToggle(current, existing_achievements);
    var deltaCps = cpsNew - cpsOrig;
    var baseDeltaCps = baseCpsNew - baseCpsOrig;
    var efficiency = efficiencyWeight * divCps(current.price, cpsOrig) + divCps(current.price, deltaCps);
    return {'id' : current.id, 'efficiency' : efficiency, 'base_delta_cps' : baseDeltaCps, 'delta_cps' : deltaCps, 'cost' : current.price, 'type' : 'building'};
  });
//  }
//  return cachedBuildings;
}

//var cachedUpgrades = null;
function upgradeStats() {
//  if (recalculateCaches) {
//    cachedUpgrades = Game.UpgradesById.map(function (current) {
  return Game.UpgradesById.map(function (current) {
    if (!current.bought) {
      var needed = unfinishedUpgradePrereqs(current);
      if (!current.unlocked && !needed) {
        return null;
      }
      var baseCpsOrig = baseCps();
      var cpsOrig = baseCpsOrig + gcPs(weightedCookieValue(true));
      var existing_achievements = Game.AchievementsById.map(function(item,i){return item.won});
      var existing_wrath = Game.elderWrath;
      var reverseFunctions = upgradeToggle(current);
      var baseCpsNew = baseCps();
      var cpsNew = baseCpsNew + gcPs(weightedCookieValue(true));
      upgradeToggle(current, existing_achievements, reverseFunctions);
      Game.elderWrath = existing_wrath;
      var deltaCps = cpsNew - cpsOrig;
      var baseDeltaCps = baseCpsNew - baseCpsOrig;
      var cost = upgradePrereqCost(current);
      var efficiency = efficiencyWeight * divCps(cost, cpsOrig) + divCps(cost, deltaCps);
      if (deltaCps < 0) {
        efficiency = Number.POSITIVE_INFINITY;
      }
      return {'id' : current.id, 'efficiency' : efficiency, 'base_delta_cps' : baseDeltaCps, 'delta_cps' : deltaCps, 'cost' : cost, 'type' : 'upgrade'};
    }
  }).filter(function(a){return a;});
//  }
//  return cachedUpgrades;
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

Game.Win = function (what) {
  if (typeof what==='string') {
    if (Game.Achievements[what]) {
      if (Game.Achievements[what].won==0) {
        Game.Achievements[what].won=1;
        if (!disabledPopups) {
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
  return Game.goldenCookie.life > 0 && Game.prefs.autogc;
}

function autoclickFrenzy() {
  if (Game.clickFrenzy > 0) {
    Game.ClickCookie();
  }
}

function autoCookie() {
  if (Game.cookieClicks < initial_clicks) {
    for (var i=0; i<initial_clicks; i++) {
      Game.ClickCookie();
    }
  }
  // Handle possible lag issues? Only recalculate when CPS changes.
//  if (lastCPS != Game.cookiesPs) {
//    recalculateCaches = true;
//  }
  if (lastHCAmount < Game.HowMuchPrestige(Game.cookiesEarned + Game.cookiesReset)) {
    lastHCAmount = Game.HowMuchPrestige(Game.cookiesEarned + Game.cookiesReset);
    prevLastHCTime = lastHCTime;
    lastHCTime = Date.now();
    updateLocalStorage();
  }
  var recommendation = nextPurchase();
  var store = (recommendation.type == 'building') ? Game.ObjectsById : Game.UpgradesById;
  var purchase = store[recommendation.id];
  if (Game.prefs.autobuy && Game.cookies >= delayAmount() + recommendation.cost) {
    recommendation.time = Date.now() - Game.startDate;
//    full_history.push(recommendation);  // Probably leaky, maybe laggy?
    purchase.clickFunction = null;
    disabledPopups = false;
//    console.log(purchase.name + ': ' + Beautify(recommendation.efficiency) + ',' + Beautify(recommendation.delta_cps));
    purchase.buy();
    disabledPopups = true;
    autoCookie();
  }
  if (shouldClickGC()) {
    Game.goldenCookie.click();
    Game.goldenCookie.life = 0;
//    full_history.push({'type' : 'golden_cookie', 'time' : Date.now() - initial_load_time});  // Probably leaky, maybe laggy?
  }
  if ((Game.frenzy > 0) != last_gc_state) {
    if (last_gc_state) {
      gc_time += Date.now() - last_gc_time;
    } else {
      non_gc_time += Date.now() - last_gc_time;
    }
    updateLocalStorage();
    last_gc_state = (Game.frenzy > 0);
    last_gc_time = Date.now();
  }
}

function FCStart() {
  //  To allow polling frequency to change, clear intervals before setting new ones.
  
  if (cookieBot) {
    clearInterval(cookieBot);
  }
  if (autoclickBot) {
    clearInterval(autoclickBot);
  }
  
  // Now create new intervals with their specified frequencies.
  
  if (frequency) {
    cookieBot = setInterval(function() {autoCookie();}, frequency);
  }
  
  if (cookie_click_speed) {
    autoclickBot = setInterval(function() {Game.ClickCookie();}, cookie_click_speed);
  } else if (clickFrenzySpeed > 0) {
    autoclickBot = setInterval(function() {autoclickFrenzy();}, clickFrenzySpeed);
  }
  
  FCMenu();
}
