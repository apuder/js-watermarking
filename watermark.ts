
/// <reference path="typings/esprima/esprima.d.ts" />
/// <reference path="typings/escodegen/escodegen.d.ts" />
/// <reference path="typings/esmorph/esmorph.d.ts" />

import esprima = require("esprima");
import escodegen = require("escodegen");
import esmorph = require("esmorph");
import * as rg from "./radixgraph";

var original_code_string : string = 'function question() {\n return 7 * 9 }';

var code_ast : ESTree.Program = esprima.parse(original_code_string);

var generated_code : string = escodegen.generate(code_ast);

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

var morphed_code_entry: string = esmorph.modify(original_code_string, tracerEntrance);

var morphed_code_exit: string = esmorph.modify(original_code_string, tracerExit);

var morphed_code_both: string = esmorph.modify(morphed_code_entry, tracerExit);

console.log(JSON.stringify(rg, null, 4));
console.log();

var rad = new rg.radixgraph(1);
var inst = new rg.radixgraphinstructions(rad);

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
console.log(JSON.stringify(rad, null, 4));
console.log();
// print radix graph instructions
console.log(JSON.stringify(inst, null, 4));
console.log();
