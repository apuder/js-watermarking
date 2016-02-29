
var input_size;

function find_watermark(e) {
	if (!input_size) {
		console.error("size input not found");
		return;
	}
	// var exec_code = code;
	// exec_code += "console.log(\"Looking for watermarks of size " + input_size.value + "\");\n"
	// exec_code += "permutationgraph.permutationgraph.findnums(" + input_size.value + ");\n";

	var pjsurl = chrome.extension.getURL("permutationgraph.js");

	exec_code = 'var script = document.createElement("script");\n';
	exec_code+= 'script.src = "' + pjsurl + '";\n';
	exec_code+= 'script.onload = function() {\n';
	exec_code+= '	var script = document.createElement("script");\n';
	exec_code+= '	script.text = \"console.log(\\"Looking for watermarks of size ' + input_size.value + '\\");\\n';
	exec_code+= '		permutationgraph.permutationgraph.findnums(window, ' + input_size.value + ', ' + "['permutationgraph', 'external', 'chrome', 'document', 'speechSynthesis', 'caches', 'localStorage', 'sessionStorage', 'webkitStorageInfo', 'indexedDB', 'webkitIndexedDB', 'ondeviceorientation', 'ondevicemotion', 'crypto', 'postMessage', 'blur', 'focus', 'close', 'onautocompleteerror', 'onautocomplete', 'applicationCache', 'performance', 'onunload', 'onstorage', 'onpopstate', 'onpageshow', 'onpagehide', 'ononline', 'onoffline', 'onmessage', 'onlanguagechange', 'onhashchange', 'onbeforeunload', 'onwaiting', 'onvolumechange', 'ontoggle', 'ontimeupdate', 'onsuspend', 'onsubmit', 'onstalled', 'onshow', 'onselect', 'onseeking', 'onseeked', 'onscroll', 'onresize', 'onreset', 'onratechange', 'onprogress', 'onplaying', 'onplay', 'onpause', 'onmousewheel', 'onmouseup', 'onmouseover', 'onmouseout', 'onmousemove', 'onmouseleave', 'onmouseenter', 'onmousedown', 'onloadstart', 'onloadedmetadata', 'onloadeddata', 'onload', 'onkeyup', 'onkeypress', 'onkeydown', 'oninvalid', 'oninput', 'onfocus', 'onerror', 'onended', 'onemptied', 'ondurationchange', 'ondrop', 'ondragstart', 'ondragover', 'ondragleave', 'ondragenter', 'ondragend', 'ondrag', 'ondblclick', 'oncuechange', 'oncontextmenu', 'onclose', 'onclick', 'onchange', 'oncanplaythrough', 'oncanplay', 'oncancel', 'onblur', 'onabort', 'isSecureContext', 'onwheel', 'onwebkittransitionend', 'onwebkitanimationstart', 'onwebkitanimationiteration', 'onwebkitanimationend', 'ontransitionend', 'onsearch', 'onanimationstart', 'onanimationiteration', 'onanimationend', 'styleMedia', 'defaultstatus', 'defaultStatus', 'screenTop', 'screenLeft', 'clientInformation', 'console', 'devicePixelRatio', 'outerHeight', 'outerWidth', 'screenY', 'screenX', 'pageYOffset', 'scrollY', 'pageXOffset', 'scrollX', 'innerHeight', 'innerWidth', 'screen', 'navigator', 'frameElement', 'parent', 'opener', 'top', 'length', 'frames', 'closed', 'status', 'toolbar', 'statusbar', 'scrollbars', 'personalbar', 'menubar', 'locationbar', 'history', 'location', 'name', 'self', 'window', 'stop', 'open', 'alert', 'confirm', 'prompt', 'print', 'requestAnimationFrame', 'cancelAnimationFrame', 'captureEvents', 'releaseEvents', 'getComputedStyle', 'matchMedia', 'moveTo', 'moveBy', 'resizeTo', 'resizeBy', 'getSelection', 'find', 'getMatchedCSSRules', 'webkitRequestAnimationFrame', 'webkitCancelAnimationFrame', 'webkitCancelRequestAnimationFrame', 'btoa', 'atob', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'requestIdleCallback', 'cancelIdleCallback', 'scroll', 'scrollTo', 'scrollBy', 'fetch', 'webkitRequestFileSystem', 'webkitResolveLocalFileSystemURL', 'openDatabase', 'TEMPORARY', 'PERSISTENT', 'addEventListener', 'removeEventListener', 'dispatchEvent']" + ');\";\n';
	exec_code+= '	document.body.appendChild(script);\n';
	exec_code+= '}\n';
	exec_code+= 'document.head.appendChild(script);';

	chrome.tabs.executeScript(null,
		{	code: exec_code,
			allFrames: true	}
		// function(results) {
			// var html_nums = document.getElementById("numList");
			// if (results && typeof results === 'object') {
			// 	for (var i in results) {
			// 		var result = results[i];
			// 		if (result && typeof result === 'object' && result.length) {
			// 			for (var k = 0; k < result.length; k++) {
			// 				var num = result[k];
			// 				var num_item = document.createElement("li");
			// 				num_item.innerHTML = num;
			// 				html_nums.appendChild(num_item);
			// 			}
			// 		}
			// 	}
			// }
		// }
		);
}

document.addEventListener('DOMContentLoaded', function () {
  var inputs = document.querySelectorAll('input');
  for (var i = 0; i < inputs.length; i++) {
  	if (inputs[i].type === 'number' && inputs[i].name === 'size')
  		input_size = inputs[i];
  	else if (inputs[i].type === 'button' && inputs[i].name === 'find')
    	inputs[i].addEventListener('click', find_watermark);
  }
});
