
var jsw_serv_url = 'http://localhost';
var PORT = 3560;

var jsw_scripts_redirect_table = {};
var jsw_stored_scripts = [];
// var jsw_blobs = [];
var watermarked_blobs = [];

var tabid;
var input_number;
var input_size;

function redirect_preprocessed_scripts(details) {
	var new_url = jsw_scripts_redirect_table[details.url] || details.url;

	// console.log(details.url + " => " + new_url);

	return {redirectUrl: new_url};
}

function remove_stored_scripts() {
	for(var k in jsw_scripts_redirect_table) {
		var jsw_url = jsw_scripts_redirect_table[k];
		// send and preprocess scripts
		var xhr = new XMLHttpRequest();

		xhr.open("DELETE", jsw_url, true);
		xhr.send();
	}

	jsw_scripts_redirect_table = {};
	jsw_stored_scripts = [];
}

// localStorage scripts is an array of {url, file_name}
function store_script(script, file) {
	console.log(file);
	// store script into a blob
	var mime = "application/javascript";
	var script_blob = new Blob([script], { type: mime });
	watermarked_blobs.push(script_blob); // stop blob being garbage collected
	var blob_url = window.URL.createObjectURL(script_blob);
	// store reference to blob in localStorage
	var stored_scripts = JSON.parse(localStorage["scripts"] || '[]');
	stored_scripts.push({url: blob_url, file_name: file});
	localStorage["scripts"] = JSON.stringify(stored_scripts);

	if (watermarked_blobs.length == Object.keys(jsw_scripts_redirect_table).length) {
		// remove webRequest listener when done
		chrome.webRequest.onBeforeRequest.removeListener(
	        redirect_preprocessed_scripts);

		remove_stored_scripts();
	}
}

function do_insert_watermark() {
	chrome.tabs.sendMessage(tabid, 
			{ from: 'jsw_background', 
			  method: 'insert_watermark',
			  number: input_number,
			  size: input_size
			});
}



function check_trace_complete() {
	chrome.tabs.sendMessage(tabid, 
		{ from: 'jsw_background', 
		  method: 'check_trace_complete'
		}
		, function(response) {
			console.log(response);
			if (response) {
				// missed message, insert watermark
				do_insert_watermark();
			}
			else if (typeof(response) === "undefined") {
				// content script not fully loaded yet
				console.log("content script failed to load, wait 1 second and try again");
				setTimeout(function(){ 
					chrome.tabs.executeScript(null,
						{	file: "insert_content.js",
							allFrames: true
						}
						, check_trace_complete
						); 
					}, 1000);
			}
		});
}



function rediect_jswpp_scripts() {
	// add a listener to redirect http requests for .jsw.pp.js scripts
	chrome.webRequest.onBeforeRequest.addListener(
        redirect_preprocessed_scripts,
        {urls: ["*://*/*.jsw.js"],
    	 tabId: tabid},
        ["blocking"]);

	// clear cache forcing sending of http requests
	chrome.webRequest.handlerBehaviorChanged();

	// reload the tab and insert scripts to insert the watermark
	chrome.tabs.reload(tabid, function () {
		chrome.tabs.executeScript(null,
						{	file: "insert_content.js",
							allFrames: true
						}
						, check_trace_complete
					);
	});
}

function send_to_jsw_serv(jsw_url, script_text) {
	
	// send scripts to be  preprocessed
	var xhr = new XMLHttpRequest();

	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			if (xhr.status == 200) {
				jsw_stored_scripts.push(xhr.responseURL);
				if (jsw_stored_scripts.length == Object.keys(jsw_scripts_redirect_table).length) {
					rediect_jswpp_scripts();
				}
			}
			else {
				// TODO handle error
			}
		}
	};

	xhr.open("POST", jsw_url, true);
	xhr.send(script_text);
}

function get_script(script_url, jsw_url) {
	// find and preprocess scripts
	var xhr = new XMLHttpRequest();

	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			if (xhr.status == 200) {
				// console.log('got script ' + script_url);
				send_to_jsw_serv(jsw_url, xhr.responseText);
			}
			else {
				// TODO handle error
			}
		}
	};

	xhr.open("GET", script_url, true);
	xhr.send();
}

function preprocess_scripts(scripts) {
	jsw_scripts_redirect_table = {};
	jsw_stored_scripts = [];
	// jsw_blobs = [];
	for (var i = 0; i < scripts.length; i++) {
		var script_url = scripts[i];

		// save the url to the script for redirection
		var a = document.createElement("a");
		a.href = script_url;

		var jsw_url = a.pathname;
		jsw_url = jsw_url.replace('.jsw', '');

		var jsw_url = jsw_serv_url + ":" + PORT + "/" + jsw_url;

		jsw_scripts_redirect_table[script_url] = jsw_url;

		// get and preprocess the script
		get_script(script_url, jsw_url);
	}
	
	localStorage["jsw_scripts"] = JSON.stringify(jsw_scripts_redirect_table);
}

function find_jswpp_scripts() {
	chrome.tabs.sendMessage(tabid, 
		{ from: 'jsw_background', 
		  method: 'find_jswpp_scripts'
		});
}

function check_jswpp_server() {

	console.log("looking for jswpp server");

	var check_url = jsw_serv_url + ":" + PORT + "/check";
	// find and preprocess scripts
	var xhr = new XMLHttpRequest();

	xhr.onerror = function() { 
		console.log("didn't find jswpp server");
		chrome.runtime.sendMessage( { from: 'jsw_background', method: 'jswpp_server_not_found'} );
	}

	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			if (xhr.status == 200) {
				console.log("found jswpp server");
				chrome.runtime.sendMessage( { from: 'jsw_background', method: 'jswpp_server_found'} );
				find_jswpp_scripts();
			}
			else {
				console.log("didn't find jswpp server");
				chrome.runtime.sendMessage( { from: 'jsw_background', method: 'jswpp_server_not_found'} );
			}
		}
	};

	xhr.open("GET", check_url, true);
	xhr.send();
}

function check_insert_ready() {
	chrome.tabs.sendMessage(tabid, 
		{ from: 'jsw_background', 
		  method: 'check_insert_ready'
		}
		, function(response) {
			if (response) {
				// insert watermark
				do_insert_watermark();
			} else {
				// find watermarkable code
				check_jswpp_server();
			}
		});
}

function check_code_watermark_ready() {
	// check if content script already loaded
	chrome.tabs.sendMessage(tabid, { from: 'jsw_background', method: 'check_insert_content_loaded'},
		function(response) {
			if (response) {
				check_insert_ready();
			} else {
				// execute content script in tab
				chrome.tabs.executeScript(null,
							{	file: "insert_content.js",
								allFrames: true
							},
							check_insert_ready
							);
			}
		});
}


function find_watermark() {
	// find the watermarks
	// console.log("trying to find watermarks");
	chrome.tabs.sendMessage(tabid, { from: 'jsw_background', method: 'find_watermarks', watermark_size: input_size });
}

function insert_find_watermark_code() {
	
	// check if content script already loaded
	chrome.tabs.sendMessage(tabid, { from: 'jsw_background', method: 'check_find_content_loaded'},
		function(response) {
			if (response) {
				// console.log("content script already added");
				find_watermark();
			} else {
				// console.log("adding content script");
				// execute content script in tab
				chrome.tabs.executeScript(null,
						{	file: "find_content.js",
							allFrames: true
						},
						find_watermark);
			}
		});
}



// handle messages
chrome.runtime.onMessage.addListener(function(msg, sender, response) {
	if (msg.from === 'jsw_popup') {
		// messages from popup
		if (msg.method === 'find_watermark') {
			tabid = msg.tabid;
			input_size = msg.size;
			insert_find_watermark_code();
		}
		else if (msg.method === 'insert_watermark') {
			tabid = msg.tabid;
			input_number = msg.number;
			input_size = msg.size;
			check_code_watermark_ready();
		}
		else if (msg.method === 'clear_nums') {
			localStorage.removeItem("nums");
		}
		else if (msg.method === 'clear_scripts') {
			// remove watermarked scripts
			var scripts = JSON.parse(localStorage["scripts"] || '[]');
			for (var i = 0; i < scripts.length; i++) {
				var script = scripts[i];
				window.URL.revokeObjectURL(script.url);
			}
			localStorage.removeItem("scripts");
			// remove preprocessed scripts
			var jsw_script_blob_urls = JSON.parse(localStorage["jsw_scripts"] || '[]');
			for (var i = 0; i < jsw_script_blob_urls.length; i++) {
				var blob_url = jsw_script_blob_urls[i];
				window.URL.revokeObjectURL(blob_url);
			}
			localStorage.removeItem("jsw_scripts");
			remove_stored_scripts();
			// reset local vars
			jsw_scripts_redirect_table = {};
			jsw_stored_scripts = [];
			watermarked_blobs = [];
		}
	}
	else if (msg.from === 'jsw_find_content') {
		// messages from find_content script
		if (msg.method === "storeNums") {
	    	var stored_nums = JSON.parse(localStorage["nums"] || '[]');
	    	stored_nums = stored_nums.concat(JSON.parse(msg.arg));
			localStorage["nums"] = JSON.stringify(stored_nums);
	    }
	}
	else if (msg.from === 'jsw_insert_content') {
		// messages from insert_content script
		if (msg.method === "storeJswppScripts") {
	    	var jswpp_scripts = JSON.parse(msg.arg);
	    	preprocess_scripts(jswpp_scripts);
	    }
	    else if (msg.method === "storeScript") {
	    	store_script(msg.arg, msg.file);
	    }
	    else if (msg.method === "open_popup") {
	    	chrome.tabs.create({url: "popup.html"});
	    }
	    else if (msg.method === "insert_watermark") {
			do_insert_watermark();
		}
	}
});
