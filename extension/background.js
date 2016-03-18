
var jsw_serv_url = 'http://localhost';
var PORT = 3560;

var num_scripts = 0;
var jsw_scripts_redirect_table = {};
var num_scripts_stored = 0;
var num_scripts_redirected = 0;
var num_scripts_watermarked = 0;
var watermarked_blobs = [];

var tabid;
var input_number;
var input_size;

function load_content_script(script, onload) {
	// console.log("loading script: "+script);
	// execute content script in tab
	chrome.tabs.executeScript(null,
				{	file: script,
					allFrames: true
				}
				, onload
				);
}

function redirect_preprocessed_scripts(details) {
	var new_url = jsw_scripts_redirect_table[details.url] || details.url;

	// if (++num_scripts_redirected == num_scripts) {
	// 	setTimeout( stop_jsw_redirect, 5000);
	// }

	// console.log("Rediecting: "+details.url + " => " + new_url);

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
	localStorage["insert_message"] = "";
	console.log("Stopping .jsw.js script redirection");
	// remove webRequest listener when done
	chrome.webRequest.onBeforeRequest.removeListener(
        redirect_preprocessed_scripts);

	remove_stored_scripts();
}

// localStorage scripts is an array of {url, file_name}
function store_script(script, file, num, size) {
	// console.log("Storing watermarked file: "+file);
	localStorage["insert_message"] = "";
	// store script into a blob
	var mime = "application/javascript";
	var script_blob = new Blob([script], { type: mime });
	watermarked_blobs.push(script_blob); // stop blob being garbage collected
	var blob_url = window.URL.createObjectURL(script_blob);
	// store reference to blob in localStorage
	var stored_scripts = JSON.parse(localStorage["scripts"] || '[]');
	stored_scripts.push({url: blob_url, file_name: file, num: num, size: size});
	localStorage["scripts"] = JSON.stringify(stored_scripts);

	if (++num_scripts_watermarked == num_scripts) {
		stop_jsw_redirect();
	}
}

function do_insert_watermark() {
	num_scripts_watermarked = 0;
	// console.log("Inserting watermark: number "+input_number+", size "+input_size);
	localStorage["insert_message"] = "Inserting watermark: number "+input_number+", size "+input_size;
	chrome.tabs.sendMessage(tabid, 
			{ from: 'jsw_background', 
			  method: 'insert_watermark',
			  number: input_number,
			  size: input_size
			});
}

function check_missed_trace_complete() {
	chrome.tabs.sendMessage(tabid, 
		{ from: 'jsw_background', 
		  method: 'set_insert_status',
		  status: 1
		}
		, function(response) {
			if (response == 1) {
				localStorage["insert_message"] = "Tracing in Progress";
			}
			else if (typeof(response) === "undefined") {
				// content script not loaded yet
				// console.log("content script failed to load, waiting 1 second and trying again");
				localStorage["error"] = "content script failed to load, try clicking Insert again";
				setTimeout(function() {
					load_content_script("insert_content.js", check_missed_trace_complete);
				}, 1000);
			}
	});
}

function redirect_jswpp_scripts() {
	num_scripts_redirected = 0;
	console.log("Starting .jsw.js script redirection and reloading page");
	localStorage["insert_message"] = "Reloading Page";
	// add a listener to redirect http requests for .jsw.pp.js scripts
	chrome.webRequest.onBeforeRequest.addListener(
        redirect_preprocessed_scripts,
        {urls: ["*://*/*.jsw.js"],
    	 tabId: tabid},
        ["blocking"]);

	// clear cache forcing sending of http requests
	chrome.webRequest.handlerBehaviorChanged();

	// add a listener for the upcoming tab reload
	chrome.tabs.onUpdated.addListener( function update_listener(updated_tabId, changeInfo, tab) {
		if ( tabid == updated_tabId && changeInfo.url === undefined) {
			// on reload tab, stop listening
			chrome.tabs.onUpdated.removeListener(update_listener);
			// load insert content
			load_content_script("insert_content.js", check_missed_trace_complete);
		}
	});

	// reload the tab and insert scripts to insert the watermark
	chrome.tabs.reload(tabid);
}

function send_to_jsw_serv(jsw_url, script_text) {
	// console.log("Sending script "+jsw_url+" to jswpp");
	// send scripts to be  preprocessed
	var xhr = new XMLHttpRequest();

	xhr.onerror = function() { 
		// console.error("Error "+xhr.status+" Failed to send script "+script_url+"to jswpp");
		localStorage["error"] = ''+xhr.status+" Failed to send script "+jsw_url+"to jswpp";
	}

	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			if (xhr.status == 200) {
				if (++num_scripts_stored == num_scripts) {
					redirect_jswpp_scripts();
				}
			}
			else {
				// TODO handle error
				// console.error("Error "+xhr.status+" Failed to send script "+jsw_url+"to jswpp");
				localStorage["error"] = ''+xhr.status+" Failed to send script "+jsw_url+"to jswpp";
			}
		}
	};

	xhr.open("POST", jsw_url, true);
	xhr.send(script_text);
}

function get_script(script_url, jsw_url) {
	// console.log("Downloading script "+script_url);
	// find and preprocess scripts
	var xhr = new XMLHttpRequest();

	xhr.onerror = function() { 
		// console.error("Error "+xhr.status+" Failed to download script "+script_url);
		localStorage["error"] = ''+xhr.status+" Failed to download script "+script_url;
	}

	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			if (xhr.status == 200) {
				// console.log('got script ' + script_url);
				send_to_jsw_serv(jsw_url, xhr.responseText);
			}
			else {
				// TODO handle error
				// console.error("Error "+xhr.status+" Failed to download script "+script_url);
				localStorage["error"] = ''+xhr.status+" Failed to download script "+script_url;
			}
		}
	};

	xhr.open("GET", script_url, true);
	xhr.send();
}

function preprocess_scripts(scripts) {
	localStorage["insert_message"] = "Preprocessing scripts";
	jsw_scripts_redirect_table = {};
	num_scripts_stored = 0;
	num_scripts = scripts.length;
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

	// console.log("looking for jswpp server");

	var check_url = jsw_serv_url + ":" + PORT + "/check";
	// find and preprocess scripts
	var xhr = new XMLHttpRequest();

	xhr.onerror = function() { 
		// console.error("jswpp server not found");
		localStorage["error"] = "jswpp.js server not found";
	}

	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			if (xhr.status == 200) {
				// console.log("jswpp server found");
				localStorage["error"] = "";
				find_jswpp_scripts();
			}
			else {
				// console.error("jswpp server not found");
				localStorage["error"] = "jswpp.js server not found";
			}
		}
	};

	xhr.open("GET", check_url, true);
	xhr.send();
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
				load_content_script("insert_content.js", check_code_watermark_ready);
			}
			else {
				// console.log("check_code_watermark_ready response code: " + response);
			}
		});
}


function try_find_watermark() {
	localStorage["find_message"] = "Looking for Watermarks of size >= "+input_size;
	// check if content script already loaded
	chrome.tabs.sendMessage(tabid, { from: 'jsw_background', method: 'find_watermarks', watermark_size: input_size },
		function(response) {
			if (response == 0) {
				find_watermark();
			}
			else if (typeof(response) === "undefined") {
				load_content_script("find_content.js", try_find_watermark);
			}
			// else {
				console.log("try_find_watermark response code: " + response);
			// }
		});
}


// reset localStorage on start
localStorage.removeItem("error");
localStorage.removeItem("nums");
localStorage.removeItem("scripts");
localStorage.removeItem("insert_message");
localStorage.removeItem("find_message");


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
			localStorage["find_message"] = "";
			localStorage.removeItem("nums");
		}
		else if (msg.method === 'clear_scripts') {
			// console.log("clearing local variables and script storage");
			localStorage["insert_message"] = "";
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
	    	var new_nums = JSON.parse(msg.arg);
	    	if (new_nums.length > 0) {
	    		localStorage["nums"] = JSON.stringify(stored_nums.concat(new_nums));
	    		localStorage["find_message"] = ""+new_nums.length+" watermark"+(new_nums.length > 1 ? "s" : "")+" found";
	    	} else {
	    		localStorage["find_message"] = "No watermarks found";
	    	}
	    }
	    else if (msg.method === "print_message") {
			localStorage["find_message"] = msg.text;
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
		else if (msg.method === "print_message") {
			localStorage["insert_message"] = msg.text;
		}
	}
});
