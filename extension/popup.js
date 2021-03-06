
var messages_area;
var messages_hr;
var insert_message_area;
var html_scripts;
var find_message_area;
var html_nums;

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
		var script_row = document.createElement("tr");

		var num_data = document.createElement("td");
		num_data.textContent = script.num.toString();
		var size_data = document.createElement("td");
		size_data.textContent = script.size.toString();
		var link_data = document.createElement("td");

		var a = document.createElement('a');
		a.download = script.file_name;
		a.href = script.url;
		a.textContent = script.file_name;

		var mime = "application/javascript";
		a.dataset.downloadurl = [mime, a.download, a.href].join(':');
		a.draggable = true;

		link_data.appendChild(a);

		script_row.appendChild(num_data);
		script_row.appendChild(size_data);
		script_row.appendChild(link_data);

		html_scripts.appendChild(script_row);
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
		var num_row = document.createElement("tr");

		var num_data = document.createElement("td");
		num_data.textContent = nums[i].num.toString();
		var size_data = document.createElement("td");
		size_data.textContent = nums[i].size.toString();

		num_row.appendChild(num_data);
		num_row.appendChild(size_data);

		html_nums.appendChild(num_row);
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

function setError(error_text) {
	if (error_text) {
		messages_area.textContent = "Error: " + error_text;
		messages_area.style.color = "red";
		messages_hr.style.visibility = "visible";
	}
	else {
		messages_area.textContent = "";
		messages_area.style.color = "black";
		messages_hr.style.visibility = "hidden";
	}
}

function set_insert_message(msg_txt) {
	if (msg_txt) {
		insert_message_area.textContent = msg_txt;
		insert_message_area.style.color = "DarkGoldenRod";
	}
	else {
		insert_message_area.textContent = "";
		insert_message_area.style.color = "black";
	}
}

function set_find_message(msg_txt) {
	if (msg_txt) {
		find_message_area.textContent = msg_txt;
		find_message_area.style.color = "DarkGoldenRod";
	}
	else {
		find_message_area.textContent = "";
		find_message_area.style.color = "black";
	}
}

document.addEventListener('DOMContentLoaded', function () {
	messages_area = document.getElementById("messages_area");
	messages_hr = document.getElementById("messages_hr");

	var insert = document.getElementById("insert_button");
	if (insert.type === 'button' && insert.name === 'insert') {
		insert.addEventListener('click', make_watermark);
	}

	insert_message_area = document.getElementById("insert_message_area");
	find_message_area = document.getElementById("find_message_area");

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

	if (html_num_input.type === 'number' && html_num_input.name === 'number') {
		html_num_input.value = localStorage["number"] || 0;
		html_num_input.oninput = function() {
			localStorage["number"] = html_num_input.value;
		};
	}

	var html_size_input = document.getElementById("size_input");

	if (html_size_input.type === 'number' && html_size_input.name === 'size') {
		html_size_input.value = localStorage["size"] || 14;
		html_size_input.oninput = function() {
			localStorage["size"] = html_size_input.value;
		};
	}

	// set scripts initially
    setScripts(JSON.parse(localStorage["scripts"] || '[]'));

	// set nums initially
    setNums(JSON.parse(localStorage["nums"] || '[]'));

    // set error initially
    setError(localStorage["error"] || '');

    set_insert_message(localStorage["insert_message"] || '');

    set_find_message(localStorage["find_message"] || '');

    window.onstorage = function (e) {
    	if (e.key == "scripts") {
    		setScripts(JSON.parse(e.newValue || '[]'));
    	}
    	else if (e.key == "nums") {
    		setNums(JSON.parse(e.newValue || '[]'));
    	}
    	else if (e.key == "error") {
    		setError(e.newValue || '');
    	}
    	else if (e.key == "insert_message") {
    		set_insert_message(e.newValue || '');
    	}
    	else if (e.key == "find_message") {
    		set_find_message(e.newValue || '');
    	}
    }
});
