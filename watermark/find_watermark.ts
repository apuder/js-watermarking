
/// <reference path="./permutationgraph.ts" />
/// <reference path="./cycles.ts" />

function find_watermark(root: Object, size: number, blacklist: string[]) {
	
	var cy: Object[][] = cycles.find_cycles(root, size, blacklist);

	var nums: num_size[] = permutationgraph.permutationgraph.findnums(cy);

	console.log("Found " + nums.length + " watermarks");

	window.postMessage({ type: "jsw_found_watermark", text: JSON.stringify(nums) }, "*");

}
