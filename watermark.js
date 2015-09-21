/// <reference path="typings/esprima/esprima.d.ts" />
/// <reference path="typings/escodegen/escodegen.d.ts" />
var esprima = require("esprima");
var escodegen = require("escodegen");
var original_code_string = 'var answer = 42';
var code_ast = esprima.parse(original_code_string);
var generated_code = escodegen.generate(code_ast);
// print original code
console.log(JSON.stringify(original_code_string, null, 4));
// print generated abstract syntax tree
console.log(JSON.stringify(code_ast, null, 4));
// print regenerated code
console.log(JSON.stringify(generated_code, null, 4));
