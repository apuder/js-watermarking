
var input_size;

function find_watermark(e) {
  chrome.tabs.executeScript(null,
      {code:"alert('" + (input_size ? input_size.value : -1 ) + "')"});
  // TODO insert code to actually look for graphs
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
