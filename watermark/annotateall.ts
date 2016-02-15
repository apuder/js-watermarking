
/// <reference path="typings/main/ambient/node/node.d.ts" />

import fs = require('fs');

function printUsage() {
	var usage = "Usage: node annotateall.js ";
	usage += "file ";
	console.log(usage);
}

var fname: string = process.argv[2];

if (!fname || typeof (fname) !== 'string') {
	console.log("Error: no file name given");
	printUsage();
	process.exit(1);
}

try {
	var original_code_string: string = fs.readFileSync(fname, 'utf-8');

	var annotated_code = original_code_string;

	var count: number = 0;

	function add_annotation(code: string, ind: number): string {
		count++;
		var str: string = "\n///jsw\n";
		return code.slice(0, ind) + str + code.slice(ind);
	}

	function find_func_body(code: string, ind: number): number {

		var stack: string[] = [];

		ind = code.indexOf('(', ind);

		if (ind < 0) return ind;

		stack.push('(');

		while (stack.length > 0) {

			var left: number = code.indexOf('(', ind + 1);
			var right: number = code.indexOf(')', ind + 1);

			if (right >= 0 && right < left) {
				ind = right;
				stack.pop();
			} else if (left >= 0 && left < right) {
				ind = left;
				stack.push('(');
			} else throw 'no more parenthesis';
		}

		ind = code.indexOf('{', ind + 1);

		return ind;

	}

	function find_func(code: string, ind: number): number {
		return code.indexOf('function', ind);
	}

	var ind: number = 0;

	ind = find_func(annotated_code, ind);

	while (ind >= 0) {
		
		ind = find_func_body(annotated_code, ind);

		annotated_code = add_annotation(annotated_code, ind + 1);

		ind = find_func(annotated_code, ind);
	}

	console.log("number of annotations = " + count);

	fs.writeFileSync(fname.replace('.js', '_jswpp.js'), annotated_code);

} catch (e) {
	console.log("Error: " + e.message);
	process.exit(1);
}
