/// <reference path="typings/main/ambient/node/node.d.ts" />
"use strict";
var preprocess;
(function (preprocess_1) {
    "use strict";
    var count;
    // TODO verify validity of identifiers
    function replace_identifier(identifier) {
        identifier = identifier.replace(/,$/, ''); // remove trailing comma
        return "'" + identifier + "':" + identifier + ',';
    }
    function replace_jsw_default(code) {
        code = code.substring(6).trim();
        code = code.replace(/\w+,?/g, replace_identifier);
        code = code.replace(/,$/, ''); // remove trailing comma
        return "trace_stack.push({location:" + count++ + ",context:{" + code + "}});";
    }
    function replace_jsw_global(code) {
        code = code.substring(13).trim();
        code = code.replace(/\w+,?/g, replace_identifier);
        code = code.replace(/,$/, ''); // remove trailing comma
        return "trace_stack.global_context = {" + code + "};";
    }
    function replace_jsw_end(code) {
        return "final_stack = trace_stack;\n"
            + "trace_stack = [];\n"
            + "window.onload = function() { window.postMessage({ type: 'jsw_trace_complete' }, '*');\n }";
    }
    function replace_jsw(code) {
        if (code.indexOf("///jsw_end") == 0) {
            return replace_jsw_end(code);
        }
        else if (code.indexOf("///jsw_global") == 0) {
            return replace_jsw_global(code);
        }
        else {
            return replace_jsw_default(code);
        }
    }
    function preprocess(code, header) {
        count = 0;
        // var orig_code = code;
        // match ///jsw to end of line
        code = code.replace(/\/\/\/jsw.*/g, replace_jsw);
        return (header || "") + code;
    }
    preprocess_1.preprocess = preprocess;
})(preprocess || (preprocess = {}));
var fs = require('fs');
var path = require('path');
function printUsage() {
    var usage = "Usage: node watermark.js ";
    usage += "file ";
    console.log(usage);
}
var fname = process.argv[2];
if (!fname || typeof (fname) !== 'string') {
    console.log("Error: no file name given");
    printUsage();
    process.exit(1);
}
function apply_preprocessor(fname, code) {
    var abs_fname = path.basename(fname);
    abs_fname = abs_fname.replace('.pp', '');
    abs_fname = abs_fname.replace('.jsw', '');
    var watermarkapplier = applier || '';
    var header = watermarkapplier + "\n"
        + "var trace_stack = [];\n"
        + "var final_stack;\n"
        + "trace_stack.watermark = watermarkapplier.apply_watermark;\n"
        + "trace_stack.file_name = " + JSON.stringify(abs_fname) + ";\n"
        + "trace_stack.orig_code = " + JSON.stringify(code) + ";\n";
    code = preprocess.preprocess(original_code_string, header);
    return code + "\n";
}
try {
    var original_code_string = fs.readFileSync(fname, 'utf-8');
    var trace_code = apply_preprocessor(fname, original_code_string);
    var out_name = fname;
    if (out_name.indexOf('.pp') < 0) {
        out_name = "out.jsw.js";
    }
    else {
        out_name = out_name.replace('.pp', '');
    }
    fs.writeFileSync(out_name, trace_code);
}
catch (e) {
    console.log("Error: " + e.message);
    process.exit(1);
}
