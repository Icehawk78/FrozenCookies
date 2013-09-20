var fcButton = document.createElement('div');
$(fcButton).addClass('button')
  .html('Frozen Cookie')
  .appendTo($("#comments"))
  .click(function(){
    Game.ShowMenu('fc_menu');
  });

Game.oldUpdateMenu = Game.UpdateMenu;

Game.UpdateMenu = function() {
  if (Game.onMenu !== 'fc_menu') {
    return Game.oldUpdateMenu();
  } else {
    $('#menu').html("<div class='section'>Frozen Cookie</div>");
  }
}
