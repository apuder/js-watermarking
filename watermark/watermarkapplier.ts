
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

		var url = "http://localhost:3560/jsw";

		var client = new XMLHttpRequest();

		client.open("PUT", url, true);

		client.setRequestHeader("Content-Type", "application/json");

		client.onerror = function(e) {
			console.error(client.statusText);
		};

		console.log(code);

		client.send(JSON.stringify(code));
	}

}