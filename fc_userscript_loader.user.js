// ==UserScript==
// @name           Frozen Cookies
// @version        github-latest
// @description    Userscript to load Frozen Cookies written by Icehawk78, forked by haerik
// @author         shinji257
// @homepage       https://github.com/Icehawk78/FrozenCookies
// @include        http://orteil.dashnet.org/cookieclicker/
// @updateURL      https://rawgithub.com/haerik/FrozenCookies/master/fc_userscript_loader.js
// @downloadURL    https://rawgithub.com/haerik/FrozenCookies/master/fc_userscript_loader.js
// @run-at         document-start
// ==/UserScript==

// Dev:       https://raw.github.com/Icehawk78/FrozenCookies/development/
// Master:    https://raw.github.com/Icehawk78/FrozenCookies/master/
// Github.io: http://icehawk78.github.io/FrozenCookies/
// Change URL to point to haerik's fork... remove download/update urls...

function LoadFrozenCookies() {
  var js = document.createElement('script');
  js.setAttribute('type', 'text/javascript');
  js.setAttribute('id', 'frozenCookieScript');
  js.setAttribute('src', 'https://rawgithub.com/haerik/FrozenCookies/master/frozen_cookies.js');
  document.head.appendChild(js);
}

window.addEventListener("load", LoadFrozenCookies, false);
