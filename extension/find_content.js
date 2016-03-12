
var appended_script = false;

window.addEventListener("message", function(event) {
  // We only accept messages from ourselves
  if (event.source != window)
    return;

  if (event.data.type && (event.data.type == "jsw_found_watermark")) {
    // console.log("Content script received: " + event.data.text);
    chrome.runtime.sendMessage({from: "jsw_find_content", method: "storeNums", arg: event.data.text});
  }
}, false);

var input_size;

function find_watermark() {
  // remove script node if present
  var cdw = document.getElementById("jsw_call_do_find_watermark");
  if (cdw) cdw.parentNode.removeChild(cdw);

  // add node to call do_find_watermark with input_size
  var script = document.createElement("script");
	script.id = "jsw_call_do_find_watermark";
	script.text = "console.log('Looking for watermarks of size " + input_size + "');\n"
				+ "find_watermark(window, " + input_size + ", ['permutationgraph', 'cycles', 'find_watermark', 'external', 'chrome', 'document', 'speechSynthesis', 'caches', 'localStorage', 'sessionStorage', 'webkitStorageInfo', 'indexedDB', 'webkitIndexedDB', 'ondeviceorientation', 'ondevicemotion', 'crypto', 'postMessage', 'blur', 'focus', 'close', 'onautocompleteerror', 'onautocomplete', 'applicationCache', 'performance', 'onunload', 'onstorage', 'onpopstate', 'onpageshow', 'onpagehide', 'ononline', 'onoffline', 'onmessage', 'onlanguagechange', 'onhashchange', 'onbeforeunload', 'onwaiting', 'onvolumechange', 'ontoggle', 'ontimeupdate', 'onsuspend', 'onsubmit', 'onstalled', 'onshow', 'onselect', 'onseeking', 'onseeked', 'onscroll', 'onresize', 'onreset', 'onratechange', 'onprogress', 'onplaying', 'onplay', 'onpause', 'onmousewheel', 'onmouseup', 'onmouseover', 'onmouseout', 'onmousemove', 'onmouseleave', 'onmouseenter', 'onmousedown', 'onloadstart', 'onloadedmetadata', 'onloadeddata', 'onload', 'onkeyup', 'onkeypress', 'onkeydown', 'oninvalid', 'oninput', 'onfocus', 'onerror', 'onended', 'onemptied', 'ondurationchange', 'ondrop', 'ondragstart', 'ondragover', 'ondragleave', 'ondragenter', 'ondragend', 'ondrag', 'ondblclick', 'oncuechange', 'oncontextmenu', 'onclose', 'onclick', 'onchange', 'oncanplaythrough', 'oncanplay', 'oncancel', 'onblur', 'onabort', 'isSecureContext', 'onwheel', 'onwebkittransitionend', 'onwebkitanimationstart', 'onwebkitanimationiteration', 'onwebkitanimationend', 'ontransitionend', 'onsearch', 'onanimationstart', 'onanimationiteration', 'onanimationend', 'styleMedia', 'defaultstatus', 'defaultStatus', 'screenTop', 'screenLeft', 'clientInformation', 'console', 'devicePixelRatio', 'outerHeight', 'outerWidth', 'screenY', 'screenX', 'pageYOffset', 'scrollY', 'pageXOffset', 'scrollX', 'innerHeight', 'innerWidth', 'screen', 'navigator', 'frameElement', 'parent', 'opener', 'top', 'length', 'frames', 'closed', 'status', 'toolbar', 'statusbar', 'scrollbars', 'personalbar', 'menubar', 'locationbar', 'history', 'location', 'name', 'self', 'window', 'stop', 'open', 'alert', 'confirm', 'prompt', 'print', 'requestAnimationFrame', 'cancelAnimationFrame', 'captureEvents', 'releaseEvents', 'getComputedStyle', 'matchMedia', 'moveTo', 'moveBy', 'resizeTo', 'resizeBy', 'getSelection', 'find', 'getMatchedCSSRules', 'webkitRequestAnimationFrame', 'webkitCancelAnimationFrame', 'webkitCancelRequestAnimationFrame', 'btoa', 'atob', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'requestIdleCallback', 'cancelIdleCallback', 'scroll', 'scrollTo', 'scrollBy', 'fetch', 'webkitRequestFileSystem', 'webkitResolveLocalFileSystemURL', 'openDatabase', 'TEMPORARY', 'PERSISTENT', 'addEventListener', 'removeEventListener', 'dispatchEvent']);\n";
  script.onload = find_watermark;
	document.body.appendChild(script);
}

function append_find_watermark_code() {
	// add script to document if not already present
	if (!document.getElementById("jsw_find_watermark")) {
		// insert find_watermark.js into the page
		var jsurl = chrome.extension.getURL("find_watermark.js");

		var script = document.createElement("script");
		script.id = "jsw_find_watermark";
		script.src = jsurl;
		script.onload = find_watermark;
		document.head.appendChild(script);
	}
  appended_script = true;
}

chrome.runtime.onMessage.addListener(function (msg, sender, response) {
  if (msg.from === 'jsw_background') {
  	if (msg.method === 'check_find_content_loaded') {
  		// content script loaded in this page
  		response(true);
  	}
  	else if (msg.method === 'find_watermarks') {
	    input_size = msg.watermark_size;

	    if (!appended_script) {
	      append_find_watermark_code();
	    }
	    else {
	      find_watermark();
	    }
	  }
	}
});