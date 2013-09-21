// Load external libraries

if (true) {
  var script_list = [
    'https://raw.github.com/caleb531/jcanvas/master/jcanvas.min.js',
    'https://raw.github.com/Icehawk78/FrozenCookies/master/fc_button.js'
  ]
  var jquery = document.createElement('script');
  jquery.setAttribute('type', 'text/javascript');
  jquery.setAttribute('src', 'http://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js');
  jquery.onload = function() {
    script_list.forEach(function(url){
      $.getScript(url);
    });
  };
  document.head.appendChild(jquery);
}

// Global Variables

var autoBuy = true;
var frequency = 100;
var non_gc_time = 0;
var gc_time = 0;
var last_gc_state = (Game.frenzy > 0);
var last_gc_time = Date.now();
var cookie_click_speed = 0;
var gc_click_percent = 1;
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
	return (hours + minutes + seconds).trim();
}

Game.sayTime = function(time,detail) {return timeDisplay(time/Game.fps);}

function nextHC() {
  var futureHC = Math.floor(Math.sqrt((Game.cookiesEarned + Game.cookiesReset) / 1000000000000));
  var nextHC = (futureHC + 1) * (futureHC + 1) * 1000000000000;
  var toGo = nextHC - (Game.cookiesEarned + Game.cookiesReset);
  return timeDisplay(toGo / Game.cookiesPs);
}

document.addEventListener('keydown', function(event) {
    if(event.keyCode == 65) {
        autoBuy = !autoBuy;
    }
});

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
  gcValue *= gc_click_percent;
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
    return Math.max(0,(maxLuckyValue() * 10 - Game.cookies)) / (gcPs(weightedCookieValue()) - gcPs(weightedCookieValue(true)));
  }
  return null;
}

function delayAmount() {
  if (nextPurchase().roi > gcRoi()) {
    return maxLuckyValue() * 10;
  } else if (costDelta()) {
    return nextPurchase().roi - (costDelta() * Game.cookiesPs);
  } else {
   return 0;
  }
}

function recommendationList() {
  return upgradeStats().concat(buildingStats()).sort(function(a,b){return (a.roi - b.roi)});
}

function nextPurchase() {
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

function upgradeStats() {
  return Game.UpgradesInStore.map(function (current, index) {
    var base_cps_orig = Game.cookiesPs;
    var cps_orig = Game.cookiesPs + gcPs(weightedCookieValue(true));
    var game_current_state = Game;
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
  });
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
      Game.AchievementsById[index].won = won;
      if (won) {
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
      Game.AchievementsById[index].won = won;
      if (won) {
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
  return Game.goldenCookie.life > 0 && gc_click_percent > 0 && Game.missedGoldenClicks + Game.goldenClicks >= 0 && ((Game.goldenClicks / (Game.missedGoldenClicks + Game.goldenClicks) <= gc_click_percent) || (Game.missedGoldenClicks + Game.goldenClicks == 0));
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
  if (autoBuy && Game.cookies >= delayAmount() + recommendation.cost) {
    recommendation.time = Date.now() - initial_load_time;
    full_history.push(recommendation);
    purchase.clickFunction = null;
    purchase.buy();
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

if (frequency) {
  var cookieBot = setInterval(function() {autoCookie()}, frequency);
}
if (cookie_click_speed) {
  var autoclickBot = setInterval(function() {Game.ClickCookie()}, cookie_click_speed);
}
