
var input_size;

function find_watermark(e) {
	if (!input_size) {
		console.error("size input not found");
		return;
	}
	// var exec_code = code;
	// exec_code += "console.log(\"Looking for watermarks of size " + input_size.value + "\");\n"
	// exec_code += "permutationgraph.permutationgraph.findnums(" + input_size.value + ");\n";

	var pjsurl = chrome.extension.getURL("permutationgraph.js");

	exec_code = 'var script = document.createElement("script");\n';
	exec_code+= 'script.src = "' + pjsurl + '";\n';
	exec_code+= 'document.head.appendChild(script);';
	exec_code+= 'script = document.createElement("script");\n';
	exec_code+= 'script.text = \"';
	exec_code+= 'console.log(\\"Looking for watermarks of size ' + input_size.value + '\\");';
	exec_code+= 'permutationgraph.permutationgraph.findnums(' + input_size.value + ');'
	exec_code+= '\";\n';
	exec_code+= 'document.body.appendChild(script)\n;';

	chrome.tabs.executeScript(null,
		{	code: exec_code,
			allFrames: true	},
		function(results) {
			// var html_nums = document.getElementById("numList");
			// if (results && typeof results === 'object') {
			// 	for (var i in results) {
			// 		var result = results[i];
			// 		if (result && typeof result === 'object' && result.length) {
			// 			for (var k = 0; k < result.length; k++) {
			// 				var num = result[k];
			// 				var num_item = document.createElement("li");
			// 				num_item.innerHTML = num;
			// 				html_nums.appendChild(num_item);
			// 			}
			// 		}
			// 	}
			// }
		});
}

document.addEventListener('DOMContentLoaded', function () {
  var inputs = document.querySelectorAll('input');
  for (var i = 0; i < inputs.length; i++) {
  	if (inputs[i].type === 'number' && inputs[i].name === 'size')
  		input_size = inputs[i];
  	else if (inputs[i].type === 'button' && inputs[i].name === 'find')
    	inputs[i].addEventListener('click', find_watermark);
  }
});
