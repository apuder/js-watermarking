
getScript(url) {
	var xmlhttp;
	xmlhttp = new XMLHttpRequest();
	xmlhttp.open('GET', url, false);
	xmlhttp.send();
	return xmlhttp.responseText;
}

getScriptURLS() {
	var scripturls = [];
	for(var key in window.frames.document.getElementsByTagName("SCRIPT")) {
		var item = window.frames.document.getElementsByTagName("SCRIPT")[key];
		if (item.src.length > 0) {
			scripturls.push(item.src);
		}
	}
	return scripturls;
}


