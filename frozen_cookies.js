// Load external libraries

if (true) {
  var script_list = [
    'https://raw.github.com/Icehawk78/FrozenCookies/master/cc_upgrade_prerequisites.js',
    'https://raw.github.com/caleb531/jcanvas/master/jcanvas.js',
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
Game.prefs['autobuy'] = Number(localStorage.getItem('autobuy'));
var frequency = 100;
var non_gc_time = 0;
var gc_time = 0;
var last_gc_state = (Game.frenzy > 0);
var last_gc_time = Date.now();
var cookie_click_speed = 0;
//var gc_click_percent = localStorage.getItem('autogc');
Game.prefs['autogc'] = Number(localStorage.getItem('autogc'));
var initial_clicks = 0;
var initial_load_time = Date.now();
var full_history = [];

var cookieBot = -1;
var autoclickBot = -1;

function Beautify (value) {
  notation = ['', ' million', ' billion', ' trillion', ' quadrillion', ' quintillion', ' sextillion', ' septillion'];
  base = 0;
  if (value >= 1000000) {
    value /= 1000;
    while(value >= 1000){
      value /= 1000;
      base++;
    }
  }
  value = Math.round(value * 1000) / 1000.0;
  if(base < notation.length){
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + notation[base];
  }
  return 'Infinity';
}

Game.RebuildStore();
Game.RebuildUpgrades();

function showGCTimes() {
  return "\nNormal CPS: " + timeDisplay(non_gc_time / 1000) + "\nGC CPS:     " + timeDisplay(gc_time / 1000) + "\nPercentage GC: " + (gc_time * 1.0) / (non_gc_time + gc_time);
}

function timeDisplay(seconds) {
  if (seconds === '---' || seconds === 0) { return '---'; }
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

function nextHC(tg) {
  var futureHC = Math.ceil(Math.sqrt((Game.cookiesEarned + Game.cookiesReset)/0.5e12+0.25)-0.5);
  var nextHC = futureHC*(futureHC+1)*0.5e12;
  var toGo = nextHC - (Game.cookiesEarned + Game.cookiesReset);
  return tg ? toGo : timeDisplay(toGo / Game.cookiesPs);
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
    toggleFrozen('autobuy');
    Game.Toggle('autobuy','autobuyButton','Autobuy OFF','Autobuy ON');
  }
});

// Press 'c' to toggle auto-GC
document.addEventListener('keydown', function(event) {
  if(event.keyCode == 67) {
    toggleFrozen('autogc');
    Game.Toggle('autogc','autogcButton','Autoclick GC OFF','Autoclick GC ON');
  }
});

function toggleFrozen(setting) {
  if (!localStorage.getItem(setting)) {
    localStorage.setItem(setting,1);
//    Game.prefs[setting] = 1;
  } else {
    localStorage.setItem(setting,0);
//    Game.prefs[setting] = 0;
  }
}

function weightedCookieValue(useCurrent) {
  var frenzy_mod = (Game.frenzy > 0) ? Game.frenzyPower : 1;
  var base_cps = Game.cookiesPs / frenzy_mod;
  var lucky_mod = Game.Has('Get lucky');
  var base_wrath = lucky_mod ? 401.835 * base_cps : 396.51 * base_cps;
//  base_wrath += 192125500000;
  var base_golden = lucky_mod ? 2804.76 * base_cps : 814.38 * base_cps;
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
      base_golden -= ((1200 * base_cps) - Math.min(1200 * base_cps, Game.cookies * 0.1)) * 0.49 * 0.5 + (maxLuckyValue() - (Game.cookies * 0.1)) * 0.49 * 0.5;
    } else {
      base_golden -= (maxLuckyValue() - (Game.cookies * 0.1)) * 0.49;
      base_wrath  -= (maxLuckyValue() - (Game.cookies * 0.1)) * 0.29;
    }
  }
  return Game.elderWrath / 3.0 * base_wrath + (3 - Game.elderWrath) / 3.0 * base_golden;
}

function maxLuckyValue() {
  var gcMod = Game.Has('Get lucky') ? 8400 : 1200;
  gcMod /= Game.frenzy ? Game.frenzyPower : 1;
  return Game.cookiesPs * gcMod;
}

function maxCookieTime() {
  var baseCookieTime = Game.fps * 60 * 15;
  if (Game.Has('Lucky day')) baseCookieTime/=2;
  if (Game.Has('Serendipity')) baseCookieTime/=2;
  if (Game.Has('Gold hoard')) baseCookieTime=0.01;
  return baseCookieTime;
}

function gcPs(gcValue) {
  var averageGCTime = 600
  if (Game.Has('Lucky day')) averageGCTime/=2;
  if (Game.Has('Serendipity')) averageGCTime/=2;
  gcValue /= averageGCTime;
//  gcValue *= gc_click_percent;
  gcValue *= Game.prefs.autogc ? 1 : 0;
  return gcValue;
}

function gcRoi() {
  var frenzy_mod = (Game.frenzy > 0) ? Game.frenzyPower : 1;
  if (gcPs(weightedCookieValue()) <= 0) {
    return Number.MAX_VALUE;
  }
  return Math.max(0,(maxLuckyValue() * 10 - Game.cookies)) * ((Game.cookiesPs / frenzy_mod) + gcPs(weightedCookieValue(true))) / gcPs(weightedCookieValue(true));
}

function costDelta() {
  if (weightedCookieValue() > weightedCookieValue(true)) {
    return Math.max(0,(maxLuckyValue() * 10 - Game.cookies)) / (gcPs(weightedCookieValue() - weightedCookieValue(true)));
  }
  return null;
}

function delayAmount() {
  if (nextChainedPurchase().roi > gcRoi() || Game.goldenCookie.delay < Game.frenzy) {
    return maxLuckyValue() * 10;
  } else if (costDelta()) {
    return Math.min(maxLuckyValue() * 10, Math.max(0,(nextChainedPurchase().roi - (costDelta() * Game.cookiesPs)) / costDelta()));
  } else {
   return 0;
  }
}

function recommendationList() {
  return upgradeStats().concat(buildingStats()).sort(function(a,b){return (a.roi - b.roi)});
}

function nextPurchase() {
  var recList = recommendationList();
  var purchase = recList[0];
  if (purchase.type == 'upgrade' && unfinishedUpgradePrereqs(Game.UpgradesById[purchase.id])) {
    var prereqList = unfinishedUpgradePrereqs(Game.UpgradesById[purchase.id]);
    purchase = recList.filter(function(a){return prereqList.some(function(b){return b.id == a.id && b.type == a.type})})[0];
  }
  return purchase;
}

function nextChainedPurchase() {
  return recommendationList()[0];
}

function buildingStats() {
  return Game.ObjectsById.map(function (current, index) {
    var base_cps_orig = Game.cookiesPs;
    var cps_orig = Game.cookiesPs + gcPs(weightedCookieValue(true));
    var existing_achievements = Game.AchievementsById.map(function(item,i){return item.won});
    buildingToggle(current);
    var base_cps_new = Game.cookiesPs;
    var cps_new = Game.cookiesPs + gcPs(weightedCookieValue(true));
    buildingToggle(current, existing_achievements);
    var delta_cps = cps_new - cps_orig;
    var base_delta_cps = base_cps_new - base_cps_orig;
    var roi = current.price * cps_new / delta_cps;
    return {'id' : current.id, 'roi' : roi, 'base_delta_cps' : base_delta_cps, 'delta_cps' : delta_cps, 'cost' : current.price, 'type' : 'building'};
  });
}

function oldUpgradeStats() {
  return Game.UpgradesInStore.map(function (current, index) {
    if (!current.bought) {
      var base_cps_orig = Game.cookiesPs;
      var cps_orig = Game.cookiesPs + gcPs(weightedCookieValue(true));
      var existing_achievements = Game.AchievementsById.map(function(item,i){return item.won});
      var existing_wrath = Game.elderWrath;
      var reverseFunctions = upgradeToggle(current);
      var base_cps_new = Game.cookiesPs;
      var cps_new = Game.cookiesPs + gcPs(weightedCookieValue(true));
      upgradeToggle(current, existing_achievements, reverseFunctions);
      Game.elderWrath = existing_wrath;
      var delta_cps = cps_new - cps_orig;
      var base_delta_cps = base_cps_new - base_cps_orig;
      var roi = (delta_cps > 0) ? current.basePrice * cps_new / delta_cps : Number.MAX_VALUE;
      return {'id' : current.id, 'roi' : roi, 'base_delta_cps' : base_delta_cps, 'delta_cps' : delta_cps, 'cost' : current.basePrice, 'type' : 'upgrade'};
    }
  });
}

function upgradeStats() {
  return Game.UpgradesById.map(function (current) {
    if (!current.bought) {
      var needed = unfinishedUpgradePrereqs(current);
      if (!current.unlocked && !needed) {
        return null;
      }
      var base_cps_orig = Game.cookiesPs;
      var cps_orig = Game.cookiesPs + gcPs(weightedCookieValue(true));
      var existing_achievements = Game.AchievementsById.map(function(item,i){return item.won});
      var existing_wrath = Game.elderWrath;
      var reverseFunctions = upgradeToggle(current);
      var base_cps_new = Game.cookiesPs;
      var cps_new = Game.cookiesPs + gcPs(weightedCookieValue(true));
      upgradeToggle(current, existing_achievements, reverseFunctions);
      Game.elderWrath = existing_wrath;
      var delta_cps = cps_new - cps_orig;
      var base_delta_cps = base_cps_new - base_cps_orig;
      var roi = (delta_cps > 0) ? upgradePrereqCost(current) * cps_new / delta_cps : Number.MAX_VALUE;
      return {'id' : current.id, 'roi' : roi, 'base_delta_cps' : base_delta_cps, 'delta_cps' : delta_cps, 'cost' : upgradePrereqCost(current), 'type' : 'upgrade'};
    }
  }).filter(function(a){return a;});
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

function shouldClickGC() {
//  return Game.goldenCookie.life > 0 && gc_click_percent > 0 && Game.missedGoldenClicks + Game.goldenClicks >= 0 && ((Game.goldenClicks / (Game.missedGoldenClicks + Game.goldenClicks) <= gc_click_percent) || (Game.missedGoldenClicks + Game.goldenClicks == 0));
  return Game.goldenCookie.life > 0 && Game.prefs.autogc;
}

function autoCookie() {
  if (Game.cookieClicks < initial_clicks) {
    for (var i=0; i<initial_clicks; i++) {
      Game.ClickCookie();
    }
  }
  var recommendation = nextPurchase();
  var store = (recommendation.type == 'building') ? Game.ObjectsById : Game.UpgradesById;
  var purchase = store[recommendation.id];
  if (Game.prefs.autobuy && Game.cookies >= delayAmount() + recommendation.cost) {
    recommendation.time = Date.now() - initial_load_time;
    full_history.push(recommendation);
    purchase.clickFunction = null;
    purchase.buy();
    autoCookie();
  }
  if (shouldClickGC()) {
    Game.goldenCookie.click();
    full_history.push({'type' : 'golden_cookie', 'time' : Date.now() - initial_load_time});
  }
  if ((Game.frenzy > 0) != last_gc_state) {
    if (last_gc_state) {
      gc_time += Date.now() - last_gc_time;
    } else {
      non_gc_time += Date.now() - last_gc_time;
    }
    last_gc_state = (Game.frenzy > 0);
    last_gc_time = Date.now();
  }
}

function FCStart(){
  if (frequency) {
    var cookieBot = setInterval(function() {autoCookie()}, frequency);
  }
  if (cookie_click_speed) {
    var autoclickBot = setInterval(function() {Game.ClickCookie()}, cookie_click_speed);
  }
  FCMenu();
}
