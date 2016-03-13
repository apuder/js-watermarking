
window.addEventListener("message", function(event) {
  // We only accept messages from ourselves
  if (event.source != window)
    return;

  if (event.data.type && (event.data.type == "jsw_inserted_watermark")) {
    // console.log("Content script received: " + event.data.file);
    chrome.runtime.sendMessage({from: "jsw_insert_content", method: "storeScript", arg: event.data.text, file: event.data.file});
  }
  else if (event.data.type && (event.data.type == "jsw_trace_complete")) {
  	chrome.runtime.sendMessage({from: "jsw_insert_content", method: "open_popup"});
  }
}, false);

var url_validator = /.*\.jsw\.pp\.js/;

function find_jswpp_scripts() {
	console.log("Finding .jsw.pp scripts");

	var scripts = document.getElementsByTagName("script");
	var jswpp_scripts = [];

	for(var i = 0; i < scripts.length; i++) {
		var script = scripts[i];
		if (url_validator.test(script.src)) {
			console.log("Found " + script.src);
			jswpp_scripts.push(script.src);
		}
	}

	// send script urls to background script for storage
	chrome.runtime.sendMessage({from: "jsw_insert_content", method: "storeJswppScripts", arg: JSON.stringify(jswpp_scripts)});
}

chrome.runtime.onMessage.addListener(function (msg, sender, response) {
  if (msg.from === 'jsw_background') {
  	if (msg.method === 'check_insert_content_loaded') {
  		// content script loaded in this page
  		response(true);
  	}
  	else if (msg.method === 'find_jswpp_scripts') {
	    find_jswpp_scripts();
	}
	else if (msg.method === 'insert_watermark') {
  		var num = msg.number;
  		var size = msg.size;
  		// check if already inserted code
  		var jws = document.getElementById("jsw_watermark_script");
		if (jws) jws.parentNode.removeChild(jws);
		//insert code
		var script = document.createElement("script");
		script.id = "jsw_watermark_script";
		script.text = "final_stack.watermark_num = " + num + ";\n"
					+ "final_stack.watermark_size = " + size + ";\n"
					+ "final_stack.watermark(final_stack);";
		document.body.appendChild(script);
	}
  }
});
