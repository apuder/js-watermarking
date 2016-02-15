
/// <reference path="typings/main/ambient/node/node.d.ts" />
/// <reference path="./radixgraph.d.ts" />
/// <reference path="./rootedgraphinstructions.d.ts" />
/// <reference path="./rootedgraphinserter.d.ts" />
/// <reference path="./preprocess.d.ts" />

import fs = require('fs');

import { radixgraph } from "./radixgraph";
import { rootedgraphinstructions } from "./rootedgraphinstructions";
import { rootedgraphinserter } from "./rootedgraphinserter";
import { preprocess } from "./preprocess";

var rootedgraph = radixgraph;

function printUsage() {
	var usage = "Usage: node watermark.js ";
	usage += "number ";
	usage += "file ";
	usage += "command";
	console.log(usage);
}

var numarg: string = process.argv[2];
var fname: string = process.argv[3];

var num: number = parseInt(numarg);

if (!numarg || typeof (numarg) !== 'string') {
	console.log("Error: no number given");
	printUsage();
	process.exit(1);
} else if (!num) {
	console.log("Error: Invalid number given");
	printUsage();
	process.exit(1);
}

if (!fname || typeof (fname) !== 'string') {
	console.log("Error: no file name given");
	printUsage();
	process.exit(1);
}

function apply_trace(code: string): string {

	var header: string = "var trace_stack = [];\n"
		+ "function jsw_watermark() { };\n";
		// + "var orig_code = " + code + "\n";

	code = preprocess(original_code_string, header);

	return code + "\n";
}

try {
	var original_code_string: string = fs.readFileSync(fname, 'utf-8');

	// make a radix graph representing number num
	// var rad = new rootedgraph(num);
	// var inst = new rootedgraphinstructions(rad);

	var trace_code: string = apply_trace(original_code_string);

	var out_name = fname;

	if (out_name.indexOf('_jswpp.js') >= 0) {
		out_name = out_name.replace('_jswpp.js', '_jsw.js');
	} else {
		out_name = out_name.replace('.js', '_jsw.js');
	}

	fs.writeFileSync(out_name, trace_code);
	




	// var trace_stack = [];

	// var theRoot;





	// eval(trace_code);

	// var watermark_inserter = new rootedgraphinserter(original_code_string, inst);

	// var watermark_code = watermark_inserter.insert();

	// watermark_code += cmd;


	// // print code with injected watermark
	// console.log(watermark_code);
	// // console.log(radcode);

	// // run injected code
	// eval(watermark_code);


	// // find number from root
	// console.log("Expecting: " + rad.num);
	// console.log("Found: " + rootedgraph.findnum(theRoot));

} catch (e) {
	console.log("Error: " + e.message);
	process.exit(1);
}
