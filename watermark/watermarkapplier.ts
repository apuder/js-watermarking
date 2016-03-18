
/// <reference path="./permutationgraph.ts" />
/// <reference path="./cyclicgraphinstructions.ts" />
/// <reference path="./cyclicgraphinserter.ts" />

module watermarkapplier {
	"use strict";

	export function apply_watermark(trace: cyclicgraphinserter.trace_stack) {
		var graph = new permutationgraph.permutationgraph(trace.watermark_num, trace.watermark_size);
		var inst = new cyclicgraphinstructions.cyclicgraphinstructions(graph)
		var inserter = new cyclicgraphinserter.cyclicgraphinserter(inst);

		var code = inserter.insert(trace);

		// console.log(code);

		window.postMessage({ 
			type: "jsw_inserted_watermark", 
			text: code, 
			file: trace.file_name, 
			number: trace.watermark_num, 
			size: trace.watermark_size 
		}, "*");
	}
}

