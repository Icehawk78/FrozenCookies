// ==UserScript==
// @name           Frozen Cookies
// @version        github-latest
// @description    Userscript to load Frozen Cookies written by Icehawk78, forked by Lordshinjo
// @author         Lordshinjo
// @homepage       https://github.com/Mtarnuhal/FrozenCookies
// @include        http://orteil.dashnet.org/cookieclicker/
// @include        https://orteil.dashnet.org/cookieclicker/
// @updateURL      https://mtarnuhal.github.io/FrozenCookies/fc_userscript_loader.user.js
// @downloadURL    https://mtarnuhal.github.io/FrozenCookies/fc_userscript_loader.user.js
// ==/UserScript==

// Dev:       https://github.com/Mtarnuhal/FrozenCookies/development/
// Master:    https://github.com/Mtarnuhal/FrozenCookies/master/
// Github.io: http://lordshinjo.github.io/FrozenCookies/

var loadInterval = setInterval(function() {
  const Game = unsafeWindow.Game;
    if (Game && Game.ready) {
      clearInterval(loadInterval);
      Game.LoadMod('https://mtarnuhal.github.io/FrozenCookies/frozen_cookies.js');
    }
}, 1000);
