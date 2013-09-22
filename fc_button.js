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

function updateTimers() {
  var gc_delay = Game.goldenCookie.delay / maxCookieTime();
  var frenzy_delay = Game.frenzy / maxCookieTime();
  var click_frenzy_delay = Game.clickFrenzy / maxCookieTime();
  var decimal_HC_complete = ((Math.sqrt((Game.cookiesEarned + Game.cookiesReset)/0.5e12+0.25)-0.5)%1);
  var canvas = $('#fcTimer');
  canvas.jCanvas({
    x: 75, y: 75,
    radius: 40
  })
  .drawArc({
    strokeStyle: '#AAA',
    strokeWidth: 10,
  })
  .drawArc({
    strokeStyle: 'gold',
/*    function(layer) {
      return $(this).createGradient({
        x1: layer.x, y1: layer.y,
        x2: layer.x, y2: layer.y,
        r1: layer.radius-layer.strokeWidth, r2: layer.radius+layer.strokeWidth,
        c1: "gold", c2: "white"
      });
    },
*/
    strokeWidth: 7,
    start: 0,
    end: (360 * gc_delay)
  })
  .drawArc({
    strokeStyle: '#BBB',
    strokeWidth: 10,
    radius:30
  })
  .drawArc({
    strokeStyle: '#CCC',
    strokeWidth: 1,
    radius:35
  })
  .drawArc({
    strokeStyle: 'red',
/*    function(layer) {
      return $(this).createGradient({
        x1: layer.x, y1: layer.y,
        x2: layer.x, y2: layer.y,
        r1: layer.radius-layer.strokeWidth, r2: layer.radius+layer.strokeWidth*1.25,
        c1: "red", c2: "white"
      });
    },
*/
    strokeWidth: 7,
    radius: 30,
    start: 0,
    end: (360 * frenzy_delay)
	})
  .drawArc({
    strokeStyle: '#CCC',
    strokeWidth: 10,
    radius:20
  })
  .drawArc({
    strokeStyle: '#DDD',
    strokeWidth: 1,
    radius:25
  })
  .drawArc({
    strokeStyle: '00C4FF',
/*    function(layer) {
      return $(this).createGradient({
        x1: layer.x, y1: layer.y,
        x2: layer.x, y2: layer.y,
        r1: layer.radius-layer.strokeWidth, r2: layer.radius+layer.strokeWidth*1.5,
        c1: "00C4FF", c2: "white"
      });
    },
*/
    strokeWidth: 7,
    radius: 20,
    start: 0,
    end: 360*click_frenzy_delay
	})
  .drawArc({
    strokeStyle: '#DDD',
    strokeWidth: 10,
    radius:10
  })
  .drawArc({
    strokeStyle: '#EEE',
    strokeWidth: 1,
    radius:15
  })
  .drawArc({
    strokeStyle: 'black',
/*    function(layer) {
      return $(this).createGradient({
        x1: layer.x, y1: layer.y,
        x2: layer.x, y2: layer.y,
        r1: layer.radius-layer.strokeWidth, r2: layer.radius+layer.strokeWidth*1.75,
        c1: "#000", c2: "white"
      });
    },
*/
    strokeWidth: 7,
    radius: 10,
    start: 0,
    end: 360*decimal_HC_complete
  });
}

Game.UpdateMenu = function() {
  if (Game.onMenu !== 'fc_menu') {
    return Game.oldUpdateMenu();
  } else {
    var menu = $('#menu').html('');
    menu.append($('<div />').addClass('section').html('Frozen Cookie'));
    var subsection = $('<div />').addClass('subsection');
    subsection.append($('<div />').addClass('title').html('Timer Tests'));
    var timers = $('<canvas id="fcTimer" width="400px" height="150px"/>').html('Your browser does not support the HTML5 canvas tag.');
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
    subsection.append($(Game.WriteButton('autobuy','autobuyButton','Autobuy ON','Autobuy OFF','')));
    subsection.append($(Game.WriteButton('autogc','autogcButton','Autoclick GC ON','Autoclick GC OFF','')));
    menu.append(subsection);
  }
}
