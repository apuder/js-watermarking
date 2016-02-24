
/// <reference path="typings/main/ambient/node/node.d.ts" />

import fs = require('fs');

function printUsage() {
	var usage = "Usage: node jsonify.js ";
	usage += "file ";
	// usage += "url ";
	console.log(usage);
}

var fname: string = process.argv[2];

if (!fname || typeof (fname) !== 'string') {
	console.log("Error: no file name given");
	printUsage();
	process.exit(1);
}

var original_code_string: string = fs.readFileSync(fname, 'utf-8');

var new_code_string = JSON.stringify(original_code_string);

var out_fname = fname.replace('.js', '.json');

fs.writeFileSync(out_fname, new_code_string);
