
var nums = null;

window.addEventListener("message", function(event) {
  // We only accept messages from ourselves
  if (event.source != window)
    return;

  if (event.data.type && (event.data.type == "jsw_found_watermark")) {
    // console.log("Content script received: " + event.data.text);
    nums = JSON.parse(event.data.text);
  }
}, false);

function find_watermark(input_size) {
	// insert find_watermark.js into the page
	var jsurl = chrome.extension.getURL("find_watermark.js");

	var script = document.createElement("script");
	script.src = jsurl;
	script.onload = function() {
		var script = document.createElement("script");
		script.text = "console.log('Looking for watermarks of size " + input_size + "');\n"
					+ "find_watermark(window, " + input_size + ", ['permutationgraph', 'cycles', 'find_watermark', 'external', 'chrome', 'document', 'speechSynthesis', 'caches', 'localStorage', 'sessionStorage', 'webkitStorageInfo', 'indexedDB', 'webkitIndexedDB', 'ondeviceorientation', 'ondevicemotion', 'crypto', 'postMessage', 'blur', 'focus', 'close', 'onautocompleteerror', 'onautocomplete', 'applicationCache', 'performance', 'onunload', 'onstorage', 'onpopstate', 'onpageshow', 'onpagehide', 'ononline', 'onoffline', 'onmessage', 'onlanguagechange', 'onhashchange', 'onbeforeunload', 'onwaiting', 'onvolumechange', 'ontoggle', 'ontimeupdate', 'onsuspend', 'onsubmit', 'onstalled', 'onshow', 'onselect', 'onseeking', 'onseeked', 'onscroll', 'onresize', 'onreset', 'onratechange', 'onprogress', 'onplaying', 'onplay', 'onpause', 'onmousewheel', 'onmouseup', 'onmouseover', 'onmouseout', 'onmousemove', 'onmouseleave', 'onmouseenter', 'onmousedown', 'onloadstart', 'onloadedmetadata', 'onloadeddata', 'onload', 'onkeyup', 'onkeypress', 'onkeydown', 'oninvalid', 'oninput', 'onfocus', 'onerror', 'onended', 'onemptied', 'ondurationchange', 'ondrop', 'ondragstart', 'ondragover', 'ondragleave', 'ondragenter', 'ondragend', 'ondrag', 'ondblclick', 'oncuechange', 'oncontextmenu', 'onclose', 'onclick', 'onchange', 'oncanplaythrough', 'oncanplay', 'oncancel', 'onblur', 'onabort', 'isSecureContext', 'onwheel', 'onwebkittransitionend', 'onwebkitanimationstart', 'onwebkitanimationiteration', 'onwebkitanimationend', 'ontransitionend', 'onsearch', 'onanimationstart', 'onanimationiteration', 'onanimationend', 'styleMedia', 'defaultstatus', 'defaultStatus', 'screenTop', 'screenLeft', 'clientInformation', 'console', 'devicePixelRatio', 'outerHeight', 'outerWidth', 'screenY', 'screenX', 'pageYOffset', 'scrollY', 'pageXOffset', 'scrollX', 'innerHeight', 'innerWidth', 'screen', 'navigator', 'frameElement', 'parent', 'opener', 'top', 'length', 'frames', 'closed', 'status', 'toolbar', 'statusbar', 'scrollbars', 'personalbar', 'menubar', 'locationbar', 'history', 'location', 'name', 'self', 'window', 'stop', 'open', 'alert', 'confirm', 'prompt', 'print', 'requestAnimationFrame', 'cancelAnimationFrame', 'captureEvents', 'releaseEvents', 'getComputedStyle', 'matchMedia', 'moveTo', 'moveBy', 'resizeTo', 'resizeBy', 'getSelection', 'find', 'getMatchedCSSRules', 'webkitRequestAnimationFrame', 'webkitCancelAnimationFrame', 'webkitCancelRequestAnimationFrame', 'btoa', 'atob', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'requestIdleCallback', 'cancelIdleCallback', 'scroll', 'scrollTo', 'scrollBy', 'fetch', 'webkitRequestFileSystem', 'webkitResolveLocalFileSystemURL', 'openDatabase', 'TEMPORARY', 'PERSISTENT', 'addEventListener', 'removeEventListener', 'dispatchEvent']);";
		document.body.appendChild(script);
	}
	document.head.appendChild(script);
}

chrome.runtime.onMessage.addListener(function (msg, sender, response) {
  if (msg.from === 'jsw_popup' && msg.subject === 'find_watermarks') {
    var input_size = msg.watermark_size;

    find_watermark(input_size);

    response();
  }
});

chrome.runtime.onMessage.addListener(function (msg, sender, response) {
  if (msg.from === 'jsw_popup' && msg.subject === 'poll_watermarks') {
    // send nums along
    response(nums);
  }
});

chrome.runtime.onMessage.addListener(function (msg, sender, response) {
  if (msg.from === 'jsw_popup' && msg.subject === 'cleanup') {
    // reset nums to null
    nums = null;
  }
});