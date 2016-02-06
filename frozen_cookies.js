// Global Variables
var scriptElement = document.getElementById( 'frozenCookieScript' );
var version_list = [1.0466, 1.0501, 1.9, 1.905];
var v_index = version_list.findIndex(function(i){return Game.version == i});
var load_version = v_index == -1 ? version_list[version_list.length - 1] : version_list[v_index];
var baseUrl = (scriptElement !== null ? scriptElement.getAttribute('src').replace(/\/frozen_cookies\.js$/, '/') : 'http://icehawk78.github.io/FrozenCookies/') + load_version;
var FrozenCookies = {
	'baseUrl': baseUrl,
	'branch' : 'Σ',
	'version': '1.9.3'
};

// Load external libraries
var script_list = [
    '//ajax.googleapis.com/ajax/libs/jqueryui/1.10.4/jquery-ui.min.js',
    '//ajax.googleapis.com/ajax/libs/jqueryui/1.10.4/themes/smoothness/jquery-ui.css',
    '//cdn.jsdelivr.net/underscorejs/1.6.0/underscore-min.js',
    '//cdn.jsdelivr.net/jquery.jcanvas/13.04.26/jcanvas.min.js',
    '//cdn.jsdelivr.net/jqplot/1.0.8/jquery.jqplot.min.js',
    '//cdn.jsdelivr.net/jqplot/1.0.8/jquery.jqplot.min.css',
    '//cdn.jsdelivr.net/jqplot/1.0.8/plugins/jqplot.canvasTextRenderer.min.js',
    '//cdn.jsdelivr.net/jqplot/1.0.8/plugins/jqplot.canvasAxisLabelRenderer.min.js',
    '//cdn.jsdelivr.net/jqplot/1.0.8/plugins/jqplot.canvasAxisTickRenderer.min.js',
    '//cdn.jsdelivr.net/jqplot/1.0.8/plugins/jqplot.trendline.min.js',
    '//cdn.jsdelivr.net/jqplot/1.0.8/plugins/jqplot.highlighter.min.js',
    '//cdn.jsdelivr.net/jqplot/1.0.8/plugins/jqplot.logAxisRenderer.min.js',
    '//cdn.jsdelivr.net/jqplot/1.0.8/plugins/jqplot.cursor.min.js',
    FrozenCookies.baseUrl + '/cc_upgrade_prerequisites.js',
    FrozenCookies.baseUrl + '/fc_main.js',
    FrozenCookies.baseUrl + '/fc_button.js'
  ]
  
FrozenCookies.loadInterval = setInterval(function() {
  if (Game && Game.ready) {
    clearInterval(FrozenCookies.loadInterval);
    FrozenCookies.loadInterval = 0;
    fcInit();
  }
}, 1000);

function loadScript(id) {
  if (id >= script_list.length) {
    setOverrides();
    FCStart();
  } else { 
    var url = script_list[id];
    if (/\.js$/.exec(url)) {
      $.getScript(url, function() {loadScript(id + 1);});
    } else if (/\.css$/.exec(url)) {
      $('<link>').attr({rel: 'stylesheet', type: 'text/css', href: url}).appendTo($('head'));
      loadScript(id + 1);
    } else {
      console.log('Error loading script: ' + url);
      loadScript(id + 1);
    }
  }
}

function fcInit() {
  var jquery = document.createElement('script');
  jquery.setAttribute('type', 'text/javascript');
  jquery.setAttribute('src', '//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js');
  jquery.onload = function() {loadScript(0);};
  document.head.appendChild(jquery);
}
