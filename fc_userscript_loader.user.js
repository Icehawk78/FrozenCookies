// ==UserScript==
// @name           Frozen Cookies
// @version        github-latest
// @description    Userscript to load Frozen Cookies written by Icehawk78
// @author         shinji257
// @homepage       https://github.com/Icehawk78/FrozenCookies
// @include        http://orteil.dashnet.org/cookieclicker/
// @updateURL      https://rawgithub.com/Icehawk78/FrozenCookies/master/fc_userscript_loader.js
// @downloadURL    https://rawgithub.com/Icehawk78/FrozenCookies/master/fc_userscript_loader.js
// @run-at         document-start
// ==/UserScript==

// Dev:       https://www.github.com/Icehawk78/FrozenCookies/development/
// Master:    https://www.github.com/Icehawk78/FrozenCookies/master/
// Github.io: http://icehawk78.github.io/FrozenCookies/

function LoadFrozenCookies() {
  var js = document.createElement('script');
  js.setAttribute('type', 'text/javascript');
  js.setAttribute('id', 'frozenCookieScript');
  js.setAttribute('src', 'https://rawgithub.com/Icehawk78/FrozenCookies/master/frozen_cookies.js');
  document.head.appendChild(js);
}

window.addEventListener("load", LoadFrozenCookies, false);
