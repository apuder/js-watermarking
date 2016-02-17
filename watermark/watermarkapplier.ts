
/// <reference path="./permutationgraph.ts" />
/// <reference path="./cyclicgraphinstructions.ts" />
/// <reference path="./cyclicgraphinserter.ts" />

function apply_watermark(trace: trace_stack): string {
	var graph = new permutationgraph(trace.watermark_num, trace.watermark_size);
	var inst = new cyclicgraphinstructions(graph)
	var inserter = new cyclicgraphinserter(inst);
	return inserter.insert(trace);
}
