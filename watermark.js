/// <reference path="typings/esprima/esprima.d.ts" />
/// <reference path="typings/escodegen/escodegen.d.ts" />
/// <reference path="typings/esmorph/esmorph.d.ts" />
/// <reference path="./radixgraph.d.ts" />
/// <reference path="./rootedgraphinstructions.d.ts" />
var esprima = require("esprima");
var escodegen = require("escodegen");
var esmorph = require("esmorph");
var radixgraph_1 = require("./radixgraph");
var rootedgraphinstructions_1 = require("./rootedgraphinstructions");
var original_code_string = 'function question() {\n return 7 * 9 }';
var code_ast = esprima.parse(original_code_string);
var generated_code = escodegen.generate(code_ast);
var tracerEntrance = esmorph.Tracer.FunctionEntrance(function (fn) {
    var sig = 'console.log("Call ' + fn.name;
    sig += ' at line ' + fn.loc.start.line;
    sig += ' in range [' + fn.range[0] + ',' + fn.range[1] + ']");';
    return sig;
});
var tracerExit = esmorph.Tracer.FunctionExit(function (fn) {
    var sig = 'console.log("Exit ' + fn.name;
    sig += ' at line ' + fn.loc.end.line;
    sig += ' in range [' + fn.range[0] + ',' + fn.range[1] + ']");';
    return sig;
});
var morphed_code_entry = esmorph.modify(original_code_string, tracerEntrance);
var morphed_code_exit = esmorph.modify(original_code_string, tracerExit);
var morphed_code_both = esmorph.modify(morphed_code_entry, tracerExit);
// console.log(radixgraph);
// console.log();
// console.log(rootedgraphinstructions);
// console.log();
var rad = new radixgraph_1.radixgraph.radixgraph(1509325484);
var inst = new rootedgraphinstructions_1.rootedgraphinstructions.rootedgraphinstructions(rad);
// print original code
// console.log(JSON.stringify(original_code_string, null, 4));
// console.log();
// // print generated abstract syntax tree
// console.log(JSON.stringify(code_ast, null, 4));
// console.log();
// // print regenerated code
// console.log(JSON.stringify(generated_code, null, 4));
// console.log();
// // print code with extra statements at beginning
// console.log(JSON.stringify(morphed_code_entry, null, 4));
// console.log();
// // print code with extra statements at end
// console.log(JSON.stringify(morphed_code_exit, null, 4));
// console.log();
// // print code with extra statements at beginning and end
// console.log(JSON.stringify(morphed_code_both, null, 4));
// console.log();
// print radix graph
// console.log(rad);
// console.log();
function pathfromroot(instruction) {
    var inst = "root";
    var path = instruction.path_from_root;
    for (var i = 0; i < path.length; ++i) {
        if (path[i].is_edge) {
            var edge = path[i];
            inst += "[" + edge.origin_edge + "]";
        }
    }
    return inst;
}
// print each instruction
var radcode = [];
var last_is_node = false;
var i;
var nodes = [];
while (i = inst.next()) {
    // print radix graph instructions
    var comp = i.component;
    if (comp.is_node) {
        var node = comp;
        if (node.id == 0) {
            radcode.push("root = {};");
        }
        else {
            last_is_node = true;
        }
    }
    else {
        var edge = comp;
        var instruction = "";
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
        instruction += " = ";
        if (last_is_node) {
            instruction += "{}";
            last_is_node = false;
            nodes[edge.destination.id] = i;
        }
        else {
            instruction += pathfromroot(nodes[edge.destination.id]);
        }
        radcode.push(instruction + ";");
    }
}
console.log(rad.num);
console.log(rad.size);
console.log(radcode);
var root;
for (var k in radcode)
    eval(radcode[k]);
console.log(radixgraph_1.radixgraph.radixgraph.findnum(root));
