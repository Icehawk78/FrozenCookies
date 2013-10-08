$('#logButton').before(
  $('<div id="fcButton" />').addClass('button')
    .html('Frozen Cookie')
    .click(function(){
      Game.ShowMenu('fc_menu');
    })
);

$('<style type="text/css">')
  .html(
  '#fcButton {font-size: 60%; top: 0px; right: -16px; padding: 14px 16px 10px 0px;}' +
  '#fcButton:hover {right: -8px;}' +
  '.worst {border-width:1px; border-style:solid; border-color:#330000;}' +
  '.bad {border-width:1px; border-style:solid; border-color:#660033;}' +
  '.average {border-width:1px; border-style:solid; border-color:#663399;}' +
  '.good {border-width:1px; border-style:solid; border-color:#3399FF;}' +
  '.best {border-width:1px; border-style:solid; border-color:#00FFFF;}'
  )
  .appendTo('head');

function getBuildingTooltip(building) {
  var recommendation = recommendationList().filter(function(a) {return a.id == building.id && a.type == 'building';})[0];
  var parent = $('<div />').attr('style','min-width:300px;');
  parent.append($('<div />').addClass('price').attr('style', 'float:right;').text(Beautify(building.price)));
  parent.append($('<div />').addClass('name').text(building.name));
  parent.append($('<div />').attr('style', 'font-size:80%;').text('[owned: ' + building.amount + ']'));
  parent.append($('<div />').addClass('description').html(building.desc));
  if (recommendation) {
    parent.append($('<div />').addClass('fc_cps').html('&#916; CPS: ' + Beautify(recommendation.delta_cps)));
    parent.append($('<div />').addClass('fc_efficiency').text('Efficiency: ' + (Math.floor(efficiencyScore(building, 'building') * 10000) / 100).toString() + '%'));
    parent.append($('<div />').addClass('fc_build_time').text('Build time: ' + timeDisplay(divCps((recommendation.cost + delayAmount()), Game.cookiesPs))));
    parent.append($('<div />').addClass('fc_effective_build_time').text('Estimated GC Build time: ' + timeDisplay(divCps((recommendation.cost + delayAmount()), (baseCps() + gcPs(weightedCookieValue(true)))))));
  }
  return parent[0].outerHTML;
}

function getUpgradeTooltip(upgrade) {
  var recommendation = recommendationList().filter(function(a) {return a.id == upgrade.id && a.type == 'upgrade';})[0];
  var parent = $('<div />').attr('style','min-width:300px;');
  parent.append($('<div />').addClass('price').attr('style', 'float:right;').text(Beautify(upgrade.basePrice)));
  parent.append($('<div />').addClass('name').text(upgrade.name));
  parent.append($('<div />').attr('style', 'font-size:80%;').text('[Upgrade]'));
  parent.append($('<div />').addClass('description').html(upgrade.desc));
  if (recommendation) {
    parent.append($('<div />').addClass('fc_cps').html('&#916; CPS: ' + Beautify(recommendation.delta_cps)));
    parent.append($('<div />').addClass('fc_efficiency').text('Efficiency: ' + (Math.floor(efficiencyScore(upgrade, 'upgrade') * 10000) / 100).toString() + '%'));
    parent.append($('<div />').addClass('fc_build_time').text('Build time: ' + timeDisplay(divCps((recommendation.cost + delayAmount()), Game.cookiesPs))));
    parent.append($('<div />').addClass('fc_effective_build_time').text('Estimated GC Build time: ' + timeDisplay(divCps((recommendation.cost + delayAmount()), (baseCps() + gcPs(weightedCookieValue(true)))))));
  }
  return parent[0].outerHTML;
}

function efficiencyScore(purchase, type) {
  var result = 0;
  var recommendations = recommendationList().filter(function(a){return a.efficiency < Number.POSITIVE_INFINITY && a.efficiency > Number.NEGATIVE_INFINITY;});
  var purchaseRec = recommendations.filter(function(a){return a.id == purchase.id && a.type == type;})[0];
  if (purchaseRec) {
    var minValue = Math.log(recommendations[0].efficiency);
    var maxValue = Math.log(recommendations[recommendations.length - 1].efficiency);
    var purchaseValue = Math.log(purchaseRec.efficiency);
    var spread = maxValue - minValue;
    var purchaseSpread = purchaseValue - minValue;
    result = 1 - (purchaseSpread / spread);
  }
  return result;
}

function colorizeScore(score) {
  var classNames = ['best', 'good', 'average', 'bad', 'worst'];
  var result;
  if (score == 1) {
    result = classNames[0];
  } else if (score > 0.9) {
    result = classNames[1];
  } else if (score > 0.1) {
    result = classNames[2];
  } else if (score > 0) {
    result = classNames[3];
  } else {
    result = classNames[4];
  }
  return result;
}

eval("Game.Draw = " + Game.Draw.toString()
  .replace(/if \(Game.cookies>=me.price\) l\('product'\+me.id\).className='product enabled'; else l\('product'\+me.id\).className='product disabled';/, '(Game.cookies >= me.price) ? $("#product"+me.id).addClass("enabled").removeClass("disabled") : $("#product"+me.id).addClass("disabled").removeClass("enabled");')
  .replace(/if \(Game.cookies>=me.basePrice\) l\('upgrade'\+i\).className='crate upgrade enabled'; else l\('upgrade'\+i\).className='crate upgrade disabled';/, '(Game.cookies >= me.basePrice) ? $("#upgrade"+me.id).addClass("enabled").removeClass("disabled") : $("#upgrade"+me.id).addClass("disabled").removeClass("enabled");'));

function rebuildStore() {
  var store = $('#products');
  store[0].innerHTML = '';
  Game.ObjectsById.forEach(function(me) {
    var button = $('<div />')
      .addClass('product')
      .addClass(colorizeScore(efficiencyScore(me, 'building')))
      .mouseenter(function() {Game.tooltip.draw(this, escape(getBuildingTooltip(me)), 0, 0, 'left')})
      .mouseleave(function() {Game.tooltip.hide()})
      .click(function() {Game.ObjectsById[me.id].buy()})
      .attr('id', 'product' + me.id);
    button.append($('<div />').addClass('icon').attr('style', 'background-image:url(img/' + me.icon + '.png);'));
    var content = $('<div />').addClass('content');
    content.append($('<div />').addClass('title').html(me.displayName));
    content.append($('<div />').addClass('price').text(Beautify(me.price)));
    if (me.amount) {
      content.append($('<div />').addClass('title').addClass('owned').text(Beautify(me.amount)));
    }
    button.append(content);
    store.append(button);
  });
  Game.Draw();
}

function rebuildUpgrades() {
  var store = $('#upgrades');
  store[0].innerHTML = '';
  Game.UpgradesInStore = Game.UpgradesById.filter(function(a){return !a.bought && a.unlocked;}).sort(function(a,b){return a.basePrice - b.basePrice;});
  Game.UpgradesInStore.forEach(function(me) {
    store.append($('<div />')
      .addClass('crate')
      .addClass('upgrade')
      .addClass(colorizeScore(efficiencyScore(me, 'upgrade')))
      .mouseenter(function() {Game.tooltip.draw(this, escape(getUpgradeTooltip(me)), 0, 16, 'bottom-right')})
      .mouseleave(function() {Game.tooltip.hide()})
      .click(function() {Game.ObjectsById[me.id].buy()})
      .attr('id', 'upgrade' + me.id)
      .attr('style', 'background-position:' + (-me.icon[0] * 48 + 6) + 'px ' + (-me.icon[1] * 48 + 6) + 'px;'));
  });
  Game.Draw();
}

Game.RebuildStore=function() {rebuildStore();}
Game.RebuildUpgrades=function() {rebuildUpgrades();}

Game.RebuildStore();
Game.RebuildUpgrades();

Game.oldUpdateMenu = Game.UpdateMenu;

function drawCircles(t_d, canvas) {
  /*c = canvas.jCanvas({
    x: 50, y:50,
    radius: 40
  });*/
  var c = canvas;
  var i_c = 0;
  var t_b = ['#AAA','#BBB','#CCC','#DDD','#EEE','#FFF'];
  var maxWidth = Math.max.apply(null,t_d.map(function(o){return (o.name && o.display) ? c.measureText({font: "10px Arial", maxWidth:c.width, text: o.name + ': ' + o.display}).width : 250;}));
  var maxHeight = 20+t_d.map(function(o){return (o.name && o.display) ? c.measureText({font: "10px Arial", maxWidth:c.width, text: o.name + ': ' + o.display}).height : 250;})
                     .reduce(function(sum,item){return sum+item;},0);
  c.drawRect({
    fillStyle: '#999',
    x: maxWidth, y: 12.5+t_d.length/2*15,
    width: maxWidth, height: maxHeight
  });
  t_d.forEach( function(o_draw) {
    c.drawArc({
      strokeStyle: t_b[i_c],
      strokeWidth: 10,
      x: 45, y:45,
      radius: 40-i_c*10,
    });
    c.drawArc({
      strokeStyle: t_b[i_c+2],
      strokeWidth: 1,
      x: 45, y:45,
      radius: 35-i_c*10
    });
    c.drawArc({
      strokeStyle: o_draw.c1,
      x: 45, y:45,
      strokeWidth: 7,
      start: 0,
      radius: 40-i_c*10,
      end: (360 * o_draw.f_percent)
    });
    if (o_draw.name && o_draw.display)
    {
      var s_t = o_draw.name+": "+o_draw.display;
      c.drawText({
        font: "10px Arial",
        fillStyle: o_draw.c1,
        x: c.measureText({font: "10px Arial", maxWidth:c.width, text: s_t}).width, y: 20+15*i_c,
        text: s_t
      });   
    }
    i_c++;
  });
}

function updateTimers() {
  var gc_delay = Game.goldenCookie.delay / maxCookieTime();
  var frenzy_delay = Game.frenzy / maxCookieTime();
  var click_frenzy_delay = Game.clickFrenzy / maxCookieTime();
  var decimal_HC_complete = ((Math.sqrt((Game.cookiesEarned + Game.cookiesReset)/0.5e12+0.25)-0.5)%1);
  var t_draw = [];
  if (gc_delay>0) {
    t_draw.push({
      f_percent: gc_delay,
      c1: "gold",
      c2: "white",
      name: "Golden Cookie Time",
      display: timeDisplay(Game.goldenCookie.delay/Game.fps)
    });
  }
  if (frenzy_delay>0) {
    t_draw.push({
      f_percent: frenzy_delay,
      c1: "red",
      c2: "white",
      name: "Frenzy Time",
      display: timeDisplay(Game.frenzy/Game.fps)
    });
  }
  if (click_frenzy_delay>0) {
    t_draw.push({
      f_percent: click_frenzy_delay,
      c1: "#00C4FF",
      c2: "white",
      name: "Click Frenzy Time",
      display: timeDisplay(Game.clickFrenzy/Game.fps)
    });
  }
  if (decimal_HC_complete>0) {
    t_draw.push({
      f_percent: decimal_HC_complete,
      c1: "#000",
      c2: "white",
      name: "HC Completion",
      display: (Math.round(decimal_HC_complete*10000)/100)+"%"
    });
  }
  drawCircles(t_draw, $('#fcTimer'));
}

function updateBuyTimers() {
  var bankTotal = delayAmount();
  var purchaseTotal = nextPurchase().cost;
  var chainTotal = nextChainedPurchase().cost;
  var bankCompletion = bankTotal ? (Math.min(Game.cookies, bankTotal)) / bankTotal : 0;
  var purchaseCompletion = Math.max(Game.cookies - bankTotal, 0) / (bankTotal + purchaseTotal);
  var chainCompletion = Math.max(Game.cookies - bankTotal, 0) / (bankTotal + chainTotal);
  var bankPercent = bankTotal / (purchaseTotal + bankTotal);
  var purchasePercent = purchaseTotal / (purchaseTotal + bankTotal);
  
  var t_draw = [];
  if (bankTotal > 0) {
    t_draw.push({
      f_percent: bankCompletion,
      c1: '#666',
      c2: '#666',
      name: "Golden Cookie Bank",
      display: timeDisplay(divCps(Math.max(bankTotal - Game.cookies,0), Game.cookiesPs))
    });
  }
  if (chainTotal - purchaseTotal > 0) {
    t_draw.push({
      f_percent: chainCompletion,
      c1: '#333',
      c2: '#333',
      name: "Chain Completion Time",
      display: timeDisplay(divCps(Math.max(chainTotal + bankTotal - Game.cookies,0), Game.cookiesPs))
    });
  }
  if (purchaseTotal > 0) {
    t_draw.push({
      f_percent: purchaseCompletion,
      c1: '#111',
      c2: '#111',
      name: "Purchase Completion Time",
      display: timeDisplay(divCps(Math.max(purchaseTotal + bankTotal - Game.cookies,0), Game.cookiesPs))
    });
  }
  drawCircles(t_draw, $('#fcBuyTimer'));
}

function FCMenu() {
  Game.UpdateMenu = function() {
    if (Game.onMenu !== 'fc_menu') {
      return Game.oldUpdateMenu();
    } else {
      var menu = $('#menu').html('');
      menu.append($('<div />').addClass('section').html('Frozen Cookie'));
      var subsection = $('<div />').addClass('subsection');
      subsection.append($('<div />').addClass('title').html('Game Timers'));
      var timers = $('<canvas id="fcTimer" width="400px" height="100px"/>').html('Your browser does not support the HTML5 canvas tag.');
      subsection.append($('<div />').addClass('listing').append(timers));
      menu.append(subsection);
      updateTimers();
      if (Game.cookiesPs > 0) {
        var timers = $('<canvas id="fcBuyTimer" width="400px" height="100px"/>').html('Your browser does not support the HTML5 canvas tag.');
        subsection.append($('<div />').addClass('listing').append(timers));
        menu.append(subsection);
        updateBuyTimers();
      }
      var subsection = $('<div />').addClass('subsection');
      subsection.append($('<div />').addClass('title').html('Autobuy Information'));
      var recommendation = nextPurchase();
      var store = (recommendation.type == 'building') ? Game.ObjectsById : Game.UpgradesById;
      var purchase = store[recommendation.id];
      var chain_recommend = recommendationList()[0];
      var chain_store = null;
      subsection.append($('<div />').addClass('listing').html('<b>Next Purchase:</b> ' + purchase.name));
      if (!(recommendation.id == chain_recommend.id && recommendation.type == chain_recommend.type)) {
        chain_store = (chain_recommend.type == 'building') ? Game.ObjectsById : Game.UpgradesById;
        subsection.append($('<div />').addClass('listing').html('<b>Building Chain to:</b> ' + chain_store[chain_recommend.id].name));
      }
      subsection.append($('<div />').addClass('listing').html('<b>Time til completion:</b> ' + timeDisplay(divCps((recommendation.cost + delayAmount() - Game.cookies), Game.cookiesPs))));
      if (!(recommendation.id == chain_recommend.id && recommendation.type == chain_recommend.type)) {
        subsection.append($('<div />').addClass('listing').html('<b>Time til Chain completion:</b> ' + timeDisplay(chain_recommend.cost)));
      }
      subsection.append($('<div />').addClass('listing').html('<b>Cost:</b> ' + Beautify(recommendation.cost)));
      subsection.append($('<div />').addClass('listing').html('<b>Golden Cookie Bank:</b> ' + Beautify(delayAmount())));
      subsection.append($('<div />').addClass('listing').html('<b>Base &#916; CPS:</b> ' + Beautify(recommendation.base_delta_cps)));
      subsection.append($('<div />').addClass('listing').html('<b>Full &#916; CPS:</b> ' + Beautify(recommendation.delta_cps)));
      subsection.append($('<div />').addClass('listing').html('<b>Purchase Efficiency:</b> ' + Beautify(recommendation.efficiency)));
      if (!(recommendation.id == chain_recommend.id && recommendation.type == chain_recommend.type)) {
        subsection.append($('<div />').addClass('listing').html('<b>Chain efficiency:</b> ' + Beautify(chain_recommend.efficiency)));
      }
      if (Game.cookiesPs > 0) {
        subsection.append($('<div />').addClass('listing').html('<b>Golden Cookie efficiency:</b> ' + Beautify(gcEfficiency())));
      }
      menu.append(subsection);
      var subsection = $('<div />').addClass('subsection');
      subsection.append($('<div />').addClass('title').html('Golden Cookie Information'));
      var isMaxed = weightedCookieValue(true) == weightedCookieValue();
      var maxTxt = isMaxed ? ' (Max)' : '';
      subsection.append($('<div />').addClass('listing').html('<b>Current Average Cookie Value' + maxTxt + ':</b> ' + Beautify(weightedCookieValue(true))));
      if (!isMaxed) {
        subsection.append($('<div />').addClass('listing').html('<b>Max Average Cookie Value:</b> ' + Beautify(weightedCookieValue())));
      }
      subsection.append($('<div />').addClass('listing').html('<b>Max Lucky Cookie Value:</b> ' + Beautify(maxLuckyValue())));
      subsection.append($('<div />').addClass('listing').html('<b>Cookie Bank Required for Max Lucky:</b> ' + Beautify(maxLuckyValue() * 10)));
      if (Game.cookiesPs > 0) {
        subsection.append($('<div />').addClass('listing').html('<b>Estimated Cookie CPS:</b> ' + Beautify(gcPs(weightedCookieValue(true)))));
      }
      subsection.append($('<div />').addClass('listing').html('<b>Golden Cookie Clicks:</b> ' + Beautify(Game.goldenClicks)));
      subsection.append($('<div />').addClass('listing').html('<b>Missed Golden Cookie Clicks:</b> ' + Beautify(Game.missedGoldenClicks)));
      subsection.append($('<div />').addClass('listing').html('<b>Last Golden Cookie Effect:</b> ' + Game.goldenCookie.last));
      subsection.append($('<div />').addClass('listing').html('<b>Total Recorded Frenzy Time:</b> ' + timeDisplay(FrozenCookies.gc_time/1000)));
      subsection.append($('<div />').addClass('listing').html('<b>Total Recorded Non-Frenzy Time:</b> ' + timeDisplay(FrozenCookies.non_gc_time/1000)));
      menu.append(subsection);
      var subsection = $('<div />').addClass('subsection');
      subsection.append($('<div />').addClass('title').html('Heavenly Chips Information'));
      var currHC = Game.prestige['Heavenly chips'];
      var resetHC = Game.HowMuchPrestige(Game.cookiesReset+Game.cookiesEarned);
      subsection.append($('<div />').addClass('listing').html('<b>HC Now:</b> ' + Beautify(Game.prestige['Heavenly chips'])));
      subsection.append($('<div />').addClass('listing').html('<b>HC After Reset:</b> ' + Beautify(resetHC)));
      subsection.append($('<div />').addClass('listing').html('<b>Cookies to next HC:</b> ' + Beautify(nextHC(true))));
      subsection.append($('<div />').addClass('listing').html('<b>Estimated time to next HC:</b> ' + nextHC()));
      if (currHC < resetHC) {
        subsection.append($('<div />').addClass('listing').html('<b>Time since last HC:</b> ' + timeDisplay((Date.now() - FrozenCookies.lastHCTime)/1000)));
        if (FrozenCookies.lastHCAmount - 1 >= currHC) {
          subsection.append($('<div />').addClass('listing').html('<b>Time to get last HC:</b> ' + timeDisplay((FrozenCookies.lastHCTime - FrozenCookies.prevLastHCTime)/1000)));
        }
        if (FrozenCookies.maxHCPercent > 0) {
          subsection.append($('<div />').addClass('listing').html('<b>Max HC Gain/hr:</b> ' + Beautify(FrozenCookies.maxHCPercent)));
        }
        subsection.append($('<div />').addClass('listing').html('<b>Average HC Gain/hr:</b> ' + Beautify(60 * 60 * (FrozenCookies.lastHCAmount - currHC)/((FrozenCookies.lastHCTime - Game.startDate)/1000))));
        if (FrozenCookies.lastHCAmount - 1 >= currHC) {
          subsection.append($('<div />').addClass('listing').html('<b>Previous Average HC Gain/hr:</b> ' + Beautify(60 * 60 *(FrozenCookies.lastHCAmount - 1 - currHC)/((FrozenCookies.prevLastHCTime - Game.startDate)/1000))));
        }
      }
      menu.append(subsection);
      var subsection = $('<div />').addClass('subsection');
      subsection.append($('<div />').addClass('title').html('Other Information'));
      var cps = baseCps();
      var baseChosen = (Game.frenzy > 0) ? '' : ' (*)';
      var frenzyChosen = (Game.frenzy > 0) ? ' (*)' : '';
      subsection.append($('<div />').addClass('listing').html('<b>Base CPS' + baseChosen + ':</b> ' + Beautify(cps)));
      subsection.append($('<div />').addClass('listing').html('<b>Frenzy CPS' + frenzyChosen + ':</b> ' + Beautify(cps * 7)));
      subsection.append($('<div />').addClass('listing').html('<b>Estimated Effective CPS:</b> ' + Beautify(cps + gcPs(weightedCookieValue(true)))));
      subsection.append($('<div />').addClass('listing').html('<b>Game Started:</b> ' + Game.sayTime((Date.now()-Game.startDate)/1000*Game.fps)));
      menu.append(subsection);
      var subsection = $('<div />').addClass('subsection');
      subsection.append($('<div />').addClass('title').html('Frozen Cookie Controls'));
      var listing = $('<div />').addClass('listing');
      listing.append($(Game.WriteButton('autoBuy','autobuyButton','Autobuy ON','Autobuy OFF',"toggleFrozen('autoBuy');")));
      listing.append($(Game.WriteButton('autoGC','autogcButton','Autoclick GC ON','Autoclick GC OFF',"toggleFrozen('autoGC');")));
      subsection.append(listing);
      menu.append(subsection);
      var subsection = $('<div />').addClass('subsection');
      subsection.append($('<div />').addClass('title').html('Internal Information'));
      var buildTable = $('<table />').html('<tr><th>Building</th><th>efficiency</th><th>Cost</th><th>&#916; CPS</th></tr>');
      recommendationList().forEach(function(rec) {
        var store = (rec.type == 'building') ? Game.ObjectsById : Game.UpgradesById;
        var item  = store[rec.id];
        buildTable.append($('<tr><td><b>' + item.name + '</b></td><td>' + Beautify(rec.efficiency) + '</td><td>' + Beautify(rec.cost) + '</td><td>' + Beautify(rec.delta_cps) + '</td></tr>'));
      });
      buildTable.append($('<tr><td><b>Golden Bank</b></td><td>' + Beautify(gcEfficiency()) + '</td><td>' + Beautify(Math.max(0,(maxLuckyValue() * 10 - Game.cookies))) + '</td><td>' + Beautify(gcPs(weightedCookieValue() - weightedCookieValue(true))) + '</td></tr>'));
      subsection.append($('<div />').addClass('listing').append(buildTable));
      menu.append(subsection);
    }
  }
}
