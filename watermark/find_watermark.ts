
/// <reference path="./permutationgraph.ts" />
/// <reference path="./cycles.ts" />

function find_watermark(root: Object, size: number, blacklist: string[]) {
	
	var cy: Object[][] = cycles.find_cycles(root, size, blacklist);

	var nums: number[] = permutationgraph.permutationgraph.findnums(cy);

	// TODO send message of numbers found
}
