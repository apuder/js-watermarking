
/// <reference path="./permutationgraph.ts" />
/// <reference path="./cycles.ts" />

function find_watermark(root: Object, size: number, blacklist: string[]) {
	
	var cy: Object[][] = cycles.find_cycles(root, size, blacklist);

	var nums: num_size[] = permutationgraph.permutationgraph.findnums(cy);

	console.log("Found " + nums.length + " watermarks");

	var json_nums = JSON.stringify(nums);

	// sending trace complete message until acknowledged
	var tint = setInterval(function(){ signal_found_complete() }, 200);

	window.addEventListener('message', function(event) {
		// We only accept messages from ourselves
		if (event.source != window)
		return;
		if (event.data.type && (event.data.type == 'jsw_found_watermark_acknowledgement')) {
			if (tint) { clearInterval(tint); tint = null; }
		}
	}, false);

	function signal_found_complete() { window.postMessage({ type: "jsw_found_watermark", text: json_nums }, "*"); };

	signal_found_complete();

}
