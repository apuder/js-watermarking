
// do local storage
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.method == "storeNums") {
    	var stored_nums = JSON.parse(localStorage["nums"] || '[]');
    	stored_nums = stored_nums.concat(JSON.parse(request.arg));
		localStorage["nums"] = JSON.stringify(stored_nums);
    }
});