
var html_nums;
var tabid;

// Update the relevant fields with the new data
function addNums(nums) {
	for(var i = 0; i < nums.length; i++) {
		var num_item = document.createElement("li");
		num_item.innerHTML = nums[i].toString();
		html_nums.appendChild(num_item);
	}
}

// poll content thread repeatedly
function check_found_watermarks(nums) {
	if (nums) {
		addNums(nums);
    chrome.tabs.sendMessage(tabid,
        { from: 'jsw_popup', subject: 'cleanup' });
		tabid = undefined;
	}
	else {
		try_to_get_nums();
	}
}

function try_to_get_nums() {
	setTimeout(function(){
    chrome.tabs.sendMessage(tabid,
        { from: 'jsw_popup', subject: 'poll_watermarks' },
        check_found_watermarks );
	}, 1000);
}

function find_watermark() {
	var input_size = document.getElementById("size_input");
	if (!input_size) {
		console.error("size input not found");
		return;
	}

	// execute content script in tab
	chrome.tabs.executeScript(null,
			{	file: "content.js",
				allFrames: true
	});

	// setup callback to poll for results
	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		tabid = tabs[0].id;
		chrome.tabs.sendMessage(tabid,
	    { from: 'jsw_popup', subject: 'find_watermarks', watermark_size: input_size.value },
	    try_to_get_nums );
  });
}

document.addEventListener('DOMContentLoaded', function () {
  var input = document.getElementById("find_button");
	if (input.type === 'button' && input.name === 'find') {
  	input.addEventListener('click', find_watermark);
	}
  html_nums = document.getElementById("numList");
});
