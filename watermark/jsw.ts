
/// <reference path="typings/main/ambient/node/node.d.ts" />
/// <reference path="./permutationgraph.ts" />
/// <reference path="./cyclicgraphinstructions.ts" />
/// <reference path="./cyclicgraphinserter.ts" />
/// <reference path="./cycles.ts" />

module preprocess {
	"use strict"

	var jsw_count: number;
	var jsw_global_count: number;
	var jsw_end_count: number;

	// TODO verify validity of identifiers

	function replace_identifier(identifier: string): string {
		identifier = identifier.replace(/,$/, ''); // remove trailing comma
		return "'" + identifier + "':" + identifier + ',';
	}

	function replace_jsw_default(code: string): string {
		code = code.substring(6).trim();
		code = code.replace(/\w+,?/g, replace_identifier);
		code = code.replace(/,$/, ''); // remove trailing comma
		return "trace_stack.push({location:" + jsw_count++ + ",context:{" + code + "}});";
	}

	function replace_jsw_global(code: string): string {
		code = code.substring(13).trim();
		code = code.replace(/\w+,?/g, replace_identifier);
		code = code.replace(/,$/, ''); // remove trailing comma
		jsw_global_count++;
		return "trace_stack.global_context = {" + code + "};";
	}

	function replace_jsw_end(code: string): string {
		jsw_end_count++;
		return ""
			 + "final_stack = trace_stack;\n"
			 + "trace_stack = [];\n"
			// + "trace_stack.jsw_watermark_script = document.createElement('script');\n"
			// + "trace_stack.jsw_watermark_script.id = 'jsw_watermark_script';\n"
			// + "trace_stack.jsw_watermark_script.text = \""
			// + "// sending trace complete message until acknowledged\\n"
			// + "var tint = setInterval(function(){ signal_trace_complete() }, 100);\\n"
			// + "window.addEventListener('message', function(event) {\\n"
			// + "	// We only accept messages from ourselves\\n"
			// + "	if (event.source != window)\\n"
			// + "	return;\\n"
			// + "	if (event.data.type && (event.data.type === 'jsw_trace_complete_acknowledgement')) {\\n"
			// + "		if (tint && final_stack.file_name === event.data.file ) { clearInterval(tint); tint = null; }\\n"
			// + "	}\\n"
			// + "}, false);\\n"
			// + "function signal_trace_complete() { console.log('Signaling trace complete'); window.postMessage({ type: 'jsw_trace_complete', file: final_stack.file_name }, '*'); };\\n"
			// + "signal_trace_complete();\";\n"
			// + "document.head.appendChild(trace_stack.jsw_watermark_script);\n"
			// + "console.log('trace complete');"
			;
	}

	function replace_jsw(code: string): string {
		if (code.indexOf("///jsw_end") == 0) {
			return replace_jsw_end(code);
		} else if (code.indexOf("///jsw_global") == 0) {
			return replace_jsw_global(code);
		} else {
			return replace_jsw_default(code);
		}
	}

	export function preprocess(code: string, header?: string): string {
		jsw_count = 0;
		jsw_global_count = 0;
		jsw_end_count = 0;
		// var orig_code = code;
		// match ///jsw to end of line
		code = code.replace(/\/\/\/jsw.*/g, replace_jsw);

		if (jsw_count == 0) {
			console.log("Error: no ///jsw annotations found");
			process.exit(2);
		}
		if (jsw_global_count == 0) {
			console.log("Error: no ///jsw_global annotations found");
			process.exit(2);
		}
		if (jsw_end_count == 0) {
			console.log("Error: no ///jsw_end annotations found");
			process.exit(2);
		}

		return (header || "") + code;
	}

}

// import * as fs from 'fs';
// import * as path from 'path';

var fs = require('fs');
var path = require('path');

function printUsage() {
	var usage = "Usage: node jsw.js (--harmony)";
	usage += " file";
	usage += " number (if inserting watermark)";
	usage += " [options]";
	console.log(usage);
}

function printHelp() {
	printUsage();
	var helpage = "Options\n";
	helpage += "\t-h\t-\t Show Help\n";
	helpage += "\t-f\t-\tFind a watermark in file\n";
	helpage += "\t-s\t-\tSet Size (default 14)\n";
	helpage += "\t-o\t-\tName of output file\n";
	helpage += "\t-e\t-\t'code to execute during trace'\n";
	console.log(helpage);
}

function checkNumArgs(i: number) {
	if (i >= process.argv.length)
	{
		printUsage();
		process.exit(1);
	}
}

var jsw_file = "";
var jsw_number = -1;
var jsw_size = 14;
var jsw_fileout = "";
var jsw_execute = "";
var jsw_find = false;

var num_args_processed = 0;

// process args
for (var i = 2; i < process.argv.length; i++) {
	switch (process.argv[i])
	{
		case "-o":
		{
			// change output file name
			checkNumArgs(i+1);
			jsw_fileout = process.argv[++i];
			break;
		}
		case "-e":
		{
			// change code to execute with trace
			checkNumArgs(i+1);
			jsw_execute = process.argv[++i];
			break;
		}
		case "-s":
		{
			// change code to execute with trace
			checkNumArgs(i + 1);
			jsw_size = parseInt(process.argv[++i]);
			break;
		}
		case "-f":
		{
			jsw_find = true;
			break;
		}
		case "-h":
		{
			printHelp();
			process.exit(0);
			break;
		}
		default:
		{
			if (process.argv[i].indexOf('-') == 0) {
				console.log("Unknown Option: " + process.argv[i]);
				break;
			}
			// change input file name
			if (num_args_processed == 0) {
				jsw_file = process.argv[i];
				num_args_processed++;
			} else if (num_args_processed == 1) {
				jsw_number = parseInt(process.argv[i]);
				num_args_processed++;
			}
			else {
				printUsage();
				process.exit(1);
			}
			break;
		}
	}
}

// check file input
if (!jsw_file) {
	printUsage();
	process.exit(1);
}


function apply_preprocessor(fname: string, code: string): string {

	var header: string = ""
		// + (jsw_applier || '') + "\n"
		// + "var final_stack;\n"
		// + "var trace_stack = [];\n"
		// + "trace_stack.watermark = watermarkapplier.apply_watermark;\n"
		// + "trace_stack.file_name = " + JSON.stringify(abs_fname) + ";\n"
		// + "trace_stack.orig_code = " + JSON.stringify(code) + ";\n"
		;

	code = preprocess.preprocess(code, header);

	return code + "\n";
}


var jsw_file_text: string = fs.readFileSync(jsw_file, 'utf-8');


if (jsw_find) {
	// find a watermark of size jsw_size or greater
	var jsw_run_code = jsw_file_text + "\n" + jsw_execute;

	// run code
	eval(jsw_run_code);

	// find watermarks
	var found_cycles = cycles.find_cycles(global, jsw_size, []);

	var found_watermarks = permutationgraph.permutationgraph.findnums(found_cycles);

	console.log("Found " + found_watermarks.length + " watermark" + (found_watermarks.length == 1 ? "" : "s"));
	if (found_watermarks.length != 0) console.log("Number\t\tSize");

	for (var i = 0; i < found_watermarks.length; ++i) {
		var wtrmk = found_watermarks[i];
		var str_num = wtrmk.num.toString();
		if (str_num.length < 8) {
			str_num += "\t\t";
		}
		else {
			str_num += "\t";
		}
		console.log(str_num + wtrmk.size);
	}
}
else {
	// check number input
	if (jsw_number < 0) {
		printUsage();
		process.exit(1);
	}

	// name output based on input file
	if (!jsw_fileout) {
		var jsw_fileout: string = path.basename(jsw_file);
		jsw_fileout = jsw_fileout.replace('.jsw', '');
		if (jsw_fileout.lastIndexOf(".js") != jsw_fileout.length - 3) {
			// filename doesn't end in .js
			jsw_fileout += ".js";
		}
		if (jsw_fileout === jsw_file) {
			console.log("Warning: Use -o file.js to overwrite input file");
			process.exit(1);
		}
	}

	// insert a watermark with number jsw_number of size_jsw_size

	var jsw_trace_code = apply_preprocessor(jsw_file, jsw_file_text) + "\n" + jsw_execute;

	// define variables
	var trace_stack: cyclicgraphinserter.trace_stack = [];
	var final_stack: cyclicgraphinserter.trace_stack = [];

	// evaluate code
	eval(jsw_trace_code);

	final_stack.watermark_size = jsw_size;
	final_stack.watermark_num = jsw_number;
	final_stack.orig_code = jsw_file_text;

	var jsw_graph = new permutationgraph.permutationgraph(jsw_number, jsw_size);
	var jsw_inst = new cyclicgraphinstructions.cyclicgraphinstructions(jsw_graph)
	var inserter = new cyclicgraphinserter.cyclicgraphinserter(jsw_inst);

	var jsw_codeout = inserter.insert(final_stack);

	fs.writeFileSync(jsw_fileout, jsw_codeout);
}
