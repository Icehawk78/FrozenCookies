// ==UserScript==
// @name           Frozen Cookies
// @version        github-latest
// @description    Userscript to load Frozen Cookies written by Icehawk78, forked by Lordshinjo
// @author         Lordshinjo
// @homepage       https://github.com/Lordshinjo/FrozenCookies
// @include        http://orteil.dashnet.org/cookieclicker/
// @updateURL      https://rawgit.com/Lordshinjo/FrozenCookies/master/fc_userscript_loader.js
// @downloadURL    https://rawgit.com/Lordshinjo/FrozenCookies/master/fc_userscript_loader.js
// @run-at         document-start
// ==/UserScript==

// Dev:       https://github.com/Lordshinjo/FrozenCookies/development/
// Master:    https://github.com/Lordshinjo/FrozenCookies/master/
// Github.io: http://lordshinjo.github.io/FrozenCookies/

function LoadFrozenCookies() {
    Game.LoadMod('https://rawgit.com/hnns88/FrozenCookies/master/frozen_cookies.js');
}

window.addEventListener("load", LoadFrozenCookies, false);
