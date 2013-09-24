// ==UserScript==
// @name           Frozen Cookies
// @version        github-latest
// @description    Userscript to load Frozen Cookies written by Icehawk78
// @author         shinji257
// @homepage       https://github.com/Icehawk78/FrozenCookies
// @include        http://orteil.dashnet.org/cookieclicker/
// @updateURL      https://raw.github.com/Icehawk78/FrozenCookies/master/fc_userscript_loader.js
// @downloadURL    https://raw.github.com/Icehawk78/FrozenCookies/master/fc_userscript_loader.js
// ==/UserScript==

function LoadFrozenCookies() {
  var js = document.createElement('script');
  js.setAttribute('type', 'text/javascript');
  js.setAttribute('src', 'https://raw.github.com/Icehawk78/FrozenCookies/master/frozen_cookies.js');
  document.head.appendChild(js);
 }
 window.addEventListener("load", LoadFrozenCookies, false);
