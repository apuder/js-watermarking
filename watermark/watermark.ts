
/// <reference path="typings/main/ambient/node/node.d.ts" />
/// <reference path="./preprocess.d.ts" />

import fs = require('fs');
import net = require('net');
import path = require('path');

import { preprocess } from "./preprocess";

function printUsage() {
	var usage = "Usage: node watermark.js ";
	usage += "file ";
	usage += "number ";
	usage += "size ";
	// usage += "url ";
	console.log(usage);
}

var fname: string = process.argv[2];
var numarg: string = process.argv[3];
var sizearg: string = process.argv[4];
// var page: string = process.argv[5];

var num: number = parseInt(numarg);
var size: number = parseInt(sizearg);

if (!fname || typeof (fname) !== 'string') {
	console.log("Error: no file name given");
	printUsage();
	process.exit(1);
}

if (!numarg || typeof (numarg) !== 'string') {
	console.log("Error: no number given");
	printUsage();
	process.exit(1);
} else if (num < 0) {
	console.log("Error: Invalid number given");
	printUsage();
	process.exit(1);
} 

if (!sizearg || typeof (sizearg) !== 'string') {
	console.log("Error: no size given");
	printUsage();
	process.exit(1);
} else if (!size) {
	console.log("Error: Invalid size given");
	printUsage();
	process.exit(1);
}

function apply_preprocessor(fname: string, code: string): string {

	var abs_fname = path.resolve(fname);
	abs_fname = abs_fname.replace('.pp', '');
	abs_fname = abs_fname.replace('.jsw', '');

	// TODO fix hardcoded filepath

	var header: string = fs.readFileSync('/home/jburmark/workspace/js-watermarking/watermark/watermarkapplier.js', 'utf-8') + "\n"
		+ "var trace_stack = [];\n"
		// + "trace_stack.watermark_num = " + JSON.stringify(num) + ";\n"
		// + "trace_stack.watermark_size = " + JSON.stringify(size) + ";\n"
		// + "trace_stack.watermark = watermarkapplier.apply_watermark;\n"
		+ "trace_stack.file_name = " + JSON.stringify(abs_fname) + ";\n"
		+ "trace_stack.orig_code = " + JSON.stringify(code) + ";\n"
		;

	code = preprocess(original_code_string, header);

	return code + "\n";
}

try {
	var original_code_string: string = fs.readFileSync(fname, 'utf-8');

	var trace_code: string = apply_preprocessor(fname, original_code_string);

	var out_name = fname;

	if (out_name.indexOf('.pp') < 0) {
		out_name = "out.jsw.js"
	} else {
		out_name = out_name.replace('.pp', '');
	}

	fs.writeFileSync(out_name, trace_code);

	

} catch (e) {
	console.log("Error: " + e.message);
	process.exit(1);
}
