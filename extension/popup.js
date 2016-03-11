
var html_nums;
var tabid;
var input_number;
var input_size;
var scripts;

function clear_nums_storage() {
	localStorage.removeItem("nums");
	// remove previous data
	while (html_nums.firstChild) {
	    html_nums.removeChild(html_nums.firstChild);
	}
}

// Update the relevant fields with the new data
function setNums(nums) {
	// remove previous data
	while (html_nums.firstChild) {
	    html_nums.removeChild(html_nums.firstChild);
	}
	// add new data
	for(var i = 0; i < nums.length; i++) {
		var num_item = document.createElement("li");
		num_item.innerHTML = nums[i].toString();
		html_nums.appendChild(num_item);
	}
}

function preprocess_scripts(scripts) {
	// find and preprocess scripts
	// var xhr = new XMLHttpRequest();

	// xhr.open("GET", "http://www.domain.com?par=0", false);
	// xhr.send();

	// var result = xhr.responseText;
	// localStorage[url] = result;
}

function redirect_preprocessed_scripts(details) {
	return {redirect: scripts[details.url]};
}

function insert_watermark() {



	// remove listener when done
	chrome.webRequest.onBeforeRequest.removeListener(
        redirect_preprocessed_scripts);
}

function make_watermark() {
	input_number = document.getElementById("number_input");
	if (!input_number) {
		console.error("size input not found");
		return;
	}
	input_size = document.getElementById("size_input");
	if (!input_size) {
		console.error("size input not found");
		return;
	}

	

	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		tabid = tabs[0].id;



		// add a listener to redirect http requests for .jsw.pp.js scripts
		chrome.webRequest.onBeforeRequest.addListener(
	        redirect_preprocessed_scripts,
	        {urls: ["*://*/*.jsw.pp.js"],
	    	 tabId: tabid},
	        ["blocking"]);

		// clear cache forcing sending of http requests
		chrome.webRequest.handlerBehaviorChanged();

		// reload the tab and insert scripts to insert the watermark
		chrome.tabs.reload(tabid, function () {
			chrome.tabs.executeScript(null,
							{	file: "insert_content.js",
								allFrames: true
							},
							insert_watermark);
		});
	}
}

function find_watermark() {
	// find the watermarks
	console.log("trying to find watermarks");
	chrome.tabs.sendMessage(tabid, { from: 'jsw_popup', subject: 'find_watermarks', watermark_size: input_size.value });
}

function insert_find_watermark_code() {
	input_size = document.getElementById("size_input");
	if (!input_size) {
		console.error("size input not found");
		return;
	}

	// send message to start search
	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		tabid = tabs[0].id;

		// check if content script already loaded
		chrome.tabs.sendMessage(tabid, { from: 'jsw_popup', subject: 'check_contentjs_loaded'},
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
	});
}

document.addEventListener('DOMContentLoaded', function () {
	var insert = document.getElementById("insert_button");
	if (insert.type === 'button' && insert.name === 'insert') {
		insert.addEventListener('click', make_watermark);
	}

	var input = document.getElementById("find_button");
	if (input.type === 'button' && input.name === 'find') {
		input.addEventListener('click', insert_find_watermark_code);
	}

	html_nums = document.getElementById("numList");

	var clear_nums = document.getElementById("clear_nums_button");
	if (clear_nums.type === 'button' && clear_nums.name === 'clear_nums') {
		clear_nums.addEventListener('click', clear_nums_storage);
	}

	// set nums initially
	var stored_nums = JSON.parse(localStorage["nums"] || '[]');
    setNums(stored_nums);

    window.onstorage = function (e) {
    	if (e.key == "nums") {
    		setNums(JSON.parse(e.newValue || '[]'));
    	}
    }
});
