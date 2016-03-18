/// <reference path="set_map.d.ts" />
/// <reference path="./cyclicgraph.d.ts" />
var permutationgraph;
(function (permutationgraph_1) {
    "use strict";
    class permutationgraphnode {
        constructor(id) {
            this.id = id;
            this.aliases = new Map();
            this.alias_obj = new Map();
            this.dist = Infinity;
            this.built = Infinity;
            this.outbound_edges = [];
            this.inbound_edges = [];
        }
        alias_object(context, instruction, building_now) {
            if (building_now) {
                for (var k in context) {
                    var v = context[k];
                    var node_aliases = this.alias_obj.get(v) || [];
                    for (var i = 0; i < node_aliases.length; i++) {
                        var interval = node_aliases[i];
                        if (instruction >= interval.instruction_added && instruction < interval.instruction_removed)
                            return interval;
                    }
                }
            }
            else {
                for (var k in context) {
                    var v = context[k];
                    var node_aliases = this.alias_obj.get(v) || [];
                    for (var i = 0; i < node_aliases.length; i++) {
                        var interval = node_aliases[i];
                        if (instruction > interval.instruction_added && instruction <= interval.instruction_removed)
                            return interval;
                    }
                }
            }
            return null;
        }
        alias_object_building(context, instruction) {
            for (var k in context) {
                var v = context[k];
                var node_aliases = this.alias_obj.get(v) || [];
                for (var i = 0; i < node_aliases.length; i++) {
                    var interval = node_aliases[i];
                    if (instruction >= interval.instruction_added && instruction < interval.instruction_removed)
                        return interval;
                }
            }
            return null;
        }
    }
    permutationgraph_1.permutationgraphnode = permutationgraphnode;
    class permutationgraphedge {
        constructor(origin, destination) {
            this.alias = '';
            this.built = Infinity;
            this.backbone = false;
            this.destination = destination;
            this.origin = origin;
        }
    }
    permutationgraph_1.permutationgraphedge = permutationgraphedge;
    class permutationgraph {
        constructor(num, size) {
            if (num < 0)
                throw ("Invalid number");
            this.num = num;
            // find minimal size to fit number
            var min_size = permutationgraph.num_size(num) + 1;
            this.size = size || min_size;
            // must have at least size one greater than necessary, to ensure permutation begins with 0
            if (this.size < min_size)
                throw "Number " + this.num + " too large for size " + this.size;
            this.makenodes();
            // make nodes before edges
            this.makeedges();
        }
        // calculates factorial and stores intermediate results in fact
        static factorial(n) {
            if (!permutationgraph.fact) {
                permutationgraph.fact = [1];
            }
            for (var i = permutationgraph.fact.length; i <= n; i++) {
                permutationgraph.fact[i] = i * permutationgraph.fact[i - 1];
            }
            return permutationgraph.fact[n];
        }
        static findnums(cycles) {
            // find all numbers represented by permutation graphs in cycles
            var nums = [];
            for (var i = 0; i < cycles.length; i++) {
                var backbone = cycles[i];
                var perm = permutationgraph.backbone_to_perm(backbone);
                if (perm) {
                    nums.push({ num: permutationgraph.fact_to_num(permutationgraph.perm_to_fact(perm)), size: perm.length });
                    console.log('found watermark number: ' + nums[nums.length - 1].num + ' (size: ' + nums[nums.length - 1].size + ')');
                }
            }
            return nums;
        }
        static backbone_to_perm(backbone) {
            // check backbone valid if so return permutation represented
            // else null
            var begin_digit = /^\d/;
            var size = backbone.length;
            var perm = [];
            var i;
            var i_zero = -1;
            // console.log(backbone.length, backbone)
            for (i = 0; i < size; i++) {
                var obj = backbone[i];
                var val = 0;
                for (var k in obj) {
                    var other = obj[k];
                    var j = backbone.indexOf(other);
                    if (j >= 0) {
                        // other in backbone
                        if (j == i) {
                            // invalid graph, no nodes link to themselves
                            // console.log("self link, discarding backbone");
                            return null;
                        }
                        if (begin_digit.test(k)) {
                            // data link, record value
                            if (j > i) {
                                val = j - i;
                            }
                            else if (j < i) {
                                val = size + j - i;
                            }
                        }
                    }
                }
                if (val == 0) {
                    i_zero = i;
                }
                if (perm.indexOf(val) >= 0) {
                    // already found this edge, invalid permutation graph
                    // console.log("invalid permutation, number repeated", perm);
                    return null;
                }
                perm.push(val);
            }
            if (i_zero < 0) {
                // console.log("invalid permutation, no zero node");
                return null; // should never happen
            }
            var perm_reordered = [];
            for (i = 0; i < size; ++i) {
                perm_reordered[size - i - 1] = perm[(i + i_zero) % size];
            }
            return perm_reordered;
        }
        static num_size(num) {
            var size = 1;
            while (num >= permutationgraph.factorial(size)) {
                size += 1;
            }
            return size;
        }
        static num_to_fact(num, size) {
            var fact = [];
            for (var i = (size || permutationgraph.num_size(num)) - 1; i >= 0; i--) {
                fact[i] = Math.floor(num / permutationgraph.factorial(i));
                num -= fact[i] * permutationgraph.factorial(i);
            }
            return fact;
        }
        static fact_to_num(fact) {
            var num = 0;
            for (var i = 0; i < fact.length; i++) {
                num += fact[i] * permutationgraph.factorial(i);
            }
            return num;
        }
        // takes an array representing a fact and turns it into the
        // permutation representation of the factorial number
        static fact_to_perm(fact) {
            var perm = fact.slice();
            for (var i = 1; i < perm.length; i++) {
                for (var j = 0; j < i; j++) {
                    if (perm[j] >= perm[i]) {
                        perm[j]++;
                    }
                }
            }
            return perm;
        }
        // takes an array representing a permutation and turns it into the
        // factorial representation of the permutation
        static perm_to_fact(perm) {
            var fact = perm.slice();
            for (var i = fact.length - 1; i > 0; i--) {
                for (var j = 0; j < i; j++) {
                    if (fact[j] > fact[i]) {
                        fact[j]--;
                    }
                }
            }
            return fact;
        }
        makenodes() {
            this.nodes = [];
            // make nodes
            for (var i = 0; i < this.size; ++i) {
                this.nodes.push(new permutationgraphnode(i));
            }
        }
        add_edge(source, destination, backbone) {
            var edge = new permutationgraphedge(source, destination);
            edge.backbone = backbone;
            source.outbound_edges.push(edge);
            destination.inbound_edges.push(edge);
            this.num_edges++;
        }
        makeedges() {
            this.num_edges = 0;
            var size = this.size;
            var nodes = this.nodes;
            var perm = permutationgraph.fact_to_perm(permutationgraph.num_to_fact(this.num, this.size));
            for (var i = 0; i < size; i++) {
                // make backbone edges
                this.add_edge(nodes[i], nodes[(i + 1) % size], true);
                var dest = (i + perm[size - i - 1]) % size;
                if (i != dest) {
                    // edge is not representing zero
                    this.add_edge(nodes[i], nodes[dest], false);
                }
            }
        }
        get_node(id) {
            return this.nodes[id];
        }
    }
    permutationgraph_1.permutationgraph = permutationgraph;
})(permutationgraph || (permutationgraph = {}));
/// <reference path="./set_map.d.ts" />
/// <reference path="./cyclicgraph.d.ts" />
var cyclicgraphinstructions;
(function (cyclicgraphinstructions_1) {
    "use strict";
    class cyclicgraphinstructions {
        constructor(graph) {
            this.graph = graph;
            this.size = graph.num_edges + 1;
            this.fringe_edge = new Set();
        }
        // breadth randomely
        possible(nodes) {
            var fringe = [];
            for (var i in nodes) {
                var edges = nodes[i].outbound_edges;
                for (var j in edges) {
                    var e = edges[j];
                    if (e.built >= Infinity) {
                        fringe.push(e);
                    }
                }
            }
            return fringe;
        }
        reset_dist() {
            for (var i in this.graph.nodes) {
                this.graph.nodes[i].dist = Infinity;
            }
        }
        fringe_add_all(fringe) {
            for (var i in this.graph.nodes) {
                fringe.add(this.graph.nodes[i]);
            }
        }
        fringe_min(fringe) {
            var obj = undefined;
            var d = Infinity;
            for (var v of fringe.values()) {
                if (v.dist < d) {
                    d = v.dist;
                    obj = v;
                }
            }
            return obj;
        }
        shortest_path(node, context, instruction, building_now) {
            if (Object.keys(context).length == 0) {
                return [];
            }
            this.reset_dist();
            var fringe = new Set();
            fringe.add(node);
            node.dist = 0;
            var path = [];
            var check_inst = instruction + (building_now ? 1 : 0);
            while (fringe.size > 0) {
                // find min, remove from fringe
                var n = this.fringe_min(fringe);
                fringe.delete(n);
                var node_alias = n.alias_object(context, instruction, building_now);
                if (node_alias) {
                    path.first = n;
                    path.first_obj = node_alias.obj;
                    break; // found
                }
                // update
                for (var j in n.inbound_edges) {
                    var e = n.inbound_edges[j];
                    if (e.built < check_inst && e.origin.built < check_inst && e.origin.dist > n.dist + 1) {
                        // add on first encounter
                        if (!fringe.has(e.origin))
                            fringe.add(e.origin);
                        e.origin.dist = n.dist + 1;
                    }
                }
            }
            if (!path.first)
                return path;
            var closest = path.first;
            while (closest.dist > 0) {
                for (var i in closest.outbound_edges) {
                    var e = closest.outbound_edges[i];
                    if (e.built < check_inst && e.destination.dist == closest.dist - 1) {
                        closest = e.destination;
                        path.push(e);
                        break;
                    }
                }
            }
            return path;
        }
        add_edges_fringe(node) {
            for (var k in node.outbound_edges) {
                var edge = node.outbound_edges[k];
                if (edge.built >= Infinity)
                    this.fringe_edge.add(edge);
            }
        }
        remove_edge_fringe(edge) {
            if (this.fringe_edge.has(edge))
                this.fringe_edge.delete(edge);
        }
        add_node_alias(node, obj, alias, instruction) {
            var node_aliases = node.alias_obj.get(obj);
            if (!node_aliases) {
                node_aliases = [];
                node.alias_obj.set(obj, node_aliases);
            }
            node_aliases.push({
                name: alias,
                obj: obj,
                instruction_added: instruction,
                instruction_removed: Infinity
            });
        }
        remove_node_alias_obj(node, obj, instruction) {
            var node_alias = node.alias_object([obj], instruction, false);
            if (node_alias) {
                node_alias.instruction_removed = instruction;
            }
        }
        consume_node(node, instruction) {
            if (node.built >= Infinity) {
                node.built = instruction;
                this.add_edges_fringe(node);
            }
        }
        consume_edge(edge, alias, instruction) {
            edge.built = instruction;
            edge.alias = alias;
            this.remove_edge_fringe(edge);
        }
    }
    cyclicgraphinstructions_1.cyclicgraphinstructions = cyclicgraphinstructions;
})(cyclicgraphinstructions || (cyclicgraphinstructions = {}));
/// <reference path="./set_map.d.ts" />
/// <reference path="./cyclicgraphinstructions.ts" />
var cyclicgraphinserter;
(function (cyclicgraphinserter_1) {
    "use strict";
    class cyclicgraphinserter {
        constructor(instructions) {
            this.instructions = instructions;
        }
        static rand_from_array(col) {
            var i = Math.floor(Math.random() * col.length);
            return col[i];
        }
        static rand_from_obj(obj) {
            var keys = Object.keys(obj);
            var key = cyclicgraphinserter.rand_from_array(keys);
            var value = obj[key];
            return { 'key': key, 'value': value };
        }
        static rand_from_set(set) {
            var m = Math.floor(Math.random() * set.size);
            var i = 0;
            var thing;
            for (let item of set) {
                if (i == m) {
                    thing = item;
                    break;
                }
                i++;
            }
            return thing;
        }
        add_inst_to_common_context(inst, obj) {
            var context = this.common_context.get(obj);
            if (context) {
                context.push(inst);
            }
            else {
                context = [inst];
                context.obj = obj;
                this.common_context.set(obj, context);
            }
        }
        construct_common_contexts(trace) {
            this.common_context = new Map();
            for (var inst = 0; inst < trace.length; inst++) {
                var context = trace[inst].context;
                var keys = Object.keys(context);
                if (keys.length == 0) {
                    this.add_inst_to_common_context(inst, null);
                }
                for (var key in keys) {
                    this.add_inst_to_common_context(inst, context[key]);
                }
            }
        }
        assign_code_sites(trace) {
            var ordered_contexts = [];
            for (var val of this.common_context.values()) {
                ordered_contexts.push(val);
            }
            // sort decreasing order by length
            // with lonely contexts at the end (contexts without any objects ///jsw (blank))
            ordered_contexts.sort(function (a, b) {
                return (b.obj ? b.length : 0) - (a.obj ? a.length : 0);
            });
            this.chosen_contexts = [];
            this.chosen_contexts.size = 0;
            var num_instruct = this.instructions.size;
            var used_instances = new Set();
            for (var c = 0; c < ordered_contexts.length; c++) {
                var used_locations = new Set();
                var common_context = ordered_contexts[c];
                var chosen_context = [];
                chosen_context.obj = common_context.obj;
                this.chosen_contexts.push(chosen_context);
                for (var j = 0; j < common_context.length; j++) {
                    var inst = common_context[j];
                    // check if instance already used
                    if (used_instances.has(inst))
                        continue;
                    else
                        used_instances.add(inst);
                    var loc = trace[inst].location;
                    // check if location used already
                    if (used_locations.has(loc))
                        continue;
                    else
                        used_locations.add(loc);
                    // new location to add code
                    chosen_context.push(inst);
                    if (++this.chosen_contexts.size >= num_instruct) {
                        break; // more sites than instructions, stop
                    }
                }
            }
        }
        static num_instruct(i, n, p) {
            var m = Math.floor(n / p);
            if (i < n - m * p)
                m++;
            return m;
        }
        static get_obj_alias(obj) {
            var alias = '';
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
                if (keys[alias])
                    alias = '';
            }
            keys[alias] = true; // set key so it can't be used again
            return '.' + alias;
        }
        static reset_obj_keys() {
            cyclicgraphinserter.used_obj_keys = new Map();
        }
        static get_edge_alias(edge) {
            var alias = '';
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
            else {
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
        static context_obj_alias(obj, context) {
            for (var k in context) {
                if (context[k] == obj)
                    return k;
            }
            return '';
        }
        static code_from_idiom(check, set) {
            var code = '';
            if (check) {
                code += "if (" + check + ") {\n";
                code += "\t" + set + "\n";
                code += "}\n";
            }
            else {
                code += set + "\n";
            }
            return code;
        }
        // all of path must be valid as of instruction
        // num_check is the number of edges to check
        static valid_path_check(trace, path, context, checked, check_set, instruction) {
            if (!path.first)
                return '';
            var code = '';
            var part = '';
            part += cyclicgraphinserter.context_obj_alias(path.first_obj, context) || cyclicgraphinserter.context_obj_alias(path.first_obj, trace.global_context);
            var alias = path.first.alias_object([path.first_obj], instruction, check_set);
            part += alias ? alias.name : '';
            if (alias && checked.get(alias) != path.first) {
                code += part;
                checked.set(alias, path.first); // checking external alias node now
            }
            var i;
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
        check_path(trace, path, context, checked, check_set, instruction) {
            if (!path || !path.first)
                return '';
            var code = '';
            var last_built = -3;
            var tmp_path = [];
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
                }
            }
            var i;
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
                        if (new_code)
                            code += (code ? ' && ' : '') + new_code;
                    }
                    else {
                    }
                }
                var next_node = edge.destination;
                if (next_node.built < instruction) {
                    // path built at destination of edge, keep checking
                    if (last_built == 2 * i) {
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
                if (new_code)
                    code += (code ? ' && ' : '') + new_code;
            }
            else if (check_set && path.length == 0 && path.first.alias_object([path.first_obj], instruction, true) && path.first.built == instruction) {
                // check direct set not already done
                var new_code = cyclicgraphinserter.valid_path_check(trace, path, context, checked, check_set, instruction);
                if (new_code)
                    code += (code ? ' && ' : '') + new_code;
            }
            return code;
        }
        code_check(trace, instruct, checked, instruction) {
            var code = '';
            // if (instruct.alias_obj) {
            // 	var path: cyclicgraphinstructions.path_type = [];
            // 	var set_path = instruct.path_set;
            // 	path.first = set_path.length > 0 ? set_path[set_path.length - 1].destination : set_path.first;
            // 	path.first_obj = instruct.alias_obj;
            // 	code += this.check_path(trace, path, instruct.inst.context, checked, true, instruction);
            // }
            var new_code = this.check_path(trace, instruct.path_get, instruct.inst.context, checked, false, instruction);
            if (new_code)
                code += (code ? ' && ' : '') + new_code;
            new_code = this.check_path(trace, instruct.path_set, instruct.inst.context, checked, true, instruction);
            if (new_code)
                code += (code ? ' && ' : '') + new_code;
            return code;
        }
        static path_code(path, set_path, trace, context, instruction) {
            if (!path.first)
                return '';
            var code = '';
            code += cyclicgraphinserter.context_obj_alias(path.first_obj, context) || cyclicgraphinserter.context_obj_alias(path.first_obj, trace.global_context);
            code += path.first.alias_object([path.first_obj], instruction, set_path).name;
            for (var i = 0; i < path.length; i++) {
                var edge = path[i];
                code += edge.alias;
            }
            return code;
        }
        static code_instruct(instruct, trace, instruction) {
            var alias = instruct.alias_str;
            var set = cyclicgraphinserter.path_code(instruct.path_set, true, trace, instruct.inst.context, instruction);
            var get = instruct.path_get ? cyclicgraphinserter.path_code(instruct.path_get, false, trace, instruct.inst.context, instruction) : "{}";
            var code = alias + set + ' = ' + get + ';\n';
            return code;
        }
        code_instructions(instructions, trace, inst, instruction) {
            var location = trace[inst.instance].location;
            var code = (this.loc_code[location] || '');
            var check = '';
            var set = '';
            var checked = new Map();
            for (var i = 0; i < instructions.length; i++) {
                var instruct = instructions[i];
                var check_i = this.code_check(trace, instruct, checked, instruction);
                var set_i = cyclicgraphinserter.code_instruct(instruct, trace, instruction + i);
                if (check_i)
                    check += (check ? ' && ' : '') + check_i;
                set += set_i;
            }
            code += cyclicgraphinserter.code_from_idiom(check, set);
            this.loc_code[location] = code;
        }
        add_node(edge, trace, inst, instruction) {
            var path_set;
            if (edge) {
                var origin = edge.origin;
                // find path to origin
                path_set = this.instructions.shortest_path(origin, inst.context, instruction, false);
                if (!path_set.first)
                    path_set = this.instructions.shortest_path(origin, trace.global_context, instruction, false);
                if (!path_set.first)
                    console.log("failed to find path to node " + origin.id);
                var node = edge.destination;
                var alias = cyclicgraphinserter.get_edge_alias(edge);
                // consume and alias edge and node
                this.instructions.consume_edge(edge, alias, instruction);
                this.instructions.consume_node(node, instruction);
                // add edge to end of path
                path_set.push(edge);
            }
            else {
                // pick a single global to refer to root
                var glob = cyclicgraphinserter.rand_from_obj(trace.global_context);
                var node = this.instructions.graph.nodes[0];
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
        add_edge(edge, trace, inst, instruction) {
            var origin = edge.origin;
            var destination = edge.destination;
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
        add_alias(curr_instr, inst, force, instruction) {
            if (Object.keys(inst.context).length == 0) {
                return;
            }
            // get the node that will be aliased
            var path_set = curr_instr.path_set;
            var node;
            if (path_set.length > 0) {
                node = path_set[path_set.length - 1].destination;
            }
            else {
                node = path_set.first;
            }
            if (force ||
                path_set.length > 2) {
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
            var local_obj = cyclicgraphinserter.rand_from_obj(inst.context);
            // generate alias for node
            var alias_str = cyclicgraphinserter.get_obj_alias(local_obj.value);
            this.instructions.add_node_alias(node, local_obj.value, alias_str, instruction);
            curr_instr.alias_str = local_obj.key + alias_str + " = ";
            curr_instr.alias_obj = local_obj.value;
        }
        handle_instance(trace, inst, instruction, num_instruct) {
            if (num_instruct <= 0)
                return;
            var instructions = [];
            for (var num_done = 0; num_done < num_instruct; num_done++) {
                var curr_instr;
                var curr_instruction = instruction + num_done;
                if (curr_instruction == 0) {
                    // make first node
                    curr_instr = this.add_node(null, trace, inst, curr_instruction);
                }
                else {
                    var edge = cyclicgraphinserter.rand_from_set(this.instructions.fringe_edge);
                    if (edge.destination.built < curr_instruction) {
                        // make edge only
                        curr_instr = this.add_edge(edge, trace, inst, curr_instruction);
                    }
                    else {
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
        construct_site_code(trace) {
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
            this.chosen_instances.sort(function (a, b) {
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
        insert(trace) {
            var this_ = this;
            this.construct_site_code(trace);
            this.count = 0;
            return trace.orig_code.replace(/\/\/\/jsw.*/g, function replace(code) {
                if (code.indexOf("\/\/\/jsw_end") == 0) {
                    return '';
                }
                else if (code.indexOf("\/\/\/jsw_global") == 0) {
                    return '';
                }
                else {
                    return this_.loc_code[this_.count++] || '';
                }
            });
        }
        ;
    }
    cyclicgraphinserter.dictionary = [
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
    cyclicgraphinserter.used_obj_keys = new Map();
    cyclicgraphinserter_1.cyclicgraphinserter = cyclicgraphinserter;
})(cyclicgraphinserter || (cyclicgraphinserter = {}));
/// <reference path="./permutationgraph.ts" />
/// <reference path="./cyclicgraphinstructions.ts" />
/// <reference path="./cyclicgraphinserter.ts" />
var watermarkapplier;
(function (watermarkapplier) {
    "use strict";
    function apply_watermark(trace) {
        try {
            var graph = new permutationgraph.permutationgraph(trace.watermark_num, trace.watermark_size);
            var inst = new cyclicgraphinstructions.cyclicgraphinstructions(graph);
            var inserter = new cyclicgraphinserter.cyclicgraphinserter(inst);
            var code = inserter.insert(trace);
            // console.log(code);
            window.postMessage({
                type: "jsw_inserted_watermark",
                text: code,
                file: trace.file_name,
                number: trace.watermark_num,
                size: trace.watermark_size
            }, "*");
        }
        catch (e) {
            window.postMessage({
                type: "jsw_insertion_error",
                text: e.toString(),
                file: trace.file_name,
                number: trace.watermark_num,
                size: trace.watermark_size
            }, "*");
        }
    }
    watermarkapplier.apply_watermark = apply_watermark;
})(watermarkapplier || (watermarkapplier = {}));
