
var html_nums;
var tabid;
var input_size;

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
							{	file: "content.js",
								allFrames: true
							},
							find_watermark);
				}
				
			});
	});
}

document.addEventListener('DOMContentLoaded', function () {
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
