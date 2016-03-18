
// console.log("insert content script loading");

var status = 0;

var trace_completed = {};

window.addEventListener("message", function(event) {
  // We only accept messages from ourselves
  if (event.source != window)
    return;

  if (event.data.type && (event.data.type === "jsw_inserted_watermark")) {
  	// console.log("Recieved inserted watermark message from page");
  	status = 3;
    chrome.runtime.sendMessage({from: "jsw_insert_content", method: "storeScript", arg: event.data.text, file: event.data.file, number: event.data.number, size: event.data.size});
  }
  else if (event.data.type && (event.data.type === "jsw_trace_complete")) {
  	// console.log("Recieved trace complete message from page");
  	status = 3;
  	// respond to page to stop trying to tell trace complete
  	window.postMessage({ type: 'jsw_trace_complete_acknowledgement', file: event.data.file }, '*');

  	if (!trace_completed[event.data.file]) {
  		console.log(event.data.file);
  		
		chrome.runtime.sendMessage({from: "jsw_insert_content", method: "insert_watermark"});

		trace_completed[event.data.file] = true;
	}
  }
  else if (event.data.type && (event.data.type === "jsw_insertion_error")) {
  	status = 3;
  	
  	chrome.runtime.sendMessage({from: "jsw_insert_content", method: "print_message", text: "Error in file "+event.data.file+": "+event.data.text });
  }
}, false);

function insert_watermark(num, size) {
	// console.log("inserting watermark: number " + num + ", size " + size);
	chrome.runtime.sendMessage({from: "jsw_insert_content", method: "print_message", text: "inserting watermark: number " + num + ", size " + size });
	// check if already inserted code
	var jws = document.getElementById("jsw_watermark_script");
	if (jws) {
		jws.parentNode.removeChild(jws);
		//insert code
		var script = document.createElement("script");
		script.id = "jsw_watermark_script";
		script.text = "final_stack.watermark_num = " + num + ";\n"
					+ "final_stack.watermark_size = " + size + ";\n"
					+ "final_stack.watermark(final_stack);";
		document.body.appendChild(script);

		status = 2;
	}
}

var url_validator = /.*\.jsw\.js/;

function find_jswpp_scripts() {
	// console.log("Finding .jsw.js scripts");

	var scripts = document.getElementsByTagName("script");
	var jswpp_scripts = [];

	for(var i = 0; i < scripts.length; i++) {
		var script = scripts[i];
		if (url_validator.test(script.src)) {
			// console.log("Found " + script.src);
			chrome.runtime.sendMessage({from: "jsw_insert_content", method: "print_message", text: "Found script " + script.src });
			jswpp_scripts.push(script.src);
		}
	}
	if (scripts.length == 0) {
		// console.error("No .jsw.js scripts found");
		chrome.runtime.sendMessage({from: "jsw_insert_content", method: "print_message", text: "No .jsw.js scripts found" });
	}

	// send script urls to background script for storage
	chrome.runtime.sendMessage({from: "jsw_insert_content", method: "storeJswppScripts", arg: JSON.stringify(jswpp_scripts)});
}

function check_insert_ready() {
	return !!document.getElementById("jsw_watermark_script");
}

// if (check_insert_ready()) {
// 	// missed trace complete signal or already received it
// 	// eithe way status should be 3
// 	status = 3;
// }

chrome.runtime.onMessage.addListener(function (msg, sender, response) {
  if (msg.from === 'jsw_background') {
  	if (msg.method === 'find_jswpp_scripts') {
	    find_jswpp_scripts();
	}
	else if (msg.method === 'insert_watermark') {
  		var num = msg.number;
  		var size = msg.size;
  		insert_watermark(num, size);
	}
	else if (msg.method === 'get_insert_status') {
		// 0 default
		// 1 tracing code
		// 2 inserting watermark
		// 3 ready to insert watermark
		response( status );
	}
	else if (msg.method === 'set_insert_status') {
		// can only set a higher status than the current status
		if (msg.status > status) {
			status = msg.status;
		}
		response( status );
	}
  }
});
