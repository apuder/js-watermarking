
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

		console.log(code);

		var mime = "application/javascript";

		var bb = new Blob([code], { type: mime });

		var url = window.URL.createObjectURL(bb);

		// use any to avoid compile time errors over HTML5
		var a: any = document.createElement('a');
		a.download = trace.file_name;
		a.href = url;
		a.textContent = 'Watermark ready';

		a.dataset.downloadurl = [mime, a.download, a.href].join(':');
		a.draggable = true;

		a.style.position = 'fixed';
		a.style.left = '0px';
		a.style.top = '0px';

		document.body.appendChild(a);
	}

}