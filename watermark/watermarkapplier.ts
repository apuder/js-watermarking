
/// <reference path="./permutationgraph.ts" />
/// <reference path="./cyclicgraphinstructions.ts" />
/// <reference path="./cyclicgraphinserter.ts" />

module watermarkapplier {
	"use strict";

	export function apply_watermark(trace: cyclicgraphinserter.trace_stack) {
		var graph = new permutationgraph.permutationgraph(trace.watermark_num, trace.watermark_size);
		var inst = new cyclicgraphinstructions.cyclicgraphinstructions(graph)
		var inserter = new cyclicgraphinserter.cyclicgraphinserter(inst);

		var window_black_list = ['external', 'chrome', 'document', 'speechSynthesis', 'caches', 'localStorage', 'sessionStorage', 'webkitStorageInfo', 'indexedDB', 'webkitIndexedDB', 'ondeviceorientation', 'ondevicemotion', 'crypto', 'postMessage', 'blur', 'focus', 'close', 'onautocompleteerror', 'onautocomplete', 'applicationCache', 'performance', 'onunload', 'onstorage', 'onpopstate', 'onpageshow', 'onpagehide', 'ononline', 'onoffline', 'onmessage', 'onlanguagechange', 'onhashchange', 'onbeforeunload', 'onwaiting', 'onvolumechange', 'ontoggle', 'ontimeupdate', 'onsuspend', 'onsubmit', 'onstalled', 'onshow', 'onselect', 'onseeking', 'onseeked', 'onscroll', 'onresize', 'onreset', 'onratechange', 'onprogress', 'onplaying', 'onplay', 'onpause', 'onmousewheel', 'onmouseup', 'onmouseover', 'onmouseout', 'onmousemove', 'onmouseleave', 'onmouseenter', 'onmousedown', 'onloadstart', 'onloadedmetadata', 'onloadeddata', 'onload', 'onkeyup', 'onkeypress', 'onkeydown', 'oninvalid', 'oninput', 'onfocus', 'onerror', 'onended', 'onemptied', 'ondurationchange', 'ondrop', 'ondragstart', 'ondragover', 'ondragleave', 'ondragenter', 'ondragend', 'ondrag', 'ondblclick', 'oncuechange', 'oncontextmenu', 'onclose', 'onclick', 'onchange', 'oncanplaythrough', 'oncanplay', 'oncancel', 'onblur', 'onabort', 'isSecureContext', 'onwheel', 'onwebkittransitionend', 'onwebkitanimationstart', 'onwebkitanimationiteration', 'onwebkitanimationend', 'ontransitionend', 'onsearch', 'onanimationstart', 'onanimationiteration', 'onanimationend', 'styleMedia', 'defaultstatus', 'defaultStatus', 'screenTop', 'screenLeft', 'clientInformation', 'console', 'devicePixelRatio', 'outerHeight', 'outerWidth', 'screenY', 'screenX', 'pageYOffset', 'scrollY', 'pageXOffset', 'scrollX', 'innerHeight', 'innerWidth', 'screen', 'navigator', 'frameElement', 'parent', 'opener', 'top', 'length', 'frames', 'closed', 'status', 'toolbar', 'statusbar', 'scrollbars', 'personalbar', 'menubar', 'locationbar', 'history', 'location', 'name', 'self', 'window', 'stop', 'open', 'alert', 'confirm', 'prompt', 'print', 'requestAnimationFrame', 'cancelAnimationFrame', 'captureEvents', 'releaseEvents', 'getComputedStyle', 'matchMedia', 'moveTo', 'moveBy', 'resizeTo', 'resizeBy', 'getSelection', 'find', 'getMatchedCSSRules', 'webkitRequestAnimationFrame', 'webkitCancelAnimationFrame', 'webkitCancelRequestAnimationFrame', 'btoa', 'atob', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'requestIdleCallback', 'cancelIdleCallback', 'scroll', 'scrollTo', 'scrollBy', 'fetch', 'webkitRequestFileSystem', 'webkitResolveLocalFileSystemURL', 'openDatabase'];

		var code = inserter.insert(trace);

		console.log(code);

		var mime = "application/javascript";

		var bb = new Blob([code], { type: mime });

		var url = window.URL.createObjectURL(bb);

		// use any to avoid compile time errors over HTML5
		var a: any = document.createElement('a');
		a.download = trace.file_name;
		a.href = url;
		a.textContent = 'Watermark ready';

		a.dataset.downloadurl = [mime, a.download, a.href].join(':');
		a.draggable = true; // Don't really need, but good practice.

		a.style.position = 'fixed';
		a.style.left = '0px';
		a.style.top = '0px';

		document.body.appendChild(a);
	}

}