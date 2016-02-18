/// <reference path="typings/main/ambient/node/node.d.ts" />
/// <reference path="typings/main/ambient/express/express.d.ts" />
/// <reference path="typings/main/ambient/body-parser/body-parser.d.ts" />
/// <reference path="./preprocess.d.ts" />
"use strict";
var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var preprocess_1 = require("./preprocess");
function printUsage() {
    var usage = "Usage: node watermark.js ";
    usage += "file ";
    usage += "number ";
    usage += "size ";
    // usage += "url ";
    console.log(usage);
}
var fname = process.argv[2];
var numarg = process.argv[3];
var sizearg = process.argv[4];
// var page: string = process.argv[5];
var num = parseInt(numarg);
var size = parseInt(sizearg);
if (!fname || typeof (fname) !== 'string') {
    console.log("Error: no file name given");
    printUsage();
    process.exit(1);
}
if (!numarg || typeof (numarg) !== 'string') {
    console.log("Error: no number given");
    printUsage();
    process.exit(1);
}
else if (num < 0) {
    console.log("Error: Invalid number given");
    printUsage();
    process.exit(1);
}
if (!sizearg || typeof (sizearg) !== 'string') {
    console.log("Error: no size given");
    printUsage();
    process.exit(1);
}
else if (!size) {
    console.log("Error: Invalid size given");
    printUsage();
    process.exit(1);
}
function apply_preprocessor(code) {
    var abs_fname = path.resolve(fname);
    abs_fname.replace('.js', '_watermarked.js');
    // TODO fix hardcoded filepath
    var header = fs.readFileSync('/home/jburmark/workspace/js-watermarking/watermark/watermarkapplier.js', 'utf-8') + "\n"
        + "var trace_stack = [];\n"
        + "trace_stack.watermark_num = " + JSON.stringify(num) + ";\n"
        + "trace_stack.watermark_size = " + JSON.stringify(size) + ";\n"
        + "trace_stack.watermark = watermarkapplier.apply_watermark;\n"
        + "trace_stack.file_name = " + JSON.stringify(abs_fname) + ";\n"
        + "trace_stack.orig_code = " + JSON.stringify(code) + ";\n";
    code = preprocess_1.preprocess(original_code_string, header);
    return code + "\n";
}
function do_server() {
    var app = express();
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    var port = process.env.PORT || 3560;
    var router = express.Router();
    var server;
    router.put('/', function (req, res) {
        var b = req.body;
        console.log(b);
        fs.writeFileSync(wm_name, b);
        res.send(200);
        server.close();
        process.exit(0);
    });
    app.use('/jsw', router);
    server = app.listen(port);
    console.log('listen');
}
try {
    var original_code_string = fs.readFileSync(fname, 'utf-8');
    var trace_code = apply_preprocessor(original_code_string);
    var out_name = fname;
    if (out_name.indexOf('_jswpp.js') >= 0) {
        out_name = out_name.replace('_jswpp.js', '_jsw.js');
    }
    else {
        out_name = out_name.replace('.js', '_jsw.js');
    }
    fs.writeFileSync(out_name, trace_code);
    var wm_name = fname.replace('.js', '_watermark.js').replace('_jswpp', '');
    do_server();
}
catch (e) {
    console.log("Error: " + e.message);
    process.exit(1);
}
