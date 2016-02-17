chrome.browserAction.onClicked.addListener(send_click);

function send_click() {
	chrome.runtime.sendMessage(
		'hpmeemfifnkcmdggegneieobkcpkbjno', 
		{BAclick: 'click'}, 
		function(response) { 
			console.log("response: "+JSON.stringify(response));
		});
}


