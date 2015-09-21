
/// <reference path="typings/esprima/esprima.d.ts" />
/// <reference path="typings/escodegen/escodegen.d.ts" />

import esprima = require("esprima");
import escodegen = require("escodegen");

var original_code_string : string = 'var answer = 42';

var code_ast : ESTree.Program = esprima.parse(original_code_string);

var generated_code : string = escodegen.generate(code_ast);

// print original code
console.log(JSON.stringify(original_code_string, null, 4));
// print generated abstract syntax tree
console.log(JSON.stringify(code_ast, null, 4));
// print regenerated code
console.log(JSON.stringify(generated_code, null, 4));
