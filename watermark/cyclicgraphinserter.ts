
/// <reference path="./set_map.d.ts" />
/// <reference path="./cyclicgraphinstructions.ts" />

interface trace_single {
	location: number,
	context: Object
}

interface context_obj extends Array<number> {
	obj?: Object;
}

interface chosen_context_obj extends Array <context_obj> {
	size?: number;
}

interface chosen_instance_obj {
	instance: number;
	context: Object;
}

interface trace_stack extends Array<trace_single> {
	global_context?: Object;
	watermark_num?: number;
	watermark_size?: number;
	file_name?: string;
	orig_code?: string;
}

interface key_value {
	key: string;
	value: any;
}

class cyclicgraphinserter {

	private static dictionary = [
		'next',
		'prev',
		'previous',
		'self',
		'mpx',
		'stack',
		'tree',
		'heap',
		'other',
		'tmp',
		'a',
		'b',
		'c',
		'value',
		'check',
		'result',
		'status',
		'current',
		'last',
		'default',
		'pos'
		];

	private static rand_from_array(col: any[]): any {
		var i = Math.floor((Math.random() * col.length));
		return col[i];
	}

	private static rand_from_obj(obj: Object): key_value {
		var keys = Object.keys(obj);
		var key: string = cyclicgraphinserter.rand_from_array(keys);
		var value: any = obj[key];
		return { 'key': key, 'value': value };
	}

	private instructions: cyclicgraphinstructions;
	private count: number;
	private loc_code: string[];
	private common_context: Map<Object, context_obj>;
	private chosen_contexts: chosen_context_obj;
	private chosen_instances: chosen_instance_obj[];

	constructor(instructions: cyclicgraphinstructions) {
		this.instructions = instructions;
	}

	private add_inst_to_common_context(inst: number, obj: Object) {
		var context: context_obj = this.common_context.get(obj);
		if (context) {
			context.push(inst);
		} else {
			context = [inst];
			context.obj = obj;
			this.common_context.set(obj, context);
		}
	}

	private construct_common_contexts(trace: trace_stack) {
		this.common_context = new Map<Object, number[]>();

		for (var inst in trace) {

			var context = trace[inst].context;
			var keys: string[] = Object.keys(context);

			if (keys.length == 0) {
				this.add_inst_to_common_context(inst, null);
				// continue;
			}

			for (var key in keys) {
				this.add_inst_to_common_context(inst, context[key]);
			}
		}
	}

	private assign_code_sites(trace: trace_stack) {
		var ordered_contexts: Array<context_obj> = [];

		for (var val of this.common_context.values()) {
			ordered_contexts.push(val);
		}

		// sort decreasing order by length
		// with lonely contexts at the end (contexts without any objects ///jsw (blank))
		ordered_contexts.sort(function(a: context_obj, b: context_obj): number {
			return (b.obj ? b.length : 0) - (a.obj ? a.length : 0);
		});

		this.chosen_contexts = [];
		this.chosen_contexts.size = 0;

		var num_instruct = this.instructions.size;

		var used_instances: Set<number> = new Set<number>();

		for (var c = 0; c < ordered_contexts.length; c++) {
			var used_locations: Set<number> = new Set<number>();

			var common_context = ordered_contexts[c];

			var chosen_context: context_obj = [];
			chosen_context.obj = common_context.obj;

			this.chosen_contexts.push(chosen_context);
			
			for (var j = 0; j < common_context.length; j++) {
				var inst = common_context[j];
				// check if instance already used
				if (used_instances.has(inst)) continue;
				else used_instances.add(inst);

				var loc = trace[inst].location;
				// check if location used already
				if (used_locations.has(loc)) continue;
				else used_locations.add(loc);

				// new location to add code
				chosen_context.push(inst);
				if (++this.chosen_contexts.size >= num_instruct) {
					break; // more sites than instructions, stop
				}
			}
		}
	}

	private static num_instruct(i: number, n: number, p: number): number {
		var m = Math.floor(n / p);
		if (i < n - m * p) m++;
		return m;
	}

	private static get_obj_alias(obj: Object): string {
		var alias: string = '';

		var keys = Object.keys(obj);

		while (!alias) {
			alias = cyclicgraphinserter.rand_from_array(cyclicgraphinserter.dictionary);

			if (keys.indexOf(alias) >= 0) alias = '';
		}

		return '.' + alias;
	}

	private static get_edge_alias(edge: cyclicgraphedge): string {
		var alias: string = '';

		while (!alias) {
			alias = cyclicgraphinserter.rand_from_array(cyclicgraphinserter.dictionary);

			for (var k in edge.origin.outbound_edges) {
				var e = edge.origin.outbound_edges[k];
				if (e.alias === alias) {
					alias = '';
					break;
				}
			}
		}

		return '.' + alias;
	}

	private static code_from_idiom(check: string, set: string): string {
		var code: string = '';
		code += "if (" + check + ") {\n";
		code += "\t" + set + "\n";
		code += "}\n";

		return code;
	}

	private static path_get_check(path: path_type): string {
		var code = '';
		var part = '';

		code += path.first.alias_string([path.first_obj]);
		part += code;

		for (var i = 0; i < path.length; i++) {
			var edge = path[i];
			part += edge.alias;
			code += ' && ' + part;
		}

		return code;
	}

	private static path_set_check(path: path_type): string {
		if (path.length == 0) return '';
		var code = '';
		var part = '';

		code += path.first.alias_string([path.first_obj]);
		part += code;

		for (var i = 0; i < path.length - 1; i++) {
			var edge = path[i];
			part += edge.alias;
			code += ' && ' + part;
		}

		return code;
	}

	private static path_code(path: path_type): string {
		var code = '';

		code += path.first.alias_string([path.first_obj]);

		for (var i = 0; i < path.length; i++) {
			var edge = path[i];
			code += edge.alias;
		}

		return code;
	}


	// must be called after appropriate aliases are added
	private static code_new_node(path_set: path_type): string {
		var code = '';

		var check = cyclicgraphinserter.path_set_check(path_set);

		var set = cyclicgraphinserter.path_code(path_set);

		set += ' = {};'

		return cyclicgraphinserter.code_from_idiom(check, set);
	}

	// must be called after appropriate aliases are added
	private static code_new_edge(path_get: path_type, path_set: path_type): string {
		var code = '';

		// TODO combine paths and checks

		var set_check = cyclicgraphinserter.path_set_check(path_set);

		var get_check = cyclicgraphinserter.path_get_check(path_get);

		var set = cyclicgraphinserter.path_code(path_set);

		var get = cyclicgraphinserter.path_code(path_get);

		var check = set_check + ' && ' + get_check;

		set += ' = ' + get;

		return cyclicgraphinserter.code_from_idiom(check, set);
	}

	private add_first_node(trace: trace_stack, inst: chosen_instance_obj) {
		var location = trace[inst.instance].location;
		var context = inst.context;

		// place reference in global variable
		var glob: key_value = cyclicgraphinserter.rand_from_obj(trace.global_context);

		var node = this.instructions.graph.nodes[0];

		// generate alias for node
		var alias = cyclicgraphinserter.get_obj_alias(glob.value);

		// add alias before finding path
		this.instructions.add_node_alias(node, glob.value, glob.key + alias);
		this.instructions.consume_node(node);

		// find path to node
		var path = this.instructions.shortest_path(node, [glob.value]);

		var code = cyclicgraphinserter.code_new_node(path);

		this.loc_code[location] = (this.loc_code[location] || '') + code;

		// TODO add context alias






	}

	private add_another_node(edge: cyclicgraphedge, trace: trace_stack, inst: chosen_instance_obj) {
		var location = trace[inst.instance].location;
		var context = inst.context;
		var glob: key_value = cyclicgraphinserter.rand_from_obj(trace.global_context);

		var node: cyclicgraphnode = edge.destination;

		var alias = cyclicgraphinserter.get_edge_alias(edge);

		// consume and alias edge and node, forcing edge to be used (only valid path to node)
		this.instructions.consume_edge(edge, alias);
		this.instructions.consume_node(node);

		// find path to node
		var path_set = this.instructions.shortest_path(node, [context]) 
						|| this.instructions.shortest_path(node, [glob.value]);


		var code = cyclicgraphinserter.code_new_node(path_set);

		this.loc_code[location] = (this.loc_code[location] || '') + code;

		// TODO add context alias




		
	}

	private add_another_edge(edge: cyclicgraphedge, trace: trace_stack, inst: chosen_instance_obj) {
		var location = trace[inst.instance].location;
		var context = inst.context;
		var glob: key_value = cyclicgraphinserter.rand_from_obj(trace.global_context);

		var origin: cyclicgraphnode = edge.origin;
		var destination: cyclicgraphnode = edge.destination;

		var path_get = this.instructions.shortest_path(destination, [inst.context])
						|| this.instructions.shortest_path(destination, [glob.value]);

		var path_set = this.instructions.shortest_path(origin, [inst.context])
						|| this.instructions.shortest_path(origin, [glob.value]);

		// add edge to end of set path
		path_set.push(edge);

		// alias and consume after finding a path, path will never use edge
		var alias = cyclicgraphinserter.get_edge_alias(edge);

		// consume and alias edge
		this.instructions.consume_edge(edge, alias);

		var code = cyclicgraphinserter.code_new_edge(path_get, path_set);

		this.loc_code[location] = (this.loc_code[location] || '') + code;

		// TODO add context alias




		

	}

	private add_another_instruction(trace: trace_stack, inst: chosen_instance_obj) {

		var edge: cyclicgraphedge = cyclicgraphinserter.rand_from_array(this.instructions.fringe_edge.values());

		if (edge.destination.built) {
			// make edge only
			this.add_another_edge(edge, trace, inst);
		} else {
			// make edge to new node
			this.add_another_node(edge, trace, inst);
		}
	}

	private handle_instance(trace: trace_stack, inst: chosen_instance_obj, i: number) {
		

		var num_instruct = cyclicgraphinserter.num_instruct(i, this.instructions.size, this.chosen_contexts.size);

		if (num_instruct <= 0) return;

		var num_done = 0;

		for(var num_done = 0; num_done < num_instruct; num_done++) {

			if (i == 0 && num_done == 0) {
				this.add_first_node(trace, inst);
			} else {
				this.add_another_instruction(trace, inst);
			}
		}
		// add or move alias
	}

	private construct_site_code(trace: trace_stack) {
		this.construct_common_contexts(trace);

		this.assign_code_sites(trace);

		this.chosen_instances = [];

		for (var i = 0; i < this.chosen_contexts.length; i++) {
			var context = this.chosen_contexts[i];
			for (var j in context) {
				this.chosen_instances.push({ 'instance': context[j], 'context': context.obj });
			}
		}

		// sort in increasing order
		this.chosen_instances.sort(function(a: chosen_instance_obj, b: chosen_instance_obj): number {
			return a.instance - b.instance;
		});

		this.loc_code = [];

		// handle instances in order
		for(var j in this.chosen_instances) {
			var inst = this.chosen_instances[j];

			this.handle_instance(trace, inst, j);
		}
	}

	insert(trace: trace_stack): string {
		this.construct_site_code(trace);

		this.count = 0;
		return trace.orig_code.replace(/\/\/\/jsw.*/g, function replace(code: string): string {
			if (code.indexOf("///jsw_end") == 0) {
				return '';
			} else if (code.indexOf("///jsw_global") == 0) {
				return '';
			} else {
				return this.loc_code[this.count++] || '';
			}
		});
	};
}
