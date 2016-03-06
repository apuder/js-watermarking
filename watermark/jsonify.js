/// <reference path="typings/main/ambient/node/node.d.ts" />
"use strict";
var fs = require('fs');
function printUsage() {
    var usage = "Usage: node jsonify.js ";
    usage += "file";
    console.log(usage);
}
var fname = process.argv[2];
if (!fname || typeof (fname) !== 'string') {
    console.log("Error: no file name given");
    printUsage();
    process.exit(1);
}
try {
    var original = fs.readFileSync(fname, 'utf-8');
    var jsonified = JSON.stringify(original);
    var out_name = fname;
    out_name = out_name.replace('.js', '.json');
    fs.writeFileSync(out_name, jsonified);
}
catch (e) {
    console.error("Error: " + e.message);
    process.exit(1);
}
