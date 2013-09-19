javascript:(
	function () {
		var js = document.createElement('script');
		js.setAttribute('type', 'text/javascript');
		js.setAttribute('src', 'https://github.com/Icehawk78/FrozenCookies/blob/master/frozen_cookies.js');
     	document.head.appendChild(js);
    
		var frozenCookieButton = document.createElement('div');
		frozenCookieButton.setAttribute('id', 'fcButton');
		frozenCookieButton.setAttribute('class', 'button');
		frozenCookieButton.setAttribute('style', 'font-size: 60%;');
		frozenCookieButton.innerHTML = "Frozen Cookie";
		document.getElementById('comments').insertBefore(frozenCookieButton, document.getElementById('logButton'));

		var frozenCookieCSS = document.createElement('style');
		frozenCookieCSS.setAttribute('type', 'text/css');
		frozenCookieCSS.innerHTML = '#fcButton { font-size: 60%; top: 0px; right: -16px; padding-top: 14px; padding-right: 16px; padding-bottom: 10px; padding-left: 0px; } #fcButton:hover { right: -8px; }';

		document.getElementsByTagName('head')[0].appendChild(frozenCookieCSS);

		l('fcButton').onclick=function(){Game.ShowMenu('fcMenu');};
   
   }()
);
