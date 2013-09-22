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
  '#fcButton:hover {right: -8px;}')
  .appendTo('head');

Game.oldUpdateMenu = Game.UpdateMenu;

function drawCircles(t_d) {
  var canvas = $('#fcTimer');
  /*c = canvas.jCanvas({
    x: 50, y:50,
    radius: 40
  });*/
  var c = canvas;
  var i_c = 0;
  var t_b = ['#AAA','#BBB','#CCC','#DDD','#EEE','#FFF'];
  c.drawRect({
    fillStyle: '#999',
    x: 225, y: 12.5+t_d.length/2*15,
    width: 250, height: 5+t_d.length*15
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
      strokeStyle: function(layer) {
        return $(this).createGradient({
          x1: layer.x, y1: layer.y,
          x2: layer.x, y2: layer.y,
          r1: layer.radius-layer.strokeWidth, r2: layer.radius+layer.strokeWidth*(1+i_c*0.25),
          c1: o_draw.c1, c2: o_draw.c2
        });
      },
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
        x: 200+s_t.length, y: 20+15*i_c,
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
  drawCircles(t_draw);
}

Game.UpdateMenu = function() {
  if (Game.onMenu !== 'fc_menu') {
    return Game.oldUpdateMenu();
  } else {
    var menu = $('#menu').html('');
    menu.append($('<div />').addClass('section').html('Frozen Cookie'));
    var subsection = $('<div />').addClass('subsection');
    subsection.append($('<div />').addClass('title').html('Timer Tests'));
    var timers = $('<canvas id="fcTimer" width="400px" height="100px"/>').html('Your browser does not support the HTML5 canvas tag.');
    subsection.append(timers);
    menu.append(subsection);
    updateTimers();
    var subsection = $('<div />').addClass('subsection');
    subsection.append($('<div />').addClass('title').html('Autobuy Information'));
    var recommendation = nextPurchase();
    var store = (recommendation.type == 'building') ? Game.ObjectsById : Game.UpgradesById;
    var purchase = store[recommendation.id];
    subsection.append($('<div />').addClass('listing').html('<b>Next Purchase:</b> ' + purchase.name));
    if (Game.cookiesPs > 0) {
      subsection.append($('<div />').addClass('listing').html('<b>Time til completion:</b> ' + timeDisplay((recommendation.cost + delayAmount() - Game.cookies) / Game.cookiesPs)));
    }
    subsection.append($('<div />').addClass('listing').html('<b>Cost:</b> ' + Beautify(recommendation.cost)));
    subsection.append($('<div />').addClass('listing').html('<b>Golden Cookie Bank:</b> ' + Beautify(delayAmount())));
    subsection.append($('<div />').addClass('listing').html('<b>Base &#916; CPS:</b> ' + Beautify(recommendation.base_delta_cps)));
    subsection.append($('<div />').addClass('listing').html('<b>Full &#916; CPS:</b> ' + Beautify(recommendation.delta_cps)));
    subsection.append($('<div />').addClass('listing').html('<b>Purchase ROI:</b> ' + Beautify(recommendation.roi)));
    if (Game.cookiesPs > 0) {
      subsection.append($('<div />').addClass('listing').html('<b>Golden Cookie ROI:</b> ' + Beautify(gcRoi())));
    }
    menu.append(subsection);
    var subsection = $('<div />').addClass('subsection');
    subsection.append($('<div />').addClass('title').html('Golden Cookie Information'));
    subsection.append($('<div />').addClass('listing').html('<b>Current Average Cookie Value:</b> ' + Beautify(weightedCookieValue(true))));
    subsection.append($('<div />').addClass('listing').html('<b>Max Average Cookie Value:</b> ' + Beautify(weightedCookieValue())));
    subsection.append($('<div />').addClass('listing').html('<b>Max Lucky Cookie Value:</b> ' + Beautify(maxLuckyValue())));
    if (Game.cookiesPs > 0) {
      subsection.append($('<div />').addClass('listing').html('<b>Estimated Cookie CPS:</b> ' + Beautify(gcPs(weightedCookieValue(true)))));
    }
    menu.append(subsection);
    var subsection = $('<div />').addClass('subsection');
    subsection.append($('<div />').addClass('title').html('Heavenly Chips Information'));
    subsection.append($('<div />').addClass('listing').html('<b>HC Now:</b> ' + Beautify(Game.HowMuchPrestige(Game.cookiesReset))));
    subsection.append($('<div />').addClass('listing').html('<b>HC After Reset:</b> ' + Beautify(Game.HowMuchPrestige(Game.cookiesReset+Game.cookiesEarned))));
    subsection.append($('<div />').addClass('listing').html('<b>Cookies to next HC:</b> ' + Beautify(nextHC(true))));
    if (Game.cookiesPs > 0) {
      subsection.append($('<div />').addClass('listing').html('<b>Estimated time to next HC:</b> ' + nextHC()));
    }
    menu.append(subsection);
    var subsection = $('<div />').addClass('subsection');
    subsection.append($('<div />').addClass('title').html('Frozen Cookie Controls'));
    var listing = $('<div />').addClass('listing');
    listing.append($(Game.WriteButton('autobuy','autobuyButton','Autobuy ON','Autobuy OFF',"toggleFrozen('autobuy');")));
    listing.append($(Game.WriteButton('autogc','autogcButton','Autoclick GC ON','Autoclick GC OFF',"toggleFrozen('autogc');")));
    subsection.append(listing);
    menu.append(subsection);
  }
}
