
var jsw_serv_url = 'http://localhost';
var PORT = 3560;

var jsw_scripts_redirect_table = {};
var num_scripts_stored = 0;
var num_scripts_watermarked = 0;
var watermarked_blobs = [];

var tabid;
var input_number;
var input_size;

function load_content_script(script, onload) {
	console.log("loading script: "+script);
		// execute content script in tab
		chrome.tabs.executeScript(null,
					{	file: script,
						allFrames: true
					},
					onload
					);
}

function redirect_preprocessed_scripts(details) {
	var new_url = jsw_scripts_redirect_table[details.url] || details.url;

	console.log("Rediecting: "+details.url + " => " + new_url);

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
}

function stop_jsw_redirect() {
	console.log("Stopping .jsw.js script redirection");
	// remove webRequest listener when done
	chrome.webRequest.onBeforeRequest.removeListener(
        redirect_preprocessed_scripts);

	remove_stored_scripts();
}

// localStorage scripts is an array of {url, file_name}
function store_script(script, file, num, size) {
	console.log("Storing watermarked file: "+file);
	// store script into a blob
	var mime = "application/javascript";
	var script_blob = new Blob([script], { type: mime });
	watermarked_blobs.push(script_blob); // stop blob being garbage collected
	var blob_url = window.URL.createObjectURL(script_blob);
	// store reference to blob in localStorage
	var stored_scripts = JSON.parse(localStorage["scripts"] || '[]');
	stored_scripts.push({url: blob_url, file_name: file, num: num, size: size});
	localStorage["scripts"] = JSON.stringify(stored_scripts);

	if (++num_scripts_watermarked == Object.keys(jsw_scripts_redirect_table).length) {
		stop_jsw_redirect();
	}
}

function do_insert_watermark() {
	num_scripts_watermarked = 0;
	console.log("Inserting watermark: number "+input_number+", size "+input_size);
	chrome.tabs.sendMessage(tabid, 
			{ from: 'jsw_background', 
			  method: 'insert_watermark',
			  number: input_number,
			  size: input_size
			});
}

function check_missed_trace_complete() {
	console.log("Checking trace complete");
	chrome.tabs.sendMessage(tabid, 
		{ from: 'jsw_background', 
		  method: 'set_insert_status',
		  status: 1
		}
		, function(response) {
			if (response == 3) {
				// missed message, insert watermark
				do_insert_watermark();
			}
			else if (typeof(response) === "undefined") {
				// content script not loaded yet
				console.log("content script failed to load, waiting 1 second and trying again");
				setTimeout(function() {
					load_content_script("insert_content.js", check_missed_trace_complete);
				}, 1000);
			}
			else {
				console.log("check_missed_trace_complete response code: " + response);
			}
	});
}

function redirect_jswpp_scripts() {
	console.log("Starting .jsw.js script redirection and reloading page");
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
		load_content_script("insert_content.js", check_missed_trace_complete);
	});
}

function send_to_jsw_serv(jsw_url, script_text) {
	console.log("Sending script "+jsw_url+" to jswpp");
	// send scripts to be  preprocessed
	var xhr = new XMLHttpRequest();

	xhr.onerror = function() { 
		console.error("Error "+xhr.status+" Failed to send script "+script_url+"to jswpp");
	}

	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			if (xhr.status == 200) {
				if (++num_scripts_stored == Object.keys(jsw_scripts_redirect_table).length) {
					redirect_jswpp_scripts();
				}
			}
			else {
				// TODO handle error
				console.error("Error "+xhr.status+" Failed to send script "+jsw_url+"to jswpp");
			}
		}
	};

	xhr.open("POST", jsw_url, true);
	xhr.send(script_text);
}

function get_script(script_url, jsw_url) {
	console.log("Downloading script "+script_url);
	// find and preprocess scripts
	var xhr = new XMLHttpRequest();

	xhr.onerror = function() { 
		console.error("Error "+xhr.status+" Failed to download script "+script_url);
	}

	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			if (xhr.status == 200) {
				// console.log('got script ' + script_url);
				send_to_jsw_serv(jsw_url, xhr.responseText);
			}
			else {
				// TODO handle error
				console.error("Error "+xhr.status+" Failed to download script "+script_url);
			}
		}
	};

	xhr.open("GET", script_url, true);
	xhr.send();
}

function preprocess_scripts(scripts) {
	jsw_scripts_redirect_table = {};
	num_scripts_stored = 0;
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
		console.error("jswpp server not found");
		chrome.runtime.sendMessage( { from: 'jsw_background', method: 'jswpp_server_not_found'} );
	}

	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			if (xhr.status == 200) {
				console.log("jswpp server found");
				localStorage["error"] = "";
				find_jswpp_scripts();
			}
			else {
				console.error("jswpp server not found");
				localStorage["error"] = "jswpp.js server not found";
			}
		}
	};

	xhr.open("GET", check_url, true);
	xhr.send();
}

function keep_trying_check_insert_content() {
	// check if content script already loaded
	chrome.tabs.sendMessage(tabid, { from: 'jsw_background', method: 'get_insert_status'},
		function(response) {
			if (response == 0) {
				// find watermarkable code
				check_jswpp_server();
			}
			else if (response == 3) {
				// insert watermark
				do_insert_watermark();
			}
			else if (typeof(response) === "undefined") {
				// content script not fully loaded yet
				console.log("content script failed to load, waiting 1 second and trying again");
				setTimeout(function() {
					load_content_script("insert_content.js", keep_trying_check_insert_content);
				}, 1000);
			}
			else {
				console.log("keep_trying_check_insert_content response code: " + response);
			}
		});
}

function check_code_watermark_ready() {
	// check if content script already loaded
	chrome.tabs.sendMessage(tabid, { from: 'jsw_background', method: 'get_insert_status'},
		function(response) {
			if (response == 0) {
				// find watermarkable code
				check_jswpp_server();
			}
			else if (response == 3) {
				// insert watermark
				do_insert_watermark();
			}
			else if (typeof(response) === "undefined") {
				// content script not yet loaded
				load_content_script("insert_content.js", keep_trying_check_insert_content);
			}
			else {
				console.log("check_code_watermark_ready response code: " + response);
			}
		});
}


function find_watermark() {
	console.log("Trying to find watermarks");
	chrome.tabs.sendMessage(tabid, { from: 'jsw_background', method: 'find_watermarks', watermark_size: input_size });
}

function try_find_watermark() {
	
	// check if content script already loaded
	chrome.tabs.sendMessage(tabid, { from: 'jsw_background', method: 'get_find_status'},
		function(response) {
			if (response == 0) {
				find_watermark();
			}
			else if (typeof(response) === "undefined") {
				load_content_script("find_content.js", find_watermark);
			}
			else {
				console.log("try_find_watermark response code: " + response);
			}
		});
}


// reset localStorage on start
localStorage.removeItem("error");
localStorage.removeItem("nums");
localStorage.removeItem("scripts");


// handle messages
chrome.runtime.onMessage.addListener(function(msg, sender, response) {
	if (msg.from === 'jsw_popup') {
		// messages from popup
		if (msg.method === 'find_watermark') {
			tabid = msg.tabid;
			input_size = msg.size;
			try_find_watermark();
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
			console.log("clearing local variables and script storage");
			// remove watermarked scripts
			var scripts = JSON.parse(localStorage["scripts"] || '[]');
			for (var i = 0; i < scripts.length; i++) {
				var script = scripts[i];
				window.URL.revokeObjectURL(script.url);
			}
			localStorage.removeItem("scripts");
			remove_stored_scripts();
			stop_jsw_redirect();
			// reset local vars
			jsw_scripts_redirect_table = {};
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
	    	store_script(msg.arg, msg.file, msg.number, msg.size);
	    }
	    else if (msg.method === "open_popup") {
	    	chrome.tabs.create({url: "popup.html"});
	    }
	    else if (msg.method === "insert_watermark") {
			do_insert_watermark();
		}
	}
});
