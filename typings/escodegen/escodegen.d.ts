/// <reference path="../estree/estree.d.ts" />

declare module 'escodegen' {
    function generate(ast: ESTree.Program, options?: any): string;
}