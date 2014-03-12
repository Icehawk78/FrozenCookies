// Global Variables
var scriptElement = document.getElementById( 'frozenCookieScript' ),
	baseUrl = scriptElement !== null ?
		scriptElement.getAttribute('src').replace(/\/frozen_cookies\.js$/, '') :
		'https://raw.github.com/Icehawk78/FrozenCookies/master',
	FrozenCookies = {
		'baseUrl': baseUrl,
		'branch' : 'M',
		'version': 1.0412
	};

// Load external libraries
FrozenCookies.loadInterval = setInterval(function() {
  if (Game && Game.ready) {
    clearInterval(FrozenCookies.loadInterval);
    FrozenCookies.loadInterval = 0;
    fcInit();
  }
}, 1000);

function fcInit() {
  var done = 0,
    script_list = [
      '//ajax.googleapis.com/ajax/libs/jqueryui/1.10.4/jquery-ui.min.js',
      '//ajax.googleapis.com/ajax/libs/jqueryui/1.10.4/themes/smoothness/jquery-ui.css',
      '//cdn.jsdelivr.net/underscorejs/1.6.0/underscore-min.js',
      '//cdn.jsdelivr.net/jqplot/1.0.8/jquery.jqplot.min.js',
      '//cdn.jsdelivr.net/jqplot/1.0.8/jquery.jqplot.min.css',
      '//cdn.jsdelivr.net/jquery.jcanvas/13.04.26/jcanvas.min.js',
      '//cdn.jsdelivr.net/jqplot/1.0.8/plugins/jqplot.canvasTextRenderer.min.js',
      '//cdn.jsdelivr.net/jqplot/1.0.8/plugins/jqplot.canvasAxisLabelRenderer.min.js',
      '//cdn.jsdelivr.net/jqplot/1.0.8/plugins/jqplot.categoryAxisRenderer.min.js',
      FrozenCookies.baseUrl + '/cc_upgrade_prerequisites.js',
      FrozenCookies.baseUrl + '/fc_main.js',
      FrozenCookies.baseUrl + '/fc_button.js'
    ],
    jquery = document.createElement('script');

  jquery.setAttribute('type', 'text/javascript');
  jquery.setAttribute('src', '//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js');
  jquery.onload = function() {
    script_list.forEach(function(url,id){
      var wasteful = Date.now();
      do {wasteful = Date.now();} while (id < done);
      if (/\.js/.exec(url)) {
        $.getScript(url,function() {
          done++;
          if (done>=script_list.length)
          {
            setOverrides();
            FCStart();
          }
        });
      } else if (/\.css$/.exec(url)) {
        $('<link>').attr({rel: 'stylesheet', type: 'text/css', href: url}).appendTo($('head'));
        done++;
      }
    });
  };
  document.head.appendChild(jquery);
}
