var frozenCookieButton = "<div id='fcButton' class='button' style='font-size:60%;' onclick=\"function(){Game.ShowMenu('fc_menu');}\">Frozen Cookie</div>";
var fcButton = document.createElement('div');
$(fcButton).addClass('button')
  .html('Frozen Cookie')
  .appendTo($("#comments"))
  .click(function(){
    Game.ShowMenu('fc_menu');
  });

var fcStyle = document.createElement('style');
$(fcStyle).type('text/css')
  .html('#fcButton { font-size: 60%; top: 0px; right: -16px; padding-top: 14px; padding-right: 16px; padding-bottom: 10px; padding-left: 0px; } #fcButton:hover { right: -8px; }')
  .appendTo($('head'));

Game.oldUpdateMenu = Game.UpdateMenu;

Game.UpdateMenu = function()
{
	if (Game.onMenu !== 'fc_menu') {
		return Game.oldUpdateMenu();
  } else {
    return "<div class='section'>Frozen Cookie</div>";
  }
}
