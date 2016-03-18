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
            + "trace_stack.jsw_watermark_script = document.createElement('script');\n"
            + "trace_stack.jsw_watermark_script.id = 'jsw_watermark_script';\n"
            + "trace_stack.jsw_watermark_script.text = \""
            + "// sending trace complete message until acknowledged\\n"
            + "var tint = setInterval(function(){ signal_trace_complete() }, 100);\\n"
            + "window.addEventListener('message', function(event) {\\n"
            + "	// We only accept messages from ourselves\\n"
            + "	if (event.source != window)\\n"
            + "	return;\\n"
            + "	if (event.data.type && (event.data.type === 'jsw_trace_complete_acknowledgement')) {\\n"
            + "		if (tint && final_stack.file_name === event.data.file ) { clearInterval(tint); tint = null; }\\n"
            + "	}\\n"
            + "}, false);\\n"
            + "function signal_trace_complete() { console.log('Signaling trace complete'); window.postMessage({ type: 'jsw_trace_complete', file: final_stack.file_name }, '*'); };\\n"
            + "signal_trace_complete();\";\n"
            + "document.head.appendChild(trace_stack.jsw_watermark_script);\n"
            + "console.log('trace complete');";
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
var path = require('path');
var url = require('url');
var http = require('http');
var PORT = 3560;
function printUsage() {
    var usage = "Usage: node watermark.js";
    usage += " [-p PORT]";
    // usage += " file";
    console.log(usage);
}
for (var i = 2; i < process.argv.length; i++) {
    switch (process.argv[i]) {
        case "-p":
            {
                if (i + 1 >= process.argv.length) {
                    printUsage();
                    process.exit(1);
                }
                PORT = parseInt(process.argv[++i]);
                if (!PORT) {
                    printUsage();
                    process.exit(1);
                }
                break;
            }
        default:
            {
                break;
            }
    }
}
// var fname: string = process.argv[2];
// if (!fname || typeof (fname) !== 'string') {
// 	console.log("Error: no file name given");
// 	printUsage();
// 	process.exit(1);
// }
function apply_preprocessor(fname, code) {
    var abs_fname = path.basename(fname);
    abs_fname = abs_fname.replace('.jsw', '');
    var header = (applier || '') + "\n"
        + "var final_stack;\n"
        + "var trace_stack = [];\n"
        + "trace_stack.watermark = watermarkapplier.apply_watermark;\n"
        + "trace_stack.file_name = " + JSON.stringify(abs_fname) + ";\n"
        + "trace_stack.orig_code = " + JSON.stringify(code) + ";\n";
    code = preprocess.preprocess(code, header);
    return code + "\n";
}
try {
    var file_text = {};
    var serv = http.createServer();
    serv.on('request', function (request, response) {
        try {
            request.on('error', function (err) {
                console.error("Error in request: " + err);
                response.statusCode = 400;
                response.setHeader("Access-Control-Allow-Origin", "*");
                response.end();
            });
            response.on('error', function (err) {
                console.error("Error in response: " + err);
            });
            console.log("Recieved request: " + request.method + " " + request.url);
            var request_file = url.parse(request.url).pathname.substring(1);
            switch (request.method) {
                case 'GET':
                    {
                        var response_text = file_text[request_file];
                        if (response_text) {
                            response.statusCode = 200;
                            response.setHeader('Content-Type', 'application/javascript');
                            response.setHeader("Access-Control-Allow-Origin", "*");
                            response.write(response_text);
                            response.end();
                        }
                        else if (request_file === "check") {
                            response.statusCode = 200;
                            response.setHeader("Access-Control-Allow-Origin", "*");
                            response.end();
                        }
                        else {
                            console.log('Error finding file ' + request_file);
                            response.statusCode = 404;
                            response.setHeader("Content-Type", "text/plain");
                            response.setHeader("Access-Control-Allow-Origin", "*");
                            response.write("404 Not Found\n");
                            response.end();
                        }
                        break;
                    }
                case 'PUT':
                case 'POST':
                    {
                        console.log('Preprocessing file ' + request_file);
                        var body_arr = [];
                        var body;
                        request.on('data', function (chunk) {
                            body_arr.push(chunk);
                        });
                        request.on('end', function () {
                            body = Buffer.concat(body_arr).toString();
                            console.log(body);
                            var trace_code = apply_preprocessor(request_file, body);
                            file_text[request_file] = trace_code;
                            response.statusCode = 200;
                            response.setHeader("Access-Control-Allow-Origin", "*");
                            response.end();
                        });
                        break;
                    }
                case 'DELETE':
                    {
                        delete file_text[request_file];
                        response.statusCode = 200;
                        response.setHeader("Access-Control-Allow-Origin", "*");
                        response.end();
                        break;
                    }
                default:
                    {
                        response.statusCode = 400;
                        response.setHeader("Access-Control-Allow-Origin", "*");
                        response.end();
                        break;
                    }
            }
        }
        catch (err) {
            console.log("Error: " + err.message);
            response.statusCode = 500;
            response.setHeader("Content-Type", "text/plain");
            response.setHeader("Access-Control-Allow-Origin", "*");
            response.write(err + "\n");
            response.end();
        }
    });
    serv.listen(PORT, function () {
        console.log("jsw server listening on port " + PORT);
    });
}
catch (err) {
    console.log("Error: " + err.message);
    process.exit(1);
}
