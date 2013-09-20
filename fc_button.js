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
  var canvas = $('#fcTimer');
  canvas.jCanvas({
    x: 50, y: 50,
    radius: 40
  })
  .drawArc({
    strokeStyle: '#AAA',
    strokeWidth: 10,
  })
  .drawArc({
    strokeStyle: '#FFF',
    strokeWidth: 10,
    start: 0,
    end: (360 * gc_delay)
  })
  .drawArc({
    strokeStyle: 'red',
    strokeWidth: 5,
    start: 0,
    end: (360 * frenzy_delay)
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
    var timers = $('<canvas id="fcTimer" width="100%" height="100px"/>').html('Your browser does not support the HTML5 canvas tag.');
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
    subsection.append($('<div />').addClass('listing').html('<b>HC After Reset:</b> ' + Beautify(Game.HowMuchPrestige(Game.cookiesReset+Game.cookiesEarned))));
    if (Game.cookiesPs > 0) {
      subsection.append($('<div />').addClass('listing').html('<b>Estimated time to next HC:</b> ' + nextHC()));
    }
    menu.append(subsection);
  }
}
