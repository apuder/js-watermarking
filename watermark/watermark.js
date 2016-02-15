/// <reference path="typings/main/ambient/node/node.d.ts" />
/// <reference path="./radixgraph.d.ts" />
/// <reference path="./rootedgraphinstructions.d.ts" />
/// <reference path="./rootedgraphinserter.d.ts" />
/// <reference path="./preprocess.d.ts" />
"use strict";
var fs = require('fs');
var radixgraph_1 = require("./radixgraph");
var preprocess_1 = require("./preprocess");
var rootedgraph = radixgraph_1.radixgraph;
function printUsage() {
    var usage = "Usage: node watermark.js ";
    usage += "number ";
    usage += "file ";
    usage += "command";
    console.log(usage);
}
var numarg = process.argv[2];
var fname = process.argv[3];
var num = parseInt(numarg);
if (!numarg || typeof (numarg) !== 'string') {
    console.log("Error: no number given");
    printUsage();
    process.exit(1);
}
else if (!num) {
    console.log("Error: Invalid number given");
    printUsage();
    process.exit(1);
}
if (!fname || typeof (fname) !== 'string') {
    console.log("Error: no file name given");
    printUsage();
    process.exit(1);
}
function apply_trace(code) {
    var header = "var trace_stack = [];\n"
        + "function jsw_watermark() { };\n";
    // + "var orig_code = " + code + "\n";
    code = preprocess_1.preprocess(original_code_string, header);
    return code + "\n";
}
try {
    var original_code_string = fs.readFileSync(fname, 'utf-8');
    // make a radix graph representing number num
    // var rad = new rootedgraph(num);
    // var inst = new rootedgraphinstructions(rad);
    var trace_code = apply_trace(original_code_string);
    var out_name = fname;
    if (out_name.indexOf('_jswpp.js') >= 0) {
        out_name = out_name.replace('_jswpp.js', '_jsw.js');
    }
    else {
        out_name = out_name.replace('.js', '_jsw.js');
    }
    fs.writeFileSync(out_name, trace_code);
}
catch (e) {
    console.log("Error: " + e.message);
    process.exit(1);
}
