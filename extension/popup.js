
var messages_area;
var html_nums;
var html_scripts;

function clear_scripts_storage() {
	chrome.runtime.sendMessage({ from: 'jsw_popup', method: 'clear_scripts' });
	// remove previous data
	while (html_scripts.firstChild) {
	    html_scripts.removeChild(html_scripts.firstChild);
	}
}

function setScripts(scripts) {
	// remove previous data
	while (html_scripts.firstChild) {
	    html_scripts.removeChild(html_scripts.firstChild);
	}
	// add new data
	for(var i = 0; i < scripts.length; i++) {
		var script = scripts[i];
		var script_item = document.createElement("li");

		var a = document.createElement('a');
		a.download = script.file_name;
		a.href = script.url;
		a.textContent = script.file_name;

		var mime = "application/javascript";
		a.dataset.downloadurl = [mime, a.download, a.href].join(':');
		a.draggable = true;

		script_item.appendChild(a);

		html_scripts.appendChild(script_item);
	}
}

function clear_nums_storage() {
	chrome.runtime.sendMessage({ from: 'jsw_popup', method: 'clear_nums' });
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

function make_watermark() {
	var input_number = document.getElementById("number_input");
	if (!input_number) {
		console.error("size input not found");
		return;
	}
	var input_size = document.getElementById("size_input");
	if (!input_size) {
		console.error("size input not found");
		return;
	}

	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		// console.log("Tab: "+tabs[0].id+" Number: "+input_number.value+" Size: "+input_size.value);
		// send message to background to insert watermark in current page
		chrome.runtime.sendMessage({ from: 'jsw_popup', method: 'insert_watermark', tabid: tabs[0].id, number: input_number.value, size: input_size.value });
	});
}

function find_watermark() {
	var input_size = document.getElementById("size_input");
	if (!input_size) {
		console.error("size input not found");
		return;
	}

	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		// send message to background to start search
		chrome.runtime.sendMessage({ from: 'jsw_popup', method: 'find_watermark', tabid: tabs[0].id, size: input_size.value });
	});
}

// handle messages
chrome.runtime.onMessage.addListener(function(msg, sender, response) {
	if (msg.from === 'jsw_background') {
		// messages from background
		if (msg.method === 'jswpp_server_found') {
			messages_area.innerHTML = "";
			messages_area.style.color = "black";
		}
		else if (msg.method === 'jswpp_server_not_found') {
			messages_area.innerHTML = "Error: jswpp.js server not found.";
			messages_area.style.color = "red";
		}
	}
});


document.addEventListener('DOMContentLoaded', function () {
	messages_area = document.getElementById("messages_area");

	var insert = document.getElementById("insert_button");
	if (insert.type === 'button' && insert.name === 'insert') {
		insert.addEventListener('click', make_watermark);
	}

	html_scripts = document.getElementById("scriptList");

	var clear_scripts = document.getElementById("clear_scripts_button");
	if (clear_scripts.type === 'button' && clear_scripts.name === 'clear_scripts') {
		clear_scripts.addEventListener('click', clear_scripts_storage);
	}


	var find = document.getElementById("find_button");
	if (find.type === 'button' && find.name === 'find') {
		find.addEventListener('click', find_watermark);
	}

	html_nums = document.getElementById("numList");

	var clear_nums = document.getElementById("clear_nums_button");
	if (clear_nums.type === 'button' && clear_nums.name === 'clear_nums') {
		clear_nums.addEventListener('click', clear_nums_storage);
	}

	var html_num_input = document.getElementById("number_input");
	console.log(html_num_input);
	if (html_num_input.type === 'number' && html_num_input.name === 'number') {
		console.log(html_num_input);
		html_num_input.value = localStorage["number"] || 0;
		html_num_input.oninput = function() {
			console.log(html_num_input);
			localStorage["number"] = html_num_input.value;
		};
	}

	var html_size_input = document.getElementById("size_input");
	console.log(html_size_input);
	if (html_size_input.type === 'number' && html_size_input.name === 'size') {
		console.log(html_size_input);
		html_size_input.value = localStorage["size"] || 14;
		html_size_input.oninput = function() {
			console.log(html_size_input);
			localStorage["size"] = html_size_input.value;
		};
	}

	// set scripts initially
    setScripts(JSON.parse(localStorage["scripts"] || '[]'));

	// set nums initially
    setNums(JSON.parse(localStorage["nums"] || '[]'));

    window.onstorage = function (e) {
    	if (e.key == "scripts") {
    		setScripts(JSON.parse(e.newValue || '[]'));
    	}
    	else if (e.key == "nums") {
    		setNums(JSON.parse(e.newValue || '[]'));
    	}
    }
});
