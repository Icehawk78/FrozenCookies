// ==UserScript==
// @name           Frozen Cookies
// @version        github-latest
// @description    Userscript to load Frozen Cookies written by Icehawk78, forked by Lordshinjo
// @author         Lordshinjo
// @homepage       https://github.com/Lordshinjo/FrozenCookies
// @include        http://orteil.dashnet.org/cookieclicker/
// @updateURL      https://rawgithub.com/Lordshinjo/FrozenCookies/master/fc_userscript_loader.js
// @downloadURL    https://rawgithub.com/Lordshinjo/FrozenCookies/master/fc_userscript_loader.js
// @run-at         document-start
// ==/UserScript==

// Dev:       https://raw.github.com/Lordshinjo/FrozenCookies/development/
// Master:    https://raw.github.com/Lordshinjo/FrozenCookies/master/
// Github.io: http://lordshinjo.github.io/FrozenCookies/

function LoadFrozenCookies() {
    Game.LoadMod('https://rawgit.com/Lordshinjo/FrozenCookies/master/frozen_cookies.js');
}

window.addEventListener("load", LoadFrozenCookies, false);
