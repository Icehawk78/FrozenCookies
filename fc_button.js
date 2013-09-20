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
    $('#menu').html("<div class='section'>Frozen Cookie</div>");
  }
}
