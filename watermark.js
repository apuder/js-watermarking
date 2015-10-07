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
console.log(radixgraph_1.radixgraph);
console.log();
console.log(rootedgraphinstructions_1.rootedgraphinstructions);
console.log();
var rad = new radixgraph_1.radixgraph.radixgraph(1024);
var inst = new rootedgraphinstructions_1.rootedgraphinstructions.rootedgraphinstructions(rad);
// print original code
console.log(JSON.stringify(original_code_string, null, 4));
console.log();
// print generated abstract syntax tree
console.log(JSON.stringify(code_ast, null, 4));
console.log();
// print regenerated code
console.log(JSON.stringify(generated_code, null, 4));
console.log();
// print code with extra statements at beginning
console.log(JSON.stringify(morphed_code_entry, null, 4));
console.log();
// print code with extra statements at end
console.log(JSON.stringify(morphed_code_exit, null, 4));
console.log();
// print code with extra statements at beginning and end
console.log(JSON.stringify(morphed_code_both, null, 4));
console.log();
// print radix graph
console.log(rad);
console.log();
// print each instruction
var i;
while (i = inst.next()) {
    // print radix graph instructions
    var comp = i.component;
    if (comp.is_node) {
        var node = comp;
        console.log("Node(" + comp.id + ")");
    }
    else {
        var edge = comp;
        console.log("Edge(" + edge.origin.id + "->" + edge.destination.id + ")");
    }
    console.log();
}
