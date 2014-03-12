// ==UserScript==
// @name           Frozen Cookies
// @version        github-latest
// @description    Userscript to load Frozen Cookies written by Icehawk78
// @author         shinji257
// @homepage       https://github.com/Icehawk78/FrozenCookies
// @include        http://orteil.dashnet.org/cookieclicker/
// @updateURL      http://icehawk78.github.io/FrozenCookies/fc_userscript_loader.js
// @downloadURL    http://icehawk78.github.io/FrozenCookies/fc_userscript_loader.js
// ==/UserScript==

// Dev:       https://raw.github.com/Icehawk78/FrozenCookies/development/
// Master:    https://raw.github.com/Icehawk78/FrozenCookies/master/
// Github.io: http://icehawk78.github.io/FrozenCookies/

function LoadFrozenCookies() {
  var js = document.createElement('script');
  js.setAttribute('type', 'text/javascript');
<<<<<<< HEAD:fc_userscript_loader.user.js
  js.setAttribute('id', 'frozenCookieScript');
  js.setAttribute('src', 'https://raw.github.com/Icehawk78/FrozenCookies/master/frozen_cookies.js');
=======
  js.setAttribute('src', 'http://icehawk78.github.io/FrozenCookies/frozen_cookies.js');
>>>>>>> 4f0a801ea6edd89267fa36e0933068d39a3899b6:fc_userscript_loader.js
  document.head.appendChild(js);
}
// It's not the best way but Chrome doesn't work with addEventListener... :(
// Delay load by 2 seconds to allow the site to load itself first.)
window.setTimeout(LoadFrozenCookies, 2000);
