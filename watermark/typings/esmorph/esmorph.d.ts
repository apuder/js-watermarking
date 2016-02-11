
declare module 'esmorph' {

    const version: string;

    function modify(code: string, modifier?: any): string;

    module Tracer {

    	interface tracerObject {
			name: string;
			loc: { start: { line: number, column: number }, end: { line: number, column: number } };
			range: {0: number, 1: number};
    	}
		function tracerFunction(object: tracerObject): string;

		function FunctionEntrance(tracename: (object: tracerObject) => string): any;
		function FunctionExit(tracename: (object: tracerObject) => string): any;
    }
}
