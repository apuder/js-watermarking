
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
		path_get: cyclicgraphinstructions.path_type;
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

		private static get_obj_alias(obj: Object): string {
			var alias: string = '';

			var keys = Object.keys(obj);

			while (!alias) {
				alias = cyclicgraphinserter.rand_from_array(cyclicgraphinserter.dictionary);

				if (keys.indexOf(alias) >= 0) alias = '';
			}

			obj[alias] = null; // set key in object so it can't be used again

			return '.' + alias;
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

		private static path_get_check(path: cyclicgraphinstructions.path_type, checked: Map<Object, any>, instruction: number): string {
			if (!path.first) return '';
			var code = '';
			var part = '';

			part += path.first.alias_string([path.first_obj], instruction);
			if (checked.get(path.first_obj) != path.first) {
				code += part;
				checked.set(path.first_obj, path.first); // checking external alias node now
			}

			for (var i = 0; i < path.length; i++) {
				var edge = path[i];
				part += edge.alias;
				if (!checked.get(edge)) {
					code += (code ? ' && ' : '') + part;
					checked.set(edge, true); // checking edge now
				}
			}

			return code;
		}

		private static path_set_check(path: cyclicgraphinstructions.path_type, checked: Map<Object, any>, instruction: number): string {
			if (!path.first) return '';
			var code = '';
			var part = '';

			part += path.first.alias_string([path.first_obj], instruction);
			if (checked.get(path.first_obj) != path.first) {
				code += part;
				checked.set(path.first_obj, path.first); // checking external alias node now
			}

			for (var i = 0; i < path.length - 1; i++) {
				var edge = path[i];
				part += edge.alias;
				if (!checked.get(edge)) {
					code += (code ? ' && ' : '') + part;
					checked.set(edge, true); // checking edge now
				}
			}

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
			
			return code;
		}

		private static path_code(path: cyclicgraphinstructions.path_type, instruction: number): string {
			if (!path.first) return '';
			var code = '';

			code += path.first.alias_string([path.first_obj], instruction);

			for (var i = 0; i < path.length; i++) {
				var edge = path[i];
				code += edge.alias;
			}

			return code;
		}

		private static code_new_node(path_set: cyclicgraphinstructions.path_type, checked: Map<Object, any>, instruction: number): check_and_set {
			var code = '';

			var check = cyclicgraphinserter.path_set_check(path_set, checked, instruction);

			var set = cyclicgraphinserter.path_code(path_set, instruction);

			set += ' = {};\n'

			return { 'check': check, 'set': set };
		}

		private static code_new_edge(path_get: cyclicgraphinstructions.path_type, path_set: cyclicgraphinstructions.path_type, checked: Map<Object, any>, instruction: number): check_and_set {
			var code = '';

			// TODO combine paths and checks

			var set_check = cyclicgraphinserter.path_set_check(path_set, checked, instruction);

			var get_check = cyclicgraphinserter.path_get_check(path_get, checked, instruction);

			var set = cyclicgraphinserter.path_code(path_set, instruction);

			var get = cyclicgraphinserter.path_code(path_get, instruction);

			var check = set_check + (set_check && get_check ? ' && ' : '') + get_check;

			set += ' = ' + get + ';\n';

			return { 'check': check, 'set': set };
		}

		

		private code_instructions(instructions: insertion_instruction[], location: number, instruction: number) {

			var code = (this.loc_code[location] || '');

			var check = '';
			var set = '';

			var checked: Map<Object, any> = new Map();

			for (var i = 0; i < instructions.length; i++) {

				var instruct = instructions[i];
				var cs: check_and_set;

				if (instruct.path_get) {
					cs = cyclicgraphinserter.code_new_edge(instruct.path_get, instruct.path_set, checked, instruction + i);
				}
				else {
					cs = cyclicgraphinserter.code_new_node(instruct.path_set, checked, instruction + i);
				}

				if (cs.check)
					check += (check ? ' && ' : '') + cs.check;

				set += cs.set;
			}

			code += cyclicgraphinserter.code_from_idiom(check, set);

			this.loc_code[location] = code;

			// TODO add context alias





		}

		private add_node(edge: cyclicgraphedge, trace: trace_stack, inst: chosen_instance_obj, instruction: number): insertion_instruction {
			var context = inst.context;
			var glob: key_value = cyclicgraphinserter.rand_from_obj(trace.global_context);

			var path_set: cyclicgraphinstructions.path_type;
			if (edge) {
				var node: cyclicgraphnode = edge.destination;

				var alias = cyclicgraphinserter.get_edge_alias(edge);

				// consume and alias edge and node, forcing edge to be used (only valid path to node)
				this.instructions.consume_edge(edge, alias, instruction);
				this.instructions.consume_node(node, instruction);

				// find path to node
				path_set = this.instructions.shortest_path(node, [context], instruction);
				if (!path_set.first)
					path_set = this.instructions.shortest_path(node, [glob.value], instruction);
			}
			else {
				var node: cyclicgraphnode = this.instructions.graph.nodes[0];

				var node = this.instructions.graph.nodes[0];

				// generate alias for node
				var alias = cyclicgraphinserter.get_obj_alias(glob.value);

				// add alias before finding path
				this.instructions.add_node_alias(node, glob.value, glob.key + alias, instruction);
				this.instructions.consume_node(node, instruction);

				// find path to node
				path_set = this.instructions.shortest_path(node, [glob.value], instruction);
			}

			return {
				path_get: null,
				path_set: path_set
			};
		}

		private add_edge(edge: cyclicgraphedge, trace: trace_stack, inst: chosen_instance_obj, instruction: number): insertion_instruction {
			var context = inst.context;
			var glob: key_value = cyclicgraphinserter.rand_from_obj(trace.global_context);

			var origin: cyclicgraphnode = edge.origin;
			var destination: cyclicgraphnode = edge.destination;

			var path_get = this.instructions.shortest_path(destination, [inst.context], instruction);
			if (!path_get.first)
				path_get = this.instructions.shortest_path(destination, [glob.value], instruction);

			var path_set = this.instructions.shortest_path(origin, [inst.context], instruction);
			if (!path_set.first)
				path_set = this.instructions.shortest_path(origin, [glob.value], instruction);

			// add edge to end of set path
			path_set.push(edge);

			// alias and consume after finding a path, path will never use edge
			var alias = cyclicgraphinserter.get_edge_alias(edge);

			// consume and alias edge
			this.instructions.consume_edge(edge, alias, instruction);

			return {
				path_get: path_get,
				path_set: path_set
			};
		}

		private handle_instance(trace: trace_stack, inst: chosen_instance_obj, instruction: number) {


			var num_instruct = cyclicgraphinserter.num_instruct(instruction, this.instructions.size, this.chosen_contexts.size);

			if (num_instruct <= 0) return;

			var instructions: insertion_instruction[] = [];

			for (var num_done = 0; num_done < num_instruct; num_done++) {

				if (instruction == 0 && num_done == 0) {
					// make first node
					instructions.push(this.add_node(null, trace, inst, instruction + num_done));
				} else {
					var edge: cyclicgraphedge = cyclicgraphinserter.rand_from_set(this.instructions.fringe_edge);

					if (edge.destination.built < instruction + num_done) {
						// make edge only
						instructions.push(this.add_edge(edge, trace, inst, instruction + num_done));
					} else {
						// make edge to new node
						instructions.push(this.add_node(edge, trace, inst, instruction + num_done));
					}
				}
			}

			this.code_instructions(instructions, trace[inst.instance].location, instruction);
		}

		private construct_site_code(trace: trace_stack) {
			this.construct_common_contexts(trace);

			this.assign_code_sites(trace);

			this.chosen_instances = [];

			for (var i = 0; i < this.chosen_contexts.length; i++) {
				var context = this.chosen_contexts[i];
				for (var j = 0; j < context.length; j++) {
					this.chosen_instances.push({ 'instance': context[j], 'context': context.obj });
				}
			}

			// sort in increasing order
			this.chosen_instances.sort(function(a: chosen_instance_obj, b: chosen_instance_obj): number {
				return a.instance - b.instance;
			});

			this.loc_code = [];

			// handle instances in order
			for (var instruction = 0; instruction < this.chosen_instances.length; instruction++) {
				var inst = this.chosen_instances[instruction];

				this.handle_instance(trace, inst, instruction);
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