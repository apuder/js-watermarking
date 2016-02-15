

export class rootedgraphinserter {
	private code: string;
	private instructions: rootedgraphinstructions.rootedgraphinstructions;
	constructor(code: string, instructions: rootedgraphinstructions.rootedgraphinstructions) {
		this.code = code;
		this.instructions = instructions;
	}
	insert(trace: string):string {
		return "";
	};
}


// name and declare root variable
var rootname: string = "theRoot";
var theRoot;

// returns a string that if evaluated follows the edges from the root to the component in instruction
function pathfromroot(instruction: rootedgraphinstructions.rootedgraphinstruction): string {
	var inst = rootname;

	var path: rootedgraph.rootedgraphcomponent[] = instruction.path_from_root;
	for (var i = 0; i < path.length; ++i) {
		if (path[i].is_edge) {
			var edge: rootedgraph.rootedgraphedge = <rootedgraph.rootedgraphedge>path[i];
			inst += "[" + edge.origin_edge + "]";
		}
	}

	return inst;
}

// make an array of instructions to inject
var radcode = [];
var last_is_node = false;
var i: rootedgraphinstructions.rootedgraphinstruction;
var nodes: rootedgraphinstructions.rootedgraphinstruction[] = [];
while (i = inst.next()) {
	// find type
	var comp: rootedgraph.rootedgraphcomponent = i.component;
	if (comp.is_node) {
		var node: rootedgraph.rootedgraphnode = <rootedgraph.rootedgraphnode>comp;
		// nodes creation except root creation happens when the first edge
		// to it is created to leave no nodes unconnected
		if (node.id == 0) {
			radcode.push(rootname + " || (" + rootname + " = {});");
		} else {
			// mark that a node is to be created as the destination of the next edge
			last_is_node = true;
		}
		// console.log("n" + node.id + " = {};");
	} else {
		var edge: rootedgraph.rootedgraphedge = <rootedgraph.rootedgraphedge>comp;
		// edge creation may occur with node creation, or between two existing nodes
		var instruction: string = "";

		// path to the originating node of an edge is guaranteed safe
		// the path given through the edge itself may not be
		if (nodes[edge.origin.id]) {
			// possible for the given path from root to current edge 
			// to use an edge about to be created in this edge batch
			// the node whose outgoing edge is being set exists
			// but an edge on the path to that node (probably the last one) is yet to be
			// created, but will be created later in this batch of edges
			instruction += pathfromroot(nodes[edge.origin.id]) + "[" + edge.origin_edge + "]";
		} else {
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
		} else {
			instruction += pathfromroot(nodes[edge.destination.id]);
		}
		radcode.push(instruction + "); ");
		// console.log("n" + edge.origin.id + "[" + edge.origin_edge + "]" + " = n" + edge.destination.id + ";");
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

	

// inject code
tracerEntrance = esmorph.Tracer.FunctionEntrance(function(fn): string {
	var fid: string = "" + fn.loc.start.line + "," + fn.loc.start.column + "";
	// only push new function calls
	var fnum = codecalls.indexOf(fid);
	if (fnum == -1) return "";

	// ensure code does not break program code
	var codeins: string = "try{ ";

	// input the instructions
	if (codecalls.length >= radcode.length && fnum < radcode.length) {
		// one at a time if enough functions
		codeins += radcode[fnum];
	} else {
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