/// <reference path="set_map.d.ts" />
/// <reference path="./cyclicgraph.d.ts" />
var permutationgraph;
(function (permutationgraph_1) {
    "use strict";
    class permutationgraphnode {
        constructor(id) {
            this.id = id;
            this.aliases = {};
            this.alias_obj = new Map();
            this.dist = Infinity;
            this.built = Infinity;
            this.outbound_edges = [];
            this.inbound_edges = [];
        }
        alias_object(context, instruction) {
            for (var k in context) {
                var v = context[k];
                var node_aliases = this.alias_obj.get(v) || [];
                for (var i = 0; i < node_aliases.length; i++) {
                    var interval = node_aliases[i];
                    if (instruction > interval.instruction_added && instruction <= interval.instruction_removed)
                        return v;
                }
            }
            return null;
        }
        alias_string(context, instruction) {
            for (var k in context) {
                var v = context[k];
                var alias = this.alias_obj.get(v) || [];
                for (var i = 0; i < alias.length; i++) {
                    var interval = alias[i];
                    if (instruction > interval.instruction_added && instruction <= interval.instruction_removed)
                        return interval.name;
                }
            }
            return '';
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
                throw "Size " + this.size + " Too small for number " + this.num;
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
                    nums.push(permutationgraph.fact_to_num(permutationgraph.perm_to_fact(perm)));
                    console.log('found watermark number: ' + nums[nums.length - 1] + ' (size: ' + perm.length + ')');
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
        shortest_path(node, context, instruction) {
            if (context.length == 0) {
                return [];
            }
            this.reset_dist();
            var fringe = new Set();
            fringe.add(node);
            node.dist = 0;
            var path = [];
            while (fringe.size > 0) {
                // find min, remove from fringe
                var n = this.fringe_min(fringe);
                fringe.delete(n);
                var obj = n.alias_object(context, instruction);
                if (obj) {
                    path.first = n;
                    path.first_obj = obj;
                    break; // found
                }
                // update
                for (var j in n.inbound_edges) {
                    var e = n.inbound_edges[j];
                    if (e.built < instruction && e.origin.built < instruction && e.origin.dist > n.dist + 1) {
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
                    if (e.destination.dist == closest.dist - 1) {
                        closest = e.destination;
                        path.push(e);
                        break;
                    }
                }
            }
            return path;
        }
        path_to_alias(path, instruction) {
            var alias = '';
            if (path.first_obj) {
                alias += path.first.alias_string([path.first_obj], instruction);
            }
            for (var i = 0; i < path.length; i++) {
                alias += path[i].alias;
            }
            return alias;
        }
        get_alias(node, context, instruction) {
            var ali = node.alias_string(context, instruction);
            if (ali) {
                return ali;
            }
            else {
                return this.path_to_alias(this.shortest_path(node, context, instruction), instruction);
            }
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
                instruction_added: instruction,
                instruction_removed: Infinity
            });
        }
        remove_node_alias(node, alias, instruction) {
            this.remove_node_alias_obj(node, node.aliases[alias], instruction);
        }
        remove_node_alias_obj(node, obj, instruction) {
            var node_aliases = node.alias_obj.get(obj);
            var node_alias_obj = node_aliases[node_aliases.length - 1];
            node_alias_obj.instruction_removed = instruction;
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
            var keys = Object.keys(obj);
            while (!alias) {
                alias = cyclicgraphinserter.rand_from_array(cyclicgraphinserter.dictionary);
                if (keys.indexOf(alias) >= 0)
                    alias = '';
            }
            obj[alias] = null; // set key in object so it can't be used again
            return '.' + alias;
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
        static path_get_check(path, checked, instruction) {
            if (!path.first)
                return '';
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
        static path_set_check(path, checked, instruction) {
            if (!path.first)
                return '';
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
        static path_code(path, instruction) {
            if (!path.first)
                return '';
            var code = '';
            code += path.first.alias_string([path.first_obj], instruction);
            for (var i = 0; i < path.length; i++) {
                var edge = path[i];
                code += edge.alias;
            }
            return code;
        }
        static code_new_node(path_set, checked, instruction) {
            var code = '';
            var check = cyclicgraphinserter.path_set_check(path_set, checked, instruction + 1);
            var set = cyclicgraphinserter.path_code(path_set, instruction + 1);
            set += ' = {};\n';
            return { 'check': check, 'set': set };
        }
        static code_new_edge(path_get, path_set, checked, instruction) {
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
        code_instructions(instructions, location, instruction) {
            var code = (this.loc_code[location] || '');
            var check = '';
            var set = '';
            var checked = new Map();
            for (var i = 0; i < instructions.length; i++) {
                var instruct = instructions[i];
                var cs;
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
        add_node(edge, trace, inst, instruction) {
            var context = inst.context;
            var glob = cyclicgraphinserter.rand_from_obj(trace.global_context);
            var path_set;
            if (edge) {
                var origin = edge.origin;
                var node = edge.destination;
                var alias = cyclicgraphinserter.get_edge_alias(edge);
                // consume and alias edge and node
                this.instructions.consume_edge(edge, alias, instruction);
                this.instructions.consume_node(node, instruction);
                // find path to origin
                path_set = this.instructions.shortest_path(origin, [context], instruction);
                if (!path_set.first)
                    path_set = this.instructions.shortest_path(origin, [glob.value], instruction);
                // add edge to end of path
                path_set.push(edge);
            }
            else {
                var node = this.instructions.graph.nodes[0];
                // generate alias for node
                var alias = cyclicgraphinserter.get_obj_alias(glob.value);
                // add alias before finding path
                this.instructions.add_node_alias(node, glob.value, glob.key + alias, instruction);
                this.instructions.consume_node(node, instruction);
                // find path to node using edge just added by adding 1 to instruction (only 1 path possible)
                // avoid manually constructing path by doing this
                path_set = this.instructions.shortest_path(node, [glob.value], instruction + 1);
            }
            return {
                path_get: null,
                path_set: path_set
            };
        }
        add_edge(edge, trace, inst, instruction) {
            var context = inst.context;
            var glob = cyclicgraphinserter.rand_from_obj(trace.global_context);
            var origin = edge.origin;
            var destination = edge.destination;
            // alias and consume after finding a path
            var alias = cyclicgraphinserter.get_edge_alias(edge);
            // consume and alias edge
            this.instructions.consume_edge(edge, alias, instruction);
            // find paths to destination and origin
            var path_get = this.instructions.shortest_path(destination, [inst.context], instruction);
            if (!path_get.first)
                path_get = this.instructions.shortest_path(destination, [glob.value], instruction);
            var path_set = this.instructions.shortest_path(origin, [inst.context], instruction);
            if (!path_set.first)
                path_set = this.instructions.shortest_path(origin, [glob.value], instruction);
            // add edge to end of set path
            path_set.push(edge);
            return {
                path_get: path_get,
                path_set: path_set
            };
        }
        handle_instance(trace, inst, instruction) {
            var num_instruct = cyclicgraphinserter.num_instruct(instruction, this.instructions.size, this.chosen_contexts.size);
            if (num_instruct <= 0)
                return;
            var instructions = [];
            for (var num_done = 0; num_done < num_instruct; num_done++) {
                if (instruction == 0 && num_done == 0) {
                    // make first node
                    instructions.push(this.add_node(null, trace, inst, instruction + num_done));
                }
                else {
                    var edge = cyclicgraphinserter.rand_from_set(this.instructions.fringe_edge);
                    if (edge.destination.built < instruction + num_done) {
                        // make edge only
                        instructions.push(this.add_edge(edge, trace, inst, instruction + num_done));
                    }
                    else {
                        // make edge to new node
                        instructions.push(this.add_node(edge, trace, inst, instruction + num_done));
                    }
                }
            }
            this.code_instructions(instructions, trace[inst.instance].location, instruction);
        }
        construct_site_code(trace) {
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
            this.chosen_instances.sort(function (a, b) {
                return a.instance - b.instance;
            });
            this.loc_code = [];
            // handle instances in order
            for (var instruction = 0; instruction < this.chosen_instances.length; instruction++) {
                var inst = this.chosen_instances[instruction];
                this.handle_instance(trace, inst, instruction);
            }
        }
        insert(trace) {
            var this_ = this;
            this.construct_site_code(trace);
            this.count = 0;
            return trace.orig_code.replace(/\/\/\/jsw.*/g, function replace(code) {
                if (code.indexOf("///jsw_end") == 0) {
                    return '';
                }
                else if (code.indexOf("///jsw_global") == 0) {
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
    cyclicgraphinserter_1.cyclicgraphinserter = cyclicgraphinserter;
})(cyclicgraphinserter || (cyclicgraphinserter = {}));
/// <reference path="./permutationgraph.ts" />
/// <reference path="./cyclicgraphinstructions.ts" />
/// <reference path="./cyclicgraphinserter.ts" />
var watermarkapplier;
(function (watermarkapplier) {
    "use strict";
    function apply_watermark(trace) {
        var graph = new permutationgraph.permutationgraph(trace.watermark_num, trace.watermark_size);
        var inst = new cyclicgraphinstructions.cyclicgraphinstructions(graph);
        var inserter = new cyclicgraphinserter.cyclicgraphinserter(inst);
        var code = inserter.insert(trace);
        console.log(code);
        // var mime = "application/javascript";
        // var bb = new Blob([code], { type: mime });
        // var url = window.URL.createObjectURL(bb);
        // // use any to avoid compile time errors over HTML5
        // var a: any = document.createElement('a');
        // a.download = trace.file_name;
        // a.href = url;
        // a.textContent = 'Watermark ready';
        // a.dataset.downloadurl = [mime, a.download, a.href].join(':');
        // a.draggable = true;
        // a.style.position = 'fixed';
        // a.style.left = '0px';
        // a.style.top = '0px';
        // document.body.appendChild(a);
        window.postMessage({ type: "jsw_inserted_watermark", text: code, file: trace.file_name }, "*");
    }
    watermarkapplier.apply_watermark = apply_watermark;
})(watermarkapplier || (watermarkapplier = {}));

var trace_stack = [];
var final_stack;
trace_stack.watermark = watermarkapplier.apply_watermark;
trace_stack.file_name = "simple.js";
trace_stack.orig_code = "\nvar root = {};\n\nfunction trivial() {\n\t///jsw\n}\n\ntrivial();\n\n///jsw_global root\n\n///jsw_end\n";

var root = {};

function trivial() {
	trace_stack.push({location:0,context:{}});
}

trivial();

trace_stack.global_context = {'root':root};

final_stack = trace_stack;
trace_stack = [];
window.onload = function() { window.postMessage({ type: 'jsw_trace_complete' }, '*');
 }

