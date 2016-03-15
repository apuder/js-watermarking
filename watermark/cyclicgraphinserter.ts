
/// <reference path="./set_map.d.ts" />
/// <reference path="./cyclicgraphinstructions.ts" />

module cyclicgraphinserter {
	"use strict";

	export interface trace_single {
		location: number,
		context: Object
	}

	interface context_obj extends Array<number> {
		obj?: Object;
	}

	interface chosen_context_obj extends Array<context_obj> {
		size?: number;
	}

	interface chosen_instance_obj {
		instance: number;
		context: Object;
	}

	export interface trace_stack extends Array<trace_single> {
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

	interface insertion_instruction {
		inst: chosen_instance_obj;
		alias_str: string;
		alias_obj: Object;
		path_get?: cyclicgraphinstructions.path_type;
		path_set: cyclicgraphinstructions.path_type;
	}

	interface check_and_set {
		check: string;
		set: string;
	}

	export class cyclicgraphinserter {

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
			'value',
			'check',
			'result',
			'status',
			'current',
			'last',
			'pos',
			'rest',
			'before',
			'after',
			'gry',
			'car',
			'cdr',
			'head',
			'aware',
			'miyabi',
			'yugen',
			'wabi',
			'sabi',
			'tsukimi'
		];

		private static rand_from_array(col: any[]): any {
			var i = Math.floor(Math.random() * col.length);
			return col[i];
		}

		private static rand_from_obj(obj: Object): key_value {
			var keys = Object.keys(obj);
			var key: string = cyclicgraphinserter.rand_from_array(keys);
			var value: any = obj[key];
			return { 'key': key, 'value': value };
		}

		private static rand_from_set<T>(set: Set<T>): T {
			var m = Math.floor(Math.random() * set.size);
			var i = 0;
			var thing;
			for(let item of set) {
				if (i == m) {
					thing = item;
					break;
				}
				i++;
			}
			return thing;
		}

		private instructions: cyclicgraphinstructions.cyclicgraphinstructions;
		private count: number;
		private loc_code: string[];
		private common_context: Map<Object, context_obj>;
		private chosen_contexts: chosen_context_obj;
		private chosen_instances: chosen_instance_obj[];

		constructor(instructions: cyclicgraphinstructions.cyclicgraphinstructions) {
			this.instructions = instructions;
		}

		private add_inst_to_common_context(inst: number, obj: Object) {
			var context = this.common_context.get(obj);
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

			for (var inst = 0; inst < trace.length; inst++) {

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

		private static used_obj_keys: Map<Object, Object> = new Map();

		private static get_obj_alias(obj: Object): string {
			var alias: string = '';

			// get used keys for this object
			var keys = cyclicgraphinserter.used_obj_keys.get(obj);
			if (!keys) {
				// keys for this object not registered, register keys
				keys = {};

				var keys_arr = Object.keys(obj);
				for (var k in keys_arr) {
					keys[k] = true;
				}

				cyclicgraphinserter.used_obj_keys.set(obj, keys);
			}

			while (!alias) {
				alias = cyclicgraphinserter.rand_from_array(cyclicgraphinserter.dictionary);

				if (keys[alias]) alias = '';
			}

			keys[alias] = true; // set key so it can't be used again

			return '.' + alias;
		}

		private static reset_obj_keys() {
			cyclicgraphinserter.used_obj_keys = new Map();
		}

		private static get_edge_alias(edge: cyclicgraphedge): string {
			var alias: string = '';

			if (edge.backbone) {
				// find name
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
				alias = '.' + alias;
			}
			else
			{
				// give number
				var n = 0;

				while (!alias) {
					alias = "[" + n + "]";

					for (var k in edge.origin.outbound_edges) {
						var e = edge.origin.outbound_edges[k];
						if (e.alias === alias) {
							alias = '';
							n++;
							break;
						}
					}
				}
			}

			return alias;
		}

		// find name (alias) of obj in context
		private static context_obj_alias(obj: Object, context: Object): string {
			for (var k in context) {
				if (context[k] == obj) return k;
			}
			return '';
		}

		private static code_from_idiom(check: string, set: string): string {
			var code: string = '';
			if (check) {
				code += "if (" + check + ") {\n";
				code += "\t" + set + "\n";
				code += "}\n";
			} else {
				code += set + "\n";
			}

			return code;
		}

		// all of path must be valid as of instruction
		// num_check is the number of edges to check
		private static valid_path_check(trace: trace_stack, path: cyclicgraphinstructions.path_type, context: Object, checked: Map<Object, any>, check_set: boolean, instruction: number): string {
			if (!path.first) return '';
			var code = '';
			var part = '';

			part += cyclicgraphinserter.context_obj_alias(path.first_obj, context) || cyclicgraphinserter.context_obj_alias(path.first_obj, trace.global_context);
			var alias = path.first.alias_object([path.first_obj], instruction, check_set);
			part += alias ? alias.name : '';
			if (alias && checked.get(alias) != path.first) {
				code += part;
				checked.set(alias, path.first); // checking external alias node now
			}

			var i: number;
			var num_check = check_set ? path.length - 1 : path.length;
			for (i = 0; i < num_check; i++) {
				var edge = path[i];
				part += edge.alias;
				if (!checked.get(edge)) {
					code += (code ? ' && ' : '') + part;
					checked.set(edge, true); // checking edge now
				}
			}

			if (check_set) {
				if (path.length == 0) {
					// making edge from external object to a node, always check
					checked.set(path.first, true); // making node now
					code = '!' + part;
				}
				else {
					// making edge from node to node
					var edge = path[i];
					part += edge.alias;
					if (!checked.get(edge.origin)) {
						// no need to check edges of nodes made during these instructions
						code += (code ? ' && ' : '') + '!' + part;
					}
					checked.set(edge, true); // making edge now
					checked.set(edge.destination, true); // making node now
				}
			}
			
			return code;
		}

		// parts of path may have been constructed during current instruction
		// make paths to check existance of all nodes and edges
		private check_path(trace: trace_stack, path: cyclicgraphinstructions.path_type, context: Object, checked: Map<Object, any>, check_set: boolean, instruction: number): string {
			if (!path || !path.first) return '';
			var code = '';
			var last_built = -3;
			var tmp_path: cyclicgraphinstructions.path_type = [];
			
			if (path.first.alias_object([path.first_obj], instruction, false)) {
				// alias already built to first
				last_built = -2;

				if (path.first.built < instruction) {
					// first node built, keep checking
					// on built run
					last_built = -1;

					tmp_path.first = path.first;
					tmp_path.first_obj = path.first_obj;
				}
				else {
					// alias was built, but node hasn't been built
					console.error("alias found for unbuilt node");
				}
			}
			else {
				// alias not built, start unbuilt run
				if (path.first.built < instruction) {
					// first node built, keep checking

					// incoming alias unbuilt, start built run
					// make tmp path to this node
					tmp_path = this.instructions.shortest_path(path.first, context, instruction, false);
					if (!tmp_path.first)
						tmp_path = this.instructions.shortest_path(path.first, trace.global_context, instruction, false);

					last_built = -1;
				}
				else {
					// path unbuilt at first
					// on unbuilt run
				}
			}

			var i: number;
			var num_check = check_set ? path.length - 1 : path.length;
			for (i = 0; i < num_check; i++) {
				var edge = path[i];

				if (edge.built < instruction) {
					// path built at edge, keep checking until unbuilt
					if (last_built == 2 * i - 1) {
						// on built run, grow tmp_path
						tmp_path.push(edge);
					} 
					else {
						// origin node unbuilt, yet edge built
						// should never happen as can't build edge from unbuilt node
						console.error("edge built before origin node built");
					}
					last_built = 2 * i;
				} 
				else {
					// path unbuilt at edge, keep checking until built
					if (last_built == 2 * i - 1) {
						// origin node was built, end built run
						// test path up to this point
						var new_code = cyclicgraphinserter.valid_path_check(trace, tmp_path, context, checked, false, instruction);
						if (new_code) code += (code ? ' && ' : '') + new_code;
					} 
					else {
						// on unbuilt run
					}
				}

				var next_node = edge.destination;
				if (next_node.built < instruction) {
					// path built at destination of edge, keep checking
					if (last_built == 2 * i) {
						// on built run
					}
					else {
						// incoming edge unbuilt, start built run
						// make tmp path to this node
						tmp_path = this.instructions.shortest_path(next_node, context, instruction, false);
						if (!tmp_path.first)
							tmp_path = this.instructions.shortest_path(next_node, trace.global_context, instruction, false);
					}
					last_built = 2 * i + 1;
				} 
				else {
					// path unbuilt at destination of edge, keep checking till find next built node
					if (last_built == 2 * i) {
						// incoming edge built, yet node unbuilt
						// should never happen as can't build edge to unbuilt node
						console.error("edge built before destination node built");
					}
					else {
						// on unbuilt run
					}
				}
			}

			if (last_built == 2 * i - 1) {
				// last node was built, can check it
				if (check_set) {
					// this is a set check,
					// ensure last edge not valid
					if (path.length > 0) {
						// add last edge to path
						tmp_path.push(path[i]);
					}
				}
				var new_code = cyclicgraphinserter.valid_path_check(trace, tmp_path, context, checked, check_set, instruction);
				if (new_code) code += (code ? ' && ' : '') + new_code;
			}
			else if (check_set && path.length == 0 && path.first.alias_object([path.first_obj], instruction, true) && path.first.built == instruction) {
				// check direct set not already done

				var new_code = cyclicgraphinserter.valid_path_check(trace, path, context, checked, check_set, instruction);
				if (new_code) code += (code ? ' && ' : '') + new_code;
			}

			return code;
		}


		private code_check(trace: trace_stack, instruct: insertion_instruction, checked: Map<Object, any>, instruction: number): string {
			var code = '';

			// if (instruct.alias_obj) {
			// 	var path: cyclicgraphinstructions.path_type = [];
			// 	var set_path = instruct.path_set;
			// 	path.first = set_path.length > 0 ? set_path[set_path.length - 1].destination : set_path.first;
			// 	path.first_obj = instruct.alias_obj;
			// 	code += this.check_path(trace, path, instruct.inst.context, checked, true, instruction);
			// }

			var new_code = this.check_path(trace, instruct.path_get, instruct.inst.context, checked, false, instruction);
			if (new_code) code += (code ? ' && ' : '') + new_code;

			new_code = this.check_path(trace, instruct.path_set, instruct.inst.context, checked, true, instruction);
			if (new_code) code += (code ? ' && ' : '') + new_code;

			return code;
		}

		private static path_code(path: cyclicgraphinstructions.path_type, set_path: boolean, trace: trace_stack, context: Object, instruction: number): string {
			if (!path.first) return '';
			var code = '';

			code += cyclicgraphinserter.context_obj_alias(path.first_obj, context) || cyclicgraphinserter.context_obj_alias(path.first_obj, trace.global_context);

			code += path.first.alias_object([path.first_obj], instruction, set_path).name;

			for (var i = 0; i < path.length; i++) {
				var edge = path[i];
				code += edge.alias;
			}

			return code;
		}

		private static code_instruct(instruct: insertion_instruction, trace: trace_stack, instruction: number): string {
			var alias = instruct.alias_str;

			var set = cyclicgraphinserter.path_code(instruct.path_set, true, trace, instruct.inst.context, instruction);

			var get = instruct.path_get ? cyclicgraphinserter.path_code(instruct.path_get, false, trace, instruct.inst.context, instruction) : "{}";

			var code = alias + set + ' = ' + get + ';\n';

			return code;
		}

		private code_instructions(instructions: insertion_instruction[], trace: trace_stack, inst: chosen_instance_obj, instruction: number) {

			var location = trace[inst.instance].location;

			var code = (this.loc_code[location] || '');

			var check = '';
			var set = '';

			var checked = new Map<Object, any>();

			for (var i = 0; i < instructions.length; i++) {

				var instruct = instructions[i];

				var check_i = this.code_check(trace, instruct, checked, instruction);

				var set_i = cyclicgraphinserter.code_instruct(instruct, trace, instruction + i);

				if (check_i) check += (check ? ' && ' : '') + check_i;

				set += set_i;
			}

			code += cyclicgraphinserter.code_from_idiom(check, set);

			this.loc_code[location] = code;
		}

		private add_node(edge: cyclicgraphedge, trace: trace_stack, inst: chosen_instance_obj, instruction: number): insertion_instruction {

			var path_set: cyclicgraphinstructions.path_type;

			if (edge) {
				var origin = edge.origin;

				// find path to origin
				path_set = this.instructions.shortest_path(origin, inst.context, instruction, false);
				if (!path_set.first)
					path_set = this.instructions.shortest_path(origin, trace.global_context, instruction, false);
				if (!path_set.first)
					console.log("failed to find path to node "+origin.id);

				var node: cyclicgraphnode = edge.destination;

				var alias = cyclicgraphinserter.get_edge_alias(edge);

				// consume and alias edge and node
				this.instructions.consume_edge(edge, alias, instruction);
				this.instructions.consume_node(node, instruction);

				// add edge to end of path
				path_set.push(edge);
			}
			else {
				// pick a single global to refer to root
				var glob: key_value = cyclicgraphinserter.rand_from_obj(trace.global_context);

				var node: cyclicgraphnode = this.instructions.graph.nodes[0];

				// generate alias for node
				var alias = cyclicgraphinserter.get_obj_alias(glob.value);

				// add alias before finding path
				this.instructions.add_node_alias(node, glob.value, alias, instruction);
				this.instructions.consume_node(node, instruction);

				// find path to node using edge just added by adding 1 to instruction (only 1 path possible)
				// avoid manually constructing path by doing this
				path_set = [];
				path_set.first = node;
				path_set.first_obj = glob.value;
			}

			return {
				inst: inst,
				alias_str: '',
				alias_obj: null,
				path_get: null,
				path_set: path_set
			};
		}

		private add_edge(edge: cyclicgraphedge, trace: trace_stack, inst: chosen_instance_obj, instruction: number): insertion_instruction {
			var origin: cyclicgraphnode = edge.origin;
			var destination: cyclicgraphnode = edge.destination;

			// find paths to destination and origin
			var path_get = this.instructions.shortest_path(destination, inst.context, instruction, false);
			if (!path_get.first)
				path_get = this.instructions.shortest_path(destination, trace.global_context, instruction, false);
			if (!path_get.first)
				console.log("failed to find path to node " + destination.id);

			if (path_get.length > 0 && path_get[path_get.length - 1] == edge) {
				console.error("get path uses edge currently being built");
            }

			var path_set = this.instructions.shortest_path(origin, inst.context, instruction, false);
			if (!path_set.first)
				path_set = this.instructions.shortest_path(origin, trace.global_context, instruction, false);
			if (!path_set.first)
				console.log("failed to find path to node " + origin.id);

			// alias and consume after finding a path
			var alias = cyclicgraphinserter.get_edge_alias(edge);

			// consume and alias edge
			this.instructions.consume_edge(edge, alias, instruction);

			// add edge to end of set path
			path_set.push(edge);

			return {
				inst: inst,
				alias_str: '',
				alias_obj: null,
				path_get: path_get,
				path_set: path_set
			};
		}

		private add_alias(curr_instr: insertion_instruction, inst: chosen_instance_obj, force: boolean, instruction: number) {
			if (Object.keys(inst.context).length == 0) {
				return;
			}

			// get the node that will be aliased
			var path_set = curr_instr.path_set;
			var node: cyclicgraphnode;
			if (path_set.length > 0) {
				node = path_set[path_set.length - 1].destination
			}
			else {
				node = path_set.first;
			}

			if (force || 
				path_set.length > 2
				) {
				// decide to alias
			}
			else {
				// don't alias
				return;
			}

			// check not already aliased by an object in current context
			if (node.alias_object(inst.context, instruction, true)) {
				return;
			}

			// pick a single object to hold alias
			var local_obj: key_value = cyclicgraphinserter.rand_from_obj(inst.context);

			// generate alias for node
			var alias_str = cyclicgraphinserter.get_obj_alias(local_obj.value);

			this.instructions.add_node_alias(node, local_obj.value, alias_str, instruction);

			curr_instr.alias_str = local_obj.key + alias_str + " = ";
			curr_instr.alias_obj = local_obj.value;
		}

		private handle_instance(trace: trace_stack, inst: chosen_instance_obj, instruction: number, num_instruct: number) {

			if (num_instruct <= 0) return;

			var instructions: insertion_instruction[] = [];

			for (var num_done = 0; num_done < num_instruct; num_done++) {
				var curr_instr: insertion_instruction;
				var curr_instruction = instruction + num_done;

				if (curr_instruction == 0) {
					// make first node
					curr_instr = this.add_node(null, trace, inst, curr_instruction);
				} else {
					var edge: cyclicgraphedge = cyclicgraphinserter.rand_from_set(this.instructions.fringe_edge);

					if (edge.destination.built < curr_instruction) {
						// make edge only
						curr_instr = this.add_edge(edge, trace, inst, curr_instruction);
					} else {
						// make edge to new node
						curr_instr = this.add_node(edge, trace, inst, curr_instruction);
					}
				}

				// add local alias
				this.add_alias(curr_instr, inst, curr_instruction == 0 || (num_done == 0 && num_instruct > 2), curr_instruction);

				instructions.push(curr_instr);
			}

			this.code_instructions(instructions, trace, inst, instruction);
		}

		private construct_site_code(trace: trace_stack) {
			this.construct_common_contexts(trace);

			this.assign_code_sites(trace);

			this.chosen_instances = [];

			for (var i = 0; i < this.chosen_contexts.length; i++) {
				var context = this.chosen_contexts[i];
				for (var j = 0; j < context.length; j++) {
					var instance = context[j];
					this.chosen_instances.push({ 'instance': instance, 'context': trace[instance].context });
				}
			}

			// sort in increasing order
			this.chosen_instances.sort(function(a: chosen_instance_obj, b: chosen_instance_obj): number {
				return a.instance - b.instance;
			});

			this.loc_code = [];

			cyclicgraphinserter.reset_obj_keys();

			// handle instances in order
			var instruction = 0;
			for (var i = 0; i < this.chosen_instances.length; i++) {
				var inst = this.chosen_instances[i];

				var num_instruct = cyclicgraphinserter.num_instruct(i, this.instructions.size, this.chosen_contexts.size);

				this.handle_instance(trace, inst, instruction, num_instruct);

				instruction += num_instruct;
			}
		}

		insert(trace: trace_stack): string {
			var this_ = this;

			this.construct_site_code(trace);

			this.count = 0;
			return trace.orig_code.replace(/\/\/\/jsw.*/g, function replace(code: string): string {
				if (code.indexOf("///jsw_end") == 0) {
					return '';
				} else if (code.indexOf("///jsw_global") == 0) {
					return '';
				} else {
					return this_.loc_code[this_.count++] || '';
				}
			});
		};
	}
}