// Global Variables
var lastCompatibleVersion = 2.031;
if (Game.version > lastCompatibleVersion) {
  console.log(
    "WARNING: The Cookie Clicker version is newer than this version of Frozen Cookies."
  );
  console.log(
    "This version of Frozen Cookies has only been tested through Cookie Clicker version " +
      lastCompatibleVersion
  );
  console.log(
    "There may be incompatibilities, undesirable effects, bugs, shifts in reality, immoral behavior, and who knows what else."
  );
}

var scriptElement =
  document.getElementById("frozenCookieScript") !== null
    ? document.getElementById("frozenCookieScript")
    : document.getElementById("modscript_frozen_cookies");
var baseUrl =  scriptElement !== null
    ? scriptElement.getAttribute("src").replace(/\/frozen_cookies\.js$/, "")
    : "https://icehawk78.github.io/FrozenCookies/";
var FrozenCookies = {
  baseUrl: baseUrl,
  branch: "Main-",
  version: "2.0.0",
};

// Load external libraries
var script_list = [
  "https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js",
  "https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/themes/smoothness/jquery-ui.css",
  "https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.3/underscore-min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/jcanvas/20.1.1/min/jcanvas.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/jqPlot/1.0.9/jquery.jqplot.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/jqPlot/1.0.9/jquery.jqplot.min.css",
  "https://cdnjs.cloudflare.com/ajax/libs/jqPlot/1.0.9/plugins/jqplot.canvasTextRenderer.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/jqPlot/1.0.9/plugins/jqplot.canvasAxisLabelRenderer.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/jqPlot/1.0.9/plugins/jqplot.canvasAxisTickRenderer.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/jqPlot/1.0.9/plugins/jqplot.trendline.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/jqPlot/1.0.9/plugins/jqplot.highlighter.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/jqPlot/1.0.9/plugins/jqplot.logAxisRenderer.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/jqPlot/1.0.9/plugins/jqplot.cursor.min.js",
  FrozenCookies.baseUrl + "/fc_preferences.js",
  FrozenCookies.baseUrl + "/cc_upgrade_prerequisites.js",
  FrozenCookies.baseUrl + "/fc_main.js",
  FrozenCookies.baseUrl + "/fc_button.js",
  FrozenCookies.baseUrl + "/fc_spellpredict.js",
  FrozenCookies.baseUrl + "/fc_infobox.js",
];

FrozenCookies.loadInterval = setInterval(function () {
  if (Game && Game.ready) {
    clearInterval(FrozenCookies.loadInterval);
    FrozenCookies.loadInterval = 0;
    fcInit();
  }
}, 1000);

function loadScript(id) {
  if (id >= script_list.length) {
    registerMod("frozen_cookies"); // when the mod is registered, the save data is passed in the load function
  } else {
    var url = script_list[id];
    if (/\.js$/.exec(url)) {
      $.getScript(url, function () {
        loadScript(id + 1);
      });
    } else if (/\.css$/.exec(url)) {
      $("<link>")
        .attr({
          rel: "stylesheet",
          type: "text/css",
          href: url,
        })
        .appendTo($("head"));
      loadScript(id + 1);
    } else {
      console.log("Error loading script: " + url);
      loadScript(id + 1);
    }
  }
}

function fcInit() {
  var jquery = document.createElement("script");
  jquery.setAttribute("type", "text/javascript");
  jquery.setAttribute("src", "https://code.jquery.com/jquery-3.6.0.min.js");
  jquery.setAttribute(
    "integrity",
    "sha256-/xUj+3OJU5yExlq6GSYGSHk7tPXikynS7ogEvDej/m4="
  );
  jquery.setAttribute("crossorigin", "anonymous");
  jquery.onload = function () {
    loadScript(0);
  };
  document.head.appendChild(jquery);
}
