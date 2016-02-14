/// <reference path="typings/main/ambient/node/node.d.ts" />
/// <reference path="typings/esprima/esprima.d.ts" />
/// <reference path="typings/escodegen/escodegen.d.ts" />
/// <reference path="typings/esmorph/esmorph.d.ts" />
/// <reference path="./radixgraph.d.ts" />
/// <reference path="./rootedgraphinstructions.d.ts" />
/// <reference path="./trace.d.ts" />
"use strict";
var fs = require('fs');
var esmorph = require("esmorph");
var radixgraph_1 = require("./radixgraph");
var rootedgraphinstructions_1 = require("./rootedgraphinstructions");
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
var cmd = process.argv[4];
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
if (!cmd || typeof (cmd) !== 'string') {
    console.log("Error: no command given");
    printUsage();
    process.exit(1);
}
try {
    var original_code_string = fs.readFileSync(fname, 'utf-8');
    console.log(preprocess(original_code_string, "var jsw = {trace: function () {}, watermark: function() {}}\n"));
    // // make a radix graph representing number num
    var rad = new rootedgraph(num);
    var inst = new rootedgraphinstructions_1.rootedgraphinstructions(rad);
    // name and declare root variable
    var rootname = "theRoot";
    var theRoot;
    // returns a string that if evaluated follows the edges from the root to the component in instruction
    function pathfromroot(instruction) {
        var inst = rootname;
        var path = instruction.path_from_root;
        for (var i = 0; i < path.length; ++i) {
            if (path[i].is_edge) {
                var edge = path[i];
                inst += "[" + edge.origin_edge + "]";
            }
        }
        return inst;
    }
    // make an array of instructions to inject
    var radcode = [];
    var last_is_node = false;
    var i;
    var nodes = [];
    while (i = inst.next()) {
        // find type
        var comp = i.component;
        if (comp.is_node) {
            var node = comp;
            // nodes creation except root creation happens when the first edge
            // to it is created to leave no nodes unconnected
            if (node.id == 0) {
                radcode.push(rootname + " || (" + rootname + " = {});");
            }
            else {
                // mark that a node is to be created as the destination of the next edge
                last_is_node = true;
            }
        }
        else {
            var edge = comp;
            // edge creation may occur with node creation, or between two existing nodes
            var instruction = "";
            // path to the originating node of an edge is guaranteed safe
            // the path given through the edge itself may not be
            if (nodes[edge.origin.id]) {
                // possible for the given path from root to current edge 
                // to use an edge about to be created in this edge batch
                // the node whose outgoing edge is being set exists
                // but an edge on the path to that node (probably the last one) is yet to be
                // created, but will be created later in this batch of edges
                instruction += pathfromroot(nodes[edge.origin.id]) + "[" + edge.origin_edge + "]";
            }
            else {
                instruction += pathfromroot(i);
            }
            // avoid recreating nodes, breaks existing links
            instruction += " || (" + instruction + " = ";
            if (last_is_node) {
                // a node should be made at the destination of this edge
                instruction += "{}";
                last_is_node = false;
                // save the path used to create this node, it will be safe
                nodes[edge.destination.id] = i;
            }
            else {
                instruction += pathfromroot(nodes[edge.destination.id]);
            }
            radcode.push(instruction + "); ");
        }
    }
    // console.log(rad.num);
    // console.log(rad.size);
    // console.log(radcode);
    // var root;
    // for (var k in radcode) {
    // eval(radcode[k]);
    // }
    // console.log(radixgraph.radixgraph.findnum(root));
    // trace the command's control path through the given code
    var codecalls = [];
    var tracerEntrance = esmorph.Tracer.FunctionEntrance(function (fn) {
        var fid = "'" + fn.loc.start.line + "," + fn.loc.start.column + "'";
        // only push new function calls to get first call order
        return "if (codecalls.indexOf(" + fid + ") == -1) { codecalls.push(" + fid + "); }";
    });
    var morphed_code_entry = esmorph.modify(original_code_string, tracerEntrance);
    morphed_code_entry += cmd;
    eval(morphed_code_entry);
    // inject code
    tracerEntrance = esmorph.Tracer.FunctionEntrance(function (fn) {
        var fid = "" + fn.loc.start.line + "," + fn.loc.start.column + "";
        // only push new function calls
        var fnum = codecalls.indexOf(fid);
        if (fnum == -1)
            return "";
        // ensure code does not break program code
        var codeins = "try{ ";
        // input the instructions
        if (codecalls.length >= radcode.length && fnum < radcode.length) {
            // one at a time if enough functions
            codeins += radcode[fnum];
        }
        else {
            var linesperfunc = radcode.length / codecalls.length;
            var startk = Math.floor(fnum * linesperfunc);
            var endk = (fnum + 1 == codecalls.length) ? radcode.length : Math.floor((fnum + 1) * linesperfunc);
            // multiple at a time if fewer functions available
            for (var k = startk; k < endk; ++k) {
                codeins += radcode[k];
            }
        }
        codeins += "} catch (e) { } "; // catch (e) { console.log('Error: ' + e.message + ' at ' + '" + fid + "') }";
        // console.log(fid + "\n" + codeins);
        return codeins;
    });
    morphed_code_entry = esmorph.modify(original_code_string, tracerEntrance);
    morphed_code_entry += cmd;
    // print code with injected watermark
    console.log(morphed_code_entry);
    // console.log(radcode);
    // run injected code
    eval(morphed_code_entry);
    // find number from root
    console.log("Expecting: " + rad.num);
    console.log("Found: " + rootedgraph.findnum(theRoot));
}
catch (e) {
    console.log("Error: " + e.message);
    process.exit(1);
}
