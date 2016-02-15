
/// <reference path="./rootedgraphinstructions.d.ts" />

declare module rootedgraphinserter {

	interface stack_call {
		location: number;
		context: Object;
	}

	interface insert_function {
		(): string;
	}

	export class rootedgraphinserter {
		constructor(code: string, instructions: rootedgraphinstructions.rootedgraphinstructions);
		insert: insert_function;
	}
}