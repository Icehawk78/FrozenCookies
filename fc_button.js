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

Game.UpdateMenu = function() {
  if (Game.onMenu !== 'fc_menu') {
    return Game.oldUpdateMenu();
  } else {
    var menu = $('#menu').html('');
    menu.append($('<div />').addClass('section').html('Frozen Cookie'));
    var subsection = $('<div />').addClass('subsection');
    subsection.append($('<div />').addClass('title').html('Autobuy Information'));
    var recommendation = nextPurchase();
    var store = (recommendation.type == 'building') ? Game.ObjectsById : Game.UpgradesById;
    var purchase = store[recommendation.id];
    subsection.append($('<div />').addClass('listing').html('Next Purchase: ' + purchase.name));
    subsection.append($('<div />').addClass('listing').html('Cost: ' + Beautify(recommendation.cost)));
    subsection.append($('<div />').addClass('listing').html('Golden Cookie Bank: ' + Beautify(delayAmount())));
    subsection.append($('<div />').addClass('listing').html('Base &#916; CPS: ' + Beautify(recommendation.base_delta_cps)));
    subsection.append($('<div />').addClass('listing').html('Full &#916; CPS: ' + Beautify(recommendation.delta_cps)));
    subsection.append($('<div />').addClass('listing').html('Purchase ROI: ' + Beautify(recommendation.roi)));
    subsection.append($('<div />').addClass('listing').html('Golden Cookie ROI: ' + Beautify(gcRoi())));
    subsection.append($('<div />').addClass('listing').html('Cost: ' + Beautify(recommendation.cost)));
    subsection.append($('<div />').addClass('listing').html('Cost: ' + Beautify(recommendation.cost)));
    menu.append(subsection);
    var subsection = $('<div />').addClass('subsection');
    subsection.append($('<div />').addClass('title').html('Golden Cookie Information'));
    subsection.append($('<div />').addClass('listing').html('Current Average Cookie Value: ' + Beautify(weightedCookieValue(true))));
    subsection.append($('<div />').addClass('listing').html('Max Average Cookie Value: ' + Beautify(weightedCookieValue())));
    subsection.append($('<div />').addClass('listing').html('Max Lucky Cookie Value: ' + Beautify(maxLuckyValue())));
    subsection.append($('<div />').addClass('listing').html('Estimated Cookie CPS: ' + Beautify(gcPs(weightedCookieValue(true)))));
    menu.append(subsection);
    var subsection = $('<div />').addClass('subsection');
    subsection.append($('<div />').addClass('title').html('Heavenly Chips Information'));
    subsection.append($('<div />').addClass('listing').html('HC After Reset: ' + Beautify(Game.HowMuchPrestige(Game.cookiesReset+Game.cookiesEarned))));
    subsection.append($('<div />').addClass('listing').html('Estimated time to next HC: ' + nextHC()));
    menu.append(subsection);
  }
}
