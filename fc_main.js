// Add polyfills:
  
(function (global) {
  var global_isFinite = global.isFinite;
  Object.defineProperty(Number, 'isFinite', {
    value: function isFinite(value) {
      return typeof value === 'number' && global_isFinite(value);
    },
    configurable: true,
    enumerable: false,
    writable: true
  });
})(this);

function setOverrides() {
  
  // Set all cycleable preferencesau
  _.keys(FrozenCookies.preferenceValues).forEach(function(preference) {
    FrozenCookies[preference] = preferenceParse(preference, FrozenCookies.preferenceValues[preference].default);
  });
  
  logEvent("Load", "Initial Load of Frozen Cookies v " + FrozenCookies.branch + "." + FrozenCookies.version + ". (You should only ever see this once.)");

  FrozenCookies.frequency = 100;
  FrozenCookies.efficiencyWeight = 1.0;
  
  // Separate because these are user-input values
  FrozenCookies.cookieClickSpeed = preferenceParse('cookieClickSpeed',0);
  FrozenCookies.frenzyClickSpeed = preferenceParse('frenzyClickSpeed',0);
  
  // Becomes 0 almost immediately after user input, so default to 0
  FrozenCookies.timeTravelAmount = 0;
  
  // Force redraw every 10 purchases
  FrozenCookies.autobuyCount = 0;
  
  // Get historical data
  FrozenCookies.frenzyTimes = JSON.parse(localStorage.getItem('frenzyTimes')) || {};
//  FrozenCookies.non_gc_time = Number(localStorage.getItem('nonFrenzyTime'));
//  FrozenCookies.gc_time = Number(localStorage.getItem('frenzyTime'));
  FrozenCookies.lastHCAmount = Number(localStorage.getItem('lastHCAmount'));
  FrozenCookies.lastHCTime = Number(localStorage.getItem('lastHCTime'));
  FrozenCookies.prevLastHCTime = Number(localStorage.getItem('prevLastHCTime'));
  FrozenCookies.maxHCPercent = Number(localStorage.getItem('maxHCPercent'));

  // Set default values for calculations
  FrozenCookies.hc_gain = 0;
  FrozenCookies.hc_gain_time = Date.now();
  FrozenCookies.last_gc_state = (Game.frenzy ? Game.frenzyPower : 1) * (Game.clickFrenzy ? 777 : 1);
  FrozenCookies.last_gc_time = Date.now();
  FrozenCookies.lastCPS = Game.cookiesPs;
  FrozenCookies.lastCookieCPS = 0;
  FrozenCookies.lastUpgradeCount = 0;
  FrozenCookies.currentBank = {'cost': 0, 'efficiency' : 0};
  FrozenCookies.targetBank = {'cost': 0, 'efficiency' : 0};
  FrozenCookies.disabledPopups = true;
  FrozenCookies.trackedStats = [];
  FrozenCookies.lastGraphDraw = 0;
  FrozenCookies.calculatedCpsByType = {};
  
  // Allow autoCookie to run
  FrozenCookies.processing = false;
  FrozenCookies.priceReductionTest = false;
  
  FrozenCookies.cookieBot = 0;
  FrozenCookies.autoclickBot = 0;
  FrozenCookies.autoFrenzyBot = 0;
  FrozenCookies.frenzyClickBot = 0;
  
  // Smart tracking details
  FrozenCookies.smartTrackingBot = 0;
  FrozenCookies.minDelay = 1000 * 10; // 10s minimum reporting between purchases with "smart tracking" on
  FrozenCookies.delayPurchaseCount = 0;
  
  // Caching
  FrozenCookies.recalculateCaches = true;
  FrozenCookies.caches = {};
  FrozenCookies.caches.nextPurchase = {};
  FrozenCookies.caches.recommendationList = [];
  FrozenCookies.caches.buildings = [];
  FrozenCookies.caches.upgrades = [];
  
  if (!blacklist[FrozenCookies.blacklist]) {
    FrozenCookies.blacklist = 'none';
  }
  Beautify = fcBeautify;
  Game.sayTime = function(time,detail) {return timeDisplay(time/Game.fps);}
  Game.oldReset = Game.Reset;
  Game.oldWriteSave = Game.WriteSave;
  Game.oldLoadSave = Game.LoadSave;
  Game.Reset = fcReset;
  Game.WriteSave = fcWriteSave;
//  if (FrozenCookies.saveWrinklers && localStorage.wrinklers) {
//    Game.wrinklers = JSON.parse(localStorage.wrinklers);
//  }
  Game.Win = fcWin;
  Game.oldBackground = Game.DrawBackground;
  Game.DrawBackground = function() {Game.oldBackground(); updateTimers();}
  // Remove the following when turning on tooltop code
  nextPurchase(true);
  Game.RefreshStore();
  Game.RebuildUpgrades();
  beautifyUpgradesAndAchievements();
  // Replace Game.Popup references with event logging
  eval('Game.goldenCookie.click = ' + Game.goldenCookie.click.toString().replace(/Game\.Popup\((.+)\)\;/g, 'logEvent("GC", $1, true);'));
  eval('Game.UpdateWrinklers = ' + Game.UpdateWrinklers.toString().replace(/Game\.Popup\((.+)\)\;/g, 'logEvent("Wrinkler", $1, true);'));
  eval('FrozenCookies.safeGainsCalc = ' + Game.CalculateGains.toString().replace(/eggMult\+=\(1.+/, 'eggMult++; // CENTURY EGGS SUCK').replace(/Game\.cookiesPs/g, 'FrozenCookies.calculatedCps').replace(/Game\.globalCpsMult/g, 'mult'));
  
  // Give free achievements!
  if(!Game.HasAchiev('Third-party')) {
    Game.Win('Third-party');
  }
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

function formatEveryThirdPower(notations) {
  return function (value) {
    var base = 0,
      notationValue = '';
    if (value >= 1000000 && Number.isFinite(value)) {
      value /= 1000;
      while(Math.round(value) >= 1000){
        value /= 1000;
        base++;
      }
      if (base > notations.length) {
        return 'Infinity';
      } else {
        notationValue = notations[base];
      }
    }
    return ( Math.round(value * 1000) / 1000.0 ) + notationValue;
  };
}

function scientificNotation(value) {
  if (value === 0 || !Number.isFinite(value) || (Math.abs(value) > 1 && Math.abs(value) < 100)) {
    return rawFormatter(value);
  }
  var sign = value > 0 ? '' : '-';
  value = Math.abs(value);
  var exp = Math.floor(Math.log(value)/Math.LN10);
  var num = Math.round((value/Math.pow(10, exp)) * 100) / 100;
  var output = num.toString();
  if (num === Math.round(num)) {
    output += '.00';
  } else if (num * 10 === Math.round(num * 10)) {
    output += '0';
  }
  return sign + output + '*10^' + exp;
}

function rawFormatter(value) {
  return Math.round(value * 1000) / 1000;
}

var numberFormatters = [
  rawFormatter,
  formatEveryThirdPower([
    '',
    ' million',
    ' billion',
    ' trillion',
    ' quadrillion',
    ' quintillion',
    ' sextillion',
    ' septillion',
    ' octillion',
    ' nonillion',
    ' decillion'
  ]),

  formatEveryThirdPower([
    '',
    ' M',
    ' B',
    ' T',
    ' Qa',
    ' Qi',
    ' Sx',
    ' Sp',
    ' Oc',
    ' No',
    ' De'
  ]),

  formatEveryThirdPower([
    '',
    ' M',
    ' G',
    ' T',
    ' P',
    ' E',
    ' Z',
    ' Y'
  ]),
  scientificNotation
];

function fcBeautify (value) {
  var negative = (value < 0);
  value = Math.abs(value);
  var formatter = numberFormatters[FrozenCookies.numberDisplay];
  var output = formatter(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return negative ? '-' + output : output;
}

// Runs numbers in upgrades and achievements through our beautify function
function beautifyUpgradesAndAchievements() {
  function beautifyFn(str) {
    return Beautify(parseInt(str.replace(/,/, ''), 10));
  }

  var numre = /\d\d?\d?(?:,\d\d\d)*/;
  Game.AchievementsById.forEach(function (ach) {
    ach.desc = ach.desc.replace(numre, beautifyFn);
  });

  // These might not have any numbers in them, but just in case...
  Game.UpgradesById.forEach(function (upg) {
    upg.desc = upg.desc.replace(numre, beautifyFn);
  });
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
  hours = (hours > 0) ? hours + 'h ' : '';
  seconds %= (60 * 60);
  minutes = Math.floor(seconds / 60);
  minutes = (minutes > 0) ? minutes + 'm ' : '';
  seconds %= 60;
  seconds = (seconds > 0) ? seconds + 's' : '';
  return (days + hours + minutes + seconds).trim();
}

function fcReset() {
  Game.CollectWrinklers();
  if (Game.HasUnlocked('Chocolate egg') && !Game.Has('Chocolate egg')) {
    Game.ObjectsById.forEach(function(b){b.sell(-1);});
    Game.Upgrades['Chocolate egg'].buy();
  }
  Game.oldReset();
  FrozenCookies.frenzyTimes = {};
  FrozenCookies.last_gc_state = (Game.frenzy ? Game.frenzyPower : 1) * (Game.clickFrenzy ? 777 : 1);
  FrozenCookies.last_gc_time = Date.now();
  FrozenCookies.lastHCAmount = Game.HowMuchPrestige(Game.cookiesEarned + Game.cookiesReset + Game.wrinklers.reduce(function(s,w){return s + popValue(w.sucked);}, 0));
  FrozenCookies.lastHCTime = Date.now();
  FrozenCookies.maxHCPercent = 0;
  FrozenCookies.prevLastHCTime = Date.now();
  FrozenCookies.lastCps = 0;
  FrozenCookies.trackedStats = [];
  updateLocalStorage();
  recommendationList(true);
}

function fcWriteSave(exporting) {
//  if (FrozenCookies.saveWrinklers && Game.wrinklers) {
//    localStorage.wrinklers = JSON.stringify(Game.wrinklers);
//  }
  return Game.oldWriteSave(exporting);
}

function updateLocalStorage() {
  _.keys(FrozenCookies.preferenceValues).forEach(function(preference) {
    localStorage[preference] = FrozenCookies[preference];
  });
  
  localStorage.frenzyClickSpeed = FrozenCookies.frenzyClickSpeed;
  localStorage.cookieClickSpeed = FrozenCookies.cookieClickSpeed;
  localStorage.frenzyTimes = JSON.stringify(FrozenCookies.frenzyTimes);
//  localStorage.nonFrenzyTime = FrozenCookies.non_gc_time;
//  localStorage.frenzyTime = FrozenCookies.gc_time;
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
  Game.promptOn = 1;
  window.prompt ("Copy to clipboard: Ctrl+C, Enter", text);
  Game.promptOn = 0;
}
 
function getBuildingSpread () {
  return Game.ObjectsById.map(function(a){return a.amount;}).join('/')
}

// Press 'a' to toggle autobuy.
// Press 'b' to pop up a copyable window with building spread. 
// Press 'c' to toggle auto-GC
// Press 'e' to pop up a copyable window with your export string
// Press 'r' to pop up the reset window
// Press 's' to do a manual save
// Press 'w' to display a wrinkler-info window
document.addEventListener('keydown', function(event) {
  if (!Game.promptOn) {
    if(event.keyCode == 65) {
      Game.Toggle('autoBuy','autobuyButton','Autobuy OFF','Autobuy ON');
      toggleFrozen('autoBuy');
    }
    if(event.keyCode == 66) {
      copyToClipboard(getBuildingSpread());
    }
    if(event.keyCode == 67) {
      Game.Toggle('autoGC','autogcButton','Autoclick GC OFF','Autoclick GC ON');
      toggleFrozen('autoGC');
    }
    if(event.keyCode == 69) {
      copyToClipboard(Game.WriteSave(true));
    }
    if (event.keyCode == 82) {
      Game.Ascend();
    }
    if (event.keyCode == 83) {
      Game.WriteSave();
    }
    if(event.keyCode == 87) {
      Game.Notify('Wrinkler Info', 'Popping all wrinklers will give you ' + Beautify(Game.wrinklers.reduce(function(s,w){return s + popValue(w.sucked);},0)) + ' cookies. <input type="button" value="Click here to pop all wrinklers" onclick="Game.CollectWrinklers()"></input>', [19,8],7);
    }
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

function updateSpeed(base) {
  var newSpeed = getSpeed(FrozenCookies[base]);
  if (newSpeed != FrozenCookies[base]) {
    FrozenCookies[base] = newSpeed;
    updateLocalStorage();
    FCStart();
  }
}

function updateTimeTravelAmount() {
  var newAmount = prompt("Warning: Time travel is highly unstable, and large values are highly likely to either cause long delays or crash the game. Be careful!\nHow much do you want to time travel by? This will happen instantly.");
  if (typeof(newAmount) === 'undefined' || newAmount === null || isNaN(Number(newAmount)) || Number(newAmount) < 0) {
    newAmount = 0;
  }
  FrozenCookies.timeTravelAmount = newAmount;
}

function cyclePreference(preferenceName) {
  var preference = FrozenCookies.preferenceValues[preferenceName];
  if (preference) {
    var display = preference.display;
    var current = FrozenCookies[preferenceName];
    var preferenceButton = $('#' + preferenceName + 'Button');
    if (display && display.length > 0 && preferenceButton && preferenceButton.length > 0) {
      var newValue = (current + 1) % display.length;
      preferenceButton[0].innerText = display[newValue];
      FrozenCookies[preferenceName] = newValue;
      updateLocalStorage();
      FrozenCookies.recalculateCaches = true;
      Game.RefreshStore();
      Game.RebuildUpgrades();
      FCStart();
    }  
  }
}

function toggleFrozen(setting) {
  if (!Number(localStorage.getItem(setting))) {
    localStorage.setItem(setting,1);
    FrozenCookies[setting] = 1;
  } else {
    localStorage.setItem(setting,0);
    FrozenCookies[setting] = 0;
  }
  FCStart();
}

function autoBlacklistOff() {
  switch (FrozenCookies.blacklist) {
    case 1:
      FrozenCookies.blacklist = (Game.cookiesEarned >= 1000000) ? 0 : 1;
      break;
    case 2:
      FrozenCookies.blacklist = (Game.cookiesEarned >= 1000000000) ? 0 : 2;
      break;
    case 3:
      FrozenCookies.blacklist = (haveAll('halloween') && haveAll('valentines')) ? 0 : 3;
      break;
  }
}

function getProbabilityList(listType) {
  return cumulativeProbabilityList[listType][getProbabilityModifiers(listType)];
}

function getProbabilityModifiers(listType) {
  var result;
  switch (listType) {
    case "golden":
      result = (Game.Has('Lucky day') ? 0.5 : 1) * (Game.Has('Serendipity') ? 0.5 : 1) * (Game.Has('Golden goose egg') ? 0.95 : 1);
      break;
    case "reindeer":
      result = Game.Has('Reindeer baking grounds') ? 0.5 : 1;
      break;
  }
  return result;
}

function cumulativeProbability(listType, start, stop) {
  return 1 - ((1 - getProbabilityList(listType)[stop]) / (1 - getProbabilityList(listType)[start]));
}

function probabilitySpan(listType, start, endProbability) {
  var startProbability = getProbabilityList(listType)[start];
  return _.sortedIndex(getProbabilityList(listType), (startProbability + endProbability - startProbability * endProbability));
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

function effectiveCps(delay, wrathValue, wrinklerCount) {
  wrathValue = wrathValue != null ? wrathValue : Game.elderWrath;
  wrinklerCount = wrinklerCount != null ? wrinklerCount : (wrathValue ? 10 : 0);
  var wrinkler = wrinklerMod(wrinklerCount);
  if (delay == null) {
    delay = delayAmount();
  }
  return baseCps() * wrinkler + gcPs(cookieValue(delay, wrathValue, wrinklerCount)) + baseClickingCps(FrozenCookies.cookieClickSpeed * FrozenCookies.autoClick) + reindeerCps(wrathValue);
}

function frenzyProbability(wrathValue) {
  wrathValue = wrathValue != null ? wrathValue : Game.elderWrath;
  return cookieInfo.frenzy.odds[wrathValue];// + cookieInfo.frenzyRuin.odds[wrathValue] + cookieInfo.frenzyLucky.odds[wrathValue] + cookieInfo.frenzyClick.odds[wrathValue];
}

function clotProbability(wrathValue) {
  wrathValue = wrathValue != null ? wrathValue : Game.elderWrath;
  return cookieInfo.clot.odds[wrathValue];// + cookieInfo.clotRuin.odds[wrathValue] + cookieInfo.clotLucky.odds[wrathValue] + cookieInfo.clotClick.odds[wrathValue];
}

function bloodProbability(wrathValue) {
  wrathValue = wrathValue != null ? wrathValue : Game.elderWrath;
  return cookieInfo.blood.odds[wrathValue];
}

function cookieValue(bankAmount, wrathValue, wrinklerCount) {
  var cps = baseCps();
  var clickCps = baseClickingCps(FrozenCookies.autoClick * FrozenCookies.cookieClickSpeed);
  var frenzyCps = FrozenCookies.autoFrenzy ? baseClickingCps(FrozenCookies.autoFrenzy * FrozenCookies.frenzyClickSpeed) : clickCps;
  var luckyMod = Game.Has('Get lucky') ? 2 : 1;
  wrathValue = wrathValue != null ? wrathValue : Game.elderWrath;
  wrinklerCount = wrinklerCount != null ? wrinklerCount : (wrathValue ? 10 : 0);
  var wrinkler = wrinklerMod(wrinklerCount);
  
  var value = 0;
  // Clot
  value -= cookieInfo.clot.odds[wrathValue] * (wrinkler * cps + clickCps) * luckyMod * 66 * 0.5;
  // Frenzy
  value += cookieInfo.frenzy.odds[wrathValue] * (wrinkler * cps + clickCps) * luckyMod * 77 * 6;
  // Blood
  value += cookieInfo.blood.odds[wrathValue] * (wrinkler * cps + clickCps) * luckyMod * 6 * 665;
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
  value += cookieInfo.frenzyClick.odds[wrathValue] * frenzyCps * luckyMod * 13 * 777 * 7;
  // Clot + Click
  value += cookieInfo.clotClick.odds[wrathValue] * frenzyCps * luckyMod * 13 * 777 * 0.5;
  // Blah
  value += 0;
  return value;
}

function cookieStats(bankAmount, wrathValue, wrinklerCount) {
  var cps = baseCps();
  var clickCps = baseClickingCps(FrozenCookies.autoClick * FrozenCookies.cookieClickSpeed);
  var frenzyCps = FrozenCookies.autoFrenzy ? baseClickingCps(FrozenCookies.autoFrenzy * FrozenCookies.frenzyClickSpeed) : clickCps;
  var luckyMod = Game.Has('Get lucky') ? 2 : 1;
  var clickFrenzyMod = (Game.clickFrenzy > 0) ? 777 : 1
  wrathValue = wrathValue != null ? wrathValue : Game.elderWrath;
  wrinklerCount = wrinklerCount != null ? wrinklerCount : (wrathValue ? 10 : 0);
  var wrinkler = wrinklerMod(wrinklerCount);
  
  var result = {};
  // Clot
  result.clot = -1 * cookieInfo.clot.odds[wrathValue] * (wrinkler * cps + clickCps) * luckyMod * 66 * 0.5;
  // Frenzy
  result.frenzy = cookieInfo.frenzy.odds[wrathValue] * (wrinkler * cps + clickCps) * luckyMod * 77 * 7;
  // Blood
  result.blood = cookieInfo.blood.odds[wrathValue] * (wrinkler * cps + clickCps) * luckyMod * 666 * 6;
  // Chain
  result.chain = cookieInfo.chain.odds[wrathValue] * calculateChainValue(bankAmount, cps, (7 - (wrathValue / 3)));
  // Ruin
  result.ruin = -1 * cookieInfo.ruin.odds[wrathValue] * (Math.min(bankAmount * 0.05, cps * 60 * 10) + 13);
  // Frenzy + Ruin
  result.frenzyRuin = -1 * cookieInfo.frenzyRuin.odds[wrathValue] * (Math.min(bankAmount * 0.05, cps * 60 * 10 * 7) + 13);
  // Clot + Ruin
  result.clotRuin = -1 * cookieInfo.clotRuin.odds[wrathValue] * (Math.min(bankAmount * 0.05, cps * 60 * 10 * 0.5) + 13);
  // Lucky
  result.lucky = cookieInfo.lucky.odds[wrathValue] * (Math.min(bankAmount * 0.1, cps * 60 * 20) + 13);
  // Frenzy + Lucky
  result.frenzyLucky = cookieInfo.frenzyLucky.odds[wrathValue] * (Math.min(bankAmount * 0.1, cps * 60 * 20 * 7) + 13);
  // Clot + Lucky
  result.clotLucky = cookieInfo.clotLucky.odds[wrathValue] * (Math.min(bankAmount * 0.1, cps * 60 * 20 * 0.5) + 13);
  // Click
  result.click = cookieInfo.click.odds[wrathValue] * frenzyCps * luckyMod * 13 * 777;
  // Frenzy + Click
  result.frenzyClick = cookieInfo.frenzyClick.odds[wrathValue] * frenzyCps * luckyMod * 13 * 777 * 7;
  // Clot + Click
  result.clotClick = cookieInfo.clotClick.odds[wrathValue] * frenzyCps * luckyMod * 13 * 777 * 0.5;
  // Blah
  result.blah = 0;
  return result;
}

function reindeerValue(wrathValue) {
  var value = 0;
  if (Game.season == 'christmas') {
    var remaining = 1 - (frenzyProbability(wrathValue) + clotProbability(wrathValue) + bloodProbability(wrathValue));
    var outputMod = Game.Has('Ho ho ho-flavored frosting') ? 2 : 1;
    
    value += Math.max(25, baseCps() * outputMod * 60 * 7) * frenzyProbability(wrathValue);
    value += Math.max(25, baseCps() * outputMod * 60 * 0.5) * clotProbability(wrathValue);
    value += Math.max(25, baseCps() * outputMod * 60 * 666) * bloodProbability(wrathValue);
    value += Math.max(25, baseCps() * outputMod * 60) * remaining;
  }
  return value;
}

function reindeerCps(wrathValue) {
  var averageTime = probabilitySpan('reindeer', 0, 0.5) / Game.fps;
  return reindeerValue(wrathValue) / averageTime * FrozenCookies.simulatedGCPercent;
}

function calculateChainValue(bankAmount, cps, digit) { 
  x = Math.min(bankAmount, (cps * 60 * 60 * 6 * 4));
  n = Math.floor(Math.log((9*x)/(4*digit))/Math.LN10);
  return 125 * Math.pow(9,(n-3)) * digit;
}

function chocolateValue(bankAmount) {
  var value = 0;
  if (Game.HasUnlocked('Chocolate egg') && !Game.Has('Chocolate egg')) {
    bankAmount = (bankAmount != null && bankAmount !== 0) ? bankAmount : Game.cookies;
    value = 0.05 * (wrinklerValue() + bankAmount + Game.ObjectsById.reduce(function(s,b){return s + cumulativeBuildingCost(b.basePrice, 1, b.amount + 1) / 2},0));
  }
  return value;
}

function wrinklerValue() {
  return Game.wrinklers.reduce(function(s,w){return s + popValue(w.sucked);}, 0);
}

function buildingRemaining(building, amount) {
  var cost = cumulativeBuildingCost(building.basePrice, building.amount, amount);
  var availableCookies = Game.cookies + wrinklerValue() + Game.ObjectsById.reduce(function(s,b) {return s + (b.name == building.name ? 0 : cumulativeBuildingCost(b.basePrice, 1, b.amount + 1) / 2);}, 0);
  availableCookies *= Game.HasUnlocked('Chocolate egg') && !Game.Has('Chocolate egg') ? 1.05 : 1;
  return Math.max(0, cost - availableCookies);
}

function earnedRemaining(total) {
  return Math.max(0, total - (Game.cookiesEarned + wrinklerValue() + chocolateValue()));
}

function estimatedTimeRemaining(cookies) {
  return timeDisplay(cookies / effectiveCps());
}

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
  } else if (bankAmount <= startingPoint) {
    results = 0;
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
  var averageGCTime = probabilitySpan('golden', 0, 0.5) / Game.fps;
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

function haveAll(holiday) {
  return _.every(holidayCookies[holiday], function(id) {return Game.UpgradesById[id].unlocked;});
}

function checkPrices(currentUpgrade) {
  var value = 0;
  if (FrozenCookies.caches.recommendationList.length > 0) {
    var nextRec = FrozenCookies.caches.recommendationList.filter(function(i){return i.id != currentUpgrade.id;})[0];
    var nextPrereq = (nextRec.type == 'upgrade') ? unfinishedUpgradePrereqs(nextRec.purchase) : null;
    nextRec = (nextPrereq == null || nextPrereq.filter(function(u){return u.cost != null;}).length == 0) ? nextRec : FrozenCookies.caches.recommendationList.filter(function(a){return nextPrereq.some(function(b){return b.id == a.id && b.type == a.type})})[0];
    value = nextRec.cost == null ? 0 : (nextRec.cost / totalDiscount(nextRec.type == 'building')) - nextRec.cost;
  }
  return value;
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
    FrozenCookies.caches.recommendationList = addScores(
      upgradeStats(recalculate)
      .concat(buildingStats(recalculate))
      .concat(santaStats())
      .sort(function(a,b){
        return a.efficiency != b.efficiency ? a.efficiency - b.efficiency : (a.delta_cps != b.delta_cps ? b.delta_cps - a.delta_cps : a.cost - b.cost);
      }));
      if (FrozenCookies.pastemode) {
        FrozenCookies.caches.recommendationList.reverse();
      }
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
    var purchase = null;
    var target = null;
    for (var i = 0; i < recList.length; i++) {
      target = recList[i];
      if (target.type == 'upgrade' && unfinishedUpgradePrereqs(Game.UpgradesById[target.id])) {
        var prereqList = unfinishedUpgradePrereqs(Game.UpgradesById[target.id]);
        purchase = recList.filter(function(a){return prereqList.some(function(b){return b.id == a.id && b.type == a.type})})[0];
      } else {
        purchase = target;
      }
      if (purchase) {
        FrozenCookies.caches.nextPurchase = purchase;
        FrozenCookies.caches.nextChainedPurchase = target;
        break;
      }
    }
    if (purchase == null) {
      FrozenCookies.caches.nextPurchase = defaultPurchase();
      FrozenCookies.caches.nextChainedPurchase = defaultPurchase();
    }
  }
  return FrozenCookies.caches.nextPurchase;
//  return purchase;
}

function nextChainedPurchase(recalculate) {
  nextPurchase(recalculate);
  return FrozenCookies.caches.nextChainedPurchase;
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
      var cpsOrig = effectiveCps(Math.min(Game.cookies, currentBank)); // baseCpsOrig + gcPs(cookieValue(Math.min(Game.cookies, currentBank))) + baseClickingCps(FrozenCookies.autoClick * FrozenCookies.cookieClickSpeed);
      var existingAchievements = Game.AchievementsById.map(function(item,i){return item.won});
      buildingToggle(current);
      var baseCpsNew = baseCps();
      var cpsNew = effectiveCps(currentBank); // baseCpsNew + gcPs(cookieValue(currentBank)) + baseClickingCps(FrozenCookies.autoClick * FrozenCookies.cookieClickSpeed);
      buildingToggle(current, existingAchievements);
      var deltaCps = cpsNew - cpsOrig;
      var baseDeltaCps = baseCpsNew - baseCpsOrig;
      var efficiency = purchaseEfficiency(current.getPrice(), deltaCps, baseDeltaCps, cpsOrig)
      return {'id' : current.id, 'efficiency' : efficiency, 'base_delta_cps' : baseDeltaCps, 'delta_cps' : deltaCps, 'cost' : current.getPrice(), 'purchase' : current, 'type' : 'building'};
    }).filter(function(a){return a;});
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
        if (isUnavailable(current, upgradeBlacklist)) {
          return null;
        }
        var cost = upgradePrereqCost(current);
        var baseCpsOrig = baseCps();
        var cpsOrig = effectiveCps(Math.min(Game.cookies, currentBank)); // baseCpsOrig + gcPs(cookieValue(Math.min(Game.cookies, currentBank))) + baseClickingCps(FrozenCookies.autoClick * FrozenCookies.cookieClickSpeed);
        var existingAchievements = Game.AchievementsById.map(function(item){return item.won});
        var existingWrath = Game.elderWrath;
        var discounts = totalDiscount() + totalDiscount(true);
        var reverseFunctions = upgradeToggle(current);
        var baseCpsNew = baseCps();
        var cpsNew = effectiveCps(currentBank); // baseCpsNew + gcPs(cookieValue(currentBank)) + baseClickingCps(FrozenCookies.autoClick * FrozenCookies.cookieClickSpeed);
        var priceReduction = discounts == (totalDiscount() + totalDiscount(true)) ? 0 : checkPrices(current);
        upgradeToggle(current, existingAchievements, reverseFunctions);
        Game.elderWrath = existingWrath;
        var deltaCps = cpsNew - cpsOrig;
        var baseDeltaCps = baseCpsNew - baseCpsOrig;
        var efficiency = (priceReduction > cost) ? 1 : purchaseEfficiency(cost, deltaCps, baseDeltaCps, cpsOrig)
        return {'id' : current.id, 'efficiency' : efficiency, 'base_delta_cps' : baseDeltaCps, 'delta_cps' : deltaCps, 'cost' : cost, 'purchase' : current, 'type' : 'upgrade'};
      }
    }).filter(function(a){return a;});
  }
  return FrozenCookies.caches.upgrades;
}

function isUnavailable(upgrade, upgradeBlacklist) {
  var result = false;
  var needed = unfinishedUpgradePrereqs(upgrade);
  result = result || !upgrade.unlocked && !needed;
  result = result || (upgradeBlacklist === true);
  result = result || _.contains(upgradeBlacklist, upgrade.id);
  result = result || (needed && _.find(needed, function(a){return a.type == "wrinklers"}) != null);
  result = result || (upgrade.season && !haveAll(Game.season));
  return result;
}

function santaStats() {
  return Game.Has('A festive hat') && (Game.santaLevel + 1 < Game.santaLevels.length) ? {
    id: 0,
    efficiency: Infinity,
    base_delta_cps: 0,
    delta_cps: 0,
    cost: cumulativeSantaCost(1),
    type: 'santa',
    purchase: {
      id: 0,
      name: 'Santa Stage Upgrade (' + Game.santaLevels[(Game.santaLevel + 1) % Game.santaLevels.length] + ')',
      buy: buySanta,
      getCost: function() {return cumulativeSantaCost(1);}
    }
  } : [];
}

function defaultPurchase() {
  return {
    id: 0,
    efficiency: Infinity,
    delta_cps: 0,
    base_delta_cps: 0,
    cost: Infinity,
    type: 'other',
    purchase: {
      id: 0,
      name: 'No valid purchases!',
      buy: function(){},
      getCost: function() {return Infinity;}
    }
  }
}

function totalDiscount(building) {                                                                                    
  var price = 1;
  if (Game.Has('Season savings') && building) price *= 0.99;
  if (Game.Has('Toy workshop') && !building) price *= 0.95;
  if (Game.Has('Santa\'s dominion')) price *= (building ? 0.99 : 0.98);
  if (Game.Has('Faberge egg')) price *= 0.99;
  return price;
}

function cumulativeBuildingCost(basePrice, startingNumber, endingNumber) {
  return basePrice * totalDiscount(true) * (Math.pow(Game.priceIncrease, endingNumber) - Math.pow(Game.priceIncrease, startingNumber)) / (Game.priceIncrease - 1);
}

function cumulativeSantaCost(amount) {
  var total = 0;
  if (!amount) {
  
  } else if (Game.santaLevel + amount < Game.santaLevels.length) {
    for (var i=Game.santaLevel + 1; i <= Game.santaLevel + amount; i++) {
      total += Math.pow(i, i);
    }
  } else if (amount < Game.santaLevels.length) {
    for (var i=Game.santaLevel + 1; i <= amount; i++) {
      total += Math.pow(i, i);
    }
  } else {
    total = Infinity;
  }
  return total;
}

function cumulativeSantaCost(amount) {
  var total = 0;
  if (!amount) {
    
  } else if (Game.santaLevel + amount < Game.santaLevels.length) {
    for (var i=Game.santaLevel + 1; i <= Game.santaLevel + amount; i++) {
      total += Math.pow(i, i);
    }
  } else if (amount < Game.santaLevels.length) {
    for (var i=Game.santaLevel + 1; i <= amount; i++) {
      total += Math.pow(i, i);
    }
  } else {
    total = Infinity;
  }
  return total;
}

function upgradePrereqCost(upgrade, full) {
  var cost = upgrade.getPrice();
  if (upgrade.unlocked) {
    return cost;
  }
  var prereqs = _.find(upgradeJson, function(a) {return a.id == upgrade.id;});
  if (prereqs) {
    cost += prereqs.buildings.reduce(function(sum,item,index) {
      var building = Game.ObjectsById[index];
      if (item && full) {
        sum += cumulativeBuildingCost(building.basePrice, 0, item);
      } else if (item && building.amount < item) {
        sum += cumulativeBuildingCost(building.basePrice, building.amount, item);
      }
      return sum;
    },0);
    cost += prereqs.upgrades.reduce(function(sum,item) {
      var reqUpgrade = Game.UpgradesById[item];
      if (!upgrade.bought || full) {
        sum += upgradePrereqCost(reqUpgrade, full);
      }
      return sum;
    }, 0);
    cost += cumulativeSantaCost(prereqs.santa);
  }
  return cost;
}

function unfinishedUpgradePrereqs(upgrade) {
  if (upgrade.unlocked) {
    return null;
  }
  var needed = [];
  var prereqs = _.find(upgradeJson, function(a) {return a.id == upgrade.id;});
  if (prereqs) {
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
    if (prereqs.santa) {
      needed.push({type:'santa', id: 0});
    }
    if (prereqs.wrinklers && Game.elderWrath == 0) {
      needed.push({type:'wrinklers', id:0});
    }
  }
  return needed.length ? needed : null;
}

function upgradeToggle(upgrade, achievements, reverseFunctions) {
  if (!achievements) {
    reverseFunctions = {};
    if (!upgrade.unlocked) {
      var prereqs = _.find(upgradeJson, function(a) {return a.id == upgrade.id;});
      if (prereqs) {
        reverseFunctions.prereqBuildings = [];
        prereqs.buildings.forEach(function(a,b) {
          var building = Game.ObjectsById[b];
          if (a && building.amount < a) {
            var difference = a - building.amount;
            reverseFunctions.prereqBuildings.push({id: b, amount: difference});
            building.amount += difference;
            building.bought += difference;
            Game.BuildingsOwned += difference;
          }
        });
        reverseFunctions.prereqUpgrades = [];
        if (prereqs.upgrades.length > 0) {
          prereqs.upgrades.forEach(function(id) {
            var upgrade = Game.UpgradesById[id];
            if (!upgrade.bought) {
              reverseFunctions.prereqUpgrades.push({id: id, reverseFunctions: upgradeToggle(upgrade)});
            }
          });
        }
      }
    }
    upgrade.bought = 1;
    Game.UpgradesOwned += 1;
    reverseFunctions.current = buyFunctionToggle(upgrade);
  } else {
    if (reverseFunctions.prereqBuildings) {
      reverseFunctions.prereqBuildings.forEach(function(b) {
        var building = Game.ObjectsById[b.id];
        building.amount -= b.amount;
        building.bought -= b.amount;
        Game.BuildingsOwned -= b.amount;
      });
    }
    if (reverseFunctions.prereqUpgrades) {
      reverseFunctions.prereqUpgrades.forEach(function(u) {
        var upgrade = Game.UpgradesById[u.id];
        upgradeToggle(upgrade, [], u.reverseFunctions);
      });
    }
    upgrade.bought = 0;
    Game.UpgradesOwned -= 1;
    buyFunctionToggle(reverseFunctions.current);
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
      if (won && achievement.pool !== 'shadow') {
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
      /Game\.Earn\('.*\)/,
      /Game\.Lock\('.*'\)/,
      /Game\.Unlock\(.*\)/,
      /Game\.Objects\['.*'\]\.drawFunction\(\)/,
      /Game\.Objects\['.*'\]\.redraw\(\)/,
      /Game\.SetResearch\('.*'\)/,
      /Game\.Upgrades\['.*'\]\.basePrice=.*/,
      /Game\.CollectWrinklers\(\)/,
      /Game\.RefreshBuildings\(\)/,
      /Game\.storeToRefresh=1/,
      /Game\.upgradesToRebuild=1/,
      /Game\.Popup\(.*\)/,
      /Game\.Notify\(.*\)/,
      /var\s+.+\s*=.+/,
      /Game\.computeSeasonPrices\(\)/,
      /Game\.seasonPopup\.reset\(\)/,
      /\S/
    ];
    var buyFunctions = upgrade.buyFunction.toString()
      .replace(/[\n\r\s]+/g, ' ')
      .replace(/function\s*\(\)\s*{(.+)\s*}/, "$1")
      .replace(/for\s*\(.+\)\s*\{.+\}/,'')
      .replace(/if\s*\(this\.season\)\s*Game\.season=this\.season\;/,('Game.season="' + upgrade.season + '";'))
      .replace(/if\s*\(.+\)\s*[^{}]*?\;/,'')
      .replace(/if\s*\(.+\)\s*\{.+\}/,'')
      .replace(/else\s+\(.+\)\s*\;/,'')
      .replace(/\+\+/,'+=1')
      .replace(/\-\-/,'-=1')
      .split(';')
      .map(function(a){return a.trim();})
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
        var expression = a.split('=');
        var isString = expression[1].indexOf("'") > -1 || expression[1].indexOf('"') > -1;
        reversed = expression[0] + '=' + (isString ? "'" : '') + eval(expression[0]) + (isString ? "'" : ''); 
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

function buySanta() {
  if (Game.LeftBackground) {
    Game.mouseX = 48;
    Game.mouseY = Game.LeftBackground.canvas.height-48-24;
    Game.Click = 1;
    Game.UpdateSanta();
    Game.Click = 0;
  }
}

function statSpeed() {
  var speed = 0;
  switch (FrozenCookies.trackStats) {
    case 1: // 60s
      speed = 1000 * 60; 
      break;
    case 2: // 30m
      speed = 1000 * 60 * 30;
      break;
    case 3: // 1h
      speed = 1000 * 60 * 60;
      break;
    case 4: // 24h
      speed = 1000 * 60 * 60 * 24;
      break;
  }
  return speed;
}

function saveStats(fromGraph) {
  FrozenCookies.trackedStats.push({
    time: Date.now() - Game.startDate,
    baseCps: baseCps(),
    effectiveCps: effectiveCps(),
    hc: Game.HowMuchPrestige(Game.cookiesEarned + Game.cookiesReset + Game.wrinklers.reduce(function(s,w){return s + popValue(w.sucked);},0))
  });
  if ($('#statGraphContainer').length > 0 && !$('#statGraphContainer').is(':hidden') && !fromGraph) {
    viewStatGraphs();
  }
}

function viewStatGraphs() {
  saveStats(true);
  var containerDiv = $('#statGraphContainer').length ? 
    $('#statGraphContainer') : 
    $('<div>').attr('id', 'statGraphContainer')
      .html($('<div>')
      .attr('id', 'statGraphs'))
      .appendTo('body')
      .dialog({
        modal:true, 
        title: 'Frozen Cookies Tracked Stats',
        width:$(window).width() * 0.8, 
        height:$(window).height() * 0.8
      });
  if (containerDiv.is(':hidden')) {
    containerDiv.dialog();
  }
  if (FrozenCookies.trackedStats.length > 0 && (Date.now() - FrozenCookies.lastGraphDraw) > 1000) {
    FrozenCookies.lastGraphDraw = Date.now();
    $('#statGraphs').empty();
    var graphs = $.jqplot('statGraphs', transpose(FrozenCookies.trackedStats.map(function(s) {return [[s.time / 1000, s.baseCps], [s.time / 1000, s.effectiveCps], [s.time / 1000, s.hc]]})),  // 
      {
        legend: {show: true},
        height: containerDiv.height() - 50,
        axes: {
          xaxis: {
            tickRenderer: $.jqplot.CanvasAxisTickRenderer,
            tickOptions: {
              angle: -30,
              fontSize: '10pt',
              showGridline: false,
              formatter: function(ah,ai) {return timeDisplay(ai);}
            }
          },
          yaxis: {
            padMin: 0,
            renderer: $.jqplot.LogAxisRenderer,
            tickDistribution: 'even',
            tickOptions: {
              formatter: function(ah,ai) {return Beautify(ai);}
            }
          },
          y2axis: {
            padMin: 0,
            tickOptions: {
              showGridline: false,
              formatter: function(ah,ai) {return Beautify(ai);}
            }
          }
        },
        highlighter: {
          show: true,
          sizeAdjust: 15
        },
        series: [{label: 'Base CPS'},{label:'Effective CPS'},{label:'Earned HC', yaxis: 'y2axis'}]
      });
  }
}

function updateCaches() {
  var recommendation, currentBank, targetBank, currentCookieCPS, currentUpgradeCount;
  var recalcCount = 0;
  do {
    recommendation = nextPurchase(FrozenCookies.recalculateCaches);
    FrozenCookies.recalculateCaches = false;
    currentBank = bestBank(0);
    targetBank = bestBank(recommendation.efficiency);
    currentCookieCPS = gcPs(cookieValue(currentBank.cost));
    currentUpgradeCount = Game.UpgradesInStore.length;
    FrozenCookies.safeGainsCalc();

    if (FrozenCookies.lastCPS != FrozenCookies.calculatedCps) {
      FrozenCookies.recalculateCaches = true;
      FrozenCookies.lastCPS = FrozenCookies.calculatedCps;
    }
    
    if (FrozenCookies.currentBank.cost != currentBank.cost) {
      FrozenCookies.recalculateCaches = true;
      FrozenCookies.currentBank = currentBank;
    }
    
    if (FrozenCookies.targetBank.cost != targetBank.cost) {
      FrozenCookies.recalculateCaches = true;
      FrozenCookies.targetBank = targetBank;
    }
    
    if (FrozenCookies.lastCookieCPS != currentCookieCPS) {
      FrozenCookies.recalculateCaches = true;
      FrozenCookies.lastCookieCPS = currentCookieCPS;
    }
    
    if (FrozenCookies.lastUpgradeCount != currentUpgradeCount) {
      FrozenCookies.recalculateCaches = true;
      FrozenCookies.lastUpgradeCount = currentUpgradeCount;
    }
    recalcCount += 1;
  } while (FrozenCookies.recalculateCaches && recalcCount < 10);
}

function doTimeTravel() {
//  'Time Travel DISABLED','Purchases by Estimated Effective CPS','Purchases by Simulated Real Time','Heavenly Chips by Estimated Effective CPS','Heavenly Chips by Simulated Real Time'
  if (FrozenCookies.timeTravelMethod) {
    // Estimated Effective CPS
    if (timeTravelMethod % 2 === 1) {
      var fullCps = effectiveCps();
      if (fullCps) {
        var neededCookies = 0;
        if (timeTravelMethod === 1) {

        } else if (timeTravelMethod === 3) {
        
        }
      }
    } else {
    
    }
  } else {
    FrozenCookies.timeTravelAmount = 0;
  }
/*
  var fullCps = effectiveCps();
  if (fullCps > 0) {
    var neededCookies = Math.max(0, recommendation.cost + delayAmount() - Game.cookies);
    var time = neededCookies / fullCps;
    Game.Earn(neededCookies);
    Game.startDate -= time * 1000;
    Game.fullDate -= time * 1000;
    FrozenCookies.timeTravelPurchases -= 1;
    logEvent('Time travel', 'Travelled ' + timeDisplay(time) + ' into the future.');
  }
*/
}

function fcWin(what) {
  if (typeof what==='string') {
    if (Game.Achievements[what]) {
      if (Game.Achievements[what].won==0) {
        Game.Achievements[what].won=1;
        if (!FrozenCookies.disabledPopups) {
          logEvent('Achievement', 'Achievement unlocked :<br>'+Game.Achievements[what].name+'<br> ', true);
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

function logEvent(event, text, popup) {
  var time = '[' + timeDisplay((Date.now() - Game.startDate)/1000) + ']';
  var output = time + ' ' + event + ': ' + text;
  if (FrozenCookies.logging) {
    console.log(output);
  }
  if (popup) {
    Game.Popup(text);
  }
}

function inRect(x,y,rect) {
	// Duplicate of internally defined method, 
	// only needed because I'm modifying the scope of Game.UpdateWrinklers and it can't see this anymore.
	var dx = x+Math.sin(-rect.r)*(-(rect.h/2-rect.o)),dy=y+Math.cos(-rect.r)*(-(rect.h/2-rect.o));
	var h1 = Math.sqrt(dx*dx + dy*dy);
	var currA = Math.atan2(dy,dx);
	var newA = currA - rect.r;
	var x2 = Math.cos(newA) * h1;
	var y2 = Math.sin(newA) * h1;
	return (x2 > -0.5 * rect.w && x2 < 0.5 * rect.w && y2 > -0.5 * rect.h && y2 < 0.5 * rect.h);
}

function transpose(a) {
  return Object.keys(a[0]).map(function (c) { return a.map(function (r) { return r[c]; }); });
}

function smartTrackingStats(delay) {
  saveStats();
  if (FrozenCookies.trackStats == 6) {
    delay /= (FrozenCookies.delayPurchaseCount == 0) ? (1/1.5) : (delay > FrozenCookies.minDelay ? 2 : 1);
    FrozenCookies.smartTrackingBot = setTimeout(function(){smartTrackingStats(delay);}, delay);
    FrozenCookies.delayPurchaseCount = 0;
  }
}

// Unused
function shouldClickGC() {
  return Game.goldenCookie.life > 0 && FrozenCookies.autoGC;
}

function liveWrinklers() {
  return _.select(Game.wrinklers, function(w) {return w.sucked > 0.5 && w.phase > 0}).sort(function(w1, w2) {return w1.sucked < w2.sucked});
}

function wrinklerMod(num) {
  return 1.1 * num * num * 0.05 * (Game.Has('Wrinklerspawn') ? 1.05 : 1) + (1 - 0.05 * num);
}

function popValue(sucked) {
  return sucked * 1.1 * (Game.Has('Wrinklerspawn') ? 1.05 : 1);
}

function shouldPopWrinklers() {
  var toPop = [];
  var living = liveWrinklers();
  if (living.length > 0) {
    if ((Game.season == 'halloween' || Game.season == 'easter') && !haveAll(Game.season)) {
      toPop = living.map(function(w) {return w.id});
    } else {
      var delay = delayAmount();
      var nextRecNeeded = nextPurchase().cost + delay - Game.cookies;
      var nextRecCps = nextPurchase().delta_cps;
      var wrinklersNeeded = Game.wrinklers.sort(function(w1, w2) {return w1.sucked < w2.sucked}).reduce(function(current, w) {
        var futureWrinklers = living.length - (current.ids.length + 1);
        if (current.total < nextRecNeeded && effectiveCps(delay, Game.elderWrath, futureWrinklers) + nextRecCps > effectiveCps()) {
          current.ids.push(w.id);
          current.total += popValue(w.sucked);
        }
        return current;
      }, {total:0, ids:[]});
      toPop = (wrinklersNeeded.total > nextRecNeeded) ? wrinklersNeeded.ids : toPop;
    }
  }
  return toPop;
}

// Unused
function autoGoldenCookie() {
  if (!FrozenCookies.processing && Game.goldenCookie.life && !Game.OnAscend && !Game.AscendTimer) {
    FrozenCookies.processing = true;
    Game.goldenCookie.click();
    FrozenCookies.processing = false;
  }
}

function autoFrenzyClick() {
  if (Game.clickFrenzy > 0 && !FrozenCookies.autoFrenzyBot) {
    if (FrozenCookies.autoclickBot) {
      clearInterval(FrozenCookies.autoclickBot);
      FrozenCookies.autoclickBot = 0;
    }
    FrozenCookies.autoFrenzyBot = setInterval(function(){Game.ClickCookie();}, 1000 / FrozenCookies.frenzyClickSpeed);
  } else if (Game.clickFrenzy == 0 && FrozenCookies.autoFrenzyBot) {
    clearInterval(FrozenCookies.autoFrenzyBot);
    FrozenCookies.autoFrenzyBot = 0;
    if (FrozenCookies.autoClick && FrozenCookies.cookieClickSpeed) {
      FrozenCookies.autoclickBot = setInterval(function(){Game.ClickCookie();}, 1000 / FrozenCookies.cookieClickSpeed);
    }
  }
}

function autoCookie() {
  if (!FrozenCookies.processing && !Game.OnAscend && !Game.AscendTimer) {
    FrozenCookies.processing = true;
    var currentHCAmount = Game.HowMuchPrestige(Game.cookiesEarned + Game.cookiesReset + Game.wrinklers.reduce(function(s,w){return s + popValue(w.sucked);}, 0));
    if (FrozenCookies.lastHCAmount < currentHCAmount) {
      var changeAmount = currentHCAmount - FrozenCookies.lastHCAmount;
      FrozenCookies.lastHCAmount = currentHCAmount;
      FrozenCookies.prevLastHCTime = FrozenCookies.lastHCTime;
      FrozenCookies.lastHCTime = Date.now();
      var currHCPercent = (60 * 60 * (FrozenCookies.lastHCAmount - Game.heavenlyChipsEarned)/((FrozenCookies.lastHCTime - Game.startDate)/1000));
      if ((Game.heavenlyChipsEarned < (currentHCAmount - changeAmount)) && currHCPercent > FrozenCookies.maxHCPercent) {
        FrozenCookies.maxHCPercent = currHCPercent;
      }
      FrozenCookies.hc_gain += changeAmount;
      updateLocalStorage();
    }
    updateCaches();
    var recommendation = nextPurchase();
    var delay = delayAmount();
    if (FrozenCookies.timeTravelAmount) {
      doTimeTravel();
    }
    if (FrozenCookies.autoWrinkler) {
      var popCount = 0;
      var popList = shouldPopWrinklers();
      _.filter(Game.wrinklers, function(w) {return _.contains(popList, w.id)}).forEach(function(w) {
        w.hp = 0;
        popCount += 1;
      });
      if (popCount > 0) {
        logEvent('Wrinkler', 'Popped ' + popCount + ' wrinklers.');
      }
    }
    
    var itemBought = false;
    
    if (FrozenCookies.autoBuy && (Game.cookies >= delay + recommendation.cost) && (FrozenCookies.pastemode || isFinite(nextChainedPurchase().efficiency))) {
//    if (FrozenCookies.autoBuy && (Game.cookies >= delay + recommendation.cost)) {
      recommendation.time = Date.now() - Game.startDate;
//      full_history.push(recommendation);  // Probably leaky, maybe laggy?
      recommendation.purchase.clickFunction = null;
      disabledPopups = false;
//      console.log(purchase.name + ': ' + Beautify(recommendation.efficiency) + ',' + Beautify(recommendation.delta_cps));
      recommendation.purchase.buy();
      FrozenCookies.autobuyCount += 1;
      if (FrozenCookies.trackStats == 5 && recommendation.type == 'upgrade') {
        saveStats();
      } else if (FrozenCookies.trackStats == 6) {
        FrozenCookies.delayPurchaseCount += 1;
      }
      logEvent('Store', 'Autobought ' + recommendation.purchase.name + ' for ' + Beautify(recommendation.cost) + ', resulting in ' + Beautify(recommendation.delta_cps) + ' CPS.');
      disabledPopups = true;
      if (FrozenCookies.autobuyCount >= 10) {
      	Game.Draw();
      	FrozenCookies.autobuyCount = 0;
      }
      FrozenCookies.recalculateCaches = true;
      FrozenCookies.processing = false;
      itemBought = true;
    }
    
    // This apparently *has* to stay here, or else fast purchases will multi-click it.
    if (Game.goldenCookie.life && FrozenCookies.autoGC) {
      Game.goldenCookie.click();
    }
    if (Game.seasonPopup.life > 0 && FrozenCookies.autoReindeer) {
      Game.seasonPopup.click();
    }
    if (FrozenCookies.autoBlacklistOff) {
      autoBlacklistOff();
    }
    var currentFrenzy = (Game.frenzy ? Game.frenzyPower : 1) * (Game.clickFrenzy ? 777 : 1);
    if (currentFrenzy != FrozenCookies.last_gc_state) {
      if (FrozenCookies.last_gc_state != 1 && currentFrenzy == 1) {
      	logEvent('GC', 'Frenzy ended, cookie production x1');
      	if (FrozenCookies.hc_gain) {
      	  
	  logEvent('HC', 'Won ' + FrozenCookies.hc_gain + ' heavenly chips during Frenzy. Rate: ' + (FrozenCookies.hc_gain * 1000) / (Date.now() - FrozenCookies.hc_gain_time) + ' HC/s.');
	  FrozenCookies.hc_gain_time = Date.now();
	  FrozenCookies.hc_gain = 0;
      	}
      } else {
      	if (FrozenCookies.last_gc_state != 1) {
      	  logEvent('GC', 'Previous Frenzy x' + FrozenCookies.last_gc_state + 'interrupted.')
        } else if (FrozenCookies.hc_gain) {
	  logEvent('HC', 'Won ' + FrozenCookies.hc_gain + ' heavenly chips outside of Frenzy. Rate: ' + (FrozenCookies.hc_gain * 1000) / (Date.now() - FrozenCookies.hc_gain_time) + ' HC/s.');
          FrozenCookies.hc_gain_time = Date.now();
          FrozenCookies.hc_gain = 0;
        }
      	logEvent('GC', 'Starting ' + (Game.clickFrenzy ? 'Clicking ' : '') + 'Frenzy x' +  currentFrenzy);
      }
      if (FrozenCookies.frenzyTimes[FrozenCookies.last_gc_state] == null) {
      	FrozenCookies.frenzyTimes[FrozenCookies.last_gc_state] = 0;
      }
      FrozenCookies.frenzyTimes[FrozenCookies.last_gc_state] += Date.now() - FrozenCookies.last_gc_time;
      FrozenCookies.last_gc_state = currentFrenzy;
      FrozenCookies.last_gc_time = Date.now();
      updateLocalStorage();
    }
    FrozenCookies.processing = false;
    if (FrozenCookies.frequency) {
      FrozenCookies.cookieBot = setTimeout(autoCookie, itemBought ? 0 : FrozenCookies.frequency);
    }
  } else if (!FrozenCookies.processing && FrozenCookies.frequency) {
    FrozenCookies.cookieBot = setTimeout(autoCookie, FrozenCookies.frequency);
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
  if (FrozenCookies.statBot) {
    clearInterval(FrozenCookies.statBot);
    FrozenCookies.statBot = 0;
  }
  
//  if (!FrozenCookies.saveWrinklers && localStorage.wrinklers) {
//    delete localStorage.wrinklers;
//  }

// Remove until timing issues are fixed
//  if (FrozenCookies.goldenCookieBot) {
//    clearInterval(FrozenCookies.goldenCookieBot);
//    FrozenCookies.goldenCookieBot = 0;
//  }
  
  // Now create new intervals with their specified frequencies.
  
  if (FrozenCookies.frequency) {
    FrozenCookies.cookieBot = setTimeout(autoCookie, FrozenCookies.frequency);
  }
  
//  if (FrozenCookies.autoGC) {
//    FrozenCookies.goldenCookieBot = setInterval(autoGoldenCookie, FrozenCookies.frequency);
//  }
  
  if (FrozenCookies.autoClick && FrozenCookies.cookieClickSpeed) {
    FrozenCookies.autoclickBot = setInterval(function() {if (!Game.OnAscend && !Game.AscendTimer) {Game.ClickCookie()}}, 1000 / FrozenCookies.cookieClickSpeed);
  }
  
  if (FrozenCookies.autoFrenzy && FrozenCookies.frenzyClickSpeed) {
    FrozenCookies.frenzyClickBot = setInterval(autoFrenzyClick, FrozenCookies.frequency);
  }
  
  if (statSpeed(FrozenCookies.trackStats) > 0) {
    FrozenCookies.statBot = setInterval(saveStats, statSpeed(FrozenCookies.trackStats));
  } else if (FrozenCookies.trackStats == 6 && !FrozenCookies.smartTrackingBot) {
    FrozenCookies.smartTrackingBot = setTimeout(function() {smartTrackingStats(FrozenCookies.minDelay * 8)}, FrozenCookies.minDelay);
  }
  
  FCMenu();
}
