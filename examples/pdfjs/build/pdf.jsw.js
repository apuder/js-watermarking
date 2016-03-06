/// <reference path="./cyclicgraph.d.ts" />
var permutationgraph;
(function (permutationgraph_1) {
    "use strict";
    class permutationgraphnode {
        constructor(id) {
            this.id = id;
            this.alias = [];
            this.alias_obj = [];
            this.dist = 999999999;
            this.built = false;
            this.outbound_edges = [];
            this.inbound_edges = [];
        }
        alias_index(context) {
            var index = -1;
            for (var k in context) {
                var v = context[k];
                index = this.alias_obj.indexOf(v);
                if (index >= 0) {
                    break;
                }
            }
            return index;
        }
        alias_object(context) {
            var i = this.alias_index(context);
            if (i >= 0)
                return this.alias_obj[i];
            else
                return null;
        }
        alias_string(context) {
            var i = this.alias_index(context);
            if (i >= 0)
                return this.alias[i];
            else
                return '';
        }
    }
    permutationgraph_1.permutationgraphnode = permutationgraphnode;
    class permutationgraphedge {
        constructor(origin, destination) {
            this.alias = '';
            this.built = false;
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
        static fbbhelper(stack, found, size) {
            var top = stack[stack.length - 1];
            for (var k in top) {
                var val = top[k];
                // skip non objects and numberic keys
                // numberic keys are not allowed in the backbone
                if (typeof (val) !== 'object' || /^\d/.test(k))
                    continue;
                var index = stack.indexOf(val);
                if (index >= 0) {
                    // cycle found
                    if (stack.length - index == size) {
                        console.log("found cycle");
                        // cycle of length size, save in found array
                        found.push(stack.slice(index));
                    }
                    else {
                        // found a wrong-length cycle, keep looking
                        continue;
                    }
                }
                else {
                    // cycle not yet found
                    // add item
                    stack.push(val);
                    // search further
                    permutationgraph.fbbhelper(stack, found, size);
                    // remove item
                    stack.pop();
                }
            }
        }
        static findbackbones(root, size) {
            // find circular paths of length size via depth first search
            var stack = [];
            var found = [];
            stack.push(root);
            permutationgraph.fbbhelper(stack, found, size);
            return found;
        }
        static findnums(size) {
            var win = window || {};
            var backbones = permutationgraph.findbackbones(win, size);
            var nums = [];
            for (var i = 0; i < backbones.length; i++) {
                var backbone = backbones[i];
                var perm = permutationgraph.backbone_to_perm(backbone);
                if (perm) {
                    nums.push(permutationgraph.fact_to_num(permutationgraph.perm_to_fact(perm)));
                }
            }
            return nums;
        }
        static backbone_to_perm(backbone) {
            // check backbone valid if so return permutation represented
            // else null
            var size = backbone.length;
            var perm = [];
            var i;
            var i_zero = -1;
            for (i = 0; i < size; i++) {
                var obj = backbone[i];
                var found_backbone_link = false;
                var val = 0;
                for (var k in obj) {
                    var other = obj[k];
                    var j = backbone.indexOf(other);
                    if (j >= 0) {
                        // other in backbone
                        if (j == i) {
                            // invalid graph, no nodes link to themselves
                            console.log("self link, discarding backbone");
                            return null;
                        }
                        else if (!found_backbone_link && j == ((i + 1) % size)) {
                            found_backbone_link = true;
                        }
                        else if (j > i) {
                            val = j - i;
                        }
                        else if (j < i) {
                            val = size + j - i;
                        }
                    }
                }
                if (val == 0) {
                    i_zero = i;
                }
                if (perm.indexOf(val) >= 0) {
                    // already found this edge, invalid permutation graph
                    console.log("invalid permutation, number repeated");
                    return null;
                }
                perm.push(val);
            }
            if (i_zero < 0) {
                console.log("invalid permutation, no zero node");
                return null; // should never happen
            }
            var perm_reordered = [];
            for (i = 1; i <= size; ++i) {
                perm_reordered.push(perm[(i + i_zero) % size]);
            }
            console.log(perm_reordered);
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
                var dest = (i + perm[i]) % size;
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
                    if (!e.built) {
                        fringe.push(e);
                    }
                }
            }
            return fringe;
        }
        reset_dist() {
            for (var i in this.graph.nodes) {
                this.graph.nodes[i].dist = 999999999;
            }
        }
        fringe_add_all(fringe) {
            for (var i in this.graph.nodes) {
                fringe.add(this.graph.nodes[i]);
            }
        }
        fringe_min(fringe) {
            var obj = undefined;
            var d = 9999999999;
            for (var v of fringe.values()) {
                if (v.dist < d) {
                    d = v.dist;
                    obj = v;
                }
            }
            return obj;
        }
        shortest_path(node, context) {
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
                var obj = n.alias_object(context);
                if (obj) {
                    path.first = n;
                    path.first_obj = obj;
                    break; // found
                }
                // update
                for (var j in n.inbound_edges) {
                    var e = n.inbound_edges[j];
                    if (e.built && e.origin.built && e.origin.dist > n.dist + 1) {
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
        path_to_alias(path) {
            var alias = '';
            if (path.first_obj) {
                alias += path.first.alias_string([path.first_obj]);
            }
            for (var i = 0; i < path.length; i++) {
                alias += path[i].alias;
            }
            return alias;
        }
        get_alias(node, context) {
            var ali = node.alias_string(context);
            if (ali) {
                return ali;
            }
            else {
                return this.path_to_alias(this.shortest_path(node, context));
            }
        }
        add_edges_fringe(node) {
            for (var k in node.outbound_edges) {
                var edge = node.outbound_edges[k];
                if (!edge.built)
                    this.fringe_edge.add(edge);
            }
        }
        remove_edge_fringe(edge) {
            if (this.fringe_edge.has(edge))
                this.fringe_edge.delete(edge);
        }
        add_node_alias(node, obj, alias) {
            node.alias.push(alias);
            node.alias_obj.push(obj);
        }
        remove_node_alias(node, obj) {
            var i = node.alias_obj.indexOf(obj);
            while (i >= 0) {
                node.alias_obj.splice(i, 1);
                node.alias.splice(i, 1);
                i = node.alias_obj.indexOf(obj);
            }
        }
        consume_node(node) {
            if (!node.built) {
                node.built = true;
                this.add_edges_fringe(node);
            }
        }
        consume_edge(edge, alias) {
            edge.built = true;
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
        static path_get_check(path, checked) {
            if (!path.first)
                return '';
            var code = '';
            var part = '';
            part += path.first.alias_string([path.first_obj]);
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
        static path_set_check(path, checked) {
            if (!path.first)
                return '';
            var code = '';
            var part = '';
            part += path.first.alias_string([path.first_obj]);
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
        static path_code(path) {
            if (!path.first)
                return '';
            var code = '';
            code += path.first.alias_string([path.first_obj]);
            for (var i = 0; i < path.length; i++) {
                var edge = path[i];
                code += edge.alias;
            }
            return code;
        }
        // must be called after appropriate aliases are added
        static code_new_node(path_set, checked) {
            var code = '';
            var check = cyclicgraphinserter.path_set_check(path_set, checked);
            var set = cyclicgraphinserter.path_code(path_set);
            set += ' = {};\n';
            return { 'check': check, 'set': set };
        }
        // must be called after appropriate aliases are added
        static code_new_edge(path_get, path_set, checked) {
            var code = '';
            // TODO combine paths and checks
            var set_check = cyclicgraphinserter.path_set_check(path_set, checked);
            var get_check = cyclicgraphinserter.path_get_check(path_get, checked);
            var set = cyclicgraphinserter.path_code(path_set);
            var get = cyclicgraphinserter.path_code(path_get);
            var check = set_check + (set_check && get_check ? ' && ' : '') + get_check;
            set += ' = ' + get + ';\n';
            return { 'check': check, 'set': set };
        }
        code_instructions(instructions, location) {
            var code = (this.loc_code[location] || '');
            var check = '';
            var set = '';
            var checked = new Map();
            for (var i = 0; i < instructions.length; i++) {
                var instruct = instructions[i];
                var cs;
                if (instruct.path_get) {
                    cs = cyclicgraphinserter.code_new_edge(instruct.path_get, instruct.path_set, checked);
                }
                else {
                    cs = cyclicgraphinserter.code_new_node(instruct.path_set, checked);
                }
                if (cs.check)
                    check += (check ? ' && ' : '') + cs.check;
                set += cs.set;
            }
            code += cyclicgraphinserter.code_from_idiom(check, set);
            this.loc_code[location] = code;
            // TODO add context alias
        }
        add_node(edge, trace, inst) {
            var context = inst.context;
            var glob = cyclicgraphinserter.rand_from_obj(trace.global_context);
            var path_set;
            if (edge) {
                var node = edge.destination;
                var alias = cyclicgraphinserter.get_edge_alias(edge);
                // consume and alias edge and node, forcing edge to be used (only valid path to node)
                this.instructions.consume_edge(edge, alias);
                this.instructions.consume_node(node);
                // find path to node
                path_set = this.instructions.shortest_path(node, [context]);
                if (!path_set.first)
                    path_set = this.instructions.shortest_path(node, [glob.value]);
            }
            else {
                var node = this.instructions.graph.nodes[0];
                var node = this.instructions.graph.nodes[0];
                // generate alias for node
                var alias = cyclicgraphinserter.get_obj_alias(glob.value);
                // add alias before finding path
                this.instructions.add_node_alias(node, glob.value, glob.key + alias);
                this.instructions.consume_node(node);
                // find path to node
                path_set = this.instructions.shortest_path(node, [glob.value]);
            }
            return {
                path_get: null,
                path_set: path_set
            };
        }
        add_edge(edge, trace, inst) {
            var context = inst.context;
            var glob = cyclicgraphinserter.rand_from_obj(trace.global_context);
            var origin = edge.origin;
            var destination = edge.destination;
            var path_get = this.instructions.shortest_path(destination, [inst.context]);
            if (!path_get.first)
                path_get = this.instructions.shortest_path(destination, [glob.value]);
            var path_set = this.instructions.shortest_path(origin, [inst.context]);
            if (!path_set.first)
                path_set = this.instructions.shortest_path(origin, [glob.value]);
            // add edge to end of set path
            path_set.push(edge);
            // alias and consume after finding a path, path will never use edge
            var alias = cyclicgraphinserter.get_edge_alias(edge);
            // consume and alias edge
            this.instructions.consume_edge(edge, alias);
            return {
                path_get: path_get,
                path_set: path_set
            };
        }
        handle_instance(trace, inst, i) {
            var num_instruct = cyclicgraphinserter.num_instruct(i, this.instructions.size, this.chosen_contexts.size);
            if (num_instruct <= 0)
                return;
            var instructions = [];
            for (var num_done = 0; num_done < num_instruct; num_done++) {
                if (i == 0 && num_done == 0) {
                    // make first node
                    instructions.push(this.add_node(null, trace, inst));
                }
                else {
                    var edge = cyclicgraphinserter.rand_from_set(this.instructions.fringe_edge);
                    if (edge.destination.built) {
                        // make edge only
                        instructions.push(this.add_edge(edge, trace, inst));
                    }
                    else {
                        // make edge to new node
                        instructions.push(this.add_node(edge, trace, inst));
                    }
                }
            }
            this.code_instructions(instructions, trace[inst.instance].location);
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
            for (var i = 0; i < this.chosen_instances.length; i++) {
                var inst = this.chosen_instances[i];
                this.handle_instance(trace, inst, i);
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
        var body = encodeURIComponent(JSON.stringify(code));
        var url = "http://localhost:3560/jsw";
        var client = new XMLHttpRequest();
        client.open("POST", url, true);
        // client.setRequestHeader("Content-Type", "application/json");
        client.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        // client.setRequestHeader("Content-Length", body.length.toString());
        // client.setRequestHeader("Connection", "close");
        client.onerror = function (e) {
            console.error(client.statusText);
        };
        client.send(body);
    }
    watermarkapplier.apply_watermark = apply_watermark;
})(watermarkapplier || (watermarkapplier = {}));

var trace_stack = [];
trace_stack.watermark_num = 1234567890;
trace_stack.watermark_size = 14;
trace_stack.watermark = watermarkapplier.apply_watermark;
trace_stack.file_name = "/home/jburmark/workspace/js-watermarking/app/website/build/pdf_jswpp.js";
trace_stack.orig_code = "/* Copyright 2012 Mozilla Foundation\n *\n * Licensed under the Apache License, Version 2.0 (the \"License\");\n * you may not use this file except in compliance with the License.\n * You may obtain a copy of the License at\n *\n *     http://www.apache.org/licenses/LICENSE-2.0\n *\n * Unless required by applicable law or agreed to in writing, software\n * distributed under the License is distributed on an \"AS IS\" BASIS,\n * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n * See the License for the specific language governing permissions and\n * limitations under the License.\n */\n\n// annotated for js-watermark preprocessor\n\n/*jshint globalstrict: false */\n/* globals PDFJS */\n\n// Initializing PDFJS global object (if still undefined)\nif (typeof PDFJS === 'undefined') {\n  (typeof window !== 'undefined' ? window : this).PDFJS = {};\n}\n\nPDFJS.version = '1.3.91';\nPDFJS.build = 'd1e83b5';\n\n(function pdfjsWrapper() {\n\n  // Use strict in our context only - users might not want it\n  'use strict';\n\n\n\nvar globalScope = (typeof window === 'undefined') ? this : window;\n\nvar isWorker = (typeof window === 'undefined');\n\nvar FONT_IDENTITY_MATRIX = [0.001, 0, 0, 0.001, 0, 0];\n\nvar TextRenderingMode = {\n  FILL: 0,\n  STROKE: 1,\n  FILL_STROKE: 2,\n  INVISIBLE: 3,\n  FILL_ADD_TO_PATH: 4,\n  STROKE_ADD_TO_PATH: 5,\n  FILL_STROKE_ADD_TO_PATH: 6,\n  ADD_TO_PATH: 7,\n  FILL_STROKE_MASK: 3,\n  ADD_TO_PATH_FLAG: 4\n};\n\nvar ImageKind = {\n  GRAYSCALE_1BPP: 1,\n  RGB_24BPP: 2,\n  RGBA_32BPP: 3\n};\n\nvar AnnotationType = {\n  TEXT: 1,\n  LINK: 2,\n  FREETEXT: 3,\n  LINE: 4,\n  SQUARE: 5,\n  CIRCLE: 6,\n  POLYGON: 7,\n  POLYLINE: 8,\n  HIGHLIGHT: 9,\n  UNDERLINE: 10,\n  SQUIGGLY: 11,\n  STRIKEOUT: 12,\n  STAMP: 13,\n  CARET: 14,\n  INK: 15,\n  POPUP: 16,\n  FILEATTACHMENT: 17,\n  SOUND: 18,\n  MOVIE: 19,\n  WIDGET: 20,\n  SCREEN: 21,\n  PRINTERMARK: 22,\n  TRAPNET: 23,\n  WATERMARK: 24,\n  THREED: 25,\n  REDACT: 26\n};\n\nvar AnnotationFlag = {\n  INVISIBLE: 0x01,\n  HIDDEN: 0x02,\n  PRINT: 0x04,\n  NOZOOM: 0x08,\n  NOROTATE: 0x10,\n  NOVIEW: 0x20,\n  READONLY: 0x40,\n  LOCKED: 0x80,\n  TOGGLENOVIEW: 0x100,\n  LOCKEDCONTENTS: 0x200\n};\n\nvar AnnotationBorderStyleType = {\n  SOLID: 1,\n  DASHED: 2,\n  BEVELED: 3,\n  INSET: 4,\n  UNDERLINE: 5\n};\n\nvar StreamType = {\n  UNKNOWN: 0,\n  FLATE: 1,\n  LZW: 2,\n  DCT: 3,\n  JPX: 4,\n  JBIG: 5,\n  A85: 6,\n  AHX: 7,\n  CCF: 8,\n  RL: 9\n};\n\nvar FontType = {\n  UNKNOWN: 0,\n  TYPE1: 1,\n  TYPE1C: 2,\n  CIDFONTTYPE0: 3,\n  CIDFONTTYPE0C: 4,\n  TRUETYPE: 5,\n  CIDFONTTYPE2: 6,\n  TYPE3: 7,\n  OPENTYPE: 8,\n  TYPE0: 9,\n  MMTYPE1: 10\n};\n\n// The global PDFJS object exposes the API\n// In production, it will be declared outside a global wrapper\n// In development, it will be declared here\nif (!globalScope.PDFJS) {\n  globalScope.PDFJS = {};\n}\n\nglobalScope.PDFJS.pdfBug = false;\n\nPDFJS.VERBOSITY_LEVELS = {\n  errors: 0,\n  warnings: 1,\n  infos: 5\n};\n\n// All the possible operations for an operator list.\nvar OPS = PDFJS.OPS = {\n  // Intentionally start from 1 so it is easy to spot bad operators that will be\n  // 0's.\n  dependency: 1,\n  setLineWidth: 2,\n  setLineCap: 3,\n  setLineJoin: 4,\n  setMiterLimit: 5,\n  setDash: 6,\n  setRenderingIntent: 7,\n  setFlatness: 8,\n  setGState: 9,\n  save: 10,\n  restore: 11,\n  transform: 12,\n  moveTo: 13,\n  lineTo: 14,\n  curveTo: 15,\n  curveTo2: 16,\n  curveTo3: 17,\n  closePath: 18,\n  rectangle: 19,\n  stroke: 20,\n  closeStroke: 21,\n  fill: 22,\n  eoFill: 23,\n  fillStroke: 24,\n  eoFillStroke: 25,\n  closeFillStroke: 26,\n  closeEOFillStroke: 27,\n  endPath: 28,\n  clip: 29,\n  eoClip: 30,\n  beginText: 31,\n  endText: 32,\n  setCharSpacing: 33,\n  setWordSpacing: 34,\n  setHScale: 35,\n  setLeading: 36,\n  setFont: 37,\n  setTextRenderingMode: 38,\n  setTextRise: 39,\n  moveText: 40,\n  setLeadingMoveText: 41,\n  setTextMatrix: 42,\n  nextLine: 43,\n  showText: 44,\n  showSpacedText: 45,\n  nextLineShowText: 46,\n  nextLineSetSpacingShowText: 47,\n  setCharWidth: 48,\n  setCharWidthAndBounds: 49,\n  setStrokeColorSpace: 50,\n  setFillColorSpace: 51,\n  setStrokeColor: 52,\n  setStrokeColorN: 53,\n  setFillColor: 54,\n  setFillColorN: 55,\n  setStrokeGray: 56,\n  setFillGray: 57,\n  setStrokeRGBColor: 58,\n  setFillRGBColor: 59,\n  setStrokeCMYKColor: 60,\n  setFillCMYKColor: 61,\n  shadingFill: 62,\n  beginInlineImage: 63,\n  beginImageData: 64,\n  endInlineImage: 65,\n  paintXObject: 66,\n  markPoint: 67,\n  markPointProps: 68,\n  beginMarkedContent: 69,\n  beginMarkedContentProps: 70,\n  endMarkedContent: 71,\n  beginCompat: 72,\n  endCompat: 73,\n  paintFormXObjectBegin: 74,\n  paintFormXObjectEnd: 75,\n  beginGroup: 76,\n  endGroup: 77,\n  beginAnnotations: 78,\n  endAnnotations: 79,\n  beginAnnotation: 80,\n  endAnnotation: 81,\n  paintJpegXObject: 82,\n  paintImageMaskXObject: 83,\n  paintImageMaskXObjectGroup: 84,\n  paintImageXObject: 85,\n  paintInlineImageXObject: 86,\n  paintInlineImageXObjectGroup: 87,\n  paintImageXObjectRepeat: 88,\n  paintImageMaskXObjectRepeat: 89,\n  paintSolidColorImageMask: 90,\n  constructPath: 91\n};\n\n// A notice for devs. These are good for things that are helpful to devs, such\n// as warning that Workers were disabled, which is important to devs but not\n// end users.\nfunction info(msg) {\n\n  if (PDFJS.verbosity >= PDFJS.VERBOSITY_LEVELS.infos) {\n    console.log('Info: ' + msg);\n  }\n}\n\n// Non-fatal warnings.\nfunction warn(msg) {\n\n  if (PDFJS.verbosity >= PDFJS.VERBOSITY_LEVELS.warnings) {\n    console.log('Warning: ' + msg);\n  }\n}\n\n// Deprecated API function -- treated as warnings.\nfunction deprecated(details) {\n\n  warn('Deprecated API usage: ' + details);\n}\n\n// Fatal errors that should trigger the fallback UI and halt execution by\n// throwing an exception.\nfunction error(msg) {\n\n  if (PDFJS.verbosity >= PDFJS.VERBOSITY_LEVELS.errors) {\n    console.log('Error: ' + msg);\n    console.log(backtrace());\n  }\n  throw new Error(msg);\n}\n\nfunction backtrace() {\n\n  try {\n    throw new Error();\n  } catch (e) {\n    return e.stack ? e.stack.split('\\n').slice(2).join('\\n') : '';\n  }\n}\n\nfunction assert(cond, msg) {\n\n  if (!cond) {\n    error(msg);\n  }\n}\n\nvar UNSUPPORTED_FEATURES = PDFJS.UNSUPPORTED_FEATURES = {\n  unknown: 'unknown',\n  forms: 'forms',\n  javaScript: 'javaScript',\n  smask: 'smask',\n  shadingPattern: 'shadingPattern',\n  font: 'font'\n};\n\n// Combines two URLs. The baseUrl shall be absolute URL. If the url is an\n// absolute URL, it will be returned as is.\nfunction combineUrl(baseUrl, url) {\n\n  if (!url) {\n    return baseUrl;\n  }\n  return new URL(url, baseUrl).href;\n}\n\n// Validates if URL is safe and allowed, e.g. to avoid XSS.\nfunction isValidUrl(url, allowRelative) {\n\n  if (!url) {\n    return false;\n  }\n  // RFC 3986 (http://tools.ietf.org/html/rfc3986#section-3.1)\n  // scheme = ALPHA *( ALPHA / DIGIT / \"+\" / \"-\" / \".\" )\n  var protocol = /^[a-z][a-z0-9+\\-.]*(?=:)/i.exec(url);\n  if (!protocol) {\n    return allowRelative;\n  }\n  protocol = protocol[0].toLowerCase();\n  switch (protocol) {\n    case 'http':\n    case 'https':\n    case 'ftp':\n    case 'mailto':\n    case 'tel':\n      return true;\n    default:\n      return false;\n  }\n}\nPDFJS.isValidUrl = isValidUrl;\n\nfunction shadow(obj, prop, value) {\n\n  Object.defineProperty(obj, prop, { value: value,\n                                     enumerable: true,\n                                     configurable: true,\n                                     writable: false });\n  return value;\n}\nPDFJS.shadow = shadow;\n\nvar LinkTarget = PDFJS.LinkTarget = {\n  NONE: 0, // Default value.\n  SELF: 1,\n  BLANK: 2,\n  PARENT: 3,\n  TOP: 4,\n};\nvar LinkTargetStringMap = [\n  '',\n  '_self',\n  '_blank',\n  '_parent',\n  '_top'\n];\n\nfunction isExternalLinkTargetSet() {\n\n  if (PDFJS.openExternalLinksInNewWindow) {\n    deprecated('PDFJS.openExternalLinksInNewWindow, please use ' +\n               '\"PDFJS.externalLinkTarget = PDFJS.LinkTarget.BLANK\" instead.');\n    if (PDFJS.externalLinkTarget === LinkTarget.NONE) {\n      PDFJS.externalLinkTarget = LinkTarget.BLANK;\n    }\n    // Reset the deprecated parameter, to suppress further warnings.\n    PDFJS.openExternalLinksInNewWindow = false;\n  }\n  switch (PDFJS.externalLinkTarget) {\n    case LinkTarget.NONE:\n      return false;\n    case LinkTarget.SELF:\n    case LinkTarget.BLANK:\n    case LinkTarget.PARENT:\n    case LinkTarget.TOP:\n      return true;\n  }\n  warn('PDFJS.externalLinkTarget is invalid: ' + PDFJS.externalLinkTarget);\n  // Reset the external link target, to suppress further warnings.\n  PDFJS.externalLinkTarget = LinkTarget.NONE;\n  return false;\n}\nPDFJS.isExternalLinkTargetSet = isExternalLinkTargetSet;\n\nvar PasswordResponses = PDFJS.PasswordResponses = {\n  NEED_PASSWORD: 1,\n  INCORRECT_PASSWORD: 2\n};\n\nvar PasswordException = (function PasswordExceptionClosure() {\n\n  function PasswordException(msg, code) {\n\n    this.name = 'PasswordException';\n    this.message = msg;\n    this.code = code;\n  }\n\n  PasswordException.prototype = new Error();\n  PasswordException.constructor = PasswordException;\n\n  return PasswordException;\n})();\nPDFJS.PasswordException = PasswordException;\n\nvar UnknownErrorException = (function UnknownErrorExceptionClosure() {\n\n  function UnknownErrorException(msg, details) {\n\n    this.name = 'UnknownErrorException';\n    this.message = msg;\n    this.details = details;\n  }\n\n  UnknownErrorException.prototype = new Error();\n  UnknownErrorException.constructor = UnknownErrorException;\n\n  return UnknownErrorException;\n})();\nPDFJS.UnknownErrorException = UnknownErrorException;\n\nvar InvalidPDFException = (function InvalidPDFExceptionClosure() {\n\n  function InvalidPDFException(msg) {\n\n    this.name = 'InvalidPDFException';\n    this.message = msg;\n  }\n\n  InvalidPDFException.prototype = new Error();\n  InvalidPDFException.constructor = InvalidPDFException;\n\n  return InvalidPDFException;\n})();\nPDFJS.InvalidPDFException = InvalidPDFException;\n\nvar MissingPDFException = (function MissingPDFExceptionClosure() {\n\n  function MissingPDFException(msg) {\n\n    this.name = 'MissingPDFException';\n    this.message = msg;\n  }\n\n  MissingPDFException.prototype = new Error();\n  MissingPDFException.constructor = MissingPDFException;\n\n  return MissingPDFException;\n})();\nPDFJS.MissingPDFException = MissingPDFException;\n\nvar UnexpectedResponseException =\n    (function UnexpectedResponseExceptionClosure() {\n\n  function UnexpectedResponseException(msg, status) {\n\n    this.name = 'UnexpectedResponseException';\n    this.message = msg;\n    this.status = status;\n  }\n\n  UnexpectedResponseException.prototype = new Error();\n  UnexpectedResponseException.constructor = UnexpectedResponseException;\n\n  return UnexpectedResponseException;\n})();\nPDFJS.UnexpectedResponseException = UnexpectedResponseException;\n\nvar NotImplementedException = (function NotImplementedExceptionClosure() {\n\n  function NotImplementedException(msg) {\n\n    this.message = msg;\n  }\n\n  NotImplementedException.prototype = new Error();\n  NotImplementedException.prototype.name = 'NotImplementedException';\n  NotImplementedException.constructor = NotImplementedException;\n\n  return NotImplementedException;\n})();\n\nvar MissingDataException = (function MissingDataExceptionClosure() {\n\n  function MissingDataException(begin, end) {\n\n    this.begin = begin;\n    this.end = end;\n    this.message = 'Missing data [' + begin + ', ' + end + ')';\n  }\n\n  MissingDataException.prototype = new Error();\n  MissingDataException.prototype.name = 'MissingDataException';\n  MissingDataException.constructor = MissingDataException;\n\n  return MissingDataException;\n})();\n\nvar XRefParseException = (function XRefParseExceptionClosure() {\n\n  function XRefParseException(msg) {\n\n    this.message = msg;\n  }\n\n  XRefParseException.prototype = new Error();\n  XRefParseException.prototype.name = 'XRefParseException';\n  XRefParseException.constructor = XRefParseException;\n\n  return XRefParseException;\n})();\n\n\nfunction bytesToString(bytes) {\n\n  assert(bytes !== null && typeof bytes === 'object' &&\n         bytes.length !== undefined, 'Invalid argument for bytesToString');\n  var length = bytes.length;\n  var MAX_ARGUMENT_COUNT = 8192;\n  if (length < MAX_ARGUMENT_COUNT) {\n    return String.fromCharCode.apply(null, bytes);\n  }\n  var strBuf = [];\n  for (var i = 0; i < length; i += MAX_ARGUMENT_COUNT) {\n    var chunkEnd = Math.min(i + MAX_ARGUMENT_COUNT, length);\n    var chunk = bytes.subarray(i, chunkEnd);\n    strBuf.push(String.fromCharCode.apply(null, chunk));\n  }\n  return strBuf.join('');\n}\n\nfunction stringToBytes(str) {\n\n  assert(typeof str === 'string', 'Invalid argument for stringToBytes');\n  var length = str.length;\n  var bytes = new Uint8Array(length);\n  for (var i = 0; i < length; ++i) {\n    bytes[i] = str.charCodeAt(i) & 0xFF;\n  }\n  return bytes;\n}\n\nfunction string32(value) {\n\n  return String.fromCharCode((value >> 24) & 0xff, (value >> 16) & 0xff,\n                             (value >> 8) & 0xff, value & 0xff);\n}\n\nfunction log2(x) {\n\n  var n = 1, i = 0;\n  while (x > n) {\n    n <<= 1;\n    i++;\n  }\n  return i;\n}\n\nfunction readInt8(data, start) {\n\n  return (data[start] << 24) >> 24;\n}\n\nfunction readUint16(data, offset) {\n\n  return (data[offset] << 8) | data[offset + 1];\n}\n\nfunction readUint32(data, offset) {\n\n  return ((data[offset] << 24) | (data[offset + 1] << 16) |\n         (data[offset + 2] << 8) | data[offset + 3]) >>> 0;\n}\n\n// Lazy test the endianness of the platform\n// NOTE: This will be 'true' for simulated TypedArrays\nfunction isLittleEndian() {\n\n  var buffer8 = new Uint8Array(2);\n  buffer8[0] = 1;\n  var buffer16 = new Uint16Array(buffer8.buffer);\n  return (buffer16[0] === 1);\n}\n\nObject.defineProperty(PDFJS, 'isLittleEndian', {\n  configurable: true,\n  get: function PDFJS_isLittleEndian() {\n\n    return shadow(PDFJS, 'isLittleEndian', isLittleEndian());\n  }\n});\n\n  // Lazy test if the userAgent support CanvasTypedArrays\nfunction hasCanvasTypedArrays() {\n\n  var canvas = document.createElement('canvas');\n  canvas.width = canvas.height = 1;\n  var ctx = canvas.getContext('2d');\n  var imageData = ctx.createImageData(1, 1);\n  return (typeof imageData.data.buffer !== 'undefined');\n}\n\nObject.defineProperty(PDFJS, 'hasCanvasTypedArrays', {\n  configurable: true,\n  get: function PDFJS_hasCanvasTypedArrays() {\n\n    return shadow(PDFJS, 'hasCanvasTypedArrays', hasCanvasTypedArrays());\n  }\n});\n\nvar Uint32ArrayView = (function Uint32ArrayViewClosure() {\n\n\n  function Uint32ArrayView(buffer, length) {\n\n    this.buffer = buffer;\n    this.byteLength = buffer.length;\n    this.length = length === undefined ? (this.byteLength >> 2) : length;\n    ensureUint32ArrayViewProps(this.length);\n  }\n  Uint32ArrayView.prototype = Object.create(null);\n\n  var uint32ArrayViewSetters = 0;\n  function createUint32ArrayProp(index) {\n\n    return {\n      get: function () {\n\n        var buffer = this.buffer, offset = index << 2;\n        return (buffer[offset] | (buffer[offset + 1] << 8) |\n          (buffer[offset + 2] << 16) | (buffer[offset + 3] << 24)) >>> 0;\n      },\n      set: function (value) {\n\n        var buffer = this.buffer, offset = index << 2;\n        buffer[offset] = value & 255;\n        buffer[offset + 1] = (value >> 8) & 255;\n        buffer[offset + 2] = (value >> 16) & 255;\n        buffer[offset + 3] = (value >>> 24) & 255;\n      }\n    };\n  }\n\n  function ensureUint32ArrayViewProps(length) {\n\n    while (uint32ArrayViewSetters < length) {\n      Object.defineProperty(Uint32ArrayView.prototype,\n        uint32ArrayViewSetters,\n        createUint32ArrayProp(uint32ArrayViewSetters));\n      uint32ArrayViewSetters++;\n    }\n  }\n\n  return Uint32ArrayView;\n})();\n\nvar IDENTITY_MATRIX = [1, 0, 0, 1, 0, 0];\n\nvar Util = PDFJS.Util = (function UtilClosure() {\n\n  function Util() {\n}\n\n  var rgbBuf = ['rgb(', 0, ',', 0, ',', 0, ')'];\n\n  // makeCssRgb() can be called thousands of times. Using |rgbBuf| avoids\n  // creating many intermediate strings.\n  Util.makeCssRgb = function Util_makeCssRgb(r, g, b) {\n\n    rgbBuf[1] = r;\n    rgbBuf[3] = g;\n    rgbBuf[5] = b;\n    return rgbBuf.join('');\n  };\n\n  // Concatenates two transformation matrices together and returns the result.\n  Util.transform = function Util_transform(m1, m2) {\n\n    return [\n      m1[0] * m2[0] + m1[2] * m2[1],\n      m1[1] * m2[0] + m1[3] * m2[1],\n      m1[0] * m2[2] + m1[2] * m2[3],\n      m1[1] * m2[2] + m1[3] * m2[3],\n      m1[0] * m2[4] + m1[2] * m2[5] + m1[4],\n      m1[1] * m2[4] + m1[3] * m2[5] + m1[5]\n    ];\n  };\n\n  // For 2d affine transforms\n  Util.applyTransform = function Util_applyTransform(p, m) {\n\n    var xt = p[0] * m[0] + p[1] * m[2] + m[4];\n    var yt = p[0] * m[1] + p[1] * m[3] + m[5];\n    return [xt, yt];\n  };\n\n  Util.applyInverseTransform = function Util_applyInverseTransform(p, m) {\n\n    var d = m[0] * m[3] - m[1] * m[2];\n    var xt = (p[0] * m[3] - p[1] * m[2] + m[2] * m[5] - m[4] * m[3]) / d;\n    var yt = (-p[0] * m[1] + p[1] * m[0] + m[4] * m[1] - m[5] * m[0]) / d;\n    return [xt, yt];\n  };\n\n  // Applies the transform to the rectangle and finds the minimum axially\n  // aligned bounding box.\n  Util.getAxialAlignedBoundingBox =\n    function Util_getAxialAlignedBoundingBox(r, m) {\n\n\n    var p1 = Util.applyTransform(r, m);\n    var p2 = Util.applyTransform(r.slice(2, 4), m);\n    var p3 = Util.applyTransform([r[0], r[3]], m);\n    var p4 = Util.applyTransform([r[2], r[1]], m);\n    return [\n      Math.min(p1[0], p2[0], p3[0], p4[0]),\n      Math.min(p1[1], p2[1], p3[1], p4[1]),\n      Math.max(p1[0], p2[0], p3[0], p4[0]),\n      Math.max(p1[1], p2[1], p3[1], p4[1])\n    ];\n  };\n\n  Util.inverseTransform = function Util_inverseTransform(m) {\n\n    var d = m[0] * m[3] - m[1] * m[2];\n    return [m[3] / d, -m[1] / d, -m[2] / d, m[0] / d,\n      (m[2] * m[5] - m[4] * m[3]) / d, (m[4] * m[1] - m[5] * m[0]) / d];\n  };\n\n  // Apply a generic 3d matrix M on a 3-vector v:\n  //   | a b c |   | X |\n  //   | d e f | x | Y |\n  //   | g h i |   | Z |\n  // M is assumed to be serialized as [a,b,c,d,e,f,g,h,i],\n  // with v as [X,Y,Z]\n  Util.apply3dTransform = function Util_apply3dTransform(m, v) {\n\n    return [\n      m[0] * v[0] + m[1] * v[1] + m[2] * v[2],\n      m[3] * v[0] + m[4] * v[1] + m[5] * v[2],\n      m[6] * v[0] + m[7] * v[1] + m[8] * v[2]\n    ];\n  };\n\n  // This calculation uses Singular Value Decomposition.\n  // The SVD can be represented with formula A = USV. We are interested in the\n  // matrix S here because it represents the scale values.\n  Util.singularValueDecompose2dScale =\n    function Util_singularValueDecompose2dScale(m) {\n\n\n    var transpose = [m[0], m[2], m[1], m[3]];\n\n    // Multiply matrix m with its transpose.\n    var a = m[0] * transpose[0] + m[1] * transpose[2];\n    var b = m[0] * transpose[1] + m[1] * transpose[3];\n    var c = m[2] * transpose[0] + m[3] * transpose[2];\n    var d = m[2] * transpose[1] + m[3] * transpose[3];\n\n    // Solve the second degree polynomial to get roots.\n    var first = (a + d) / 2;\n    var second = Math.sqrt((a + d) * (a + d) - 4 * (a * d - c * b)) / 2;\n    var sx = first + second || 1;\n    var sy = first - second || 1;\n\n    // Scale values are the square roots of the eigenvalues.\n    return [Math.sqrt(sx), Math.sqrt(sy)];\n  };\n\n  // Normalize rectangle rect=[x1, y1, x2, y2] so that (x1,y1) < (x2,y2)\n  // For coordinate systems whose origin lies in the bottom-left, this\n  // means normalization to (BL,TR) ordering. For systems with origin in the\n  // top-left, this means (TL,BR) ordering.\n  Util.normalizeRect = function Util_normalizeRect(rect) {\n\n    var r = rect.slice(0); // clone rect\n    if (rect[0] > rect[2]) {\n      r[0] = rect[2];\n      r[2] = rect[0];\n    }\n    if (rect[1] > rect[3]) {\n      r[1] = rect[3];\n      r[3] = rect[1];\n    }\n    return r;\n  };\n\n  // Returns a rectangle [x1, y1, x2, y2] corresponding to the\n  // intersection of rect1 and rect2. If no intersection, returns 'false'\n  // The rectangle coordinates of rect1, rect2 should be [x1, y1, x2, y2]\n  Util.intersect = function Util_intersect(rect1, rect2) {\n\n    function compare(a, b) {\n\n      return a - b;\n    }\n\n    // Order points along the axes\n    var orderedX = [rect1[0], rect1[2], rect2[0], rect2[2]].sort(compare),\n        orderedY = [rect1[1], rect1[3], rect2[1], rect2[3]].sort(compare),\n        result = [];\n\n    rect1 = Util.normalizeRect(rect1);\n    rect2 = Util.normalizeRect(rect2);\n\n    // X: first and second points belong to different rectangles?\n    if ((orderedX[0] === rect1[0] && orderedX[1] === rect2[0]) ||\n        (orderedX[0] === rect2[0] && orderedX[1] === rect1[0])) {\n      // Intersection must be between second and third points\n      result[0] = orderedX[1];\n      result[2] = orderedX[2];\n    } else {\n      return false;\n    }\n\n    // Y: first and second points belong to different rectangles?\n    if ((orderedY[0] === rect1[1] && orderedY[1] === rect2[1]) ||\n        (orderedY[0] === rect2[1] && orderedY[1] === rect1[1])) {\n      // Intersection must be between second and third points\n      result[1] = orderedY[1];\n      result[3] = orderedY[2];\n    } else {\n      return false;\n    }\n\n    return result;\n  };\n\n  Util.sign = function Util_sign(num) {\n\n    return num < 0 ? -1 : 1;\n  };\n\n  Util.appendToArray = function Util_appendToArray(arr1, arr2) {\n\n    Array.prototype.push.apply(arr1, arr2);\n  };\n\n  Util.prependToArray = function Util_prependToArray(arr1, arr2) {\n\n    Array.prototype.unshift.apply(arr1, arr2);\n  };\n\n  Util.extendObj = function extendObj(obj1, obj2) {\n\n    for (var key in obj2) {\n      obj1[key] = obj2[key];\n    }\n  };\n\n  Util.getInheritableProperty = function Util_getInheritableProperty(dict,\n                                                                     name) {\n\n    while (dict && !dict.has(name)) {\n      dict = dict.get('Parent');\n    }\n    if (!dict) {\n      return null;\n    }\n    return dict.get(name);\n  };\n\n  Util.inherit = function Util_inherit(sub, base, prototype) {\n\n    sub.prototype = Object.create(base.prototype);\n    sub.prototype.constructor = sub;\n    for (var prop in prototype) {\n      sub.prototype[prop] = prototype[prop];\n    }\n  };\n\n  Util.loadScript = function Util_loadScript(src, callback) {\n\n    var script = document.createElement('script');\n    var loaded = false;\n    script.setAttribute('src', src);\n    if (callback) {\n      script.onload = function() {\n\n        if (!loaded) {\n          callback();\n        }\n        loaded = true;\n      };\n    }\n    document.getElementsByTagName('head')[0].appendChild(script);\n  };\n\n  return Util;\n})();\n\n/**\n * PDF page viewport created based on scale, rotation and offset.\n * @class\n * @alias PDFJS.PageViewport\n */\nvar PageViewport = PDFJS.PageViewport = (function PageViewportClosure() {\n\n  /**\n   * @constructor\n   * @private\n   * @param viewBox {Array} xMin, yMin, xMax and yMax coordinates.\n   * @param scale {number} scale of the viewport.\n   * @param rotation {number} rotations of the viewport in degrees.\n   * @param offsetX {number} offset X\n   * @param offsetY {number} offset Y\n   * @param dontFlip {boolean} if true, axis Y will not be flipped.\n   */\n  function PageViewport(viewBox, scale, rotation, offsetX, offsetY, dontFlip) {\n\n    this.viewBox = viewBox;\n    this.scale = scale;\n    this.rotation = rotation;\n    this.offsetX = offsetX;\n    this.offsetY = offsetY;\n\n    // creating transform to convert pdf coordinate system to the normal\n    // canvas like coordinates taking in account scale and rotation\n    var centerX = (viewBox[2] + viewBox[0]) / 2;\n    var centerY = (viewBox[3] + viewBox[1]) / 2;\n    var rotateA, rotateB, rotateC, rotateD;\n    rotation = rotation % 360;\n    rotation = rotation < 0 ? rotation + 360 : rotation;\n    switch (rotation) {\n      case 180:\n        rotateA = -1; rotateB = 0; rotateC = 0; rotateD = 1;\n        break;\n      case 90:\n        rotateA = 0; rotateB = 1; rotateC = 1; rotateD = 0;\n        break;\n      case 270:\n        rotateA = 0; rotateB = -1; rotateC = -1; rotateD = 0;\n        break;\n      //case 0:\n      default:\n        rotateA = 1; rotateB = 0; rotateC = 0; rotateD = -1;\n        break;\n    }\n\n    if (dontFlip) {\n      rotateC = -rotateC; rotateD = -rotateD;\n    }\n\n    var offsetCanvasX, offsetCanvasY;\n    var width, height;\n    if (rotateA === 0) {\n      offsetCanvasX = Math.abs(centerY - viewBox[1]) * scale + offsetX;\n      offsetCanvasY = Math.abs(centerX - viewBox[0]) * scale + offsetY;\n      width = Math.abs(viewBox[3] - viewBox[1]) * scale;\n      height = Math.abs(viewBox[2] - viewBox[0]) * scale;\n    } else {\n      offsetCanvasX = Math.abs(centerX - viewBox[0]) * scale + offsetX;\n      offsetCanvasY = Math.abs(centerY - viewBox[1]) * scale + offsetY;\n      width = Math.abs(viewBox[2] - viewBox[0]) * scale;\n      height = Math.abs(viewBox[3] - viewBox[1]) * scale;\n    }\n    // creating transform for the following operations:\n    // translate(-centerX, -centerY), rotate and flip vertically,\n    // scale, and translate(offsetCanvasX, offsetCanvasY)\n    this.transform = [\n      rotateA * scale,\n      rotateB * scale,\n      rotateC * scale,\n      rotateD * scale,\n      offsetCanvasX - rotateA * scale * centerX - rotateC * scale * centerY,\n      offsetCanvasY - rotateB * scale * centerX - rotateD * scale * centerY\n    ];\n\n    this.width = width;\n    this.height = height;\n    this.fontScale = scale;\n  }\n  PageViewport.prototype = /** @lends PDFJS.PageViewport.prototype */ {\n    /**\n     * Clones viewport with additional properties.\n     * @param args {Object} (optional) If specified, may contain the 'scale' or\n     * 'rotation' properties to override the corresponding properties in\n     * the cloned viewport.\n     * @returns {PDFJS.PageViewport} Cloned viewport.\n     */\n    clone: function PageViewPort_clone(args) {\n\n      args = args || {};\n      var scale = 'scale' in args ? args.scale : this.scale;\n      var rotation = 'rotation' in args ? args.rotation : this.rotation;\n      return new PageViewport(this.viewBox.slice(), scale, rotation,\n                              this.offsetX, this.offsetY, args.dontFlip);\n    },\n    /**\n     * Converts PDF point to the viewport coordinates. For examples, useful for\n     * converting PDF location into canvas pixel coordinates.\n     * @param x {number} X coordinate.\n     * @param y {number} Y coordinate.\n     * @returns {Object} Object that contains 'x' and 'y' properties of the\n     * point in the viewport coordinate space.\n     * @see {@link convertToPdfPoint}\n     * @see {@link convertToViewportRectangle}\n     */\n    convertToViewportPoint: function PageViewport_convertToViewportPoint(x, y) {\n\n      return Util.applyTransform([x, y], this.transform);\n    },\n    /**\n     * Converts PDF rectangle to the viewport coordinates.\n     * @param rect {Array} xMin, yMin, xMax and yMax coordinates.\n     * @returns {Array} Contains corresponding coordinates of the rectangle\n     * in the viewport coordinate space.\n     * @see {@link convertToViewportPoint}\n     */\n    convertToViewportRectangle:\n      function PageViewport_convertToViewportRectangle(rect) {\n\n      var tl = Util.applyTransform([rect[0], rect[1]], this.transform);\n      var br = Util.applyTransform([rect[2], rect[3]], this.transform);\n      return [tl[0], tl[1], br[0], br[1]];\n    },\n    /**\n     * Converts viewport coordinates to the PDF location. For examples, useful\n     * for converting canvas pixel location into PDF one.\n     * @param x {number} X coordinate.\n     * @param y {number} Y coordinate.\n     * @returns {Object} Object that contains 'x' and 'y' properties of the\n     * point in the PDF coordinate space.\n     * @see {@link convertToViewportPoint}\n     */\n    convertToPdfPoint: function PageViewport_convertToPdfPoint(x, y) {\n\n      return Util.applyInverseTransform([x, y], this.transform);\n    }\n  };\n  return PageViewport;\n})();\n\nvar PDFStringTranslateTable = [\n  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,\n  0x2D8, 0x2C7, 0x2C6, 0x2D9, 0x2DD, 0x2DB, 0x2DA, 0x2DC, 0, 0, 0, 0, 0, 0, 0,\n  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,\n  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,\n  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,\n  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0x2022, 0x2020, 0x2021, 0x2026, 0x2014,\n  0x2013, 0x192, 0x2044, 0x2039, 0x203A, 0x2212, 0x2030, 0x201E, 0x201C,\n  0x201D, 0x2018, 0x2019, 0x201A, 0x2122, 0xFB01, 0xFB02, 0x141, 0x152, 0x160,\n  0x178, 0x17D, 0x131, 0x142, 0x153, 0x161, 0x17E, 0, 0x20AC\n];\n\nfunction stringToPDFString(str) {\n\n  var i, n = str.length, strBuf = [];\n  if (str[0] === '\\xFE' && str[1] === '\\xFF') {\n    // UTF16BE BOM\n    for (i = 2; i < n; i += 2) {\n      strBuf.push(String.fromCharCode(\n        (str.charCodeAt(i) << 8) | str.charCodeAt(i + 1)));\n    }\n  } else {\n    for (i = 0; i < n; ++i) {\n      var code = PDFStringTranslateTable[str.charCodeAt(i)];\n      strBuf.push(code ? String.fromCharCode(code) : str.charAt(i));\n    }\n  }\n  return strBuf.join('');\n}\n\nfunction stringToUTF8String(str) {\n\n  return decodeURIComponent(escape(str));\n}\n\nfunction utf8StringToString(str) {\n\n  return unescape(encodeURIComponent(str));\n}\n\nfunction isEmptyObj(obj) {\n\n  for (var key in obj) {\n    return false;\n  }\n  return true;\n}\n\nfunction isBool(v) {\n\n  return typeof v === 'boolean';\n}\n\nfunction isInt(v) {\n\n  return typeof v === 'number' && ((v | 0) === v);\n}\n\nfunction isNum(v) {\n\n  return typeof v === 'number';\n}\n\nfunction isString(v) {\n\n  return typeof v === 'string';\n}\n\nfunction isName(v) {\n\n  return v instanceof Name;\n}\n\nfunction isCmd(v, cmd) {\n\n  return v instanceof Cmd && (cmd === undefined || v.cmd === cmd);\n}\n\nfunction isDict(v, type) {\n\n  if (!(v instanceof Dict)) {\n    return false;\n  }\n  if (!type) {\n    return true;\n  }\n  var dictType = v.get('Type');\n  return isName(dictType) && dictType.name === type;\n}\n\nfunction isArray(v) {\n\n  return v instanceof Array;\n}\n\nfunction isStream(v) {\n\n  return typeof v === 'object' && v !== null && v.getBytes !== undefined;\n}\n\nfunction isArrayBuffer(v) {\n\n  return typeof v === 'object' && v !== null && v.byteLength !== undefined;\n}\n\nfunction isRef(v) {\n\n  return v instanceof Ref;\n}\n\n/**\n * Promise Capability object.\n *\n * @typedef {Object} PromiseCapability\n * @property {Promise} promise - A promise object.\n * @property {function} resolve - Fullfills the promise.\n * @property {function} reject - Rejects the promise.\n */\n\n/**\n * Creates a promise capability object.\n * @alias PDFJS.createPromiseCapability\n *\n * @return {PromiseCapability} A capability object contains:\n * - a Promise, resolve and reject methods.\n */\nfunction createPromiseCapability() {\n\n  var capability = {};\n  capability.promise = new Promise(function (resolve, reject) {\n\n    capability.resolve = resolve;\n    capability.reject = reject;\n  });\n  return capability;\n}\n\nPDFJS.createPromiseCapability = createPromiseCapability;\n\n/**\n * Polyfill for Promises:\n * The following promise implementation tries to generally implement the\n * Promise/A+ spec. Some notable differences from other promise libaries are:\n * - There currently isn't a seperate deferred and promise object.\n * - Unhandled rejections eventually show an error if they aren't handled.\n *\n * Based off of the work in:\n * https://bugzilla.mozilla.org/show_bug.cgi?id=810490\n */\n(function PromiseClosure() {\n\n  if (globalScope.Promise) {\n    // Promises existing in the DOM/Worker, checking presence of all/resolve\n    if (typeof globalScope.Promise.all !== 'function') {\n      globalScope.Promise.all = function (iterable) {\n\n        var count = 0, results = [], resolve, reject;\n        var promise = new globalScope.Promise(function (resolve_, reject_) {\n\n          resolve = resolve_;\n          reject = reject_;\n        });\n        iterable.forEach(function (p, i) {\n          count++;\n          p.then(function (result) {\n            results[i] = result;\n            count--;\n            if (count === 0) {\n              resolve(results);\n            }\n          }, reject);\n        });\n        if (count === 0) {\n          resolve(results);\n        }\n        return promise;\n      };\n    }\n    if (typeof globalScope.Promise.resolve !== 'function') {\n      globalScope.Promise.resolve = function (value) {\n\n        return new globalScope.Promise(function (resolve) {\n resolve(value); });\n      };\n    }\n    if (typeof globalScope.Promise.reject !== 'function') {\n      globalScope.Promise.reject = function (reason) {\n\n        return new globalScope.Promise(function (resolve, reject) {\n\n          reject(reason);\n        });\n      };\n    }\n    if (typeof globalScope.Promise.prototype.catch !== 'function') {\n      globalScope.Promise.prototype.catch = function (onReject) {\n\n        return globalScope.Promise.prototype.then(undefined, onReject);\n      };\n    }\n    return;\n  }\n  var STATUS_PENDING = 0;\n  var STATUS_RESOLVED = 1;\n  var STATUS_REJECTED = 2;\n\n  // In an attempt to avoid silent exceptions, unhandled rejections are\n  // tracked and if they aren't handled in a certain amount of time an\n  // error is logged.\n  var REJECTION_TIMEOUT = 500;\n\n  var HandlerManager = {\n    handlers: [],\n    running: false,\n    unhandledRejections: [],\n    pendingRejectionCheck: false,\n\n    scheduleHandlers: function scheduleHandlers(promise) {\n\n      if (promise._status === STATUS_PENDING) {\n        return;\n      }\n\n      this.handlers = this.handlers.concat(promise._handlers);\n      promise._handlers = [];\n\n      if (this.running) {\n        return;\n      }\n      this.running = true;\n\n      setTimeout(this.runHandlers.bind(this), 0);\n    },\n\n    runHandlers: function runHandlers() {\n\n      var RUN_TIMEOUT = 1; // ms\n      var timeoutAt = Date.now() + RUN_TIMEOUT;\n      while (this.handlers.length > 0) {\n        var handler = this.handlers.shift();\n\n        var nextStatus = handler.thisPromise._status;\n        var nextValue = handler.thisPromise._value;\n\n        try {\n          if (nextStatus === STATUS_RESOLVED) {\n            if (typeof handler.onResolve === 'function') {\n              nextValue = handler.onResolve(nextValue);\n            }\n          } else if (typeof handler.onReject === 'function') {\n\n              nextValue = handler.onReject(nextValue);\n              nextStatus = STATUS_RESOLVED;\n\n              if (handler.thisPromise._unhandledRejection) {\n                this.removeUnhandeledRejection(handler.thisPromise);\n              }\n          }\n        } catch (ex) {\n          nextStatus = STATUS_REJECTED;\n          nextValue = ex;\n        }\n\n        handler.nextPromise._updateStatus(nextStatus, nextValue);\n        if (Date.now() >= timeoutAt) {\n          break;\n        }\n      }\n\n      if (this.handlers.length > 0) {\n        setTimeout(this.runHandlers.bind(this), 0);\n        return;\n      }\n\n      this.running = false;\n    },\n\n    addUnhandledRejection: function addUnhandledRejection(promise) {\n\n      this.unhandledRejections.push({\n        promise: promise,\n        time: Date.now()\n      });\n      this.scheduleRejectionCheck();\n    },\n\n    removeUnhandeledRejection: function removeUnhandeledRejection(promise) {\n\n      promise._unhandledRejection = false;\n      for (var i = 0; i < this.unhandledRejections.length; i++) {\n        if (this.unhandledRejections[i].promise === promise) {\n          this.unhandledRejections.splice(i);\n          i--;\n        }\n      }\n    },\n\n    scheduleRejectionCheck: function scheduleRejectionCheck() {\n\n      if (this.pendingRejectionCheck) {\n        return;\n      }\n      this.pendingRejectionCheck = true;\n      setTimeout(function rejectionCheck() {\n\n        this.pendingRejectionCheck = false;\n        var now = Date.now();\n        for (var i = 0; i < this.unhandledRejections.length; i++) {\n          if (now - this.unhandledRejections[i].time > REJECTION_TIMEOUT) {\n            var unhandled = this.unhandledRejections[i].promise._value;\n            var msg = 'Unhandled rejection: ' + unhandled;\n            if (unhandled.stack) {\n              msg += '\\n' + unhandled.stack;\n            }\n            warn(msg);\n            this.unhandledRejections.splice(i);\n            i--;\n          }\n        }\n        if (this.unhandledRejections.length) {\n          this.scheduleRejectionCheck();\n        }\n      }.bind(this), REJECTION_TIMEOUT);\n    }\n  };\n\n  function Promise(resolver) {\n\n    this._status = STATUS_PENDING;\n    this._handlers = [];\n    try {\n      resolver.call(this, this._resolve.bind(this), this._reject.bind(this));\n    } catch (e) {\n      this._reject(e);\n    }\n  }\n  /**\n   * Builds a promise that is resolved when all the passed in promises are\n   * resolved.\n   * @param {array} array of data and/or promises to wait for.\n   * @return {Promise} New dependant promise.\n   */\n  Promise.all = function Promise_all(promises) {\n\n    var resolveAll, rejectAll;\n    var deferred = new Promise(function (resolve, reject) {\n\n      resolveAll = resolve;\n      rejectAll = reject;\n    });\n    var unresolved = promises.length;\n    var results = [];\n    if (unresolved === 0) {\n      resolveAll(results);\n      return deferred;\n    }\n    function reject(reason) {\n\n      if (deferred._status === STATUS_REJECTED) {\n        return;\n      }\n      results = [];\n      rejectAll(reason);\n    }\n    for (var i = 0, ii = promises.length; i < ii; ++i) {\n      var promise = promises[i];\n      var resolve = (function(i) {\n\n        return function(value) {\n\n          if (deferred._status === STATUS_REJECTED) {\n            return;\n          }\n          results[i] = value;\n          unresolved--;\n          if (unresolved === 0) {\n            resolveAll(results);\n          }\n        };\n      })(i);\n      if (Promise.isPromise(promise)) {\n        promise.then(resolve, reject);\n      } else {\n        resolve(promise);\n      }\n    }\n    return deferred;\n  };\n\n  /**\n   * Checks if the value is likely a promise (has a 'then' function).\n   * @return {boolean} true if value is thenable\n   */\n  Promise.isPromise = function Promise_isPromise(value) {\n\n    return value && typeof value.then === 'function';\n  };\n\n  /**\n   * Creates resolved promise\n   * @param value resolve value\n   * @returns {Promise}\n   */\n  Promise.resolve = function Promise_resolve(value) {\n\n    return new Promise(function (resolve) {\n resolve(value); });\n  };\n\n  /**\n   * Creates rejected promise\n   * @param reason rejection value\n   * @returns {Promise}\n   */\n  Promise.reject = function Promise_reject(reason) {\n\n    return new Promise(function (resolve, reject) {\n reject(reason); });\n  };\n\n  Promise.prototype = {\n    _status: null,\n    _value: null,\n    _handlers: null,\n    _unhandledRejection: null,\n\n    _updateStatus: function Promise__updateStatus(status, value) {\n\n      if (this._status === STATUS_RESOLVED ||\n          this._status === STATUS_REJECTED) {\n        return;\n      }\n\n      if (status === STATUS_RESOLVED &&\n          Promise.isPromise(value)) {\n        value.then(this._updateStatus.bind(this, STATUS_RESOLVED),\n                   this._updateStatus.bind(this, STATUS_REJECTED));\n        return;\n      }\n\n      this._status = status;\n      this._value = value;\n\n      if (status === STATUS_REJECTED && this._handlers.length === 0) {\n        this._unhandledRejection = true;\n        HandlerManager.addUnhandledRejection(this);\n      }\n\n      HandlerManager.scheduleHandlers(this);\n    },\n\n    _resolve: function Promise_resolve(value) {\n\n      this._updateStatus(STATUS_RESOLVED, value);\n    },\n\n    _reject: function Promise_reject(reason) {\n\n      this._updateStatus(STATUS_REJECTED, reason);\n    },\n\n    then: function Promise_then(onResolve, onReject) {\n\n      var nextPromise = new Promise(function (resolve, reject) {\n\n        this.resolve = resolve;\n        this.reject = reject;\n      });\n      this._handlers.push({\n        thisPromise: this,\n        onResolve: onResolve,\n        onReject: onReject,\n        nextPromise: nextPromise\n      });\n      HandlerManager.scheduleHandlers(this);\n      return nextPromise;\n    },\n\n    catch: function Promise_catch(onReject) {\n\n      return this.then(undefined, onReject);\n    }\n  };\n\n  globalScope.Promise = Promise;\n})();\n\nvar StatTimer = (function StatTimerClosure() {\n\n  function rpad(str, pad, length) {\n\n    while (str.length < length) {\n      str += pad;\n    }\n    return str;\n  }\n  function StatTimer() {\n\n    this.started = {};\n    this.times = [];\n    this.enabled = true;\n  }\n  StatTimer.prototype = {\n    time: function StatTimer_time(name) {\n\n      if (!this.enabled) {\n        return;\n      }\n      if (name in this.started) {\n        warn('Timer is already running for ' + name);\n      }\n      this.started[name] = Date.now();\n    },\n    timeEnd: function StatTimer_timeEnd(name) {\n\n      if (!this.enabled) {\n        return;\n      }\n      if (!(name in this.started)) {\n        warn('Timer has not been started for ' + name);\n      }\n      this.times.push({\n        'name': name,\n        'start': this.started[name],\n        'end': Date.now()\n      });\n      // Remove timer from started so it can be called again.\n      delete this.started[name];\n    },\n    toString: function StatTimer_toString() {\n\n      var i, ii;\n      var times = this.times;\n      var out = '';\n      // Find the longest name for padding purposes.\n      var longest = 0;\n      for (i = 0, ii = times.length; i < ii; ++i) {\n        var name = times[i]['name'];\n        if (name.length > longest) {\n          longest = name.length;\n        }\n      }\n      for (i = 0, ii = times.length; i < ii; ++i) {\n        var span = times[i];\n        var duration = span.end - span.start;\n        out += rpad(span['name'], ' ', longest) + ' ' + duration + 'ms\\n';\n      }\n      return out;\n    }\n  };\n  return StatTimer;\n})();\n\nPDFJS.createBlob = function createBlob(data, contentType) {\n\n  if (typeof Blob !== 'undefined') {\n    return new Blob([data], { type: contentType });\n  }\n  // Blob builder is deprecated in FF14 and removed in FF18.\n  var bb = new MozBlobBuilder();\n  bb.append(data);\n  return bb.getBlob(contentType);\n};\n\nPDFJS.createObjectURL = (function createObjectURLClosure() {\n\n  // Blob/createObjectURL is not available, falling back to data schema.\n  var digits =\n    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';\n\n  return function createObjectURL(data, contentType) {\n\n    if (!PDFJS.disableCreateObjectURL &&\n        typeof URL !== 'undefined' && URL.createObjectURL) {\n      var blob = PDFJS.createBlob(data, contentType);\n      return URL.createObjectURL(blob);\n    }\n\n    var buffer = 'data:' + contentType + ';base64,';\n    for (var i = 0, ii = data.length; i < ii; i += 3) {\n      var b1 = data[i] & 0xFF;\n      var b2 = data[i + 1] & 0xFF;\n      var b3 = data[i + 2] & 0xFF;\n      var d1 = b1 >> 2, d2 = ((b1 & 3) << 4) | (b2 >> 4);\n      var d3 = i + 1 < ii ? ((b2 & 0xF) << 2) | (b3 >> 6) : 64;\n      var d4 = i + 2 < ii ? (b3 & 0x3F) : 64;\n      buffer += digits[d1] + digits[d2] + digits[d3] + digits[d4];\n    }\n    return buffer;\n  };\n})();\n\nfunction MessageHandler(sourceName, targetName, comObj) {\n\n  this.sourceName = sourceName;\n  this.targetName = targetName;\n  this.comObj = comObj;\n  this.callbackIndex = 1;\n  this.postMessageTransfers = true;\n  var callbacksCapabilities = this.callbacksCapabilities = {};\n  var ah = this.actionHandler = {};\n///jsw this\n\n  this._onComObjOnMessage = function messageHandlerComObjOnMessage(event) {\n\n\n    var data = event.data;\n    if (data.targetName !== this.sourceName) {\n      return;\n    }\n    if (data.isReply) {\n      var callbackId = data.callbackId;\n      if (data.callbackId in callbacksCapabilities) {\n        var callback = callbacksCapabilities[callbackId];\n        delete callbacksCapabilities[callbackId];\n        if ('error' in data) {\n          callback.reject(data.error);\n        } else {\n          callback.resolve(data.data);\n        }\n      } else {\n        error('Cannot resolve callback ' + callbackId);\n      }\n    } else if (data.action in ah) {\n      var action = ah[data.action];\n      if (data.callbackId) {\n        var sourceName = this.sourceName;\n        var targetName = data.sourceName;\n        Promise.resolve().then(function () {\n\n          return action[0].call(action[1], data.data);\n        }).then(function (result) {\n\n          comObj.postMessage({\n            sourceName: sourceName,\n            targetName: targetName,\n            isReply: true,\n            callbackId: data.callbackId,\n            data: result\n          });\n        }, function (reason) {\n\n          if (reason instanceof Error) {\n            // Serialize error to avoid \"DataCloneError\"\n            reason = reason + '';\n          }\n          comObj.postMessage({\n            sourceName: sourceName,\n            targetName: targetName,\n            isReply: true,\n            callbackId: data.callbackId,\n            error: reason\n          });\n        });\n      } else {\n        action[0].call(action[1], data.data);\n      }\n    } else {\n      error('Unknown action from worker: ' + data.action);\n    }\n  }.bind(this);\n  comObj.addEventListener('message', this._onComObjOnMessage);\n}\n\nMessageHandler.prototype = {\n  on: function messageHandlerOn(actionName, handler, scope) {\n\n    var ah = this.actionHandler;\n    if (ah[actionName]) {\n      error('There is already an actionName called \"' + actionName + '\"');\n    }\n    ah[actionName] = [handler, scope];\n  },\n  /**\n   * Sends a message to the comObj to invoke the action with the supplied data.\n   * @param {String} actionName Action to call.\n   * @param {JSON} data JSON data to send.\n   * @param {Array} [transfers] Optional list of transfers/ArrayBuffers\n   */\n  send: function messageHandlerSend(actionName, data, transfers) {\n\n    var message = {\n      sourceName: this.sourceName,\n      targetName: this.targetName,\n      action: actionName,\n      data: data\n    };\n    this.postMessage(message, transfers);\n  },\n  /**\n   * Sends a message to the comObj to invoke the action with the supplied data.\n   * Expects that other side will callback with the response.\n   * @param {String} actionName Action to call.\n   * @param {JSON} data JSON data to send.\n   * @param {Array} [transfers] Optional list of transfers/ArrayBuffers.\n   * @returns {Promise} Promise to be resolved with response data.\n   */\n  sendWithPromise:\n    function messageHandlerSendWithPromise(actionName, data, transfers) {\n\n    var callbackId = this.callbackIndex++;\n    var message = {\n      sourceName: this.sourceName,\n      targetName: this.targetName,\n      action: actionName,\n      data: data,\n      callbackId: callbackId\n    };\n    var capability = createPromiseCapability();\n    this.callbacksCapabilities[callbackId] = capability;\n    try {\n      this.postMessage(message, transfers);\n    } catch (e) {\n      capability.reject(e);\n    }\n    return capability.promise;\n  },\n  /**\n   * Sends raw message to the comObj.\n   * @private\n   * @param message {Object} Raw message.\n   * @param transfers List of transfers/ArrayBuffers, or undefined.\n   */\n  postMessage: function (message, transfers) {\n\n    if (transfers && this.postMessageTransfers) {\n      this.comObj.postMessage(message, transfers);\n    } else {\n      this.comObj.postMessage(message);\n    }\n  },\n\n  destroy: function () {\n\n    this.comObj.removeEventListener('message', this._onComObjOnMessage);\n  }\n};\n\nfunction loadJpegStream(id, imageUrl, objs) {\n\n  var img = new Image();\n  img.onload = (function loadJpegStream_onloadClosure() {\n\n    objs.resolve(id, img);\n  });\n  img.onerror = (function loadJpegStream_onerrorClosure() {\n\n    objs.resolve(id, null);\n    warn('Error during JPEG image loading');\n  });\n  img.src = imageUrl;\n}\n\n  // Polyfill from https://github.com/Polymer/URL\n/* Any copyright is dedicated to the Public Domain.\n * http://creativecommons.org/publicdomain/zero/1.0/ */\n(function checkURLConstructor(scope) {\n\n  /* jshint ignore:start */\n\n  // feature detect for URL constructor\n  var hasWorkingUrl = false;\n  if (typeof URL === 'function' && ('origin' in URL.prototype)) {\n\n    try {\n      var u = new URL('b', 'http://a');\n      u.pathname = 'c%20d';\n      hasWorkingUrl = u.href === 'http://a/c%20d';\n    } catch(e) {}\n  }\n\n  if (hasWorkingUrl)\n    return;\n\n  var relative = Object.create(null);\n  relative['ftp'] = 21;\n  relative['file'] = 0;\n  relative['gopher'] = 70;\n  relative['http'] = 80;\n  relative['https'] = 443;\n  relative['ws'] = 80;\n  relative['wss'] = 443;\n\n  var relativePathDotMapping = Object.create(null);\n  relativePathDotMapping['%2e'] = '.';\n  relativePathDotMapping['.%2e'] = '..';\n  relativePathDotMapping['%2e.'] = '..';\n  relativePathDotMapping['%2e%2e'] = '..';\n\n  function isRelativeScheme(scheme) {\n\n    return relative[scheme] !== undefined;\n  }\n\n  function invalid() {\n\n    clear.call(this);\n    this._isInvalid = true;\n  }\n\n  function IDNAToASCII(h) {\n\n    if ('' == h) {\n      invalid.call(this)\n    }\n    // XXX\n    return h.toLowerCase()\n  }\n\n  function percentEscape(c) {\n\n    var unicode = c.charCodeAt(0);\n    if (unicode > 0x20 &&\n       unicode < 0x7F &&\n       // \" # < > ? `\n       [0x22, 0x23, 0x3C, 0x3E, 0x3F, 0x60].indexOf(unicode) == -1\n      ) {\n      return c;\n    }\n    return encodeURIComponent(c);\n  }\n\n  function percentEscapeQuery(c) {\n\n    // XXX This actually needs to encode c using encoding and then\n    // convert the bytes one-by-one.\n\n    var unicode = c.charCodeAt(0);\n    if (unicode > 0x20 &&\n       unicode < 0x7F &&\n       // \" # < > ` (do not escape '?')\n       [0x22, 0x23, 0x3C, 0x3E, 0x60].indexOf(unicode) == -1\n      ) {\n      return c;\n    }\n    return encodeURIComponent(c);\n  }\n\n  var EOF = undefined,\n      ALPHA = /[a-zA-Z]/,\n      ALPHANUMERIC = /[a-zA-Z0-9\\+\\-\\.]/;\n\n  function parse(input, stateOverride, base) {\n\n    function err(message) {\n\n      errors.push(message)\n    }\n\n    var state = stateOverride || 'scheme start',\n        cursor = 0,\n        buffer = '',\n        seenAt = false,\n        seenBracket = false,\n        errors = [];\n\n//jsw input \n\n    loop: while ((input[cursor - 1] != EOF || cursor == 0) && !this._isInvalid) {\n      var c = input[cursor];\n      switch (state) {\n        case 'scheme start':\n          if (c && ALPHA.test(c)) {\n            buffer += c.toLowerCase(); // ASCII-safe\n            state = 'scheme';\n          } else if (!stateOverride) {\n            buffer = '';\n            state = 'no scheme';\n            continue;\n          } else {\n            err('Invalid scheme.');\n            break loop;\n          }\n          break;\n\n        case 'scheme':\n          if (c && ALPHANUMERIC.test(c)) {\n            buffer += c.toLowerCase(); // ASCII-safe\n          } else if (':' == c) {\n            this._scheme = buffer;\n            buffer = '';\n            if (stateOverride) {\n              break loop;\n            }\n            if (isRelativeScheme(this._scheme)) {\n              this._isRelative = true;\n            }\n            if ('file' == this._scheme) {\n              state = 'relative';\n            } else if (this._isRelative && base && base._scheme == this._scheme) {\n              state = 'relative or authority';\n            } else if (this._isRelative) {\n              state = 'authority first slash';\n            } else {\n              state = 'scheme data';\n            }\n          } else if (!stateOverride) {\n            buffer = '';\n            cursor = 0;\n            state = 'no scheme';\n            continue;\n          } else if (EOF == c) {\n            break loop;\n          } else {\n            err('Code point not allowed in scheme: ' + c)\n            break loop;\n          }\n          break;\n\n        case 'scheme data':\n          if ('?' == c) {\n            this._query = '?';\n            state = 'query';\n          } else if ('#' == c) {\n            this._fragment = '#';\n            state = 'fragment';\n          } else {\n            // XXX error handling\n            if (EOF != c && '\\t' != c && '\\n' != c && '\\r' != c) {\n              this._schemeData += percentEscape(c);\n            }\n          }\n          break;\n\n        case 'no scheme':\n          if (!base || !(isRelativeScheme(base._scheme))) {\n            err('Missing scheme.');\n            invalid.call(this);\n          } else {\n            state = 'relative';\n            continue;\n          }\n          break;\n\n        case 'relative or authority':\n          if ('/' == c && '/' == input[cursor+1]) {\n            state = 'authority ignore slashes';\n          } else {\n            err('Expected /, got: ' + c);\n            state = 'relative';\n            continue\n          }\n          break;\n\n        case 'relative':\n          this._isRelative = true;\n          if ('file' != this._scheme)\n            this._scheme = base._scheme;\n          if (EOF == c) {\n            this._host = base._host;\n            this._port = base._port;\n            this._path = base._path.slice();\n            this._query = base._query;\n            this._username = base._username;\n            this._password = base._password;\n            break loop;\n          } else if ('/' == c || '\\\\' == c) {\n            if ('\\\\' == c)\n              err('\\\\ is an invalid code point.');\n            state = 'relative slash';\n          } else if ('?' == c) {\n            this._host = base._host;\n            this._port = base._port;\n            this._path = base._path.slice();\n            this._query = '?';\n            this._username = base._username;\n            this._password = base._password;\n            state = 'query';\n          } else if ('#' == c) {\n            this._host = base._host;\n            this._port = base._port;\n            this._path = base._path.slice();\n            this._query = base._query;\n            this._fragment = '#';\n            this._username = base._username;\n            this._password = base._password;\n            state = 'fragment';\n          } else {\n            var nextC = input[cursor+1]\n            var nextNextC = input[cursor+2]\n            if (\n              'file' != this._scheme || !ALPHA.test(c) ||\n              (nextC != ':' && nextC != '|') ||\n              (EOF != nextNextC && '/' != nextNextC && '\\\\' != nextNextC && '?' != nextNextC && '#' != nextNextC)) {\n              this._host = base._host;\n              this._port = base._port;\n              this._username = base._username;\n              this._password = base._password;\n              this._path = base._path.slice();\n              this._path.pop();\n            }\n            state = 'relative path';\n            continue;\n          }\n          break;\n\n        case 'relative slash':\n          if ('/' == c || '\\\\' == c) {\n            if ('\\\\' == c) {\n              err('\\\\ is an invalid code point.');\n            }\n            if ('file' == this._scheme) {\n              state = 'file host';\n            } else {\n              state = 'authority ignore slashes';\n            }\n          } else {\n            if ('file' != this._scheme) {\n              this._host = base._host;\n              this._port = base._port;\n              this._username = base._username;\n              this._password = base._password;\n            }\n            state = 'relative path';\n            continue;\n          }\n          break;\n\n        case 'authority first slash':\n          if ('/' == c) {\n            state = 'authority second slash';\n          } else {\n            err(\"Expected '/', got: \" + c);\n            state = 'authority ignore slashes';\n            continue;\n          }\n          break;\n\n        case 'authority second slash':\n          state = 'authority ignore slashes';\n          if ('/' != c) {\n            err(\"Expected '/', got: \" + c);\n            continue;\n          }\n          break;\n\n        case 'authority ignore slashes':\n          if ('/' != c && '\\\\' != c) {\n            state = 'authority';\n            continue;\n          } else {\n            err('Expected authority, got: ' + c);\n          }\n          break;\n\n        case 'authority':\n          if ('@' == c) {\n            if (seenAt) {\n              err('@ already seen.');\n              buffer += '%40';\n            }\n            seenAt = true;\n            for (var i = 0; i < buffer.length; i++) {\n              var cp = buffer[i];\n              if ('\\t' == cp || '\\n' == cp || '\\r' == cp) {\n                err('Invalid whitespace in authority.');\n                continue;\n              }\n              // XXX check URL code points\n              if (':' == cp && null === this._password) {\n                this._password = '';\n                continue;\n              }\n              var tempC = percentEscape(cp);\n              (null !== this._password) ? this._password += tempC : this._username += tempC;\n            }\n            buffer = '';\n          } else if (EOF == c || '/' == c || '\\\\' == c || '?' == c || '#' == c) {\n            cursor -= buffer.length;\n            buffer = '';\n            state = 'host';\n            continue;\n          } else {\n            buffer += c;\n          }\n          break;\n\n        case 'file host':\n          if (EOF == c || '/' == c || '\\\\' == c || '?' == c || '#' == c) {\n            if (buffer.length == 2 && ALPHA.test(buffer[0]) && (buffer[1] == ':' || buffer[1] == '|')) {\n              state = 'relative path';\n            } else if (buffer.length == 0) {\n              state = 'relative path start';\n            } else {\n              this._host = IDNAToASCII.call(this, buffer);\n              buffer = '';\n              state = 'relative path start';\n            }\n            continue;\n          } else if ('\\t' == c || '\\n' == c || '\\r' == c) {\n            err('Invalid whitespace in file host.');\n          } else {\n            buffer += c;\n          }\n          break;\n\n        case 'host':\n        case 'hostname':\n          if (':' == c && !seenBracket) {\n            // XXX host parsing\n            this._host = IDNAToASCII.call(this, buffer);\n            buffer = '';\n            state = 'port';\n            if ('hostname' == stateOverride) {\n              break loop;\n            }\n          } else if (EOF == c || '/' == c || '\\\\' == c || '?' == c || '#' == c) {\n            this._host = IDNAToASCII.call(this, buffer);\n            buffer = '';\n            state = 'relative path start';\n            if (stateOverride) {\n              break loop;\n            }\n            continue;\n          } else if ('\\t' != c && '\\n' != c && '\\r' != c) {\n            if ('[' == c) {\n              seenBracket = true;\n            } else if (']' == c) {\n              seenBracket = false;\n            }\n            buffer += c;\n          } else {\n            err('Invalid code point in host/hostname: ' + c);\n          }\n          break;\n\n        case 'port':\n          if (/[0-9]/.test(c)) {\n            buffer += c;\n          } else if (EOF == c || '/' == c || '\\\\' == c || '?' == c || '#' == c || stateOverride) {\n            if ('' != buffer) {\n              var temp = parseInt(buffer, 10);\n              if (temp != relative[this._scheme]) {\n                this._port = temp + '';\n              }\n              buffer = '';\n            }\n            if (stateOverride) {\n              break loop;\n            }\n            state = 'relative path start';\n            continue;\n          } else if ('\\t' == c || '\\n' == c || '\\r' == c) {\n            err('Invalid code point in port: ' + c);\n          } else {\n            invalid.call(this);\n          }\n          break;\n\n        case 'relative path start':\n          if ('\\\\' == c)\n            err(\"'\\\\' not allowed in path.\");\n          state = 'relative path';\n          if ('/' != c && '\\\\' != c) {\n            continue;\n          }\n          break;\n\n        case 'relative path':\n          if (EOF == c || '/' == c || '\\\\' == c || (!stateOverride && ('?' == c || '#' == c))) {\n            if ('\\\\' == c) {\n              err('\\\\ not allowed in relative path.');\n            }\n            var tmp;\n            if (tmp = relativePathDotMapping[buffer.toLowerCase()]) {\n              buffer = tmp;\n            }\n            if ('..' == buffer) {\n              this._path.pop();\n              if ('/' != c && '\\\\' != c) {\n                this._path.push('');\n              }\n            } else if ('.' == buffer && '/' != c && '\\\\' != c) {\n              this._path.push('');\n            } else if ('.' != buffer) {\n              if ('file' == this._scheme && this._path.length == 0 && buffer.length == 2 && ALPHA.test(buffer[0]) && buffer[1] == '|') {\n                buffer = buffer[0] + ':';\n              }\n              this._path.push(buffer);\n            }\n            buffer = '';\n            if ('?' == c) {\n              this._query = '?';\n              state = 'query';\n            } else if ('#' == c) {\n              this._fragment = '#';\n              state = 'fragment';\n            }\n          } else if ('\\t' != c && '\\n' != c && '\\r' != c) {\n            buffer += percentEscape(c);\n          }\n          break;\n\n        case 'query':\n          if (!stateOverride && '#' == c) {\n            this._fragment = '#';\n            state = 'fragment';\n          } else if (EOF != c && '\\t' != c && '\\n' != c && '\\r' != c) {\n            this._query += percentEscapeQuery(c);\n          }\n          break;\n\n        case 'fragment':\n          if (EOF != c && '\\t' != c && '\\n' != c && '\\r' != c) {\n            this._fragment += c;\n          }\n          break;\n      }\n\n      cursor++;\n    }\n  }\n\n  function clear() {\n\n    this._scheme = '';\n    this._schemeData = '';\n    this._username = '';\n    this._password = null;\n    this._host = '';\n    this._port = '';\n    this._path = [];\n    this._query = '';\n    this._fragment = '';\n    this._isInvalid = false;\n    this._isRelative = false;\n  }\n\n  // Does not process domain names or IP addresses.\n  // Does not handle encoding for the query parameter.\n  function jURL(url, base /* , encoding */) {\n\n    if (base !== undefined && !(base instanceof jURL))\n      base = new jURL(String(base));\n\n    this._url = url;\n    clear.call(this);\n\n    var input = url.replace(/^[ \\t\\r\\n\\f]+|[ \\t\\r\\n\\f]+$/g, '');\n    // encoding = encoding || 'utf-8'\n\n    parse.call(this, input, null, base);\n  }\n\n  jURL.prototype = {\n    toString: function() {\n\n      return this.href;\n    },\n    get href() {\n      if (this._isInvalid)\n        return this._url;\n\n      var authority = '';\n      if ('' != this._username || null != this._password) {\n        authority = this._username +\n            (null != this._password ? ':' + this._password : '') + '@';\n      }\n\n      return this.protocol +\n          (this._isRelative ? '//' + authority + this.host : '') +\n          this.pathname + this._query + this._fragment;\n    },\n    set href(href) {\n      clear.call(this);\n      parse.call(this, href);\n    },\n\n    get protocol() {\n      return this._scheme + ':';\n    },\n    set protocol(protocol) {\n      if (this._isInvalid)\n        return;\n      parse.call(this, protocol + ':', 'scheme start');\n    },\n\n    get host() {\n      return this._isInvalid ? '' : this._port ?\n          this._host + ':' + this._port : this._host;\n    },\n    set host(host) {\n      if (this._isInvalid || !this._isRelative)\n        return;\n      parse.call(this, host, 'host');\n    },\n\n    get hostname() {\n      return this._host;\n    },\n    set hostname(hostname) {\n      if (this._isInvalid || !this._isRelative)\n        return;\n      parse.call(this, hostname, 'hostname');\n    },\n\n    get port() {\n      return this._port;\n    },\n    set port(port) {\n      if (this._isInvalid || !this._isRelative)\n        return;\n      parse.call(this, port, 'port');\n    },\n\n    get pathname() {\n      return this._isInvalid ? '' : this._isRelative ?\n          '/' + this._path.join('/') : this._schemeData;\n    },\n    set pathname(pathname) {\n      if (this._isInvalid || !this._isRelative)\n        return;\n      this._path = [];\n      parse.call(this, pathname, 'relative path start');\n    },\n\n    get search() {\n      return this._isInvalid || !this._query || '?' == this._query ?\n          '' : this._query;\n    },\n    set search(search) {\n      if (this._isInvalid || !this._isRelative)\n        return;\n      this._query = '?';\n      if ('?' == search[0])\n        search = search.slice(1);\n      parse.call(this, search, 'query');\n    },\n\n    get hash() {\n      return this._isInvalid || !this._fragment || '#' == this._fragment ?\n          '' : this._fragment;\n    },\n    set hash(hash) {\n      if (this._isInvalid)\n        return;\n      this._fragment = '#';\n      if ('#' == hash[0])\n        hash = hash.slice(1);\n      parse.call(this, hash, 'fragment');\n    },\n\n    get origin() {\n      var host;\n      if (this._isInvalid || !this._scheme) {\n        return '';\n      }\n      // javascript: Gecko returns String(\"\"), WebKit/Blink String(\"null\")\n      // Gecko throws error for \"data://\"\n      // data: Gecko returns \"\", Blink returns \"data://\", WebKit returns \"null\"\n      // Gecko returns String(\"\") for file: mailto:\n      // WebKit/Blink returns String(\"SCHEME://\") for file: mailto:\n      switch (this._scheme) {\n        case 'data':\n        case 'file':\n        case 'javascript':\n        case 'mailto':\n          return 'null';\n      }\n      host = this.host;\n      if (!host) {\n        return '';\n      }\n      return this._scheme + '://' + host;\n    }\n  };\n\n  // Copy over the static methods\n  var OriginalURL = scope.URL;\n  if (OriginalURL) {\n    jURL.createObjectURL = function(blob) {\n\n      // IE extension allows a second optional options argument.\n      // http://msdn.microsoft.com/en-us/library/ie/hh772302(v=vs.85).aspx\n      return OriginalURL.createObjectURL.apply(OriginalURL, arguments);\n    };\n    jURL.revokeObjectURL = function(url) {\n\n      OriginalURL.revokeObjectURL(url);\n    };\n  }\n\n  scope.URL = jURL;\n  /* jshint ignore:end */\n})(globalScope);\n\n\nvar DEFAULT_RANGE_CHUNK_SIZE = 65536; // 2^16 = 65536\n\n/**\n * The maximum allowed image size in total pixels e.g. width * height. Images\n * above this value will not be drawn. Use -1 for no limit.\n * @var {number}\n */\nPDFJS.maxImageSize = (PDFJS.maxImageSize === undefined ?\n                      -1 : PDFJS.maxImageSize);\n\n/**\n * The url of where the predefined Adobe CMaps are located. Include trailing\n * slash.\n * @var {string}\n */\nPDFJS.cMapUrl = (PDFJS.cMapUrl === undefined ? null : PDFJS.cMapUrl);\n\n/**\n * Specifies if CMaps are binary packed.\n * @var {boolean}\n */\nPDFJS.cMapPacked = PDFJS.cMapPacked === undefined ? false : PDFJS.cMapPacked;\n\n/**\n * By default fonts are converted to OpenType fonts and loaded via font face\n * rules. If disabled, the font will be rendered using a built in font renderer\n * that constructs the glyphs with primitive path commands.\n * @var {boolean}\n */\nPDFJS.disableFontFace = (PDFJS.disableFontFace === undefined ?\n                         false : PDFJS.disableFontFace);\n\n/**\n * Path for image resources, mainly for annotation icons. Include trailing\n * slash.\n * @var {string}\n */\nPDFJS.imageResourcesPath = (PDFJS.imageResourcesPath === undefined ?\n                            '' : PDFJS.imageResourcesPath);\n\n/**\n * Disable the web worker and run all code on the main thread. This will happen\n * automatically if the browser doesn't support workers or sending typed arrays\n * to workers.\n * @var {boolean}\n */\nPDFJS.disableWorker = (PDFJS.disableWorker === undefined ?\n                       false : PDFJS.disableWorker);\n\n/**\n * Path and filename of the worker file. Required when the worker is enabled in\n * development mode. If unspecified in the production build, the worker will be\n * loaded based on the location of the pdf.js file. It is recommended that\n * the workerSrc is set in a custom application to prevent issues caused by\n * third-party frameworks and libraries.\n * @var {string}\n */\nPDFJS.workerSrc = (PDFJS.workerSrc === undefined ? null : PDFJS.workerSrc);\n\n/**\n * Disable range request loading of PDF files. When enabled and if the server\n * supports partial content requests then the PDF will be fetched in chunks.\n * Enabled (false) by default.\n * @var {boolean}\n */\nPDFJS.disableRange = (PDFJS.disableRange === undefined ?\n                      false : PDFJS.disableRange);\n\n/**\n * Disable streaming of PDF file data. By default PDF.js attempts to load PDF\n * in chunks. This default behavior can be disabled.\n * @var {boolean}\n */\nPDFJS.disableStream = (PDFJS.disableStream === undefined ?\n                       false : PDFJS.disableStream);\n\n/**\n * Disable pre-fetching of PDF file data. When range requests are enabled PDF.js\n * will automatically keep fetching more data even if it isn't needed to display\n * the current page. This default behavior can be disabled.\n *\n * NOTE: It is also necessary to disable streaming, see above,\n *       in order for disabling of pre-fetching to work correctly.\n * @var {boolean}\n */\nPDFJS.disableAutoFetch = (PDFJS.disableAutoFetch === undefined ?\n                          false : PDFJS.disableAutoFetch);\n\n/**\n * Enables special hooks for debugging PDF.js.\n * @var {boolean}\n */\nPDFJS.pdfBug = (PDFJS.pdfBug === undefined ? false : PDFJS.pdfBug);\n\n/**\n * Enables transfer usage in postMessage for ArrayBuffers.\n * @var {boolean}\n */\nPDFJS.postMessageTransfers = (PDFJS.postMessageTransfers === undefined ?\n                              true : PDFJS.postMessageTransfers);\n\n/**\n * Disables URL.createObjectURL usage.\n * @var {boolean}\n */\nPDFJS.disableCreateObjectURL = (PDFJS.disableCreateObjectURL === undefined ?\n                                false : PDFJS.disableCreateObjectURL);\n\n/**\n * Disables WebGL usage.\n * @var {boolean}\n */\nPDFJS.disableWebGL = (PDFJS.disableWebGL === undefined ?\n                      true : PDFJS.disableWebGL);\n\n/**\n * Disables fullscreen support, and by extension Presentation Mode,\n * in browsers which support the fullscreen API.\n * @var {boolean}\n */\nPDFJS.disableFullscreen = (PDFJS.disableFullscreen === undefined ?\n                           false : PDFJS.disableFullscreen);\n\n/**\n * Enables CSS only zooming.\n * @var {boolean}\n */\nPDFJS.useOnlyCssZoom = (PDFJS.useOnlyCssZoom === undefined ?\n                        false : PDFJS.useOnlyCssZoom);\n\n/**\n * Controls the logging level.\n * The constants from PDFJS.VERBOSITY_LEVELS should be used:\n * - errors\n * - warnings [default]\n * - infos\n * @var {number}\n */\nPDFJS.verbosity = (PDFJS.verbosity === undefined ?\n                   PDFJS.VERBOSITY_LEVELS.warnings : PDFJS.verbosity);\n\n/**\n * The maximum supported canvas size in total pixels e.g. width * height.\n * The default value is 4096 * 4096. Use -1 for no limit.\n * @var {number}\n */\nPDFJS.maxCanvasPixels = (PDFJS.maxCanvasPixels === undefined ?\n                         16777216 : PDFJS.maxCanvasPixels);\n\n/**\n * (Deprecated) Opens external links in a new window if enabled.\n * The default behavior opens external links in the PDF.js window.\n *\n * NOTE: This property has been deprecated, please use\n *       `PDFJS.externalLinkTarget = PDFJS.LinkTarget.BLANK` instead.\n * @var {boolean}\n */\nPDFJS.openExternalLinksInNewWindow = (\n  PDFJS.openExternalLinksInNewWindow === undefined ?\n    false : PDFJS.openExternalLinksInNewWindow);\n\n/**\n * Specifies the |target| attribute for external links.\n * The constants from PDFJS.LinkTarget should be used:\n *  - NONE [default]\n *  - SELF\n *  - BLANK\n *  - PARENT\n *  - TOP\n * @var {number}\n */\nPDFJS.externalLinkTarget = (PDFJS.externalLinkTarget === undefined ?\n                            PDFJS.LinkTarget.NONE : PDFJS.externalLinkTarget);\n\n/**\n  * Determines if we can eval strings as JS. Primarily used to improve\n  * performance for font rendering.\n  * @var {boolean}\n  */\nPDFJS.isEvalSupported = (PDFJS.isEvalSupported === undefined ?\n                         true : PDFJS.isEvalSupported);\n\n/**\n * Document initialization / loading parameters object.\n *\n * @typedef {Object} DocumentInitParameters\n * @property {string}     url   - The URL of the PDF.\n * @property {TypedArray|Array|string} data - Binary PDF data. Use typed arrays\n *   (Uint8Array) to improve the memory usage. If PDF data is BASE64-encoded,\n *   use atob() to convert it to a binary string first.\n * @property {Object}     httpHeaders - Basic authentication headers.\n * @property {boolean}    withCredentials - Indicates whether or not cross-site\n *   Access-Control requests should be made using credentials such as cookies\n *   or authorization headers. The default is false.\n * @property {string}     password - For decrypting password-protected PDFs.\n * @property {TypedArray} initialData - A typed array with the first portion or\n *   all of the pdf data. Used by the extension since some data is already\n *   loaded before the switch to range requests.\n * @property {number}     length - The PDF file length. It's used for progress\n *   reports and range requests operations.\n * @property {PDFDataRangeTransport} range\n * @property {number}     rangeChunkSize - Optional parameter to specify\n *   maximum number of bytes fetched per range request. The default value is\n *   2^16 = 65536.\n * @property {PDFWorker}  worker - The worker that will be used for the loading\n *   and parsing of the PDF data.\n */\n\n/**\n * @typedef {Object} PDFDocumentStats\n * @property {Array} streamTypes - Used stream types in the document (an item\n *   is set to true if specific stream ID was used in the document).\n * @property {Array} fontTypes - Used font type in the document (an item is set\n *   to true if specific font ID was used in the document).\n */\n\n/**\n * This is the main entry point for loading a PDF and interacting with it.\n * NOTE: If a URL is used to fetch the PDF data a standard XMLHttpRequest(XHR)\n * is used, which means it must follow the same origin rules that any XHR does\n * e.g. No cross domain requests without CORS.\n *\n * @param {string|TypedArray|DocumentInitParameters|PDFDataRangeTransport} src\n * Can be a url to where a PDF is located, a typed array (Uint8Array)\n * already populated with data or parameter object.\n *\n * @param {PDFDataRangeTransport} pdfDataRangeTransport (deprecated) It is used\n * if you want to manually serve range requests for data in the PDF.\n *\n * @param {function} passwordCallback (deprecated) It is used to request a\n * password if wrong or no password was provided. The callback receives two\n * parameters: function that needs to be called with new password and reason\n * (see {\nPasswordResponses}).\n *\n * @param {function} progressCallback (deprecated) It is used to be able to\n * monitor the loading progress of the PDF file (necessary to implement e.g.\n * a loading bar). The callback receives an {\nObject} with the properties:\n * {number} loaded and {number} total.\n *\n * @return {PDFDocumentLoadingTask}\n */\nPDFJS.getDocument = function getDocument(src,\n                                         pdfDataRangeTransport,\n                                         passwordCallback,\n                                         progressCallback) {\n\n  var task = new PDFDocumentLoadingTask();\n\n  // Support of the obsolete arguments (for compatibility with API v1.0)\n  if (arguments.length > 1) {\n    deprecated('getDocument is called with pdfDataRangeTransport, ' +\n               'passwordCallback or progressCallback argument');\n  }\n  if (pdfDataRangeTransport) {\n    if (!(pdfDataRangeTransport instanceof PDFDataRangeTransport)) {\n      // Not a PDFDataRangeTransport instance, trying to add missing properties.\n      pdfDataRangeTransport = Object.create(pdfDataRangeTransport);\n      pdfDataRangeTransport.length = src.length;\n      pdfDataRangeTransport.initialData = src.initialData;\n      if (!pdfDataRangeTransport.abort) {\n        pdfDataRangeTransport.abort = function () {\n};\n      }\n    }\n    src = Object.create(src);\n    src.range = pdfDataRangeTransport;\n  }\n  task.onPassword = passwordCallback || null;\n  task.onProgress = progressCallback || null;\n\n//jsw src\n\n  var source;\n  if (typeof src === 'string') {\n    source = { url: src };\n  } else if (isArrayBuffer(src)) {\n    source = { data: src };\n  } else if (src instanceof PDFDataRangeTransport) {\n    source = { range: src };\n  } else {\n    if (typeof src !== 'object') {\n      error('Invalid parameter in getDocument, need either Uint8Array, ' +\n        'string or a parameter object');\n    }\n    if (!src.url && !src.data && !src.range) {\n      error('Invalid parameter object: need either .data, .range or .url');\n    }\n\n    source = src;\n  }\n\n  var params = {};\n  var rangeTransport = null;\n  var worker = null;\n  for (var key in source) {\n    if (key === 'url' && typeof window !== 'undefined') {\n      // The full path is required in the 'url' field.\n      params[key] = combineUrl(window.location.href, source[key]);\n      continue;\n    } else if (key === 'range') {\n      rangeTransport = source[key];\n      continue;\n    } else if (key === 'worker') {\n      worker = source[key];\n      continue;\n    } else if (key === 'data' && !(source[key] instanceof Uint8Array)) {\n      // Converting string or array-like data to Uint8Array.\n      var pdfBytes = source[key];\n      if (typeof pdfBytes === 'string') {\n        params[key] = stringToBytes(pdfBytes);\n      } else if (typeof pdfBytes === 'object' && pdfBytes !== null &&\n                 !isNaN(pdfBytes.length)) {\n        params[key] = new Uint8Array(pdfBytes);\n      } else if (isArrayBuffer(pdfBytes)) {\n        params[key] = new Uint8Array(pdfBytes);\n      } else {\n        error('Invalid PDF binary data: either typed array, string or ' +\n              'array-like object is expected in the data property.');\n      }\n      continue;\n    }\n    params[key] = source[key];\n  }\n\n  params.rangeChunkSize = params.rangeChunkSize || DEFAULT_RANGE_CHUNK_SIZE;\n\n  if (!worker) {\n    // Worker was not provided -- creating and owning our own.\n    worker = new PDFWorker();\n    task._worker = worker;\n  }\n  var docId = task.docId;\n  worker.promise.then(function () {\n\n    if (task.destroyed) {\n      throw new Error('Loading aborted');\n    }\n    return _fetchDocument(worker, params, rangeTransport, docId).then(\n        function (workerId) {\n\n      if (task.destroyed) {\n        throw new Error('Loading aborted');\n      }\n      var messageHandler = new MessageHandler(docId, workerId, worker.port);\n      messageHandler.send('Ready', null);\n      var transport = new WorkerTransport(messageHandler, task, rangeTransport);\n      task._transport = transport;\n    });\n  }, task._capability.reject);\n\n  return task;\n};\n\n/**\n * Starts fetching of specified PDF document/data.\n * @param {PDFWorker} worker\n * @param {Object} source\n * @param {PDFDataRangeTransport} pdfDataRangeTransport\n * @param {string} docId Unique document id, used as MessageHandler id.\n * @returns {Promise} The promise, which is resolved when worker id of\n *                    MessageHandler is known.\n * @private\n */\nfunction _fetchDocument(worker, source, pdfDataRangeTransport, docId) {\n\n\n  if (worker.destroyed) {\n    return Promise.reject(new Error('Worker was destroyed'));\n  }\n\n///jsw worker source\n\n  source.disableAutoFetch = PDFJS.disableAutoFetch;\n  source.disableStream = PDFJS.disableStream;\n  source.chunkedViewerLoading = !!pdfDataRangeTransport;\n  if (pdfDataRangeTransport) {\n    source.length = pdfDataRangeTransport.length;\n    source.initialData = pdfDataRangeTransport.initialData;\n  }\n  return worker.messageHandler.sendWithPromise('GetDocRequest', {\n    docId: docId,\n    source: source,\n    disableRange: PDFJS.disableRange,\n    maxImageSize: PDFJS.maxImageSize,\n    cMapUrl: PDFJS.cMapUrl,\n    cMapPacked: PDFJS.cMapPacked,\n    disableFontFace: PDFJS.disableFontFace,\n    disableCreateObjectURL: PDFJS.disableCreateObjectURL,\n    verbosity: PDFJS.verbosity\n  }).then(function (workerId) {\n\n    if (worker.destroyed) {\n      throw new Error('Worker was destroyed');\n    }\n    return workerId;\n  });\n}\n\n/**\n * PDF document loading operation.\n * @class\n * @alias PDFDocumentLoadingTask\n */\nvar PDFDocumentLoadingTask = (function PDFDocumentLoadingTaskClosure() {\n\n  var nextDocumentId = 0;\n\n  /** @constructs PDFDocumentLoadingTask */\n  function PDFDocumentLoadingTask() {\n\n    this._capability = createPromiseCapability();\n    this._transport = null;\n    this._worker = null;\n\n    /**\n     * Unique document loading task id -- used in MessageHandlers.\n     * @type {string}\n     */\n    this.docId = 'd' + (nextDocumentId++);\n\n    /**\n     * Shows if loading task is destroyed.\n     * @type {boolean}\n     */\n    this.destroyed = false;\n\n    /**\n     * Callback to request a password if wrong or no password was provided.\n     * The callback receives two parameters: function that needs to be called\n     * with new password and reason (see {PasswordResponses}).\n     */\n    this.onPassword = null;\n\n    /**\n     * Callback to be able to monitor the loading progress of the PDF file\n     * (necessary to implement e.g. a loading bar). The callback receives\n     * an {\n///jsw\nObject} with the properties: {number} loaded and {number} total.\n     */\n    this.onProgress = null;\n\n    /**\n     * Callback to when unsupported feature is used. The callback receives\n     * an {PDFJS.UNSUPPORTED_FEATURES} argument.\n     */\n    this.onUnsupportedFeature = null;\n  }\n\n  PDFDocumentLoadingTask.prototype =\n      /** @lends PDFDocumentLoadingTask.prototype */ {\n    /**\n     * @return {Promise}\n     */\n    get promise() {\n      return this._capability.promise;\n    },\n\n    /**\n     * Aborts all network requests and destroys worker.\n     * @return {Promise} A promise that is resolved after destruction activity\n     *                   is completed.\n     */\n    destroy: function () {\n\n      this.destroyed = true;\n\n      var transportDestroyed = !this._transport ? Promise.resolve() :\n        this._transport.destroy();\n      return transportDestroyed.then(function () {\n\n        this._transport = null;\n        if (this._worker) {\n          this._worker.destroy();\n          this._worker = null;\n        }\n      }.bind(this));\n    },\n\n    /**\n     * Registers callbacks to indicate the document loading completion.\n     *\n     * @param {function} onFulfilled The callback for the loading completion.\n     * @param {function} onRejected The callback for the loading failure.\n     * @return {Promise} A promise that is resolved after the onFulfilled or\n     *                   onRejected callback.\n     */\n    then: function PDFDocumentLoadingTask_then(onFulfilled, onRejected) {\n\n      return this.promise.then.apply(this.promise, arguments);\n    }\n  };\n\n  return PDFDocumentLoadingTask;\n})();\n\n/**\n * Abstract class to support range requests file loading.\n * @class\n * @alias PDFJS.PDFDataRangeTransport\n * @param {number} length\n * @param {Uint8Array} initialData\n */\nvar PDFDataRangeTransport = (function pdfDataRangeTransportClosure() {\n\n  function PDFDataRangeTransport(length, initialData) {\n\n    this.length = length;\n    this.initialData = initialData;\n\n    this._rangeListeners = [];\n    this._progressListeners = [];\n    this._progressiveReadListeners = [];\n    this._readyCapability = createPromiseCapability();\n  }\n  PDFDataRangeTransport.prototype =\n      /** @lends PDFDataRangeTransport.prototype */ {\n    addRangeListener:\n        function PDFDataRangeTransport_addRangeListener(listener) {\n\n      this._rangeListeners.push(listener);\n    },\n\n    addProgressListener:\n        function PDFDataRangeTransport_addProgressListener(listener) {\n\n      this._progressListeners.push(listener);\n    },\n\n    addProgressiveReadListener:\n        function PDFDataRangeTransport_addProgressiveReadListener(listener) {\n\n      this._progressiveReadListeners.push(listener);\n    },\n\n    onDataRange: function PDFDataRangeTransport_onDataRange(begin, chunk) {\n\n      var listeners = this._rangeListeners;\n      for (var i = 0, n = listeners.length; i < n; ++i) {\n        listeners[i](begin, chunk);\n      }\n    },\n\n    onDataProgress: function PDFDataRangeTransport_onDataProgress(loaded) {\n\n      this._readyCapability.promise.then(function () {\n\n        var listeners = this._progressListeners;\n        for (var i = 0, n = listeners.length; i < n; ++i) {\n          listeners[i](loaded);\n        }\n      }.bind(this));\n    },\n\n    onDataProgressiveRead:\n        function PDFDataRangeTransport_onDataProgress(chunk) {\n\n      this._readyCapability.promise.then(function () {\n\n        var listeners = this._progressiveReadListeners;\n        for (var i = 0, n = listeners.length; i < n; ++i) {\n          listeners[i](chunk);\n        }\n      }.bind(this));\n    },\n\n    transportReady: function PDFDataRangeTransport_transportReady() {\n\n      this._readyCapability.resolve();\n    },\n\n    requestDataRange:\n        function PDFDataRangeTransport_requestDataRange(begin, end) {\n\n      throw new Error('Abstract method PDFDataRangeTransport.requestDataRange');\n    },\n\n    abort: function PDFDataRangeTransport_abort() {\n\n    }\n  };\n  return PDFDataRangeTransport;\n})();\n\nPDFJS.PDFDataRangeTransport = PDFDataRangeTransport;\n\n/**\n * Proxy to a PDFDocument in the worker thread. Also, contains commonly used\n * properties that can be read synchronously.\n * @class\n * @alias PDFDocumentProxy\n */\nvar PDFDocumentProxy = (function PDFDocumentProxyClosure() {\n\n  function PDFDocumentProxy(pdfInfo, transport, loadingTask) {\n///jsw this transport\n\n    this.pdfInfo = pdfInfo;\n    this.transport = transport;\n    this.loadingTask = loadingTask;\n  }\n  PDFDocumentProxy.prototype = /** @lends PDFDocumentProxy.prototype */ {\n    /**\n     * @return {number} Total number of pages the PDF contains.\n     */\n    get numPages() {\n      return this.pdfInfo.numPages;\n    },\n    /**\n     * @return {string} A unique ID to identify a PDF. Not guaranteed to be\n     * unique.\n     */\n    get fingerprint() {\n      return this.pdfInfo.fingerprint;\n    },\n    /**\n     * @param {number} pageNumber The page number to get. The first page is 1.\n     * @return {Promise} A promise that is resolved with a {@link PDFPageProxy}\n     * object.\n     */\n    getPage: function PDFDocumentProxy_getPage(pageNumber) {\n\n      return this.transport.getPage(pageNumber);\n    },\n    /**\n     * @param {{num: number, gen: number}} ref The page reference. Must have\n     *   the 'num' and 'gen' properties.\n     * @return {Promise} A promise that is resolved with the page index that is\n     * associated with the reference.\n     */\n    getPageIndex: function PDFDocumentProxy_getPageIndex(ref) {\n\n      return this.transport.getPageIndex(ref);\n    },\n    /**\n     * @return {Promise} A promise that is resolved with a lookup table for\n     * mapping named destinations to reference numbers.\n     *\n     * This can be slow for large documents: use getDestination instead\n     */\n    getDestinations: function PDFDocumentProxy_getDestinations() {\n\n      return this.transport.getDestinations();\n    },\n    /**\n     * @param {string} id The named destination to get.\n     * @return {Promise} A promise that is resolved with all information\n     * of the given named destination.\n     */\n    getDestination: function PDFDocumentProxy_getDestination(id) {\n\n      return this.transport.getDestination(id);\n    },\n    /**\n     * @return {Promise} A promise that is resolved with a lookup table for\n     * mapping named attachments to their content.\n     */\n    getAttachments: function PDFDocumentProxy_getAttachments() {\n\n      return this.transport.getAttachments();\n    },\n    /**\n     * @return {Promise} A promise that is resolved with an array of all the\n     * JavaScript strings in the name tree.\n     */\n    getJavaScript: function PDFDocumentProxy_getJavaScript() {\n\n      return this.transport.getJavaScript();\n    },\n    /**\n     * @return {Promise} A promise that is resolved with an {Array} that is a\n     * tree outline (if it has one) of the PDF. The tree is in the format of:\n     * [\n     *  {\n     *   title: string,\n     *   bold: boolean,\n     *   italic: boolean,\n     *   color: rgb array,\n     *   dest: dest obj,\n     *   items: array of more items like this\n     *  },\n     *  ...\n     * ].\n     */\n    getOutline: function PDFDocumentProxy_getOutline() {\n\n      return this.transport.getOutline();\n    },\n    /**\n     * @return {Promise} A promise that is resolved with an {Object} that has\n     * info and metadata properties.  Info is an {Object} filled with anything\n     * available in the information dictionary and similarly metadata is a\n     * {Metadata} object with information from the metadata section of the PDF.\n     */\n    getMetadata: function PDFDocumentProxy_getMetadata() {\n      return this.transport.getMetadata();\n    },\n    /**\n     * @return {Promise} A promise that is resolved with a TypedArray that has\n     * the raw data from the PDF.\n     */\n    getData: function PDFDocumentProxy_getData() {\n\n      return this.transport.getData();\n    },\n    /**\n     * @return {Promise} A promise that is resolved when the document's data\n     * is loaded. It is resolved with an {Object} that contains the length\n     * property that indicates size of the PDF data in bytes.\n     */\n    getDownloadInfo: function PDFDocumentProxy_getDownloadInfo() {\n\n      return this.transport.downloadInfoCapability.promise;\n    },\n    /**\n     * @return {Promise} A promise this is resolved with current stats about\n     * document structures (see {@link PDFDocumentStats}).\n     */\n    getStats: function PDFDocumentProxy_getStats() {\n\n      return this.transport.getStats();\n    },\n    /**\n     * Cleans up resources allocated by the document, e.g. created @font-face.\n     */\n    cleanup: function PDFDocumentProxy_cleanup() {\n\n      this.transport.startCleanup();\n    },\n    /**\n     * Destroys current document instance and terminates worker.\n     */\n    destroy: function PDFDocumentProxy_destroy() {\n\n      return this.loadingTask.destroy();\n    }\n  };\n  return PDFDocumentProxy;\n})();\n\n/**\n * Page getTextContent parameters.\n *\n * @typedef {Object} getTextContentParameters\n * @param {boolean} normalizeWhitespace - replaces all occurrences of\n *   whitespace with standard spaces (0x20). The default value is `false`.\n */\n\n/**\n * Page text content.\n *\n * @typedef {Object} TextContent\n * @property {array} items - array of {@link TextItem}\n * @property {Object} styles - {@link TextStyles} objects, indexed by font\n *                    name.\n */\n\n/**\n * Page text content part.\n *\n * @typedef {Object} TextItem\n * @property {string} str - text content.\n * @property {string} dir - text direction: 'ttb', 'ltr' or 'rtl'.\n * @property {array} transform - transformation matrix.\n * @property {number} width - width in device space.\n * @property {number} height - height in device space.\n * @property {string} fontName - font name used by pdf.js for converted font.\n */\n\n/**\n * Text style.\n *\n * @typedef {Object} TextStyle\n * @property {number} ascent - font ascent.\n * @property {number} descent - font descent.\n * @property {boolean} vertical - text is in vertical mode.\n * @property {string} fontFamily - possible font family\n */\n\n/**\n * Page annotation parameters.\n *\n * @typedef {Object} GetAnnotationsParameters\n * @param {string} intent - Determines the annotations that will be fetched,\n *                 can be either 'display' (viewable annotations) or 'print'\n *                 (printable annotations).\n *                 If the parameter is omitted, all annotations are fetched.\n */\n\n/**\n * Page render parameters.\n *\n * @typedef {Object} RenderParameters\n * @property {Object} canvasContext - A 2D context of a DOM Canvas object.\n * @property {PDFJS.PageViewport} viewport - Rendering viewport obtained by\n *                                calling of PDFPage.getViewport method.\n * @property {string} intent - Rendering intent, can be 'display' or 'print'\n *                    (default value is 'display').\n * @property {Array}  transform - (optional) Additional transform, applied\n *                    just before viewport transform.\n * @property {Object} imageLayer - (optional) An object that has beginLayout,\n *                    endLayout and appendImage functions.\n * @property {function} continueCallback - (deprecated) A function that will be\n *                      called each time the rendering is paused.  To continue\n *                      rendering call the function that is the first argument\n *                      to the callback.\n */\n\n/**\n * PDF page operator list.\n *\n * @typedef {\n///jsw\nObject} PDFOperatorList\n * @property {Array} fnArray - Array containing the operator functions.\n * @property {Array} argsArray - Array containing the arguments of the\n *                               functions.\n */\n\n/**\n * Proxy to a PDFPage in the worker thread.\n * @class\n * @alias PDFPageProxy\n */\nvar PDFPageProxy = (function PDFPageProxyClosure() {\n  function PDFPageProxy(pageIndex, pageInfo, transport) {\n    this.pageIndex = pageIndex;\n    this.pageInfo = pageInfo;\n    this.transport = transport;\n    this.stats = new StatTimer();\n    this.stats.enabled = !!globalScope.PDFJS.enableStats;\n    this.commonObjs = transport.commonObjs;\n    this.objs = new PDFObjects();\n    this.cleanupAfterRender = false;\n    this.pendingCleanup = false;\n    this.intentStates = {};\n    this.destroyed = false;\n  }\n  PDFPageProxy.prototype = /** @lends PDFPageProxy.prototype */ {\n    /**\n     * @return {number} Page number of the page. First page is 1.\n     */\n    get pageNumber() {\n      return this.pageIndex + 1;\n    },\n    /**\n     * @return {number} The number of degrees the page is rotated clockwise.\n     */\n    get rotate() {\n      return this.pageInfo.rotate;\n    },\n    /**\n     * @return {Object} The reference that points to this page. It has 'num' and\n     * 'gen' properties.\n     */\n    get ref() {\n      return this.pageInfo.ref;\n    },\n    /**\n     * @return {Array} An array of the visible portion of the PDF page in the\n     * user space units - [x1, y1, x2, y2].\n     */\n    get view() {\n      return this.pageInfo.view;\n    },\n    /**\n     * @param {number} scale The desired scale of the viewport.\n     * @param {number} rotate Degrees to rotate the viewport. If omitted this\n     * defaults to the page rotation.\n     * @return {PDFJS.PageViewport} Contains 'width' and 'height' properties\n     * along with transforms required for rendering.\n     */\n    getViewport: function PDFPageProxy_getViewport(scale, rotate) {\n      if (arguments.length < 2) {\n        rotate = this.rotate;\n      }\n      return new PDFJS.PageViewport(this.view, scale, rotate, 0, 0);\n    },\n    /**\n     * @param {GetAnnotationsParameters} params - Annotation parameters.\n     * @return {Promise} A promise that is resolved with an {Array} of the\n     * annotation objects.\n     */\n    getAnnotations: function PDFPageProxy_getAnnotations(params) {\n      var intent = (params && params.intent) || null;\n\n      if (!this.annotationsPromise || this.annotationsIntent !== intent) {\n        this.annotationsPromise = this.transport.getAnnotations(this.pageIndex,\n                                                                intent);\n        this.annotationsIntent = intent;\n      }\n      return this.annotationsPromise;\n    },\n    /**\n     * Begins the process of rendering a page to the desired context.\n     * @param {RenderParameters} params Page render parameters.\n     * @return {RenderTask} An object that contains the promise, which\n     *                      is resolved when the page finishes rendering.\n     */\n    render: function PDFPageProxy_render(params) {\n      var stats = this.stats;\n      stats.time('Overall');\n\n      // If there was a pending destroy cancel it so no cleanup happens during\n      // this call to render.\n      this.pendingCleanup = false;\n\n      var renderingIntent = (params.intent === 'print' ? 'print' : 'display');\n\n      if (!this.intentStates[renderingIntent]) {\n        this.intentStates[renderingIntent] = {};\n      }\n      var intentState = this.intentStates[renderingIntent];\n\n///jsw this\n\n      // If there's no displayReadyCapability yet, then the operatorList\n      // was never requested before. Make the request and create the promise.\n      if (!intentState.displayReadyCapability) {\n        intentState.receivingOperatorList = true;\n        intentState.displayReadyCapability = createPromiseCapability();\n        intentState.operatorList = {\n          fnArray: [],\n          argsArray: [],\n          lastChunk: false\n        };\n\n        this.stats.time('Page Request');\n        this.transport.messageHandler.send('RenderPageRequest', {\n          pageIndex: this.pageNumber - 1,\n          intent: renderingIntent\n        });\n      }\n\n      var internalRenderTask = new InternalRenderTask(complete, params,\n                                                      this.objs,\n                                                      this.commonObjs,\n                                                      intentState.operatorList,\n                                                      this.pageNumber);\n      internalRenderTask.useRequestAnimationFrame = renderingIntent !== 'print';\n      if (!intentState.renderTasks) {\n        intentState.renderTasks = [];\n      }\n      intentState.renderTasks.push(internalRenderTask);\n      var renderTask = internalRenderTask.task;\n\n      // Obsolete parameter support\n      if (params.continueCallback) {\n        deprecated('render is used with continueCallback parameter');\n        renderTask.onContinue = params.continueCallback;\n      }\n\n      var self = this;\n      intentState.displayReadyCapability.promise.then(\n        function pageDisplayReadyPromise(transparency) {\n          if (self.pendingCleanup) {\n            complete();\n            return;\n          }\n          stats.time('Rendering');\n          internalRenderTask.initalizeGraphics(transparency);\n          internalRenderTask.operatorListChanged();\n        },\n        function pageDisplayReadPromiseError(reason) {\n          complete(reason);\n        }\n      );\n\n      function complete(error) {\n        var i = intentState.renderTasks.indexOf(internalRenderTask);\n        if (i >= 0) {\n          intentState.renderTasks.splice(i, 1);\n        }\n\n        if (self.cleanupAfterRender) {\n          self.pendingCleanup = true;\n        }\n        self._tryCleanup();\n\n        if (error) {\n          internalRenderTask.capability.reject(error);\n        } else {\n          internalRenderTask.capability.resolve();\n        }\n        stats.timeEnd('Rendering');\n        stats.timeEnd('Overall');\n      }\n\n      return renderTask;\n    },\n\n    /**\n     * @return {Promise} A promise resolved with an {@link PDFOperatorList}\n     * object that represents page's operator list.\n     */\n    getOperatorList: function PDFPageProxy_getOperatorList() {\n      function operatorListChanged() {\n        if (intentState.operatorList.lastChunk) {\n          intentState.opListReadCapability.resolve(intentState.operatorList);\n        }\n      }\n\n      var renderingIntent = 'oplist';\n      if (!this.intentStates[renderingIntent]) {\n        this.intentStates[renderingIntent] = {};\n      }\n      var intentState = this.intentStates[renderingIntent];\n\n      if (!intentState.opListReadCapability) {\n        var opListTask = {};\n        opListTask.operatorListChanged = operatorListChanged;\n        intentState.receivingOperatorList = true;\n        intentState.opListReadCapability = createPromiseCapability();\n        intentState.renderTasks = [];\n        intentState.renderTasks.push(opListTask);\n        intentState.operatorList = {\n          fnArray: [],\n          argsArray: [],\n          lastChunk: false\n        };\n\n        this.transport.messageHandler.send('RenderPageRequest', {\n          pageIndex: this.pageIndex,\n          intent: renderingIntent\n        });\n      }\n      return intentState.opListReadCapability.promise;\n    },\n\n    /**\n     * @param {getTextContentParameters} params - getTextContent parameters.\n     * @return {Promise} That is resolved a {@link TextContent}\n     * object that represent the page text content.\n     */\n    getTextContent: function PDFPageProxy_getTextContent(params) {\n      var normalizeWhitespace = (params && params.normalizeWhitespace) || false;\n\n      return this.transport.messageHandler.sendWithPromise('GetTextContent', {\n        pageIndex: this.pageNumber - 1,\n        normalizeWhitespace: normalizeWhitespace,\n      });\n    },\n\n    /**\n     * Destroys page object.\n     */\n    _destroy: function PDFPageProxy_destroy() {\n      this.destroyed = true;\n      this.transport.pageCache[this.pageIndex] = null;\n\n      var waitOn = [];\n      Object.keys(this.intentStates).forEach(function(intent) {\n        var intentState = this.intentStates[intent];\n        intentState.renderTasks.forEach(function(renderTask) {\n          var renderCompleted = renderTask.capability.promise.\n            catch(function () {}); // ignoring failures\n          waitOn.push(renderCompleted);\n          renderTask.cancel();\n        });\n      }, this);\n      this.objs.clear();\n      this.annotationsPromise = null;\n      this.pendingCleanup = false;\n      return Promise.all(waitOn);\n    },\n\n    /**\n     * Cleans up resources allocated by the page. (deprecated)\n     */\n    destroy: function() {\n      deprecated('page destroy method, use cleanup() instead');\n      this.cleanup();\n    },\n\n    /**\n     * Cleans up resources allocated by the page.\n     */\n    cleanup: function PDFPageProxy_cleanup() {\n      this.pendingCleanup = true;\n      this._tryCleanup();\n    },\n    /**\n     * For internal use only. Attempts to clean up if rendering is in a state\n     * where that's possible.\n     * @ignore\n     */\n    _tryCleanup: function PDFPageProxy_tryCleanup() {\n      if (!this.pendingCleanup ||\n          Object.keys(this.intentStates).some(function(intent) {\n            var intentState = this.intentStates[intent];\n            return (intentState.renderTasks.length !== 0 ||\n                    intentState.receivingOperatorList);\n          }, this)) {\n        return;\n      }\n\n      Object.keys(this.intentStates).forEach(function(intent) {\n        delete this.intentStates[intent];\n      }, this);\n      this.objs.clear();\n      this.annotationsPromise = null;\n      this.pendingCleanup = false;\n    },\n    /**\n     * For internal use only.\n     * @ignore\n     */\n    _startRenderPage: function PDFPageProxy_startRenderPage(transparency,\n                                                            intent) {\n      var intentState = this.intentStates[intent];\n      // TODO Refactor RenderPageRequest to separate rendering\n      // and operator list logic\n      if (intentState.displayReadyCapability) {\n        intentState.displayReadyCapability.resolve(transparency);\n      }\n    },\n    /**\n     * For internal use only.\n     * @ignore\n     */\n    _renderPageChunk: function PDFPageProxy_renderPageChunk(operatorListChunk,\n                                                            intent) {\n      var intentState = this.intentStates[intent];\n      var i, ii;\n      // Add the new chunk to the current operator list.\n      for (i = 0, ii = operatorListChunk.length; i < ii; i++) {\n        intentState.operatorList.fnArray.push(operatorListChunk.fnArray[i]);\n        intentState.operatorList.argsArray.push(\n          operatorListChunk.argsArray[i]);\n      }\n      intentState.operatorList.lastChunk = operatorListChunk.lastChunk;\n\n      // Notify all the rendering tasks there are more operators to be consumed.\n      for (i = 0; i < intentState.renderTasks.length; i++) {\n        intentState.renderTasks[i].operatorListChanged();\n      }\n\n      if (operatorListChunk.lastChunk) {\n        intentState.receivingOperatorList = false;\n        this._tryCleanup();\n      }\n    }\n  };\n  return PDFPageProxy;\n})();\n\n/**\n * PDF.js web worker abstraction, it controls instantiation of PDF documents and\n * WorkerTransport for them.  If creation of a web worker is not possible,\n * a \"fake\" worker will be used instead.\n * @class\n */\nvar PDFWorker = (function PDFWorkerClosure() {\n\n  var nextFakeWorkerId = 0;\n\n  // Loads worker code into main thread.\n  function setupFakeWorkerGlobal() {\n\n    if (!PDFJS.fakeWorkerFilesLoadedCapability) {\n      PDFJS.fakeWorkerFilesLoadedCapability = createPromiseCapability();\n      // In the developer build load worker_loader which in turn loads all the\n      // other files and resolves the promise. In production only the\n      // pdf.worker.js file is needed.\n      Util.loadScript(PDFJS.workerSrc, function() {\n\n        PDFJS.fakeWorkerFilesLoadedCapability.resolve();\n      });\n    }\n    return PDFJS.fakeWorkerFilesLoadedCapability.promise;\n  }\n\n  function PDFWorker(name) {\n///jsw\n\n    this.name = name;\n    this.destroyed = false;\n\n    this._readyCapability = createPromiseCapability();\n    this._port = null;\n    this._webWorker = null;\n    this._messageHandler = null;\n    this._initialize();\n  }\n\n  PDFWorker.prototype =  /** @lends PDFWorker.prototype */ {\n    get promise() {\n      return this._readyCapability.promise;\n    },\n\n    get port() {\n      return this._port;\n    },\n\n    get messageHandler() {\n      return this._messageHandler;\n    },\n\n    _initialize: function PDFWorker_initialize() {\n\n      // If worker support isn't disabled explicit and the browser has worker\n      // support, create a new web worker and test if it/the browser fullfills\n      // all requirements to run parts of pdf.js in a web worker.\n      // Right now, the requirement is, that an Uint8Array is still an\n      // Uint8Array as it arrives on the worker. (Chrome added this with v.15.)\n      if (!globalScope.PDFJS.disableWorker && typeof Worker !== 'undefined') {\n        var workerSrc = PDFJS.workerSrc;\n        if (!workerSrc) {\n          error('No PDFJS.workerSrc specified');\n        }\n///jsw this\n\n        try {\n          // Some versions of FF can't create a worker on localhost, see:\n          // https://bugzilla.mozilla.org/show_bug.cgi?id=683280\n          var worker = new Worker(workerSrc);\n          var messageHandler = new MessageHandler('main', 'worker', worker);\n\n          messageHandler.on('test', function PDFWorker_test(data) {\n\n\n            if (this.destroyed) {\n              this._readyCapability.reject(new Error('Worker was destroyed'));\n              messageHandler.destroy();\n              worker.terminate();\n              return; // worker was destroyed\n            }\n            var supportTypedArray = data && data.supportTypedArray;\n            if (supportTypedArray) {\n              this._messageHandler = messageHandler;\n              this._port = worker;\n              this._webWorker = worker;\n              if (!data.supportTransfers) {\n                PDFJS.postMessageTransfers = false;\n              }\n              this._readyCapability.resolve();\n            } else {\n              this._setupFakeWorker();\n              messageHandler.destroy();\n              worker.terminate();\n            }\n          }.bind(this));\n\n          messageHandler.on('console_log', function (data) {\n\n            console.log.apply(console, data);\n          });\n          messageHandler.on('console_error', function (data) {\n\n            console.error.apply(console, data);\n          });\n\n          var testObj = new Uint8Array([PDFJS.postMessageTransfers ? 255 : 0]);\n          // Some versions of Opera throw a DATA_CLONE_ERR on serializing the\n          // typed array. Also, checking if we can use transfers.\n          try {\n            messageHandler.send('test', testObj, [testObj.buffer]);\n          } catch (ex) {\n            info('Cannot use postMessage transfers');\n            testObj[0] = 0;\n            messageHandler.send('test', testObj);\n          }\n          return;\n        } catch (e) {\n          info('The worker has been disabled.');\n        }\n      }\n      // Either workers are disabled, not supported or have thrown an exception.\n      // Thus, we fallback to a faked worker.\n      this._setupFakeWorker();\n    },\n\n    _setupFakeWorker: function PDFWorker_setupFakeWorker() {\n\n      warn('Setting up fake worker.');\n      globalScope.PDFJS.disableWorker = true;\n\n      setupFakeWorkerGlobal().then(function () {\n///jsw this\n\n        if (this.destroyed) {\n          this._readyCapability.reject(new Error('Worker was destroyed'));\n          return;\n        }\n\n        // If we don't use a worker, just post/sendMessage to the main thread.\n        var port = {\n          _listeners: [],\n          postMessage: function (obj) {\n\n            var e = {data: obj};\n            this._listeners.forEach(function (listener) {\n              listener.call(this, e);\n            }, this);\n          },\n          addEventListener: function (name, listener) {\n\n            this._listeners.push(listener);\n          },\n          removeEventListener: function (name, listener) {\n\n            var i = this._listeners.indexOf(listener);\n            this._listeners.splice(i, 1);\n          },\n          terminate: function () {\n}\n        };\n        this._port = port;\n\n        // All fake workers use the same port, making id unique.\n        var id = 'fake' + (nextFakeWorkerId++);\n\n        // If the main thread is our worker, setup the handling for the\n        // messages -- the main thread sends to it self.\n        var workerHandler = new MessageHandler(id + '_worker', id, port);\n        PDFJS.WorkerMessageHandler.setup(workerHandler, port);\n\n        var messageHandler = new MessageHandler(id, id + '_worker', port);\n        this._messageHandler = messageHandler;\n        this._readyCapability.resolve();\n      }.bind(this));\n    },\n\n    /**\n     * Destroys the worker instance.\n     */\n    destroy: function PDFWorker_destroy() {\n///jsw this\n\n      this.destroyed = true;\n      if (this._webWorker) {\n        // We need to terminate only web worker created resource.\n        this._webWorker.terminate();\n        this._webWorker = null;\n      }\n      this._port = null;\n      if (this._messageHandler) {\n        this._messageHandler.destroy();\n        this._messageHandler = null;\n      }\n    }\n  };\n\n  return PDFWorker;\n})();\nPDFJS.PDFWorker = PDFWorker;\n\n/**\n * For internal use only.\n * @ignore\n */\nvar WorkerTransport = (function WorkerTransportClosure() {\n\n  function WorkerTransport(messageHandler, loadingTask, pdfDataRangeTransport) {\n\n\n    this.messageHandler = messageHandler;\n    this.loadingTask = loadingTask;\n    this.pdfDataRangeTransport = pdfDataRangeTransport;\n    this.commonObjs = new PDFObjects();\n    this.fontLoader = new FontLoader(loadingTask.docId);\n\n///jsw this\n\n    this.destroyed = false;\n    this.destroyCapability = null;\n\n    this.pageCache = [];\n    this.pagePromises = [];\n    this.downloadInfoCapability = createPromiseCapability();\n\n    this.setupMessageHandler();\n  }\n  WorkerTransport.prototype = {\n    destroy: function WorkerTransport_destroy() {\n\n\n      if (this.destroyCapability) {\n        return this.destroyCapability.promise;\n      }\n\n      this.destroyed = true;\n      this.destroyCapability = createPromiseCapability();\n\n///jsw this\n\n      var waitOn = [];\n      // We need to wait for all renderings to be completed, e.g.\n      // timeout/rAF can take a long time.\n      this.pageCache.forEach(function (page) {\n        if (page) {\n          waitOn.push(page._destroy());\n        }\n      });\n      this.pageCache = [];\n      this.pagePromises = [];\n      var self = this;\n      // We also need to wait for the worker to finish its long running tasks.\n      var terminated = this.messageHandler.sendWithPromise('Terminate', null);\n      waitOn.push(terminated);\n      Promise.all(waitOn).then(function () {\n\n        self.fontLoader.clear();\n        if (self.pdfDataRangeTransport) {\n          self.pdfDataRangeTransport.abort();\n          self.pdfDataRangeTransport = null;\n        }\n        if (self.messageHandler) {\n          self.messageHandler.destroy();\n          self.messageHandler = null;\n        }\n        self.destroyCapability.resolve();\n      }, this.destroyCapability.reject);\n      return this.destroyCapability.promise;\n    },\n\n    setupMessageHandler:\n      function WorkerTransport_setupMessageHandler() {\n\n      var messageHandler = this.messageHandler;\n\n      function updatePassword(password) {\n\n        messageHandler.send('UpdatePassword', password);\n      }\n\n      var pdfDataRangeTransport = this.pdfDataRangeTransport;\n      if (pdfDataRangeTransport) {\n        pdfDataRangeTransport.addRangeListener(function(begin, chunk) {\n\n          messageHandler.send('OnDataRange', {\n            begin: begin,\n            chunk: chunk\n          });\n        });\n\n        pdfDataRangeTransport.addProgressListener(function(loaded) {\n\n          messageHandler.send('OnDataProgress', {\n            loaded: loaded\n          });\n        });\n\n        pdfDataRangeTransport.addProgressiveReadListener(function(chunk) {\n\n          messageHandler.send('OnDataRange', {\n            chunk: chunk\n          });\n        });\n\n        messageHandler.on('RequestDataRange',\n          function transportDataRange(data) {\n\n            pdfDataRangeTransport.requestDataRange(data.begin, data.end);\n          }, this);\n      }\n\n      messageHandler.on('GetDoc', function transportDoc(data) {\n///jsw data this\n\n        var pdfInfo = data.pdfInfo;\n        this.numPages = data.pdfInfo.numPages;\n        var loadingTask = this.loadingTask;\n        var pdfDocument = new PDFDocumentProxy(pdfInfo, this, loadingTask);\n        this.pdfDocument = pdfDocument;\n        loadingTask._capability.resolve(pdfDocument);\n      }, this);\n\n      messageHandler.on('NeedPassword',\n                        function transportNeedPassword(exception) {\n///jsw this\n\n        var loadingTask = this.loadingTask;\n        if (loadingTask.onPassword) {\n          return loadingTask.onPassword(updatePassword,\n                                        PasswordResponses.NEED_PASSWORD);\n        }\n        loadingTask._capability.reject(\n          new PasswordException(exception.message, exception.code));\n      }, this);\n\n      messageHandler.on('IncorrectPassword',\n                        function transportIncorrectPassword(exception) {\n///jsw\n\n        var loadingTask = this.loadingTask;\n        if (loadingTask.onPassword) {\n          return loadingTask.onPassword(updatePassword,\n                                        PasswordResponses.INCORRECT_PASSWORD);\n        }\n        loadingTask._capability.reject(\n          new PasswordException(exception.message, exception.code));\n      }, this);\n\n      messageHandler.on('InvalidPDF', function transportInvalidPDF(exception) {\n\n        this.loadingTask._capability.reject(\n          new InvalidPDFException(exception.message));\n      }, this);\n\n      messageHandler.on('MissingPDF', function transportMissingPDF(exception) {\n\n        this.loadingTask._capability.reject(\n          new MissingPDFException(exception.message));\n      }, this);\n\n      messageHandler.on('UnexpectedResponse',\n                        function transportUnexpectedResponse(exception) {\n\n        this.loadingTask._capability.reject(\n          new UnexpectedResponseException(exception.message, exception.status));\n      }, this);\n\n      messageHandler.on('UnknownError',\n                        function transportUnknownError(exception) {\n\n        this.loadingTask._capability.reject(\n          new UnknownErrorException(exception.message, exception.details));\n      }, this);\n\n      messageHandler.on('DataLoaded', function transportPage(data) {\n\n        this.downloadInfoCapability.resolve(data);\n      }, this);\n\n      messageHandler.on('PDFManagerReady', function transportPage(data) {\n\n        if (this.pdfDataRangeTransport) {\n          this.pdfDataRangeTransport.transportReady();\n        }\n      }, this);\n\n      messageHandler.on('StartRenderPage', function transportRender(data) {\n///jsw this\n\n        if (this.destroyed) {\n          return; // Ignore any pending requests if the worker was terminated.\n        }\n        var page = this.pageCache[data.pageIndex];\n\n        page.stats.timeEnd('Page Request');\n        page._startRenderPage(data.transparency, data.intent);\n      }, this);\n\n      messageHandler.on('RenderPageChunk', function transportRender(data) {\n\n        if (this.destroyed) {\n          return; // Ignore any pending requests if the worker was terminated.\n        }\n        var page = this.pageCache[data.pageIndex];\n\n        page._renderPageChunk(data.operatorList, data.intent);\n      }, this);\n\n      messageHandler.on('commonobj', function transportObj(data) {\n///jsw data this\n\n        if (this.destroyed) {\n          return; // Ignore any pending requests if the worker was terminated.\n        }\n\n        var id = data[0];\n        var type = data[1];\n        if (this.commonObjs.hasData(id)) {\n          return;\n        }\n\n        switch (type) {\n          case 'Font':\n            var exportedData = data[2];\n\n            var font;\n            if ('error' in exportedData) {\n              var error = exportedData.error;\n              warn('Error during font loading: ' + error);\n              this.commonObjs.resolve(id, error);\n              break;\n            } else {\n              font = new FontFaceObject(exportedData);\n            }\n\n            this.fontLoader.bind(\n              [font],\n              function fontReady(fontObjs) {\n\n                this.commonObjs.resolve(id, font);\n              }.bind(this)\n            );\n            break;\n          case 'FontPath':\n            this.commonObjs.resolve(id, data[2]);\n            break;\n          default:\n            error('Got unknown common object type ' + type);\n        }\n      }, this);\n\n      messageHandler.on('obj', function transportObj(data) {\n\n        if (this.destroyed) {\n          return; // Ignore any pending requests if the worker was terminated.\n        }\n\n        var id = data[0];\n        var pageIndex = data[1];\n        var type = data[2];\n        var pageProxy = this.pageCache[pageIndex];\n        var imageData;\n        if (pageProxy.objs.hasData(id)) {\n          return;\n        }\n\n///jsw data this\n\n        switch (type) {\n          case 'JpegStream':\n            imageData = data[3];\n            loadJpegStream(id, imageData, pageProxy.objs);\n            break;\n          case 'Image':\n            imageData = data[3];\n            pageProxy.objs.resolve(id, imageData);\n\n            // heuristics that will allow not to store large data\n            var MAX_IMAGE_SIZE_TO_STORE = 8000000;\n            if (imageData && 'data' in imageData &&\n                imageData.data.length > MAX_IMAGE_SIZE_TO_STORE) {\n              pageProxy.cleanupAfterRender = true;\n            }\n            break;\n          default:\n            error('Got unknown object type ' + type);\n        }\n      }, this);\n\n      messageHandler.on('DocProgress', function transportDocProgress(data) {\n\n        if (this.destroyed) {\n          return; // Ignore any pending requests if the worker was terminated.\n        }\n\n        var loadingTask = this.loadingTask;\n        if (loadingTask.onProgress) {\n          loadingTask.onProgress({\n            loaded: data.loaded,\n            total: data.total\n          });\n        }\n      }, this);\n\n      messageHandler.on('PageError', function transportError(data) {\n///jsw this\n\n        if (this.destroyed) {\n          return; // Ignore any pending requests if the worker was terminated.\n        }\n\n        var page = this.pageCache[data.pageNum - 1];\n        var intentState = page.intentStates[data.intent];\n        if (intentState.displayReadyCapability) {\n          intentState.displayReadyCapability.reject(data.error);\n        } else {\n          error(data.error);\n        }\n      }, this);\n\n      messageHandler.on('UnsupportedFeature',\n          function transportUnsupportedFeature(data) {\n///jsw this\n\n        if (this.destroyed) {\n          return; // Ignore any pending requests if the worker was terminated.\n        }\n        var featureId = data.featureId;\n        var loadingTask = this.loadingTask;\n        if (loadingTask.onUnsupportedFeature) {\n          loadingTask.onUnsupportedFeature(featureId);\n        }\n        PDFJS.UnsupportedManager.notify(featureId);\n      }, this);\n\n      messageHandler.on('JpegDecode', function(data) {\n///jsw this\n\n        if (this.destroyed) {\n          return Promise.reject('Worker was terminated');\n        }\n\n        var imageUrl = data[0];\n        var components = data[1];\n        if (components !== 3 && components !== 1) {\n          return Promise.reject(\n            new Error('Only 3 components or 1 component can be returned'));\n        }\n\n        return new Promise(function (resolve, reject) {\n\n          var img = new Image();\n          img.onload = function () {\n\n            var width = img.width;\n            var height = img.height;\n            var size = width * height;\n            var rgbaLength = size * 4;\n            var buf = new Uint8Array(size * components);\n            var tmpCanvas = createScratchCanvas(width, height);\n            var tmpCtx = tmpCanvas.getContext('2d');\n            tmpCtx.drawImage(img, 0, 0);\n            var data = tmpCtx.getImageData(0, 0, width, height).data;\n            var i, j;\n///jsw this\n\n            if (components === 3) {\n              for (i = 0, j = 0; i < rgbaLength; i += 4, j += 3) {\n                buf[j] = data[i];\n                buf[j + 1] = data[i + 1];\n                buf[j + 2] = data[i + 2];\n              }\n            } else if (components === 1) {\n              for (i = 0, j = 0; i < rgbaLength; i += 4, j++) {\n                buf[j] = data[i];\n              }\n            }\n            resolve({ data: buf, width: width, height: height});\n          };\n          img.onerror = function () {\n\n            reject(new Error('JpegDecode failed to load image'));\n          };\n          img.src = imageUrl;\n        });\n      }, this);\n    },\n\n    getData: function WorkerTransport_getData() {\n\n      return this.messageHandler.sendWithPromise('GetData', null);\n    },\n\n    getPage: function WorkerTransport_getPage(pageNumber, capability) {\n\n      if (pageNumber <= 0 || pageNumber > this.numPages ||\n          (pageNumber|0) !== pageNumber) {\n        return Promise.reject(new Error('Invalid page request'));\n      }\n\n      var pageIndex = pageNumber - 1;\n      if (pageIndex in this.pagePromises) {\n        return this.pagePromises[pageIndex];\n      }\n      var promise = this.messageHandler.sendWithPromise('GetPage', {\n        pageIndex: pageIndex\n      }).then(function (pageInfo) {\n\n        if (this.destroyed) {\n          throw new Error('Transport destroyed');\n        }\n        var page = new PDFPageProxy(pageIndex, pageInfo, this);\n        this.pageCache[pageIndex] = page;\n        return page;\n      }.bind(this));\n      this.pagePromises[pageIndex] = promise;\n      return promise;\n    },\n\n    getPageIndex: function WorkerTransport_getPageIndexByRef(ref) {\n\n      return this.messageHandler.sendWithPromise('GetPageIndex', { ref: ref });\n    },\n\n    getAnnotations: function WorkerTransport_getAnnotations(pageIndex, intent) {\n\n      return this.messageHandler.sendWithPromise('GetAnnotations', {\n        pageIndex: pageIndex,\n        intent: intent,\n      });\n    },\n\n    getDestinations: function WorkerTransport_getDestinations() {\n\n      return this.messageHandler.sendWithPromise('GetDestinations', null);\n    },\n\n    getDestination: function WorkerTransport_getDestination(id) {\n\n      return this.messageHandler.sendWithPromise('GetDestination', { id: id });\n    },\n\n    getAttachments: function WorkerTransport_getAttachments() {\n\n      return this.messageHandler.sendWithPromise('GetAttachments', null);\n    },\n\n    getJavaScript: function WorkerTransport_getJavaScript() {\n\n      return this.messageHandler.sendWithPromise('GetJavaScript', null);\n    },\n\n    getOutline: function WorkerTransport_getOutline() {\n\n      return this.messageHandler.sendWithPromise('GetOutline', null);\n    },\n\n    getMetadata: function WorkerTransport_getMetadata() {\n\n      return this.messageHandler.sendWithPromise('GetMetadata', null).\n        then(function transportMetadata(results) {\n\n        return {\n          info: results[0],\n          metadata: (results[1] ? new PDFJS.Metadata(results[1]) : null)\n        };\n      });\n    },\n\n    getStats: function WorkerTransport_getStats() {\n\n      return this.messageHandler.sendWithPromise('GetStats', null);\n    },\n\n    startCleanup: function WorkerTransport_startCleanup() {\n\n      this.messageHandler.sendWithPromise('Cleanup', null).\n        then(function endCleanup() {\n///jsw this\n\n        for (var i = 0, ii = this.pageCache.length; i < ii; i++) {\n          var page = this.pageCache[i];\n          if (page) {\n            page.cleanup();\n          }\n        }\n        this.commonObjs.clear();\n        this.fontLoader.clear();\n      }.bind(this));\n    }\n  };\n  return WorkerTransport;\n\n})();\n\n/**\n * A PDF document and page is built of many objects. E.g. there are objects\n * for fonts, images, rendering code and such. These objects might get processed\n * inside of a worker. The `PDFObjects` implements some basic functions to\n * manage these objects.\n * @ignore\n */\nvar PDFObjects = (function PDFObjectsClosure() {\n  function PDFObjects() {\n    this.objs = {};\n  }\n\n  PDFObjects.prototype = {\n    /**\n     * Internal function.\n     * Ensures there is an object defined for `objId`.\n     */\n    ensureObj: function PDFObjects_ensureObj(objId) {\n      if (this.objs[objId]) {\n        return this.objs[objId];\n      }\n\n      var obj = {\n        capability: createPromiseCapability(),\n        data: null,\n        resolved: false\n      };\n      this.objs[objId] = obj;\n\n      return obj;\n    },\n\n    /**\n     * If called *without* callback, this returns the data of `objId` but the\n     * object needs to be resolved. If it isn't, this function throws.\n     *\n     * If called *with* a callback, the callback is called with the data of the\n     * object once the object is resolved. That means, if you call this\n     * function and the object is already resolved, the callback gets called\n     * right away.\n     */\n    get: function PDFObjects_get(objId, callback) {\n      // If there is a callback, then the get can be async and the object is\n      // not required to be resolved right now\n      if (callback) {\n        this.ensureObj(objId).capability.promise.then(callback);\n        return null;\n      }\n\n      // If there isn't a callback, the user expects to get the resolved data\n      // directly.\n      var obj = this.objs[objId];\n\n///jsw this\n\n      // If there isn't an object yet or the object isn't resolved, then the\n      // data isn't ready yet!\n      if (!obj || !obj.resolved) {\n        error('Requesting object that isn\\'t resolved yet ' + objId);\n      }\n\n      return obj.data;\n    },\n\n    /**\n     * Resolves the object `objId` with optional `data`.\n     */\n    resolve: function PDFObjects_resolve(objId, data) {\n      var obj = this.ensureObj(objId);\n\n      obj.resolved = true;\n      obj.data = data;\n      obj.capability.resolve(data);\n    },\n\n    isResolved: function PDFObjects_isResolved(objId) {\n      var objs = this.objs;\n\n      if (!objs[objId]) {\n        return false;\n      } else {\n        return objs[objId].resolved;\n      }\n    },\n\n    hasData: function PDFObjects_hasData(objId) {\n      return this.isResolved(objId);\n    },\n\n    /**\n     * Returns the data of `objId` if object exists, null otherwise.\n     */\n    getData: function PDFObjects_getData(objId) {\n      var objs = this.objs;\n      if (!objs[objId] || !objs[objId].resolved) {\n        return null;\n      } else {\n        return objs[objId].data;\n      }\n    },\n\n    clear: function PDFObjects_clear() {\n      this.objs = {};\n    }\n  };\n  return PDFObjects;\n})();\n\n/**\n * Allows controlling of the rendering tasks.\n * @class\n * @alias RenderTask\n */\nvar RenderTask = (function RenderTaskClosure() {\n\n  function RenderTask(internalRenderTask) {\n\n    this._internalRenderTask = internalRenderTask;\n\n    /**\n     * Callback for incremental rendering -- a function that will be called\n     * each time the rendering is paused.  To continue rendering call the\n     * function that is the first argument to the callback.\n     * @type {function}\n     */\n    this.onContinue = null;\n  }\n\n  RenderTask.prototype = /** @lends RenderTask.prototype */ {\n    /**\n     * Promise for rendering task completion.\n     * @return {Promise}\n     */\n    get promise() {\n\n      return this._internalRenderTask.capability.promise;\n    },\n\n    /**\n     * Cancels the rendering task. If the task is currently rendering it will\n     * not be cancelled until graphics pauses with a timeout. The promise that\n     * this object extends will resolved when cancelled.\n     */\n    cancel: function RenderTask_cancel() {\n\n      this._internalRenderTask.cancel();\n    },\n\n    /**\n     * Registers callbacks to indicate the rendering task completion.\n     *\n     * @param {function} onFulfilled The callback for the rendering completion.\n     * @param {function} onRejected The callback for the rendering failure.\n     * @return {Promise} A promise that is resolved after the onFulfilled or\n     *                   onRejected callback.\n     */\n    then: function RenderTask_then(onFulfilled, onRejected) {\n\n      return this.promise.then.apply(this.promise, arguments);\n    }\n  };\n\n  return RenderTask;\n})();\n\n/**\n * For internal use only.\n * @ignore\n */\nvar InternalRenderTask = (function InternalRenderTaskClosure() {\n\n\n  function InternalRenderTask(callback, params, objs, commonObjs, operatorList,\n                              pageNumber) {\n\n    this.callback = callback;\n    this.params = params;\n    this.objs = objs;\n    this.commonObjs = commonObjs;\n    this.operatorListIdx = null;\n    this.operatorList = operatorList;\n    this.pageNumber = pageNumber;\n    this.running = false;\n    this.graphicsReadyCallback = null;\n    this.graphicsReady = false;\n    this.useRequestAnimationFrame = false;\n    this.cancelled = false;\n    this.capability = createPromiseCapability();\n    this.task = new RenderTask(this);\n///jsw this\n    // caching this-bound methods\n    this._continueBound = this._continue.bind(this);\n    this._scheduleNextBound = this._scheduleNext.bind(this);\n    this._nextBound = this._next.bind(this);\n  }\n\n  InternalRenderTask.prototype = {\n\n    initalizeGraphics:\n        function InternalRenderTask_initalizeGraphics(transparency) {\n\n\n      if (this.cancelled) {\n        return;\n      }\n      if (PDFJS.pdfBug && 'StepperManager' in globalScope &&\n          globalScope.StepperManager.enabled) {\n        this.stepper = globalScope.StepperManager.create(this.pageNumber - 1);\n        this.stepper.init(this.operatorList);\n        this.stepper.nextBreakPoint = this.stepper.getNextBreakPoint();\n      }\n///jsw this\n\n      var params = this.params;\n      this.gfx = new CanvasGraphics(params.canvasContext, this.commonObjs,\n                                    this.objs, params.imageLayer);\n\n      this.gfx.beginDrawing(params.transform, params.viewport, transparency);\n      this.operatorListIdx = 0;\n      this.graphicsReady = true;\n      if (this.graphicsReadyCallback) {\n        this.graphicsReadyCallback();\n      }\n    },\n\n    cancel: function InternalRenderTask_cancel() {\n\n      this.running = false;\n      this.cancelled = true;\n      this.callback('cancelled');\n    },\n\n    operatorListChanged: function InternalRenderTask_operatorListChanged() {\n\n      if (!this.graphicsReady) {\n        if (!this.graphicsReadyCallback) {\n          this.graphicsReadyCallback = this._continueBound;\n        }\n        return;\n      }\n///jsw this\n\n      if (this.stepper) {\n        this.stepper.updateOperatorList(this.operatorList);\n      }\n\n      if (this.running) {\n        return;\n      }\n      this._continue();\n    },\n\n    _continue: function InternalRenderTask__continue() {\n\n      this.running = true;\n      if (this.cancelled) {\n        return;\n      }\n      if (this.task.onContinue) {\n        this.task.onContinue.call(this.task, this._scheduleNextBound);\n      } else {\n        this._scheduleNext();\n      }\n    },\n\n    _scheduleNext: function InternalRenderTask__scheduleNext() {\n\n      if (this.useRequestAnimationFrame) {\n        window.requestAnimationFrame(this._nextBound);\n      } else {\n        Promise.resolve(undefined).then(this._nextBound);\n      }\n    },\n\n    _next: function InternalRenderTask__next() {\n\n      if (this.cancelled) {\n        return;\n      }\n      this.operatorListIdx = this.gfx.executeOperatorList(this.operatorList,\n                                        this.operatorListIdx,\n                                        this._continueBound,\n                                        this.stepper);\n      if (this.operatorListIdx === this.operatorList.argsArray.length) {\n        this.running = false;\n        if (this.operatorList.lastChunk) {\n          this.gfx.endDrawing();\n          this.callback();\n        }\n      }\n    }\n\n  };\n\n  return InternalRenderTask;\n})();\n\n/**\n * (Deprecated) Global observer of unsupported feature usages. Use\n * onUnsupportedFeature callback of the {PDFDocumentLoadingTask} instance.\n */\nPDFJS.UnsupportedManager = (function UnsupportedManagerClosure() {\n\n  var listeners = [];\n  return {\n    listen: function (cb) {\n\n      deprecated('Global UnsupportedManager.listen is used: ' +\n                 ' use PDFDocumentLoadingTask.onUnsupportedFeature instead');\n      listeners.push(cb);\n    },\n    notify: function (featureId) {\n      for (var i = 0, ii = listeners.length; i < ii; i++) {\n        listeners[i](featureId);\n      }\n    }\n  };\n})();\n\n\nvar Metadata = PDFJS.Metadata = (function MetadataClosure() {\n\n  function fixMetadata(meta) {\n\n    return meta.replace(/>\\\\376\\\\377([^<]+)/g, function(all, codes) {\n\n      var bytes = codes.replace(/\\\\([0-3])([0-7])([0-7])/g,\n                                function(code, d1, d2, d3) {\n\n        return String.fromCharCode(d1 * 64 + d2 * 8 + d3 * 1);\n      });\n///jsw codes\n      var chars = '';\n      for (var i = 0; i < bytes.length; i += 2) {\n        var code = bytes.charCodeAt(i) * 256 + bytes.charCodeAt(i + 1);\n        chars += code >= 32 && code < 127 && code !== 60 && code !== 62 &&\n          code !== 38 && false ? String.fromCharCode(code) :\n          '&#x' + (0x10000 + code).toString(16).substring(1) + ';';\n      }\n      return '>' + chars;\n    });\n  }\n\n  function Metadata(meta) {\n\n    if (typeof meta === 'string') {\n      // Ghostscript produces invalid metadata\n      meta = fixMetadata(meta);\n\n      var parser = new DOMParser();\n      meta = parser.parseFromString(meta, 'application/xml');\n    } else if (!(meta instanceof Document)) {\n      error('Metadata: Invalid metadata object');\n    }\n///jsw meta\n\n    this.metaDocument = meta;\n    this.metadata = {};\n    this.parse();\n  }\n\n  Metadata.prototype = {\n    parse: function Metadata_parse() {\n\n      var doc = this.metaDocument;\n      var rdf = doc.documentElement;\n\n      if (rdf.nodeName.toLowerCase() !== 'rdf:rdf') { // Wrapped in <xmpmeta>\n        rdf = rdf.firstChild;\n        while (rdf && rdf.nodeName.toLowerCase() !== 'rdf:rdf') {\n          rdf = rdf.nextSibling;\n        }\n      }\n///jsw doc rdf\n\n      var nodeName = (rdf) ? rdf.nodeName.toLowerCase() : null;\n      if (!rdf || nodeName !== 'rdf:rdf' || !rdf.hasChildNodes()) {\n        return;\n      }\n\n      var children = rdf.childNodes, desc, entry, name, i, ii, length, iLength;\n      for (i = 0, length = children.length; i < length; i++) {\n        desc = children[i];\n        if (desc.nodeName.toLowerCase() !== 'rdf:description') {\n          continue;\n        }\n\n        for (ii = 0, iLength = desc.childNodes.length; ii < iLength; ii++) {\n          if (desc.childNodes[ii].nodeName.toLowerCase() !== '#text') {\n            entry = desc.childNodes[ii];\n            name = entry.nodeName.toLowerCase();\n            this.metadata[name] = entry.textContent.trim();\n          }\n        }\n      }\n    },\n\n    get: function Metadata_get(name) {\n\n      return this.metadata[name] || null;\n    },\n\n    has: function Metadata_has(name) {\n\n      return typeof this.metadata[name] !== 'undefined';\n    }\n  };\n\n  return Metadata;\n})();\n\n\n// <canvas> contexts store most of the state we need natively.\n// However, PDF needs a bit more state, which we store here.\n\n// Minimal font size that would be used during canvas fillText operations.\nvar MIN_FONT_SIZE = 16;\n// Maximum font size that would be used during canvas fillText operations.\nvar MAX_FONT_SIZE = 100;\nvar MAX_GROUP_SIZE = 4096;\n\n// Heuristic value used when enforcing minimum line widths.\nvar MIN_WIDTH_FACTOR = 0.65;\n\nvar COMPILE_TYPE3_GLYPHS = true;\nvar MAX_SIZE_TO_COMPILE = 1000;\n\nvar FULL_CHUNK_HEIGHT = 16;\n\nfunction createScratchCanvas(width, height) {\n\n  var canvas = document.createElement('canvas');\n  canvas.width = width;\n  canvas.height = height;\n  return canvas;\n}\n\nfunction addContextCurrentTransform(ctx) {\n\n  // If the context doesn't expose a `mozCurrentTransform`, add a JS based one.\n  if (!ctx.mozCurrentTransform) {\n    ctx._originalSave = ctx.save;\n    ctx._originalRestore = ctx.restore;\n    ctx._originalRotate = ctx.rotate;\n    ctx._originalScale = ctx.scale;\n    ctx._originalTranslate = ctx.translate;\n    ctx._originalTransform = ctx.transform;\n    ctx._originalSetTransform = ctx.setTransform;\n\n    ctx._transformMatrix = ctx._transformMatrix || [1, 0, 0, 1, 0, 0];\n    ctx._transformStack = [];\n\n    Object.defineProperty(ctx, 'mozCurrentTransform', {\n      get: function getCurrentTransform() {\n\n        return this._transformMatrix;\n      }\n    });\n\n    Object.defineProperty(ctx, 'mozCurrentTransformInverse', {\n      get: function getCurrentTransformInverse() {\n\n        // Calculation done using WolframAlpha:\n        // http://www.wolframalpha.com/input/?\n        //   i=Inverse+{{a%2C+c%2C+e}%2C+{b%2C+d%2C+f}%2C+{0%2C+0%2C+1}}\n\n        var m = this._transformMatrix;\n        var a = m[0], b = m[1], c = m[2], d = m[3], e = m[4], f = m[5];\n\n        var ad_bc = a * d - b * c;\n        var bc_ad = b * c - a * d;\n\n        return [\n          d / ad_bc,\n          b / bc_ad,\n          c / bc_ad,\n          a / ad_bc,\n          (d * e - c * f) / bc_ad,\n          (b * e - a * f) / ad_bc\n        ];\n      }\n    });\n\n    ctx.save = function ctxSave() {\n///jsw this\n\n      var old = this._transformMatrix;\n      this._transformStack.push(old);\n      this._transformMatrix = old.slice(0, 6);\n\n      this._originalSave();\n    };\n\n    ctx.restore = function ctxRestore() {\n///jsw this\n\n      var prev = this._transformStack.pop();\n      if (prev) {\n        this._transformMatrix = prev;\n        this._originalRestore();\n      }\n    };\n\n    ctx.translate = function ctxTranslate(x, y) {\n\n      var m = this._transformMatrix;\n      m[4] = m[0] * x + m[2] * y + m[4];\n      m[5] = m[1] * x + m[3] * y + m[5];\n\n      this._originalTranslate(x, y);\n    };\n\n    ctx.scale = function ctxScale(x, y) {\n\n      var m = this._transformMatrix;\n      m[0] = m[0] * x;\n      m[1] = m[1] * x;\n      m[2] = m[2] * y;\n      m[3] = m[3] * y;\n\n      this._originalScale(x, y);\n    };\n\n    ctx.transform = function ctxTransform(a, b, c, d, e, f) {\n\n      var m = this._transformMatrix;\n      this._transformMatrix = [\n        m[0] * a + m[2] * b,\n        m[1] * a + m[3] * b,\n        m[0] * c + m[2] * d,\n        m[1] * c + m[3] * d,\n        m[0] * e + m[2] * f + m[4],\n        m[1] * e + m[3] * f + m[5]\n      ];\n\n      ctx._originalTransform(a, b, c, d, e, f);\n    };\n\n    ctx.setTransform = function ctxSetTransform(a, b, c, d, e, f) {\n\n      this._transformMatrix = [a, b, c, d, e, f];\n\n      ctx._originalSetTransform(a, b, c, d, e, f);\n    };\n\n    ctx.rotate = function ctxRotate(angle) {\n\n      var cosValue = Math.cos(angle);\n      var sinValue = Math.sin(angle);\n\n      var m = this._transformMatrix;\n      this._transformMatrix = [\n        m[0] * cosValue + m[2] * sinValue,\n        m[1] * cosValue + m[3] * sinValue,\n        m[0] * (-sinValue) + m[2] * cosValue,\n        m[1] * (-sinValue) + m[3] * cosValue,\n        m[4],\n        m[5]\n      ];\n\n      this._originalRotate(angle);\n    };\n  }\n}\n\nvar CachedCanvases = (function CachedCanvasesClosure() {\n\n  function CachedCanvases() {\n\n    this.cache = Object.create(null);\n  }\n  CachedCanvases.prototype = {\n    getCanvas: function CachedCanvases_getCanvas(id, width, height,\n                                                 trackTransform) {\n\n      var canvasEntry;\n      if (this.cache[id] !== undefined) {\n        canvasEntry = this.cache[id];\n        canvasEntry.canvas.width = width;\n        canvasEntry.canvas.height = height;\n        // reset canvas transform for emulated mozCurrentTransform, if needed\n        canvasEntry.context.setTransform(1, 0, 0, 1, 0, 0);\n      } else {\n        var canvas = createScratchCanvas(width, height);\n        var ctx = canvas.getContext('2d');\n///jsw this\n        if (trackTransform) {\n          addContextCurrentTransform(ctx);\n        }\n        this.cache[id] = canvasEntry = {canvas: canvas, context: ctx};\n      }\n      return canvasEntry;\n    },\n    clear: function () {\n///jsw this\n\n      for (var id in this.cache) {\n        var canvasEntry = this.cache[id];\n        // Zeroing the width and height causes Firefox to release graphics\n        // resources immediately, which can greatly reduce memory consumption.\n        canvasEntry.canvas.width = 0;\n        canvasEntry.canvas.height = 0;\n        delete this.cache[id];\n      }\n    }\n  };\n  return CachedCanvases;\n})();\n\nfunction compileType3Glyph(imgData) {\n\n  var POINT_TO_PROCESS_LIMIT = 1000;\n\n  var width = imgData.width, height = imgData.height;\n  var i, j, j0, width1 = width + 1;\n  var points = new Uint8Array(width1 * (height + 1));\n  var POINT_TYPES =\n      new Uint8Array([0, 2, 4, 0, 1, 0, 5, 4, 8, 10, 0, 8, 0, 2, 1, 0]);\n\n  // decodes bit-packed mask data\n  var lineSize = (width + 7) & ~7, data0 = imgData.data;\n  var data = new Uint8Array(lineSize * height), pos = 0, ii;\n  for (i = 0, ii = data0.length; i < ii; i++) {\n    var mask = 128, elem = data0[i];\n    while (mask > 0) {\n      data[pos++] = (elem & mask) ? 0 : 255;\n      mask >>= 1;\n    }\n  }\n\n  // finding iteresting points: every point is located between mask pixels,\n  // so there will be points of the (width + 1)x(height + 1) grid. Every point\n  // will have flags assigned based on neighboring mask pixels:\n  //   4 | 8\n  //   --P--\n  //   2 | 1\n  // We are interested only in points with the flags:\n  //   - outside corners: 1, 2, 4, 8;\n  //   - inside corners: 7, 11, 13, 14;\n  //   - and, intersections: 5, 10.\n  var count = 0;\n  pos = 0;\n  if (data[pos] !== 0) {\n    points[0] = 1;\n    ++count;\n  }\n  for (j = 1; j < width; j++) {\n    if (data[pos] !== data[pos + 1]) {\n      points[j] = data[pos] ? 2 : 1;\n      ++count;\n    }\n    pos++;\n  }\n  if (data[pos] !== 0) {\n    points[j] = 2;\n    ++count;\n  }\n  for (i = 1; i < height; i++) {\n    pos = i * lineSize;\n    j0 = i * width1;\n    if (data[pos - lineSize] !== data[pos]) {\n      points[j0] = data[pos] ? 1 : 8;\n      ++count;\n    }\n    // 'sum' is the position of the current pixel configuration in the 'TYPES'\n    // array (in order 8-1-2-4, so we can use '>>2' to shift the column).\n    var sum = (data[pos] ? 4 : 0) + (data[pos - lineSize] ? 8 : 0);\n    for (j = 1; j < width; j++) {\n      sum = (sum >> 2) + (data[pos + 1] ? 4 : 0) +\n            (data[pos - lineSize + 1] ? 8 : 0);\n      if (POINT_TYPES[sum]) {\n        points[j0 + j] = POINT_TYPES[sum];\n        ++count;\n      }\n      pos++;\n    }\n    if (data[pos - lineSize] !== data[pos]) {\n      points[j0 + j] = data[pos] ? 2 : 4;\n      ++count;\n    }\n\n    if (count > POINT_TO_PROCESS_LIMIT) {\n      return null;\n    }\n  }\n\n  pos = lineSize * (height - 1);\n  j0 = i * width1;\n  if (data[pos] !== 0) {\n    points[j0] = 8;\n    ++count;\n  }\n  for (j = 1; j < width; j++) {\n    if (data[pos] !== data[pos + 1]) {\n      points[j0 + j] = data[pos] ? 4 : 8;\n      ++count;\n    }\n    pos++;\n  }\n  if (data[pos] !== 0) {\n    points[j0 + j] = 4;\n    ++count;\n  }\n  if (count > POINT_TO_PROCESS_LIMIT) {\n    return null;\n  }\n\n  // building outlines\n  var steps = new Int32Array([0, width1, -1, 0, -width1, 0, 0, 0, 1]);\n  var outlines = [];\n  for (i = 0; count && i <= height; i++) {\n    var p = i * width1;\n    var end = p + width;\n    while (p < end && !points[p]) {\n      p++;\n    }\n    if (p === end) {\n      continue;\n    }\n    var coords = [p % width1, i];\n\n    var type = points[p], p0 = p, pp;\n    do {\n      var step = steps[type];\n      do {\n        p += step;\n      } while (!points[p]);\n\n      pp = points[p];\n      if (pp !== 5 && pp !== 10) {\n        // set new direction\n        type = pp;\n        // delete mark\n        points[p] = 0;\n      } else { // type is 5 or 10, ie, a crossing\n        // set new direction\n        type = pp & ((0x33 * type) >> 4);\n        // set new type for \"future hit\"\n        points[p] &= (type >> 2 | type << 2);\n      }\n\n      coords.push(p % width1);\n      coords.push((p / width1) | 0);\n      --count;\n    } while (p0 !== p);\n    outlines.push(coords);\n    --i;\n  }\n\n  var drawOutline = function(c) {\n\n    c.save();\n    // the path shall be painted in [0..1]x[0..1] space\n    c.scale(1 / width, -1 / height);\n    c.translate(0, -height);\n    c.beginPath();\n    for (var i = 0, ii = outlines.length; i < ii; i++) {\n      var o = outlines[i];\n      c.moveTo(o[0], o[1]);\n      for (var j = 2, jj = o.length; j < jj; j += 2) {\n        c.lineTo(o[j], o[j+1]);\n      }\n    }\n///jsw c\n    c.fill();\n    c.beginPath();\n    c.restore();\n  };\n\n  return drawOutline;\n}\n\nvar CanvasExtraState = (function CanvasExtraStateClosure() {\n\n  function CanvasExtraState(old) {\n\n    // Are soft masks and alpha values shapes or opacities?\n    this.alphaIsShape = false;\n    this.fontSize = 0;\n    this.fontSizeScale = 1;\n    this.textMatrix = IDENTITY_MATRIX;\n    this.textMatrixScale = 1;\n    this.fontMatrix = FONT_IDENTITY_MATRIX;\n    this.leading = 0;\n    // Current point (in user coordinates)\n    this.x = 0;\n    this.y = 0;\n    // Start of text line (in text coordinates)\n    this.lineX = 0;\n    this.lineY = 0;\n    // Character and word spacing\n    this.charSpacing = 0;\n    this.wordSpacing = 0;\n    this.textHScale = 1;\n    this.textRenderingMode = TextRenderingMode.FILL;\n    this.textRise = 0;\n///jsw this\n    // Default fore and background colors\n    this.fillColor = '#000000';\n    this.strokeColor = '#000000';\n    this.patternFill = false;\n    // Note: fill alpha applies to all non-stroking operations\n    this.fillAlpha = 1;\n    this.strokeAlpha = 1;\n    this.lineWidth = 1;\n    this.activeSMask = null; // nonclonable field (see the save method below)\n\n    this.old = old;\n  }\n\n  CanvasExtraState.prototype = {\n    clone: function CanvasExtraState_clone() {\n\n      return Object.create(this);\n    },\n    setCurrentPoint: function CanvasExtraState_setCurrentPoint(x, y) {\n\n      this.x = x;\n      this.y = y;\n    }\n  };\n  return CanvasExtraState;\n})();\n\nvar CanvasGraphics = (function CanvasGraphicsClosure() {\n\n  // Defines the time the executeOperatorList is going to be executing\n  // before it stops and shedules a continue of execution.\n  var EXECUTION_TIME = 15;\n  // Defines the number of steps before checking the execution time\n  var EXECUTION_STEPS = 10;\n\n  function CanvasGraphics(canvasCtx, commonObjs, objs, imageLayer) {\n\n    this.ctx = canvasCtx;\n    this.current = new CanvasExtraState();\n    this.stateStack = [];\n    this.pendingClip = null;\n    this.pendingEOFill = false;\n    this.res = null;\n    this.xobjs = null;\n    this.commonObjs = commonObjs;\n    this.objs = objs;\n    this.imageLayer = imageLayer;\n    this.groupStack = [];\n    this.processingType3 = null;\n///jsw this\n    // Patterns are painted relative to the initial page/form transform, see pdf\n    // spec 8.7.2 NOTE 1.\n    this.baseTransform = null;\n    this.baseTransformStack = [];\n    this.groupLevel = 0;\n    this.smaskStack = [];\n    this.smaskCounter = 0;\n    this.tempSMask = null;\n    this.cachedCanvases = new CachedCanvases();\n    if (canvasCtx) {\n      // NOTE: if mozCurrentTransform is polyfilled, then the current state of\n      // the transformation must already be set in canvasCtx._transformMatrix.\n      addContextCurrentTransform(canvasCtx);\n    }\n    this.cachedGetSinglePixelWidth = null;\n  }\n\n  function putBinaryImageData(ctx, imgData) {\n\n    if (typeof ImageData !== 'undefined' && imgData instanceof ImageData) {\n      ctx.putImageData(imgData, 0, 0);\n      return;\n    }\n\n    // Put the image data to the canvas in chunks, rather than putting the\n    // whole image at once.  This saves JS memory, because the ImageData object\n    // is smaller. It also possibly saves C++ memory within the implementation\n    // of putImageData(). (E.g. in Firefox we make two short-lived copies of\n    // the data passed to putImageData()). |n| shouldn't be too small, however,\n    // because too many putImageData() calls will slow things down.\n    //\n    // Note: as written, if the last chunk is partial, the putImageData() call\n    // will (conceptually) put pixels past the bounds of the canvas.  But\n    // that's ok; any such pixels are ignored.\n\n    var height = imgData.height, width = imgData.width;\n    var partialChunkHeight = height % FULL_CHUNK_HEIGHT;\n    var fullChunks = (height - partialChunkHeight) / FULL_CHUNK_HEIGHT;\n    var totalChunks = partialChunkHeight === 0 ? fullChunks : fullChunks + 1;\n\n    var chunkImgData = ctx.createImageData(width, FULL_CHUNK_HEIGHT);\n    var srcPos = 0, destPos;\n    var src = imgData.data;\n    var dest = chunkImgData.data;\n    var i, j, thisChunkHeight, elemsInThisChunk;\n///jsw\n\n    // There are multiple forms in which the pixel data can be passed, and\n    // imgData.kind tells us which one this is.\n    if (imgData.kind === ImageKind.GRAYSCALE_1BPP) {\n      // Grayscale, 1 bit per pixel (i.e. black-and-white).\n      var srcLength = src.byteLength;\n      var dest32 = PDFJS.hasCanvasTypedArrays ? new Uint32Array(dest.buffer) :\n        new Uint32ArrayView(dest);\n      var dest32DataLength = dest32.length;\n      var fullSrcDiff = (width + 7) >> 3;\n      var white = 0xFFFFFFFF;\n      var black = (PDFJS.isLittleEndian || !PDFJS.hasCanvasTypedArrays) ?\n        0xFF000000 : 0x000000FF;\n      for (i = 0; i < totalChunks; i++) {\n        thisChunkHeight =\n          (i < fullChunks) ? FULL_CHUNK_HEIGHT : partialChunkHeight;\n        destPos = 0;\n        for (j = 0; j < thisChunkHeight; j++) {\n          var srcDiff = srcLength - srcPos;\n          var k = 0;\n          var kEnd = (srcDiff > fullSrcDiff) ? width : srcDiff * 8 - 7;\n          var kEndUnrolled = kEnd & ~7;\n          var mask = 0;\n          var srcByte = 0;\n          for (; k < kEndUnrolled; k += 8) {\n            srcByte = src[srcPos++];\n            dest32[destPos++] = (srcByte & 128) ? white : black;\n            dest32[destPos++] = (srcByte & 64) ? white : black;\n            dest32[destPos++] = (srcByte & 32) ? white : black;\n            dest32[destPos++] = (srcByte & 16) ? white : black;\n            dest32[destPos++] = (srcByte & 8) ? white : black;\n            dest32[destPos++] = (srcByte & 4) ? white : black;\n            dest32[destPos++] = (srcByte & 2) ? white : black;\n            dest32[destPos++] = (srcByte & 1) ? white : black;\n          }\n          for (; k < kEnd; k++) {\n             if (mask === 0) {\n               srcByte = src[srcPos++];\n               mask = 128;\n             }\n\n            dest32[destPos++] = (srcByte & mask) ? white : black;\n            mask >>= 1;\n          }\n        }\n        // We ran out of input. Make all remaining pixels transparent.\n        while (destPos < dest32DataLength) {\n          dest32[destPos++] = 0;\n        }\n\n        ctx.putImageData(chunkImgData, 0, i * FULL_CHUNK_HEIGHT);\n      }\n    } else if (imgData.kind === ImageKind.RGBA_32BPP) {\n      // RGBA, 32-bits per pixel.\n\n      j = 0;\n      elemsInThisChunk = width * FULL_CHUNK_HEIGHT * 4;\n      for (i = 0; i < fullChunks; i++) {\n        dest.set(src.subarray(srcPos, srcPos + elemsInThisChunk));\n        srcPos += elemsInThisChunk;\n\n        ctx.putImageData(chunkImgData, 0, j);\n        j += FULL_CHUNK_HEIGHT;\n      }\n      if (i < totalChunks) {\n        elemsInThisChunk = width * partialChunkHeight * 4;\n        dest.set(src.subarray(srcPos, srcPos + elemsInThisChunk));\n        ctx.putImageData(chunkImgData, 0, j);\n      }\n\n    } else if (imgData.kind === ImageKind.RGB_24BPP) {\n      // RGB, 24-bits per pixel.\n      thisChunkHeight = FULL_CHUNK_HEIGHT;\n      elemsInThisChunk = width * thisChunkHeight;\n      for (i = 0; i < totalChunks; i++) {\n        if (i >= fullChunks) {\n          thisChunkHeight = partialChunkHeight;\n          elemsInThisChunk = width * thisChunkHeight;\n        }\n\n        destPos = 0;\n        for (j = elemsInThisChunk; j--;) {\n          dest[destPos++] = src[srcPos++];\n          dest[destPos++] = src[srcPos++];\n          dest[destPos++] = src[srcPos++];\n          dest[destPos++] = 255;\n        }\n        ctx.putImageData(chunkImgData, 0, i * FULL_CHUNK_HEIGHT);\n      }\n    } else {\n      error('bad image kind: ' + imgData.kind);\n    }\n  }\n\n  function putBinaryImageMask(ctx, imgData) {\n\n    var height = imgData.height, width = imgData.width;\n    var partialChunkHeight = height % FULL_CHUNK_HEIGHT;\n    var fullChunks = (height - partialChunkHeight) / FULL_CHUNK_HEIGHT;\n    var totalChunks = partialChunkHeight === 0 ? fullChunks : fullChunks + 1;\n\n    var chunkImgData = ctx.createImageData(width, FULL_CHUNK_HEIGHT);\n    var srcPos = 0;\n    var src = imgData.data;\n    var dest = chunkImgData.data;\n///jsw ctx\n\n    for (var i = 0; i < totalChunks; i++) {\n      var thisChunkHeight =\n        (i < fullChunks) ? FULL_CHUNK_HEIGHT : partialChunkHeight;\n\n      // Expand the mask so it can be used by the canvas.  Any required\n      // inversion has already been handled.\n      var destPos = 3; // alpha component offset\n      for (var j = 0; j < thisChunkHeight; j++) {\n        var mask = 0;\n        for (var k = 0; k < width; k++) {\n          if (!mask) {\n            var elem = src[srcPos++];\n            mask = 128;\n          }\n          dest[destPos] = (elem & mask) ? 0 : 255;\n          destPos += 4;\n          mask >>= 1;\n        }\n      }\n      ctx.putImageData(chunkImgData, 0, i * FULL_CHUNK_HEIGHT);\n    }\n  }\n\n  function copyCtxState(sourceCtx, destCtx) {\n\n    var properties = ['strokeStyle', 'fillStyle', 'fillRule', 'globalAlpha',\n                      'lineWidth', 'lineCap', 'lineJoin', 'miterLimit',\n                      'globalCompositeOperation', 'font'];\n    for (var i = 0, ii = properties.length; i < ii; i++) {\n      var property = properties[i];\n      if (sourceCtx[property] !== undefined) {\n        destCtx[property] = sourceCtx[property];\n      }\n    }\n    if (sourceCtx.setLineDash !== undefined) {\n      destCtx.setLineDash(sourceCtx.getLineDash());\n      destCtx.lineDashOffset =  sourceCtx.lineDashOffset;\n    } else if (sourceCtx.mozDashOffset !== undefined) {\n      destCtx.mozDash = sourceCtx.mozDash;\n      destCtx.mozDashOffset = sourceCtx.mozDashOffset;\n    }\n  }\n\n  function composeSMaskBackdrop(bytes, r0, g0, b0) {\n\n    var length = bytes.length;\n    for (var i = 3; i < length; i += 4) {\n      var alpha = bytes[i];\n      if (alpha === 0) {\n        bytes[i - 3] = r0;\n        bytes[i - 2] = g0;\n        bytes[i - 1] = b0;\n      } else if (alpha < 255) {\n        var alpha_ = 255 - alpha;\n        bytes[i - 3] = (bytes[i - 3] * alpha + r0 * alpha_) >> 8;\n        bytes[i - 2] = (bytes[i - 2] * alpha + g0 * alpha_) >> 8;\n        bytes[i - 1] = (bytes[i - 1] * alpha + b0 * alpha_) >> 8;\n      }\n    }\n  }\n\n  function composeSMaskAlpha(maskData, layerData, transferMap) {\n\n    var length = maskData.length;\n    var scale = 1 / 255;\n    for (var i = 3; i < length; i += 4) {\n      var alpha = transferMap ? transferMap[maskData[i]] : maskData[i];\n      layerData[i] = (layerData[i] * alpha * scale) | 0;\n    }\n  }\n\n  function composeSMaskLuminosity(maskData, layerData, transferMap) {\n\n    var length = maskData.length;\n    for (var i = 3; i < length; i += 4) {\n      var y = (maskData[i - 3] * 77) +  // * 0.3 / 255 * 0x10000\n              (maskData[i - 2] * 152) + // * 0.59 ....\n              (maskData[i - 1] * 28);   // * 0.11 ....\n      layerData[i] = transferMap ?\n        (layerData[i] * transferMap[y >> 8]) >> 8 :\n        (layerData[i] * y) >> 16;\n    }\n  }\n\n  function genericComposeSMask(maskCtx, layerCtx, width, height,\n                               subtype, backdrop, transferMap) {\n\n    var hasBackdrop = !!backdrop;\n    var r0 = hasBackdrop ? backdrop[0] : 0;\n    var g0 = hasBackdrop ? backdrop[1] : 0;\n    var b0 = hasBackdrop ? backdrop[2] : 0;\n\n    var composeFn;\n    if (subtype === 'Luminosity') {\n      composeFn = composeSMaskLuminosity;\n    } else {\n      composeFn = composeSMaskAlpha;\n    }\n///jsw backdrop\n\n    // processing image in chunks to save memory\n    var PIXELS_TO_PROCESS = 1048576;\n    var chunkSize = Math.min(height, Math.ceil(PIXELS_TO_PROCESS / width));\n    for (var row = 0; row < height; row += chunkSize) {\n      var chunkHeight = Math.min(chunkSize, height - row);\n      var maskData = maskCtx.getImageData(0, row, width, chunkHeight);\n      var layerData = layerCtx.getImageData(0, row, width, chunkHeight);\n\n      if (hasBackdrop) {\n        composeSMaskBackdrop(maskData.data, r0, g0, b0);\n      }\n      composeFn(maskData.data, layerData.data, transferMap);\n\n      maskCtx.putImageData(layerData, 0, row);\n    }\n  }\n\n  function composeSMask(ctx, smask, layerCtx) {\n\n    var mask = smask.canvas;\n    var maskCtx = smask.context;\n\n    ctx.setTransform(smask.scaleX, 0, 0, smask.scaleY,\n                     smask.offsetX, smask.offsetY);\n\n    var backdrop = smask.backdrop || null;\n///jsw ctx smask\n\n    if (!smask.transferMap && WebGLUtils.isEnabled) {\n      var composed = WebGLUtils.composeSMask(layerCtx.canvas, mask,\n        {subtype: smask.subtype, backdrop: backdrop});\n      ctx.setTransform(1, 0, 0, 1, 0, 0);\n      ctx.drawImage(composed, smask.offsetX, smask.offsetY);\n      return;\n    }\n    genericComposeSMask(maskCtx, layerCtx, mask.width, mask.height,\n                        smask.subtype, backdrop, smask.transferMap);\n    ctx.drawImage(mask, 0, 0);\n  }\n\n  var LINE_CAP_STYLES = ['butt', 'round', 'square'];\n  var LINE_JOIN_STYLES = ['miter', 'round', 'bevel'];\n  var NORMAL_CLIP = {};\n  var EO_CLIP = {};\n\n  CanvasGraphics.prototype = {\n\n    beginDrawing: function CanvasGraphics_beginDrawing(transform, viewport,\n                                                       transparency) {\n\n      // For pdfs that use blend modes we have to clear the canvas else certain\n      // blend modes can look wrong since we'd be blending with a white\n      // backdrop. The problem with a transparent backdrop though is we then\n      // don't get sub pixel anti aliasing on text, creating temporary\n      // transparent canvas when we have blend modes.\n      var width = this.ctx.canvas.width;\n      var height = this.ctx.canvas.height;\n\n      this.ctx.save();\n      this.ctx.fillStyle = 'rgb(255, 255, 255)';\n      this.ctx.fillRect(0, 0, width, height);\n      this.ctx.restore();\n\n///jsw this\n\n      if (transparency) {\n        var transparentCanvas = this.cachedCanvases.getCanvas(\n          'transparent', width, height, true);\n        this.compositeCtx = this.ctx;\n        this.transparentCanvas = transparentCanvas.canvas;\n        this.ctx = transparentCanvas.context;\n        this.ctx.save();\n        // The transform can be applied before rendering, transferring it to\n        // the new canvas.\n        this.ctx.transform.apply(this.ctx,\n                                 this.compositeCtx.mozCurrentTransform);\n      }\n\n      this.ctx.save();\n      if (transform) {\n        this.ctx.transform.apply(this.ctx, transform);\n      }\n      this.ctx.transform.apply(this.ctx, viewport.transform);\n\n      this.baseTransform = this.ctx.mozCurrentTransform.slice();\n\n      if (this.imageLayer) {\n        this.imageLayer.beginLayout();\n      }\n    },\n\n    executeOperatorList: function CanvasGraphics_executeOperatorList(\n                                    operatorList,\n                                    executionStartIdx, continueCallback,\n                                    stepper) {\n\n      var argsArray = operatorList.argsArray;\n      var fnArray = operatorList.fnArray;\n      var i = executionStartIdx || 0;\n      var argsArrayLen = argsArray.length;\n\n      // Sometimes the OperatorList to execute is empty.\n      if (argsArrayLen === i) {\n        return i;\n      }\n\n      var chunkOperations = (argsArrayLen - i > EXECUTION_STEPS &&\n                             typeof continueCallback === 'function');\n      var endTime = chunkOperations ? Date.now() + EXECUTION_TIME : 0;\n      var steps = 0;\n\n      var commonObjs = this.commonObjs;\n      var objs = this.objs;\n      var fnId;\n///jsw this\n\n      while (true) {\n\n        if (stepper !== undefined && i === stepper.nextBreakPoint) {\n          stepper.breakIt(i, continueCallback);\n          return i;\n        }\n\n        fnId = fnArray[i];\n\n        if (fnId !== OPS.dependency) {\n          this[fnId].apply(this, argsArray[i]);\n        } else {\n          var deps = argsArray[i];\n          for (var n = 0, nn = deps.length; n < nn; n++) {\n            var depObjId = deps[n];\n            var common = depObjId[0] === 'g' && depObjId[1] === '_';\n            var objsPool = common ? commonObjs : objs;\n\n            // If the promise isn't resolved yet, add the continueCallback\n            // to the promise and bail out.\n            if (!objsPool.isResolved(depObjId)) {\n              objsPool.get(depObjId, continueCallback);\n              return i;\n            }\n          }\n        }\n\n        i++;\n\n        // If the entire operatorList was executed, stop as were done.\n        if (i === argsArrayLen) {\n          return i;\n        }\n\n        // If the execution took longer then a certain amount of time and\n        // `continueCallback` is specified, interrupt the execution.\n        if (chunkOperations && ++steps > EXECUTION_STEPS) {\n          if (Date.now() > endTime) {\n            continueCallback();\n            return i;\n          }\n          steps = 0;\n        }\n\n        // If the operatorList isn't executed completely yet OR the execution\n        // time was short enough, do another execution round.\n      }\n    },\n\n    endDrawing: function CanvasGraphics_endDrawing() {\n\n      this.ctx.restore();\n\n      if (this.transparentCanvas) {\n        this.ctx = this.compositeCtx;\n        this.ctx.drawImage(this.transparentCanvas, 0, 0);\n        this.transparentCanvas = null;\n      }\n///jsw this\n\n      this.cachedCanvases.clear();\n      WebGLUtils.clear();\n\n      if (this.imageLayer) {\n        this.imageLayer.endLayout();\n      }\n    },\n\n    // Graphics state\n    setLineWidth: function CanvasGraphics_setLineWidth(width) {\n\n      this.current.lineWidth = width;\n      this.ctx.lineWidth = width;\n    },\n    setLineCap: function CanvasGraphics_setLineCap(style) {\n\n      this.ctx.lineCap = LINE_CAP_STYLES[style];\n    },\n    setLineJoin: function CanvasGraphics_setLineJoin(style) {\n\n      this.ctx.lineJoin = LINE_JOIN_STYLES[style];\n    },\n    setMiterLimit: function CanvasGraphics_setMiterLimit(limit) {\n\n      this.ctx.miterLimit = limit;\n    },\n    setDash: function CanvasGraphics_setDash(dashArray, dashPhase) {\n\n      var ctx = this.ctx;\n///jsw this\n      if (ctx.setLineDash !== undefined) {\n        ctx.setLineDash(dashArray);\n        ctx.lineDashOffset = dashPhase;\n      } else {\n        ctx.mozDash = dashArray;\n        ctx.mozDashOffset = dashPhase;\n      }\n    },\n    setRenderingIntent: function CanvasGraphics_setRenderingIntent(intent) {\n\n      // Maybe if we one day fully support color spaces this will be important\n      // for now we can ignore.\n      // TODO set rendering intent?\n    },\n    setFlatness: function CanvasGraphics_setFlatness(flatness) {\n\n      // There's no way to control this with canvas, but we can safely ignore.\n      // TODO set flatness?\n    },\n    setGState: function CanvasGraphics_setGState(states) {\n\n      for (var i = 0, ii = states.length; i < ii; i++) {\n        var state = states[i];\n        var key = state[0];\n        var value = state[1];\n\n        switch (key) {\n          case 'LW':\n            this.setLineWidth(value);\n            break;\n          case 'LC':\n            this.setLineCap(value);\n            break;\n          case 'LJ':\n            this.setLineJoin(value);\n            break;\n          case 'ML':\n            this.setMiterLimit(value);\n            break;\n          case 'D':\n            this.setDash(value[0], value[1]);\n            break;\n          case 'RI':\n            this.setRenderingIntent(value);\n            break;\n          case 'FL':\n            this.setFlatness(value);\n            break;\n          case 'Font':\n            this.setFont(value[0], value[1]);\n            break;\n          case 'CA':\n            this.current.strokeAlpha = state[1];\n            break;\n          case 'ca':\n            this.current.fillAlpha = state[1];\n            this.ctx.globalAlpha = state[1];\n            break;\n          case 'BM':\n            if (value && value.name && (value.name !== 'Normal')) {\n              var mode = value.name.replace(/([A-Z])/g,\n                function(c) {\n\n                  return '-' + c.toLowerCase();\n                }\n              ).substring(1);\n              this.ctx.globalCompositeOperation = mode;\n              if (this.ctx.globalCompositeOperation !== mode) {\n                warn('globalCompositeOperation \"' + mode +\n                     '\" is not supported');\n              }\n            } else {\n              this.ctx.globalCompositeOperation = 'source-over';\n            }\n            break;\n          case 'SMask':\n            if (this.current.activeSMask) {\n              this.endSMaskGroup();\n            }\n            this.current.activeSMask = value ? this.tempSMask : null;\n            if (this.current.activeSMask) {\n              this.beginSMaskGroup();\n            }\n            this.tempSMask = null;\n            break;\n        }\n      }\n    },\n    beginSMaskGroup: function CanvasGraphics_beginSMaskGroup() {\n\n      var activeSMask = this.current.activeSMask;\n      var drawnWidth = activeSMask.canvas.width;\n      var drawnHeight = activeSMask.canvas.height;\n      var cacheId = 'smaskGroupAt' + this.groupLevel;\n      var scratchCanvas = this.cachedCanvases.getCanvas(\n        cacheId, drawnWidth, drawnHeight, true);\n\n      var currentCtx = this.ctx;\n      var currentTransform = currentCtx.mozCurrentTransform;\n      this.ctx.save();\n///jsw this\n\n      var groupCtx = scratchCanvas.context;\n      groupCtx.scale(1 / activeSMask.scaleX, 1 / activeSMask.scaleY);\n      groupCtx.translate(-activeSMask.offsetX, -activeSMask.offsetY);\n      groupCtx.transform.apply(groupCtx, currentTransform);\n\n      copyCtxState(currentCtx, groupCtx);\n      this.ctx = groupCtx;\n      this.setGState([\n        ['BM', 'Normal'],\n        ['ca', 1],\n        ['CA', 1]\n      ]);\n      this.groupStack.push(currentCtx);\n      this.groupLevel++;\n    },\n    endSMaskGroup: function CanvasGraphics_endSMaskGroup() {\n\n      var groupCtx = this.ctx;\n      this.groupLevel--;\n      this.ctx = this.groupStack.pop();\n///jsw this\n\n      composeSMask(this.ctx, this.current.activeSMask, groupCtx);\n      this.ctx.restore();\n      copyCtxState(groupCtx, this.ctx);\n    },\n    save: function CanvasGraphics_save() {\n\n      this.ctx.save();\n      var old = this.current;\n///jsw this\n      this.stateStack.push(old);\n      this.current = old.clone();\n      this.current.activeSMask = null;\n    },\n    restore: function CanvasGraphics_restore() {\n\n      if (this.stateStack.length !== 0) {\n        if (this.current.activeSMask !== null) {\n          this.endSMaskGroup();\n        }\n///jsw this\n\n        this.current = this.stateStack.pop();\n        this.ctx.restore();\n\n        // Ensure that the clipping path is reset (fixes issue6413.pdf).\n        this.pendingClip = null;\n\n        this.cachedGetSinglePixelWidth = null;\n      }\n    },\n    transform: function CanvasGraphics_transform(a, b, c, d, e, f) {\n\n      this.ctx.transform(a, b, c, d, e, f);\n\n      this.cachedGetSinglePixelWidth = null;\n    },\n\n    // Path\n    constructPath: function CanvasGraphics_constructPath(ops, args) {\n\n      var ctx = this.ctx;\n      var current = this.current;\n      var x = current.x, y = current.y;\n      for (var i = 0, j = 0, ii = ops.length; i < ii; i++) {\n        switch (ops[i] | 0) {\n          case OPS.rectangle:\n            x = args[j++];\n            y = args[j++];\n            var width = args[j++];\n            var height = args[j++];\n            if (width === 0) {\n              width = this.getSinglePixelWidth();\n            }\n            if (height === 0) {\n              height = this.getSinglePixelWidth();\n            }\n            var xw = x + width;\n            var yh = y + height;\n            this.ctx.moveTo(x, y);\n            this.ctx.lineTo(xw, y);\n            this.ctx.lineTo(xw, yh);\n            this.ctx.lineTo(x, yh);\n            this.ctx.lineTo(x, y);\n            this.ctx.closePath();\n            break;\n          case OPS.moveTo:\n            x = args[j++];\n            y = args[j++];\n            ctx.moveTo(x, y);\n            break;\n          case OPS.lineTo:\n            x = args[j++];\n            y = args[j++];\n            ctx.lineTo(x, y);\n            break;\n          case OPS.curveTo:\n            x = args[j + 4];\n            y = args[j + 5];\n            ctx.bezierCurveTo(args[j], args[j + 1], args[j + 2], args[j + 3],\n                              x, y);\n            j += 6;\n            break;\n          case OPS.curveTo2:\n            ctx.bezierCurveTo(x, y, args[j], args[j + 1],\n                              args[j + 2], args[j + 3]);\n            x = args[j + 2];\n            y = args[j + 3];\n            j += 4;\n            break;\n          case OPS.curveTo3:\n            x = args[j + 2];\n            y = args[j + 3];\n            ctx.bezierCurveTo(args[j], args[j + 1], x, y, x, y);\n            j += 4;\n            break;\n          case OPS.closePath:\n            ctx.closePath();\n            break;\n        }\n      }\n      current.setCurrentPoint(x, y);\n    },\n    closePath: function CanvasGraphics_closePath() {\n\n      this.ctx.closePath();\n    },\n    stroke: function CanvasGraphics_stroke(consumePath) {\n\n      consumePath = typeof consumePath !== 'undefined' ? consumePath : true;\n      var ctx = this.ctx;\n      var strokeColor = this.current.strokeColor;\n      // Prevent drawing too thin lines by enforcing a minimum line width.\n      ctx.lineWidth = Math.max(this.getSinglePixelWidth() * MIN_WIDTH_FACTOR,\n                               this.current.lineWidth);\n      // For stroke we want to temporarily change the global alpha to the\n      // stroking alpha.\n      ctx.globalAlpha = this.current.strokeAlpha;\n      if (strokeColor && strokeColor.hasOwnProperty('type') &&\n          strokeColor.type === 'Pattern') {\n        // for patterns, we transform to pattern space, calculate\n        // the pattern, call stroke, and restore to user space\n        ctx.save();\n        ctx.strokeStyle = strokeColor.getPattern(ctx, this);\n        ctx.stroke();\n        ctx.restore();\n      } else {\n        ctx.stroke();\n      }\n      if (consumePath) {\n        this.consumePath();\n      }\n///jsw this\n      // Restore the global alpha to the fill alpha\n      ctx.globalAlpha = this.current.fillAlpha;\n    },\n    closeStroke: function CanvasGraphics_closeStroke() {\n\n      this.closePath();\n      this.stroke();\n    },\n    fill: function CanvasGraphics_fill(consumePath) {\n\n      consumePath = typeof consumePath !== 'undefined' ? consumePath : true;\n      var ctx = this.ctx;\n      var fillColor = this.current.fillColor;\n      var isPatternFill = this.current.patternFill;\n      var needRestore = false;\n\n      if (isPatternFill) {\n        ctx.save();\n        if (this.baseTransform) {\n          ctx.setTransform.apply(ctx, this.baseTransform);\n        }\n        ctx.fillStyle = fillColor.getPattern(ctx, this);\n        needRestore = true;\n      }\n///jsw this\n\n      if (this.pendingEOFill) {\n        if (ctx.mozFillRule !== undefined) {\n          ctx.mozFillRule = 'evenodd';\n          ctx.fill();\n          ctx.mozFillRule = 'nonzero';\n        } else {\n          ctx.fill('evenodd');\n        }\n        this.pendingEOFill = false;\n      } else {\n        ctx.fill();\n      }\n\n      if (needRestore) {\n        ctx.restore();\n      }\n      if (consumePath) {\n        this.consumePath();\n      }\n    },\n    eoFill: function CanvasGraphics_eoFill() {\n\n      this.pendingEOFill = true;\n      this.fill();\n    },\n    fillStroke: function CanvasGraphics_fillStroke() {\n\n      this.fill(false);\n      this.stroke(false);\n\n      this.consumePath();\n    },\n    eoFillStroke: function CanvasGraphics_eoFillStroke() {\n\n      this.pendingEOFill = true;\n      this.fillStroke();\n    },\n    closeFillStroke: function CanvasGraphics_closeFillStroke() {\n\n      this.closePath();\n      this.fillStroke();\n    },\n    closeEOFillStroke: function CanvasGraphics_closeEOFillStroke() {\n\n      this.pendingEOFill = true;\n      this.closePath();\n      this.fillStroke();\n    },\n    endPath: function CanvasGraphics_endPath() {\n\n      this.consumePath();\n    },\n\n    // Clipping\n    clip: function CanvasGraphics_clip() {\n\n      this.pendingClip = NORMAL_CLIP;\n    },\n    eoClip: function CanvasGraphics_eoClip() {\n\n      this.pendingClip = EO_CLIP;\n    },\n\n    // Text\n    beginText: function CanvasGraphics_beginText() {\n\n      this.current.textMatrix = IDENTITY_MATRIX;\n      this.current.textMatrixScale = 1;\n      this.current.x = this.current.lineX = 0;\n      this.current.y = this.current.lineY = 0;\n    },\n    endText: function CanvasGraphics_endText() {\n\n      var paths = this.pendingTextPaths;\n      var ctx = this.ctx;\n      if (paths === undefined) {\n        ctx.beginPath();\n        return;\n      }\n\n      ctx.save();\n      ctx.beginPath();\n      for (var i = 0; i < paths.length; i++) {\n        var path = paths[i];\n        ctx.setTransform.apply(ctx, path.transform);\n        ctx.translate(path.x, path.y);\n        path.addToPath(ctx, path.fontSize);\n      }\n      ctx.restore();\n      ctx.clip();\n      ctx.beginPath();\n      delete this.pendingTextPaths;\n    },\n    setCharSpacing: function CanvasGraphics_setCharSpacing(spacing) {\n\n      this.current.charSpacing = spacing;\n    },\n    setWordSpacing: function CanvasGraphics_setWordSpacing(spacing) {\n\n      this.current.wordSpacing = spacing;\n    },\n    setHScale: function CanvasGraphics_setHScale(scale) {\n\n      this.current.textHScale = scale / 100;\n    },\n    setLeading: function CanvasGraphics_setLeading(leading) {\n\n      this.current.leading = -leading;\n    },\n    setFont: function CanvasGraphics_setFont(fontRefName, size) {\n\n      var fontObj = this.commonObjs.get(fontRefName);\n      var current = this.current;\n\n      if (!fontObj) {\n        error('Can\\'t find font for ' + fontRefName);\n      }\n\n      current.fontMatrix = (fontObj.fontMatrix ?\n                            fontObj.fontMatrix : FONT_IDENTITY_MATRIX);\n\n      // A valid matrix needs all main diagonal elements to be non-zero\n      // This also ensures we bypass FF bugzilla bug #719844.\n      if (current.fontMatrix[0] === 0 ||\n          current.fontMatrix[3] === 0) {\n        warn('Invalid font matrix for font ' + fontRefName);\n      }\n\n      // The spec for Tf (setFont) says that 'size' specifies the font 'scale',\n      // and in some docs this can be negative (inverted x-y axes).\n      if (size < 0) {\n        size = -size;\n        current.fontDirection = -1;\n      } else {\n        current.fontDirection = 1;\n      }\n///jsw this\n\n      this.current.font = fontObj;\n      this.current.fontSize = size;\n\n      if (fontObj.isType3Font) {\n        return; // we don't need ctx.font for Type3 fonts\n      }\n\n      var name = fontObj.loadedName || 'sans-serif';\n      var bold = fontObj.black ? (fontObj.bold ? '900' : 'bold') :\n                                 (fontObj.bold ? 'bold' : 'normal');\n\n      var italic = fontObj.italic ? 'italic' : 'normal';\n      var typeface = '\"' + name + '\", ' + fontObj.fallbackName;\n\n      // Some font backends cannot handle fonts below certain size.\n      // Keeping the font at minimal size and using the fontSizeScale to change\n      // the current transformation matrix before the fillText/strokeText.\n      // See https://bugzilla.mozilla.org/show_bug.cgi?id=726227\n      var browserFontSize = size < MIN_FONT_SIZE ? MIN_FONT_SIZE :\n                            size > MAX_FONT_SIZE ? MAX_FONT_SIZE : size;\n      this.current.fontSizeScale = size / browserFontSize;\n///jsw this\n\n      var rule = italic + ' ' + bold + ' ' + browserFontSize + 'px ' + typeface;\n      this.ctx.font = rule;\n    },\n    setTextRenderingMode: function CanvasGraphics_setTextRenderingMode(mode) {\n\n      this.current.textRenderingMode = mode;\n    },\n    setTextRise: function CanvasGraphics_setTextRise(rise) {\n\n      this.current.textRise = rise;\n    },\n    moveText: function CanvasGraphics_moveText(x, y) {\n\n      this.current.x = this.current.lineX += x;\n      this.current.y = this.current.lineY += y;\n    },\n    setLeadingMoveText: function CanvasGraphics_setLeadingMoveText(x, y) {\n\n      this.setLeading(-y);\n      this.moveText(x, y);\n    },\n    setTextMatrix: function CanvasGraphics_setTextMatrix(a, b, c, d, e, f) {\n\n      this.current.textMatrix = [a, b, c, d, e, f];\n      this.current.textMatrixScale = Math.sqrt(a * a + b * b);\n///jsw this\n\n      this.current.x = this.current.lineX = 0;\n      this.current.y = this.current.lineY = 0;\n    },\n    nextLine: function CanvasGraphics_nextLine() {\n\n      this.moveText(0, this.current.leading);\n    },\n\n    paintChar: function CanvasGraphics_paintChar(character, x, y) {\n\n      var ctx = this.ctx;\n      var current = this.current;\n      var font = current.font;\n      var textRenderingMode = current.textRenderingMode;\n      var fontSize = current.fontSize / current.fontSizeScale;\n      var fillStrokeMode = textRenderingMode &\n        TextRenderingMode.FILL_STROKE_MASK;\n      var isAddToPathSet = !!(textRenderingMode &\n        TextRenderingMode.ADD_TO_PATH_FLAG);\n///jsw this\n\n      var addToPath;\n      if (font.disableFontFace || isAddToPathSet) {\n        addToPath = font.getPathGenerator(this.commonObjs, character);\n      }\n\n      if (font.disableFontFace) {\n        ctx.save();\n        ctx.translate(x, y);\n        ctx.beginPath();\n        addToPath(ctx, fontSize);\n        if (fillStrokeMode === TextRenderingMode.FILL ||\n            fillStrokeMode === TextRenderingMode.FILL_STROKE) {\n          ctx.fill();\n        }\n        if (fillStrokeMode === TextRenderingMode.STROKE ||\n            fillStrokeMode === TextRenderingMode.FILL_STROKE) {\n          ctx.stroke();\n        }\n        ctx.restore();\n      } else {\n        if (fillStrokeMode === TextRenderingMode.FILL ||\n            fillStrokeMode === TextRenderingMode.FILL_STROKE) {\n          ctx.fillText(character, x, y);\n        }\n        if (fillStrokeMode === TextRenderingMode.STROKE ||\n            fillStrokeMode === TextRenderingMode.FILL_STROKE) {\n          ctx.strokeText(character, x, y);\n        }\n      }\n\n      if (isAddToPathSet) {\n        var paths = this.pendingTextPaths || (this.pendingTextPaths = []);\n        paths.push({\n          transform: ctx.mozCurrentTransform,\n          x: x,\n          y: y,\n          fontSize: fontSize,\n          addToPath: addToPath\n        });\n      }\n    },\n\n    get isFontSubpixelAAEnabled() {\n      // Checks if anti-aliasing is enabled when scaled text is painted.\n      // On Windows GDI scaled fonts looks bad.\n      var ctx = document.createElement('canvas').getContext('2d');\n      ctx.scale(1.5, 1);\n      ctx.fillText('I', 0, 10);\n      var data = ctx.getImageData(0, 0, 10, 10).data;\n      var enabled = false;\n      for (var i = 3; i < data.length; i += 4) {\n        if (data[i] > 0 && data[i] < 255) {\n          enabled = true;\n          break;\n        }\n      }\n      return shadow(this, 'isFontSubpixelAAEnabled', enabled);\n    },\n\n    showText: function CanvasGraphics_showText(glyphs) {\n\n      var current = this.current;\n      var font = current.font;\n      if (font.isType3Font) {\n        return this.showType3Text(glyphs);\n      }\n\n      var fontSize = current.fontSize;\n      if (fontSize === 0) {\n        return;\n      }\n\n      var ctx = this.ctx;\n      var fontSizeScale = current.fontSizeScale;\n      var charSpacing = current.charSpacing;\n      var wordSpacing = current.wordSpacing;\n      var fontDirection = current.fontDirection;\n      var textHScale = current.textHScale * fontDirection;\n      var glyphsLength = glyphs.length;\n      var vertical = font.vertical;\n      var spacingDir = vertical ? 1 : -1;\n      var defaultVMetrics = font.defaultVMetrics;\n      var widthAdvanceScale = fontSize * current.fontMatrix[0];\n///jsw this\n\n      var simpleFillText =\n        current.textRenderingMode === TextRenderingMode.FILL &&\n        !font.disableFontFace;\n\n      ctx.save();\n      ctx.transform.apply(ctx, current.textMatrix);\n      ctx.translate(current.x, current.y + current.textRise);\n\n      if (fontDirection > 0) {\n        ctx.scale(textHScale, -1);\n      } else {\n        ctx.scale(textHScale, 1);\n      }\n\n      var lineWidth = current.lineWidth;\n      var scale = current.textMatrixScale;\n      if (scale === 0 || lineWidth === 0) {\n        var fillStrokeMode = current.textRenderingMode &\n          TextRenderingMode.FILL_STROKE_MASK;\n        if (fillStrokeMode === TextRenderingMode.STROKE ||\n            fillStrokeMode === TextRenderingMode.FILL_STROKE) {\n          this.cachedGetSinglePixelWidth = null;\n          lineWidth = this.getSinglePixelWidth() * MIN_WIDTH_FACTOR;\n        }\n      } else {\n        lineWidth /= scale;\n      }\n\n      if (fontSizeScale !== 1.0) {\n        ctx.scale(fontSizeScale, fontSizeScale);\n        lineWidth /= fontSizeScale;\n      }\n\n      ctx.lineWidth = lineWidth;\n\n      var x = 0, i;\n      for (i = 0; i < glyphsLength; ++i) {\n        var glyph = glyphs[i];\n        if (isNum(glyph)) {\n          x += spacingDir * glyph * fontSize / 1000;\n          continue;\n        }\n\n        var restoreNeeded = false;\n        var spacing = (glyph.isSpace ? wordSpacing : 0) + charSpacing;\n        var character = glyph.fontChar;\n        var accent = glyph.accent;\n        var scaledX, scaledY, scaledAccentX, scaledAccentY;\n        var width = glyph.width;\n        if (vertical) {\n          var vmetric, vx, vy;\n          vmetric = glyph.vmetric || defaultVMetrics;\n          vx = glyph.vmetric ? vmetric[1] : width * 0.5;\n          vx = -vx * widthAdvanceScale;\n          vy = vmetric[2] * widthAdvanceScale;\n\n          width = vmetric ? -vmetric[0] : width;\n          scaledX = vx / fontSizeScale;\n          scaledY = (x + vy) / fontSizeScale;\n        } else {\n          scaledX = x / fontSizeScale;\n          scaledY = 0;\n        }\n\n        if (font.remeasure && width > 0) {\n          // Some standard fonts may not have the exact width: rescale per\n          // character if measured width is greater than expected glyph width\n          // and subpixel-aa is enabled, otherwise just center the glyph.\n          var measuredWidth = ctx.measureText(character).width * 1000 /\n            fontSize * fontSizeScale;\n          if (width < measuredWidth && this.isFontSubpixelAAEnabled) {\n            var characterScaleX = width / measuredWidth;\n            restoreNeeded = true;\n            ctx.save();\n            ctx.scale(characterScaleX, 1);\n            scaledX /= characterScaleX;\n          } else if (width !== measuredWidth) {\n            scaledX += (width - measuredWidth) / 2000 *\n              fontSize / fontSizeScale;\n          }\n        }\n\n        if (simpleFillText && !accent) {\n          // common case\n          ctx.fillText(character, scaledX, scaledY);\n        } else {\n          this.paintChar(character, scaledX, scaledY);\n          if (accent) {\n            scaledAccentX = scaledX + accent.offset.x / fontSizeScale;\n            scaledAccentY = scaledY - accent.offset.y / fontSizeScale;\n            this.paintChar(accent.fontChar, scaledAccentX, scaledAccentY);\n          }\n        }\n\n        var charWidth = width * widthAdvanceScale + spacing * fontDirection;\n        x += charWidth;\n\n        if (restoreNeeded) {\n          ctx.restore();\n        }\n      }\n      if (vertical) {\n        current.y -= x * textHScale;\n      } else {\n        current.x += x * textHScale;\n      }\n      ctx.restore();\n    },\n\n    showType3Text: function CanvasGraphics_showType3Text(glyphs) {\n\n      // Type3 fonts - each glyph is a \"mini-PDF\"\n      var ctx = this.ctx;\n      var current = this.current;\n      var font = current.font;\n      var fontSize = current.fontSize;\n      var fontDirection = current.fontDirection;\n      var spacingDir = font.vertical ? 1 : -1;\n      var charSpacing = current.charSpacing;\n      var wordSpacing = current.wordSpacing;\n      var textHScale = current.textHScale * fontDirection;\n      var fontMatrix = current.fontMatrix || FONT_IDENTITY_MATRIX;\n      var glyphsLength = glyphs.length;\n      var isTextInvisible =\n        current.textRenderingMode === TextRenderingMode.INVISIBLE;\n      var i, glyph, width, spacingLength;\n///jsw this\n\n      if (isTextInvisible || fontSize === 0) {\n        return;\n      }\n      this.cachedGetSinglePixelWidth = null;\n\n      ctx.save();\n      ctx.transform.apply(ctx, current.textMatrix);\n      ctx.translate(current.x, current.y);\n\n      ctx.scale(textHScale, fontDirection);\n\n      for (i = 0; i < glyphsLength; ++i) {\n        glyph = glyphs[i];\n        if (isNum(glyph)) {\n          spacingLength = spacingDir * glyph * fontSize / 1000;\n          this.ctx.translate(spacingLength, 0);\n          current.x += spacingLength * textHScale;\n          continue;\n        }\n\n        var spacing = (glyph.isSpace ? wordSpacing : 0) + charSpacing;\n        var operatorList = font.charProcOperatorList[glyph.operatorListId];\n        if (!operatorList) {\n          warn('Type3 character \\\"' + glyph.operatorListId +\n               '\\\" is not available');\n          continue;\n        }\n        this.processingType3 = glyph;\n        this.save();\n        ctx.scale(fontSize, fontSize);\n        ctx.transform.apply(ctx, fontMatrix);\n        this.executeOperatorList(operatorList);\n        this.restore();\n\n        var transformed = Util.applyTransform([glyph.width, 0], fontMatrix);\n        width = transformed[0] * fontSize + spacing;\n\n        ctx.translate(width, 0);\n        current.x += width * textHScale;\n      }\n      ctx.restore();\n      this.processingType3 = null;\n    },\n\n    // Type3 fonts\n    setCharWidth: function CanvasGraphics_setCharWidth(xWidth, yWidth) {\n\n      // We can safely ignore this since the width should be the same\n      // as the width in the Widths array.\n    },\n    setCharWidthAndBounds: function CanvasGraphics_setCharWidthAndBounds(xWidth,\n                                                                        yWidth,\n                                                                        llx,\n                                                                        lly,\n                                                                        urx,\n                                                                        ury) {\n\n      // TODO According to the spec we're also suppose to ignore any operators\n      // that set color or include images while processing this type3 font.\n      this.ctx.rect(llx, lly, urx - llx, ury - lly);\n      this.clip();\n      this.endPath();\n    },\n\n    // Color\n    getColorN_Pattern: function CanvasGraphics_getColorN_Pattern(IR) {\n\n      var pattern;\n      if (IR[0] === 'TilingPattern') {\n        var color = IR[1];\n        var baseTransform = this.baseTransform ||\n                            this.ctx.mozCurrentTransform.slice();\n        pattern = new TilingPattern(IR, color, this.ctx, this.objs,\n                                    this.commonObjs, baseTransform);\n      } else {\n        pattern = getShadingPatternFromIR(IR);\n      }\n      return pattern;\n    },\n    setStrokeColorN: function CanvasGraphics_setStrokeColorN(/*...*/) {\n\n      this.current.strokeColor = this.getColorN_Pattern(arguments);\n    },\n    setFillColorN: function CanvasGraphics_setFillColorN(/*...*/) {\n\n      this.current.fillColor = this.getColorN_Pattern(arguments);\n      this.current.patternFill = true;\n    },\n    setStrokeRGBColor: function CanvasGraphics_setStrokeRGBColor(r, g, b) {\n\n      var color = Util.makeCssRgb(r, g, b);\n      this.ctx.strokeStyle = color;\n      this.current.strokeColor = color;\n    },\n    setFillRGBColor: function CanvasGraphics_setFillRGBColor(r, g, b) {\n\n      var color = Util.makeCssRgb(r, g, b);\n      this.ctx.fillStyle = color;\n      this.current.fillColor = color;\n      this.current.patternFill = false;\n    },\n\n    shadingFill: function CanvasGraphics_shadingFill(patternIR) {\n\n      var ctx = this.ctx;\n\n      this.save();\n      var pattern = getShadingPatternFromIR(patternIR);\n      ctx.fillStyle = pattern.getPattern(ctx, this, true);\n///jsw this\n\n      var inv = ctx.mozCurrentTransformInverse;\n      if (inv) {\n        var canvas = ctx.canvas;\n        var width = canvas.width;\n        var height = canvas.height;\n\n        var bl = Util.applyTransform([0, 0], inv);\n        var br = Util.applyTransform([0, height], inv);\n        var ul = Util.applyTransform([width, 0], inv);\n        var ur = Util.applyTransform([width, height], inv);\n\n        var x0 = Math.min(bl[0], br[0], ul[0], ur[0]);\n        var y0 = Math.min(bl[1], br[1], ul[1], ur[1]);\n        var x1 = Math.max(bl[0], br[0], ul[0], ur[0]);\n        var y1 = Math.max(bl[1], br[1], ul[1], ur[1]);\n\n        this.ctx.fillRect(x0, y0, x1 - x0, y1 - y0);\n      } else {\n        // HACK to draw the gradient onto an infinite rectangle.\n        // PDF gradients are drawn across the entire image while\n        // Canvas only allows gradients to be drawn in a rectangle\n        // The following bug should allow us to remove this.\n        // https://bugzilla.mozilla.org/show_bug.cgi?id=664884\n\n        this.ctx.fillRect(-1e10, -1e10, 2e10, 2e10);\n      }\n\n      this.restore();\n    },\n\n    // Images\n    beginInlineImage: function CanvasGraphics_beginInlineImage() {\n\n      error('Should not call beginInlineImage');\n    },\n    beginImageData: function CanvasGraphics_beginImageData() {\n\n      error('Should not call beginImageData');\n    },\n\n    paintFormXObjectBegin: function CanvasGraphics_paintFormXObjectBegin(matrix,\n                                                                        bbox) {\n\n      this.save();\n      this.baseTransformStack.push(this.baseTransform);\n\n      if (isArray(matrix) && 6 === matrix.length) {\n        this.transform.apply(this, matrix);\n      }\n///jsw this\n\n      this.baseTransform = this.ctx.mozCurrentTransform;\n\n      if (isArray(bbox) && 4 === bbox.length) {\n        var width = bbox[2] - bbox[0];\n        var height = bbox[3] - bbox[1];\n        this.ctx.rect(bbox[0], bbox[1], width, height);\n        this.clip();\n        this.endPath();\n      }\n    },\n\n    paintFormXObjectEnd: function CanvasGraphics_paintFormXObjectEnd() {\n\n      this.restore();\n      this.baseTransform = this.baseTransformStack.pop();\n    },\n\n    beginGroup: function CanvasGraphics_beginGroup(group) {\n\n      this.save();\n      var currentCtx = this.ctx;\n      // TODO non-isolated groups - according to Rik at adobe non-isolated\n      // group results aren't usually that different and they even have tools\n      // that ignore this setting. Notes from Rik on implmenting:\n      // - When you encounter an transparency group, create a new canvas with\n      // the dimensions of the bbox\n      // - copy the content from the previous canvas to the new canvas\n      // - draw as usual\n      // - remove the backdrop alpha:\n      // alphaNew = 1 - (1 - alpha)/(1 - alphaBackdrop) with 'alpha' the alpha\n      // value of your transparency group and 'alphaBackdrop' the alpha of the\n      // backdrop\n      // - remove background color:\n      // colorNew = color - alphaNew *colorBackdrop /(1 - alphaNew)\n      if (!group.isolated) {\n        info('TODO: Support non-isolated groups.');\n      }\n\n      // TODO knockout - supposedly possible with the clever use of compositing\n      // modes.\n      if (group.knockout) {\n        warn('Knockout groups not supported.');\n      }\n\n      var currentTransform = currentCtx.mozCurrentTransform;\n      if (group.matrix) {\n        currentCtx.transform.apply(currentCtx, group.matrix);\n      }\n      assert(group.bbox, 'Bounding box is required.');\n\n      // Based on the current transform figure out how big the bounding box\n      // will actually be.\n      var bounds = Util.getAxialAlignedBoundingBox(\n                    group.bbox,\n                    currentCtx.mozCurrentTransform);\n///jsw this\n\n      // Clip the bounding box to the current canvas.\n      var canvasBounds = [0,\n                          0,\n                          currentCtx.canvas.width,\n                          currentCtx.canvas.height];\n      bounds = Util.intersect(bounds, canvasBounds) || [0, 0, 0, 0];\n      // Use ceil in case we're between sizes so we don't create canvas that is\n      // too small and make the canvas at least 1x1 pixels.\n      var offsetX = Math.floor(bounds[0]);\n      var offsetY = Math.floor(bounds[1]);\n      var drawnWidth = Math.max(Math.ceil(bounds[2]) - offsetX, 1);\n      var drawnHeight = Math.max(Math.ceil(bounds[3]) - offsetY, 1);\n      var scaleX = 1, scaleY = 1;\n      if (drawnWidth > MAX_GROUP_SIZE) {\n        scaleX = drawnWidth / MAX_GROUP_SIZE;\n        drawnWidth = MAX_GROUP_SIZE;\n      }\n      if (drawnHeight > MAX_GROUP_SIZE) {\n        scaleY = drawnHeight / MAX_GROUP_SIZE;\n        drawnHeight = MAX_GROUP_SIZE;\n      }\n\n      var cacheId = 'groupAt' + this.groupLevel;\n      if (group.smask) {\n        // Using two cache entries is case if masks are used one after another.\n        cacheId +=  '_smask_' + ((this.smaskCounter++) % 2);\n      }\n      var scratchCanvas = this.cachedCanvases.getCanvas(\n        cacheId, drawnWidth, drawnHeight, true);\n      var groupCtx = scratchCanvas.context;\n///jsw this\n      // Since we created a new canvas that is just the size of the bounding box\n      // we have to translate the group ctx.\n      groupCtx.scale(1 / scaleX, 1 / scaleY);\n      groupCtx.translate(-offsetX, -offsetY);\n      groupCtx.transform.apply(groupCtx, currentTransform);\n\n      if (group.smask) {\n        // Saving state and cached mask to be used in setGState.\n        this.smaskStack.push({\n          canvas: scratchCanvas.canvas,\n          context: groupCtx,\n          offsetX: offsetX,\n          offsetY: offsetY,\n          scaleX: scaleX,\n          scaleY: scaleY,\n          subtype: group.smask.subtype,\n          backdrop: group.smask.backdrop,\n          transferMap: group.smask.transferMap || null\n        });\n      } else {\n        // Setup the current ctx so when the group is popped we draw it at the\n        // right location.\n        currentCtx.setTransform(1, 0, 0, 1, 0, 0);\n        currentCtx.translate(offsetX, offsetY);\n        currentCtx.scale(scaleX, scaleY);\n      }\n      // The transparency group inherits all off the current graphics state\n      // except the blend mode, soft mask, and alpha constants.\n      copyCtxState(currentCtx, groupCtx);\n///jsw this\n      this.ctx = groupCtx;\n      this.setGState([\n        ['BM', 'Normal'],\n        ['ca', 1],\n        ['CA', 1]\n      ]);\n      this.groupStack.push(currentCtx);\n      this.groupLevel++;\n    },\n\n    endGroup: function CanvasGraphics_endGroup(group) {\n\n      this.groupLevel--;\n      var groupCtx = this.ctx;\n      this.ctx = this.groupStack.pop();\n      // Turn off image smoothing to avoid sub pixel interpolation which can\n      // look kind of blurry for some pdfs.\n      if (this.ctx.imageSmoothingEnabled !== undefined) {\n        this.ctx.imageSmoothingEnabled = false;\n      } else {\n        this.ctx.mozImageSmoothingEnabled = false;\n      }\n///jsw this\n      if (group.smask) {\n        this.tempSMask = this.smaskStack.pop();\n      } else {\n        this.ctx.drawImage(groupCtx.canvas, 0, 0);\n      }\n      this.restore();\n    },\n\n    beginAnnotations: function CanvasGraphics_beginAnnotations() {\n\n      this.save();\n      this.current = new CanvasExtraState();\n    },\n\n    endAnnotations: function CanvasGraphics_endAnnotations() {\n\n      this.restore();\n    },\n\n    beginAnnotation: function CanvasGraphics_beginAnnotation(rect, transform,\n                                                             matrix) {\n\n      this.save();\n\n      if (isArray(rect) && 4 === rect.length) {\n        var width = rect[2] - rect[0];\n        var height = rect[3] - rect[1];\n        this.ctx.rect(rect[0], rect[1], width, height);\n        this.clip();\n        this.endPath();\n      }\n\n      this.transform.apply(this, transform);\n      this.transform.apply(this, matrix);\n    },\n\n    endAnnotation: function CanvasGraphics_endAnnotation() {\n\n      this.restore();\n    },\n\n    paintJpegXObject: function CanvasGraphics_paintJpegXObject(objId, w, h) {\n\n      var domImage = this.objs.get(objId);\n      if (!domImage) {\n        warn('Dependent image isn\\'t ready yet');\n        return;\n      }\n\n      this.save();\n///jsw this\n\n      var ctx = this.ctx;\n      // scale the image to the unit square\n      ctx.scale(1 / w, -1 / h);\n\n      ctx.drawImage(domImage, 0, 0, domImage.width, domImage.height,\n                    0, -h, w, h);\n      if (this.imageLayer) {\n        var currentTransform = ctx.mozCurrentTransformInverse;\n        var position = this.getCanvasPosition(0, 0);\n        this.imageLayer.appendImage({\n          objId: objId,\n          left: position[0],\n          top: position[1],\n          width: w / currentTransform[0],\n          height: h / currentTransform[3]\n        });\n      }\n      this.restore();\n    },\n\n    paintImageMaskXObject: function CanvasGraphics_paintImageMaskXObject(img) {\n\n      var ctx = this.ctx;\n      var width = img.width, height = img.height;\n      var fillColor = this.current.fillColor;\n      var isPatternFill = this.current.patternFill;\n///jsw this\n\n      var glyph = this.processingType3;\n\n      if (COMPILE_TYPE3_GLYPHS && glyph && glyph.compiled === undefined) {\n        if (width <= MAX_SIZE_TO_COMPILE && height <= MAX_SIZE_TO_COMPILE) {\n          glyph.compiled =\n            compileType3Glyph({data: img.data, width: width, height: height});\n        } else {\n          glyph.compiled = null;\n        }\n      }\n\n      if (glyph && glyph.compiled) {\n        glyph.compiled(ctx);\n        return;\n      }\n\n      var maskCanvas = this.cachedCanvases.getCanvas('maskCanvas',\n                                                     width, height);\n      var maskCtx = maskCanvas.context;\n      maskCtx.save();\n\n      putBinaryImageMask(maskCtx, img);\n\n      maskCtx.globalCompositeOperation = 'source-in';\n\n      maskCtx.fillStyle = isPatternFill ?\n                          fillColor.getPattern(maskCtx, this) : fillColor;\n      maskCtx.fillRect(0, 0, width, height);\n\n      maskCtx.restore();\n\n      this.paintInlineImageXObject(maskCanvas.canvas);\n    },\n\n    paintImageMaskXObjectRepeat:\n      function CanvasGraphics_paintImageMaskXObjectRepeat(imgData, scaleX,\n                                                          scaleY, positions) {\n\n      var width = imgData.width;\n      var height = imgData.height;\n      var fillColor = this.current.fillColor;\n      var isPatternFill = this.current.patternFill;\n\n      var maskCanvas = this.cachedCanvases.getCanvas('maskCanvas',\n                                                     width, height);\n      var maskCtx = maskCanvas.context;\n      maskCtx.save();\n\n      putBinaryImageMask(maskCtx, imgData);\n\n      maskCtx.globalCompositeOperation = 'source-in';\n\n///jsw this\n\n      maskCtx.fillStyle = isPatternFill ?\n                          fillColor.getPattern(maskCtx, this) : fillColor;\n      maskCtx.fillRect(0, 0, width, height);\n\n      maskCtx.restore();\n\n      var ctx = this.ctx;\n      for (var i = 0, ii = positions.length; i < ii; i += 2) {\n        ctx.save();\n        ctx.transform(scaleX, 0, 0, scaleY, positions[i], positions[i + 1]);\n        ctx.scale(1, -1);\n        ctx.drawImage(maskCanvas.canvas, 0, 0, width, height,\n          0, -1, 1, 1);\n        ctx.restore();\n      }\n    },\n\n    paintImageMaskXObjectGroup:\n      function CanvasGraphics_paintImageMaskXObjectGroup(images) {\n\n      var ctx = this.ctx;\n\n      var fillColor = this.current.fillColor;\n      var isPatternFill = this.current.patternFill;\n      for (var i = 0, ii = images.length; i < ii; i++) {\n        var image = images[i];\n        var width = image.width, height = image.height;\n\n        var maskCanvas = this.cachedCanvases.getCanvas('maskCanvas',\n                                                       width, height);\n        var maskCtx = maskCanvas.context;\n        maskCtx.save();\n\n        putBinaryImageMask(maskCtx, image);\n\n        maskCtx.globalCompositeOperation = 'source-in';\n///jsw this\n\n        maskCtx.fillStyle = isPatternFill ?\n                            fillColor.getPattern(maskCtx, this) : fillColor;\n        maskCtx.fillRect(0, 0, width, height);\n\n        maskCtx.restore();\n\n        ctx.save();\n        ctx.transform.apply(ctx, image.transform);\n        ctx.scale(1, -1);\n        ctx.drawImage(maskCanvas.canvas, 0, 0, width, height,\n                      0, -1, 1, 1);\n        ctx.restore();\n      }\n    },\n\n    paintImageXObject: function CanvasGraphics_paintImageXObject(objId) {\n\n      var imgData = this.objs.get(objId);\n      if (!imgData) {\n        warn('Dependent image isn\\'t ready yet');\n        return;\n      }\n\n      this.paintInlineImageXObject(imgData);\n    },\n\n    paintImageXObjectRepeat:\n      function CanvasGraphics_paintImageXObjectRepeat(objId, scaleX, scaleY,\n                                                          positions) {\n\n      var imgData = this.objs.get(objId);\n      if (!imgData) {\n        warn('Dependent image isn\\'t ready yet');\n        return;\n      }\n\n      var width = imgData.width;\n      var height = imgData.height;\n      var map = [];\n      for (var i = 0, ii = positions.length; i < ii; i += 2) {\n        map.push({transform: [scaleX, 0, 0, scaleY, positions[i],\n                 positions[i + 1]], x: 0, y: 0, w: width, h: height});\n      }\n      this.paintInlineImageXObjectGroup(imgData, map);\n    },\n\n    paintInlineImageXObject:\n      function CanvasGraphics_paintInlineImageXObject(imgData) {\n\n      var width = imgData.width;\n      var height = imgData.height;\n      var ctx = this.ctx;\n///jsw this\n\n      this.save();\n      // scale the image to the unit square\n      ctx.scale(1 / width, -1 / height);\n\n      var currentTransform = ctx.mozCurrentTransformInverse;\n      var a = currentTransform[0], b = currentTransform[1];\n      var widthScale = Math.max(Math.sqrt(a * a + b * b), 1);\n      var c = currentTransform[2], d = currentTransform[3];\n      var heightScale = Math.max(Math.sqrt(c * c + d * d), 1);\n\n      var imgToPaint, tmpCanvas;\n      // instanceof HTMLElement does not work in jsdom node.js module\n      if (imgData instanceof HTMLElement || !imgData.data) {\n        imgToPaint = imgData;\n      } else {\n        tmpCanvas = this.cachedCanvases.getCanvas('inlineImage',\n                                                  width, height);\n        var tmpCtx = tmpCanvas.context;\n        putBinaryImageData(tmpCtx, imgData);\n        imgToPaint = tmpCanvas.canvas;\n      }\n\n      var paintWidth = width, paintHeight = height;\n      var tmpCanvasId = 'prescale1';\n      // Vertial or horizontal scaling shall not be more than 2 to not loose the\n      // pixels during drawImage operation, painting on the temporary canvas(es)\n      // that are twice smaller in size\n      while ((widthScale > 2 && paintWidth > 1) ||\n             (heightScale > 2 && paintHeight > 1)) {\n        var newWidth = paintWidth, newHeight = paintHeight;\n        if (widthScale > 2 && paintWidth > 1) {\n          newWidth = Math.ceil(paintWidth / 2);\n          widthScale /= paintWidth / newWidth;\n        }\n        if (heightScale > 2 && paintHeight > 1) {\n          newHeight = Math.ceil(paintHeight / 2);\n          heightScale /= paintHeight / newHeight;\n        }\n        tmpCanvas = this.cachedCanvases.getCanvas(tmpCanvasId,\n                                                  newWidth, newHeight);\n        tmpCtx = tmpCanvas.context;\n        tmpCtx.clearRect(0, 0, newWidth, newHeight);\n        tmpCtx.drawImage(imgToPaint, 0, 0, paintWidth, paintHeight,\n                                     0, 0, newWidth, newHeight);\n        imgToPaint = tmpCanvas.canvas;\n        paintWidth = newWidth;\n        paintHeight = newHeight;\n        tmpCanvasId = tmpCanvasId === 'prescale1' ? 'prescale2' : 'prescale1';\n      }\n      ctx.drawImage(imgToPaint, 0, 0, paintWidth, paintHeight,\n                                0, -height, width, height);\n///jsw this\n\n      if (this.imageLayer) {\n        var position = this.getCanvasPosition(0, -height);\n        this.imageLayer.appendImage({\n          imgData: imgData,\n          left: position[0],\n          top: position[1],\n          width: width / currentTransform[0],\n          height: height / currentTransform[3]\n        });\n      }\n      this.restore();\n    },\n\n    paintInlineImageXObjectGroup:\n      function CanvasGraphics_paintInlineImageXObjectGroup(imgData, map) {\n\n      var ctx = this.ctx;\n      var w = imgData.width;\n      var h = imgData.height;\n\n      var tmpCanvas = this.cachedCanvases.getCanvas('inlineImage', w, h);\n      var tmpCtx = tmpCanvas.context;\n///jsw this\n\n      putBinaryImageData(tmpCtx, imgData);\n\n      for (var i = 0, ii = map.length; i < ii; i++) {\n        var entry = map[i];\n        ctx.save();\n        ctx.transform.apply(ctx, entry.transform);\n        ctx.scale(1, -1);\n        ctx.drawImage(tmpCanvas.canvas, entry.x, entry.y, entry.w, entry.h,\n                      0, -1, 1, 1);\n        if (this.imageLayer) {\n          var position = this.getCanvasPosition(entry.x, entry.y);\n          this.imageLayer.appendImage({\n            imgData: imgData,\n            left: position[0],\n            top: position[1],\n            width: w,\n            height: h\n          });\n        }\n        ctx.restore();\n      }\n    },\n\n    paintSolidColorImageMask:\n      function CanvasGraphics_paintSolidColorImageMask() {\n\n        this.ctx.fillRect(0, 0, 1, 1);\n    },\n\n    paintXObject: function CanvasGraphics_paintXObject() {\n\n      warn('Unsupported \\'paintXObject\\' command.');\n    },\n\n    // Marked content\n\n    markPoint: function CanvasGraphics_markPoint(tag) {\n\n      // TODO Marked content.\n    },\n    markPointProps: function CanvasGraphics_markPointProps(tag, properties) {\n\n      // TODO Marked content.\n    },\n    beginMarkedContent: function CanvasGraphics_beginMarkedContent(tag) {\n\n      // TODO Marked content.\n    },\n    beginMarkedContentProps: function CanvasGraphics_beginMarkedContentProps(\n                                        tag, properties) {\n\n      // TODO Marked content.\n    },\n    endMarkedContent: function CanvasGraphics_endMarkedContent() {\n\n      // TODO Marked content.\n    },\n\n    // Compatibility\n\n    beginCompat: function CanvasGraphics_beginCompat() {\n\n      // TODO ignore undefined operators (should we do that anyway?)\n    },\n    endCompat: function CanvasGraphics_endCompat() {\n\n      // TODO stop ignoring undefined operators\n    },\n\n    // Helper functions\n\n    consumePath: function CanvasGraphics_consumePath() {\n\n      var ctx = this.ctx;\n      if (this.pendingClip) {\n        if (this.pendingClip === EO_CLIP) {\n          if (ctx.mozFillRule !== undefined) {\n            ctx.mozFillRule = 'evenodd';\n            ctx.clip();\n            ctx.mozFillRule = 'nonzero';\n          } else {\n            ctx.clip('evenodd');\n          }\n        } else {\n          ctx.clip();\n        }\n        this.pendingClip = null;\n      }\n      ctx.beginPath();\n    },\n    getSinglePixelWidth: function CanvasGraphics_getSinglePixelWidth(scale) {\n\n      if (this.cachedGetSinglePixelWidth === null) {\n        var inverse = this.ctx.mozCurrentTransformInverse;\n        // max of the current horizontal and vertical scale\n        this.cachedGetSinglePixelWidth = Math.sqrt(Math.max(\n          (inverse[0] * inverse[0] + inverse[1] * inverse[1]),\n          (inverse[2] * inverse[2] + inverse[3] * inverse[3])));\n      }\n      return this.cachedGetSinglePixelWidth;\n    },\n    getCanvasPosition: function CanvasGraphics_getCanvasPosition(x, y) {\n\n        var transform = this.ctx.mozCurrentTransform;\n        return [\n          transform[0] * x + transform[2] * y + transform[4],\n          transform[1] * x + transform[3] * y + transform[5]\n        ];\n    }\n  };\n\n  for (var op in OPS) {\n    CanvasGraphics.prototype[OPS[op]] = CanvasGraphics.prototype[op];\n  }\n\n  return CanvasGraphics;\n})();\n\n\nvar WebGLUtils = (function WebGLUtilsClosure() {\n\n  function loadShader(gl, code, shaderType) {\n\n    var shader = gl.createShader(shaderType);\n    gl.shaderSource(shader, code);\n    gl.compileShader(shader);\n///jsw gl\n\n    var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);\n    if (!compiled) {\n      var errorMsg = gl.getShaderInfoLog(shader);\n      throw new Error('Error during shader compilation: ' + errorMsg);\n    }\n    return shader;\n  }\n  function createVertexShader(gl, code) {\n\n    return loadShader(gl, code, gl.VERTEX_SHADER);\n  }\n  function createFragmentShader(gl, code) {\n\n    return loadShader(gl, code, gl.FRAGMENT_SHADER);\n  }\n  function createProgram(gl, shaders) {\n\n    var program = gl.createProgram();\n    for (var i = 0, ii = shaders.length; i < ii; ++i) {\n      gl.attachShader(program, shaders[i]);\n    }\n    gl.linkProgram(program);\n///jsw gl\n\n    var linked = gl.getProgramParameter(program, gl.LINK_STATUS);\n    if (!linked) {\n      var errorMsg = gl.getProgramInfoLog(program);\n      throw new Error('Error during program linking: ' + errorMsg);\n    }\n    return program;\n  }\n  function createTexture(gl, image, textureId) {\n\n    gl.activeTexture(textureId);\n    var texture = gl.createTexture();\n    gl.bindTexture(gl.TEXTURE_2D, texture);\n///jsw gl\n\n    // Set the parameters so we can render any size image.\n    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\n    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\n    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);\n    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);\n\n    // Upload the image into the texture.\n    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);\n    return texture;\n  }\n\n  var currentGL, currentCanvas;\n  function generateGL() {\n\n    if (currentGL) {\n      return;\n    }\n    currentCanvas = document.createElement('canvas');\n    currentGL = currentCanvas.getContext('webgl',\n      { premultipliedalpha: false });\n  }\n\n  var smaskVertexShaderCode = '\\\n  attribute vec2 a_position;                                    \\\n  attribute vec2 a_texCoord;                                    \\\n                                                                \\\n  uniform vec2 u_resolution;                                    \\\n                                                                \\\n  varying vec2 v_texCoord;                                      \\\n                                                                \\\n  void main() {                                                 \\\n    vec2 clipSpace = (a_position / u_resolution) * 2.0 - 1.0;   \\\n    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);          \\\n                                                                \\\n    v_texCoord = a_texCoord;                                    \\\n  }                                                             ';\n\n  var smaskFragmentShaderCode = '\\\n  precision mediump float;                                      \\\n                                                                \\\n  uniform vec4 u_backdrop;                                      \\\n  uniform int u_subtype;                                        \\\n  uniform sampler2D u_image;                                    \\\n  uniform sampler2D u_mask;                                     \\\n                                                                \\\n  varying vec2 v_texCoord;                                      \\\n                                                                \\\n  void main() {                                                 \\\n    vec4 imageColor = texture2D(u_image, v_texCoord);           \\\n    vec4 maskColor = texture2D(u_mask, v_texCoord);             \\\n    if (u_backdrop.a > 0.0) {                                   \\\n      maskColor.rgb = maskColor.rgb * maskColor.a +             \\\n                      u_backdrop.rgb * (1.0 - maskColor.a);     \\\n    }                                                           \\\n    float lum;                                                  \\\n    if (u_subtype == 0) {                                       \\\n      lum = maskColor.a;                                        \\\n    } else {                                                    \\\n      lum = maskColor.r * 0.3 + maskColor.g * 0.59 +            \\\n            maskColor.b * 0.11;                                 \\\n    }                                                           \\\n    imageColor.a *= lum;                                        \\\n    imageColor.rgb *= imageColor.a;                             \\\n    gl_FragColor = imageColor;                                  \\\n  }                                                             ';\n\n  var smaskCache = null;\n\n  function initSmaskGL() {\n\n    var canvas, gl;\n\n    generateGL();\n    canvas = currentCanvas;\n    currentCanvas = null;\n    gl = currentGL;\n    currentGL = null;\n\n    // setup a GLSL program\n    var vertexShader = createVertexShader(gl, smaskVertexShaderCode);\n    var fragmentShader = createFragmentShader(gl, smaskFragmentShaderCode);\n    var program = createProgram(gl, [vertexShader, fragmentShader]);\n    gl.useProgram(program);\n///jsw gl\n\n    var cache = {};\n    cache.gl = gl;\n    cache.canvas = canvas;\n    cache.resolutionLocation = gl.getUniformLocation(program, 'u_resolution');\n    cache.positionLocation = gl.getAttribLocation(program, 'a_position');\n    cache.backdropLocation = gl.getUniformLocation(program, 'u_backdrop');\n    cache.subtypeLocation = gl.getUniformLocation(program, 'u_subtype');\n\n    var texCoordLocation = gl.getAttribLocation(program, 'a_texCoord');\n    var texLayerLocation = gl.getUniformLocation(program, 'u_image');\n    var texMaskLocation = gl.getUniformLocation(program, 'u_mask');\n\n    // provide texture coordinates for the rectangle.\n    var texCoordBuffer = gl.createBuffer();\n    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);\n    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([\n      0.0,  0.0,\n      1.0,  0.0,\n      0.0,  1.0,\n      0.0,  1.0,\n      1.0,  0.0,\n      1.0,  1.0]), gl.STATIC_DRAW);\n    gl.enableVertexAttribArray(texCoordLocation);\n    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);\n///jsw gl\n\n    gl.uniform1i(texLayerLocation, 0);\n    gl.uniform1i(texMaskLocation, 1);\n\n    smaskCache = cache;\n  }\n\n  function composeSMask(layer, mask, properties) {\n\n    var width = layer.width, height = layer.height;\n\n    if (!smaskCache) {\n      initSmaskGL();\n    }\n    var cache = smaskCache,canvas = cache.canvas, gl = cache.gl;\n    canvas.width = width;\n    canvas.height = height;\n    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);\n    gl.uniform2f(cache.resolutionLocation, width, height);\n///jsw gl\n\n    if (properties.backdrop) {\n      gl.uniform4f(cache.resolutionLocation, properties.backdrop[0],\n                   properties.backdrop[1], properties.backdrop[2], 1);\n    } else {\n      gl.uniform4f(cache.resolutionLocation, 0, 0, 0, 0);\n    }\n    gl.uniform1i(cache.subtypeLocation,\n                 properties.subtype === 'Luminosity' ? 1 : 0);\n\n    // Create a textures\n    var texture = createTexture(gl, layer, gl.TEXTURE0);\n    var maskTexture = createTexture(gl, mask, gl.TEXTURE1);\n\n\n    // Create a buffer and put a single clipspace rectangle in\n    // it (2 triangles)\n    var buffer = gl.createBuffer();\n    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);\n    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([\n      0, 0,\n      width, 0,\n      0, height,\n      0, height,\n      width, 0,\n      width, height]), gl.STATIC_DRAW);\n    gl.enableVertexAttribArray(cache.positionLocation);\n    gl.vertexAttribPointer(cache.positionLocation, 2, gl.FLOAT, false, 0, 0);\n\n    // draw\n    gl.clearColor(0, 0, 0, 0);\n    gl.enable(gl.BLEND);\n    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);\n    gl.clear(gl.COLOR_BUFFER_BIT);\n///jsw gl\n\n    gl.drawArrays(gl.TRIANGLES, 0, 6);\n\n    gl.flush();\n\n    gl.deleteTexture(texture);\n    gl.deleteTexture(maskTexture);\n    gl.deleteBuffer(buffer);\n\n    return canvas;\n  }\n\n  var figuresVertexShaderCode = '\\\n  attribute vec2 a_position;                                    \\\n  attribute vec3 a_color;                                       \\\n                                                                \\\n  uniform vec2 u_resolution;                                    \\\n  uniform vec2 u_scale;                                         \\\n  uniform vec2 u_offset;                                        \\\n                                                                \\\n  varying vec4 v_color;                                         \\\n                                                                \\\n  void main() {                                                 \\\n    vec2 position = (a_position + u_offset) * u_scale;          \\\n    vec2 clipSpace = (position / u_resolution) * 2.0 - 1.0;     \\\n    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);          \\\n                                                                \\\n    v_color = vec4(a_color / 255.0, 1.0);                       \\\n  }                                                             ';\n\n  var figuresFragmentShaderCode = '\\\n  precision mediump float;                                      \\\n                                                                \\\n  varying vec4 v_color;                                         \\\n                                                                \\\n  void main() {                                                 \\\n    gl_FragColor = v_color;                                     \\\n  }                                                             ';\n\n  var figuresCache = null;\n\n  function initFiguresGL() {\n\n    var canvas, gl;\n\n    generateGL();\n    canvas = currentCanvas;\n    currentCanvas = null;\n    gl = currentGL;\n    currentGL = null;\n\n    // setup a GLSL program\n    var vertexShader = createVertexShader(gl, figuresVertexShaderCode);\n    var fragmentShader = createFragmentShader(gl, figuresFragmentShaderCode);\n    var program = createProgram(gl, [vertexShader, fragmentShader]);\n///jsw gl\n\n    gl.useProgram(program);\n\n    var cache = {};\n    cache.gl = gl;\n    cache.canvas = canvas;\n    cache.resolutionLocation = gl.getUniformLocation(program, 'u_resolution');\n    cache.scaleLocation = gl.getUniformLocation(program, 'u_scale');\n    cache.offsetLocation = gl.getUniformLocation(program, 'u_offset');\n    cache.positionLocation = gl.getAttribLocation(program, 'a_position');\n    cache.colorLocation = gl.getAttribLocation(program, 'a_color');\n\n    figuresCache = cache;\n  }\n\n  function drawFigures(width, height, backgroundColor, figures, context) {\n\n    if (!figuresCache) {\n      initFiguresGL();\n    }\n    var cache = figuresCache, canvas = cache.canvas, gl = cache.gl;\n\n    canvas.width = width;\n    canvas.height = height;\n///jsw gl\n    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);\n    gl.uniform2f(cache.resolutionLocation, width, height);\n\n    // count triangle points\n    var count = 0;\n    var i, ii, rows;\n    for (i = 0, ii = figures.length; i < ii; i++) {\n      switch (figures[i].type) {\n        case 'lattice':\n          rows = (figures[i].coords.length / figures[i].verticesPerRow) | 0;\n          count += (rows - 1) * (figures[i].verticesPerRow - 1) * 6;\n          break;\n        case 'triangles':\n          count += figures[i].coords.length;\n          break;\n      }\n    }\n    // transfer data\n    var coords = new Float32Array(count * 2);\n    var colors = new Uint8Array(count * 3);\n    var coordsMap = context.coords, colorsMap = context.colors;\n    var pIndex = 0, cIndex = 0;\n    for (i = 0, ii = figures.length; i < ii; i++) {\n      var figure = figures[i], ps = figure.coords, cs = figure.colors;\n      switch (figure.type) {\n        case 'lattice':\n          var cols = figure.verticesPerRow;\n          rows = (ps.length / cols) | 0;\n          for (var row = 1; row < rows; row++) {\n            var offset = row * cols + 1;\n            for (var col = 1; col < cols; col++, offset++) {\n              coords[pIndex] = coordsMap[ps[offset - cols - 1]];\n              coords[pIndex + 1] = coordsMap[ps[offset - cols - 1] + 1];\n              coords[pIndex + 2] = coordsMap[ps[offset - cols]];\n              coords[pIndex + 3] = coordsMap[ps[offset - cols] + 1];\n              coords[pIndex + 4] = coordsMap[ps[offset - 1]];\n              coords[pIndex + 5] = coordsMap[ps[offset - 1] + 1];\n              colors[cIndex] = colorsMap[cs[offset - cols - 1]];\n              colors[cIndex + 1] = colorsMap[cs[offset - cols - 1] + 1];\n              colors[cIndex + 2] = colorsMap[cs[offset - cols - 1] + 2];\n              colors[cIndex + 3] = colorsMap[cs[offset - cols]];\n              colors[cIndex + 4] = colorsMap[cs[offset - cols] + 1];\n              colors[cIndex + 5] = colorsMap[cs[offset - cols] + 2];\n              colors[cIndex + 6] = colorsMap[cs[offset - 1]];\n              colors[cIndex + 7] = colorsMap[cs[offset - 1] + 1];\n              colors[cIndex + 8] = colorsMap[cs[offset - 1] + 2];\n\n              coords[pIndex + 6] = coords[pIndex + 2];\n              coords[pIndex + 7] = coords[pIndex + 3];\n              coords[pIndex + 8] = coords[pIndex + 4];\n              coords[pIndex + 9] = coords[pIndex + 5];\n              coords[pIndex + 10] = coordsMap[ps[offset]];\n              coords[pIndex + 11] = coordsMap[ps[offset] + 1];\n              colors[cIndex + 9] = colors[cIndex + 3];\n              colors[cIndex + 10] = colors[cIndex + 4];\n              colors[cIndex + 11] = colors[cIndex + 5];\n              colors[cIndex + 12] = colors[cIndex + 6];\n              colors[cIndex + 13] = colors[cIndex + 7];\n              colors[cIndex + 14] = colors[cIndex + 8];\n              colors[cIndex + 15] = colorsMap[cs[offset]];\n              colors[cIndex + 16] = colorsMap[cs[offset] + 1];\n              colors[cIndex + 17] = colorsMap[cs[offset] + 2];\n              pIndex += 12;\n              cIndex += 18;\n            }\n          }\n          break;\n        case 'triangles':\n          for (var j = 0, jj = ps.length; j < jj; j++) {\n            coords[pIndex] = coordsMap[ps[j]];\n            coords[pIndex + 1] = coordsMap[ps[j] + 1];\n            colors[cIndex] = colorsMap[cs[j]];\n            colors[cIndex + 1] = colorsMap[cs[j] + 1];\n            colors[cIndex + 2] = colorsMap[cs[j] + 2];\n            pIndex += 2;\n            cIndex += 3;\n          }\n          break;\n      }\n    }\n\n    // draw\n    if (backgroundColor) {\n      gl.clearColor(backgroundColor[0] / 255, backgroundColor[1] / 255,\n                    backgroundColor[2] / 255, 1.0);\n    } else {\n      gl.clearColor(0, 0, 0, 0);\n    }\n    gl.clear(gl.COLOR_BUFFER_BIT);\n\n    var coordsBuffer = gl.createBuffer();\n    gl.bindBuffer(gl.ARRAY_BUFFER, coordsBuffer);\n    gl.bufferData(gl.ARRAY_BUFFER, coords, gl.STATIC_DRAW);\n    gl.enableVertexAttribArray(cache.positionLocation);\n    gl.vertexAttribPointer(cache.positionLocation, 2, gl.FLOAT, false, 0, 0);\n\n    var colorsBuffer = gl.createBuffer();\n    gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer);\n    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);\n    gl.enableVertexAttribArray(cache.colorLocation);\n    gl.vertexAttribPointer(cache.colorLocation, 3, gl.UNSIGNED_BYTE, false,\n                           0, 0);\n\n    gl.uniform2f(cache.scaleLocation, context.scaleX, context.scaleY);\n    gl.uniform2f(cache.offsetLocation, context.offsetX, context.offsetY);\n///jsw gl\n\n    gl.drawArrays(gl.TRIANGLES, 0, count);\n\n    gl.flush();\n\n    gl.deleteBuffer(coordsBuffer);\n    gl.deleteBuffer(colorsBuffer);\n\n    return canvas;\n  }\n\n  function cleanup() {\n\n    if (smaskCache && smaskCache.canvas) {\n      smaskCache.canvas.width = 0;\n      smaskCache.canvas.height = 0;\n    }\n    if (figuresCache && figuresCache.canvas) {\n      figuresCache.canvas.width = 0;\n      figuresCache.canvas.height = 0;\n    }\n    smaskCache = null;\n    figuresCache = null;\n  }\n\n  return {\n    get isEnabled() {\n      if (PDFJS.disableWebGL) {\n        return false;\n      }\n      var enabled = false;\n      try {\n        generateGL();\n        enabled = !!currentGL;\n      } catch (e) { }\n      return shadow(this, 'isEnabled', enabled);\n    },\n    composeSMask: composeSMask,\n    drawFigures: drawFigures,\n    clear: cleanup\n  };\n})();\n\n\nvar ShadingIRs = {};\n\nShadingIRs.RadialAxial = {\n  fromIR: function RadialAxial_fromIR(raw) {\n\n    var type = raw[1];\n    var colorStops = raw[2];\n    var p0 = raw[3];\n    var p1 = raw[4];\n    var r0 = raw[5];\n    var r1 = raw[6];\n    return {\n      type: 'Pattern',\n      getPattern: function RadialAxial_getPattern(ctx) {\n\n        var grad;\n        if (type === 'axial') {\n          grad = ctx.createLinearGradient(p0[0], p0[1], p1[0], p1[1]);\n        } else if (type === 'radial') {\n          grad = ctx.createRadialGradient(p0[0], p0[1], r0, p1[0], p1[1], r1);\n        }\n\n        for (var i = 0, ii = colorStops.length; i < ii; ++i) {\n          var c = colorStops[i];\n          grad.addColorStop(c[0], c[1]);\n        }\n        return grad;\n      }\n    };\n  }\n};\n\nvar createMeshCanvas = (function createMeshCanvasClosure() {\n\n  function drawTriangle(data, context, p1, p2, p3, c1, c2, c3) {\n\n    // Very basic Gouraud-shaded triangle rasterization algorithm.\n    var coords = context.coords, colors = context.colors;\n    var bytes = data.data, rowSize = data.width * 4;\n    var tmp;\n    if (coords[p1 + 1] > coords[p2 + 1]) {\n      tmp = p1; p1 = p2; p2 = tmp; tmp = c1; c1 = c2; c2 = tmp;\n    }\n    if (coords[p2 + 1] > coords[p3 + 1]) {\n      tmp = p2; p2 = p3; p3 = tmp; tmp = c2; c2 = c3; c3 = tmp;\n    }\n    if (coords[p1 + 1] > coords[p2 + 1]) {\n      tmp = p1; p1 = p2; p2 = tmp; tmp = c1; c1 = c2; c2 = tmp;\n    }\n    var x1 = (coords[p1] + context.offsetX) * context.scaleX;\n    var y1 = (coords[p1 + 1] + context.offsetY) * context.scaleY;\n    var x2 = (coords[p2] + context.offsetX) * context.scaleX;\n    var y2 = (coords[p2 + 1] + context.offsetY) * context.scaleY;\n    var x3 = (coords[p3] + context.offsetX) * context.scaleX;\n    var y3 = (coords[p3 + 1] + context.offsetY) * context.scaleY;\n    if (y1 >= y3) {\n      return;\n    }\n    var c1r = colors[c1], c1g = colors[c1 + 1], c1b = colors[c1 + 2];\n    var c2r = colors[c2], c2g = colors[c2 + 1], c2b = colors[c2 + 2];\n    var c3r = colors[c3], c3g = colors[c3 + 1], c3b = colors[c3 + 2];\n\n    var minY = Math.round(y1), maxY = Math.round(y3);\n    var xa, car, cag, cab;\n    var xb, cbr, cbg, cbb;\n    var k;\n    for (var y = minY; y <= maxY; y++) {\n      if (y < y2) {\n        k = y < y1 ? 0 : y1 === y2 ? 1 : (y1 - y) / (y1 - y2);\n        xa = x1 - (x1 - x2) * k;\n        car = c1r - (c1r - c2r) * k;\n        cag = c1g - (c1g - c2g) * k;\n        cab = c1b - (c1b - c2b) * k;\n      } else {\n        k = y > y3 ? 1 : y2 === y3 ? 0 : (y2 - y) / (y2 - y3);\n        xa = x2 - (x2 - x3) * k;\n        car = c2r - (c2r - c3r) * k;\n        cag = c2g - (c2g - c3g) * k;\n        cab = c2b - (c2b - c3b) * k;\n      }\n      k = y < y1 ? 0 : y > y3 ? 1 : (y1 - y) / (y1 - y3);\n      xb = x1 - (x1 - x3) * k;\n      cbr = c1r - (c1r - c3r) * k;\n      cbg = c1g - (c1g - c3g) * k;\n      cbb = c1b - (c1b - c3b) * k;\n      var x1_ = Math.round(Math.min(xa, xb));\n      var x2_ = Math.round(Math.max(xa, xb));\n      var j = rowSize * y + x1_ * 4;\n      for (var x = x1_; x <= x2_; x++) {\n        k = (xa - x) / (xa - xb);\n        k = k < 0 ? 0 : k > 1 ? 1 : k;\n        bytes[j++] = (car - (car - cbr) * k) | 0;\n        bytes[j++] = (cag - (cag - cbg) * k) | 0;\n        bytes[j++] = (cab - (cab - cbb) * k) | 0;\n        bytes[j++] = 255;\n      }\n    }\n  }\n\n  function drawFigure(data, figure, context) {\n\n    var ps = figure.coords;\n    var cs = figure.colors;\n    var i, ii;\n    switch (figure.type) {\n      case 'lattice':\n        var verticesPerRow = figure.verticesPerRow;\n        var rows = Math.floor(ps.length / verticesPerRow) - 1;\n        var cols = verticesPerRow - 1;\n        for (i = 0; i < rows; i++) {\n          var q = i * verticesPerRow;\n          for (var j = 0; j < cols; j++, q++) {\n            drawTriangle(data, context,\n              ps[q], ps[q + 1], ps[q + verticesPerRow],\n              cs[q], cs[q + 1], cs[q + verticesPerRow]);\n            drawTriangle(data, context,\n              ps[q + verticesPerRow + 1], ps[q + 1], ps[q + verticesPerRow],\n              cs[q + verticesPerRow + 1], cs[q + 1], cs[q + verticesPerRow]);\n          }\n        }\n        break;\n      case 'triangles':\n        for (i = 0, ii = ps.length; i < ii; i += 3) {\n          drawTriangle(data, context,\n            ps[i], ps[i + 1], ps[i + 2],\n            cs[i], cs[i + 1], cs[i + 2]);\n        }\n        break;\n      default:\n        error('illigal figure');\n        break;\n    }\n  }\n\n  function createMeshCanvas(bounds, combinesScale, coords, colors, figures,\n                            backgroundColor, cachedCanvases) {\n\n    // we will increase scale on some weird factor to let antialiasing take\n    // care of \"rough\" edges\n    var EXPECTED_SCALE = 1.1;\n    // MAX_PATTERN_SIZE is used to avoid OOM situation.\n    var MAX_PATTERN_SIZE = 3000; // 10in @ 300dpi shall be enough\n\n    var offsetX = Math.floor(bounds[0]);\n    var offsetY = Math.floor(bounds[1]);\n    var boundsWidth = Math.ceil(bounds[2]) - offsetX;\n    var boundsHeight = Math.ceil(bounds[3]) - offsetY;\n\n    var width = Math.min(Math.ceil(Math.abs(boundsWidth * combinesScale[0] *\n      EXPECTED_SCALE)), MAX_PATTERN_SIZE);\n    var height = Math.min(Math.ceil(Math.abs(boundsHeight * combinesScale[1] *\n      EXPECTED_SCALE)), MAX_PATTERN_SIZE);\n    var scaleX = boundsWidth / width;\n    var scaleY = boundsHeight / height;\n\n    var context = {\n      coords: coords,\n      colors: colors,\n      offsetX: -offsetX,\n      offsetY: -offsetY,\n      scaleX: 1 / scaleX,\n      scaleY: 1 / scaleY\n    };\n\n    var canvas, tmpCanvas, i, ii;\n    if (WebGLUtils.isEnabled) {\n      canvas = WebGLUtils.drawFigures(width, height, backgroundColor,\n                                      figures, context);\n\n      // https://bugzilla.mozilla.org/show_bug.cgi?id=972126\n      tmpCanvas = cachedCanvases.getCanvas('mesh', width, height, false);\n      tmpCanvas.context.drawImage(canvas, 0, 0);\n      canvas = tmpCanvas.canvas;\n    } else {\n      tmpCanvas = cachedCanvases.getCanvas('mesh', width, height, false);\n      var tmpCtx = tmpCanvas.context;\n\n      var data = tmpCtx.createImageData(width, height);\n      if (backgroundColor) {\n        var bytes = data.data;\n        for (i = 0, ii = bytes.length; i < ii; i += 4) {\n          bytes[i] = backgroundColor[0];\n          bytes[i + 1] = backgroundColor[1];\n          bytes[i + 2] = backgroundColor[2];\n          bytes[i + 3] = 255;\n        }\n      }\n      for (i = 0; i < figures.length; i++) {\n        drawFigure(data, figures[i], context);\n      }\n      tmpCtx.putImageData(data, 0, 0);\n      canvas = tmpCanvas.canvas;\n    }\n\n    return {canvas: canvas, offsetX: offsetX, offsetY: offsetY,\n            scaleX: scaleX, scaleY: scaleY};\n  }\n  return createMeshCanvas;\n})();\n\nShadingIRs.Mesh = {\n  fromIR: function Mesh_fromIR(raw) {\n\n    //var type = raw[1];\n    var coords = raw[2];\n    var colors = raw[3];\n    var figures = raw[4];\n    var bounds = raw[5];\n    var matrix = raw[6];\n    //var bbox = raw[7];\n    var background = raw[8];\n    return {\n      type: 'Pattern',\n      getPattern: function Mesh_getPattern(ctx, owner, shadingFill) {\n\n        var scale;\n        if (shadingFill) {\n          scale = Util.singularValueDecompose2dScale(ctx.mozCurrentTransform);\n        } else {\n          // Obtain scale from matrix and current transformation matrix.\n          scale = Util.singularValueDecompose2dScale(owner.baseTransform);\n          if (matrix) {\n            var matrixScale = Util.singularValueDecompose2dScale(matrix);\n            scale = [scale[0] * matrixScale[0],\n                     scale[1] * matrixScale[1]];\n          }\n        }\n\n\n        // Rasterizing on the main thread since sending/queue large canvases\n        // might cause OOM.\n        var temporaryPatternCanvas = createMeshCanvas(bounds, scale, coords,\n          colors, figures, shadingFill ? null : background,\n          owner.cachedCanvases);\n\n        if (!shadingFill) {\n          ctx.setTransform.apply(ctx, owner.baseTransform);\n          if (matrix) {\n            ctx.transform.apply(ctx, matrix);\n          }\n        }\n\n        ctx.translate(temporaryPatternCanvas.offsetX,\n                      temporaryPatternCanvas.offsetY);\n        ctx.scale(temporaryPatternCanvas.scaleX,\n                  temporaryPatternCanvas.scaleY);\n\n        return ctx.createPattern(temporaryPatternCanvas.canvas, 'no-repeat');\n      }\n    };\n  }\n};\n\nShadingIRs.Dummy = {\n  fromIR: function Dummy_fromIR() {\n\n    return {\n      type: 'Pattern',\n      getPattern: function Dummy_fromIR_getPattern() {\n\n        return 'hotpink';\n      }\n    };\n  }\n};\n\nfunction getShadingPatternFromIR(raw) {\n\n  var shadingIR = ShadingIRs[raw[0]];\n  if (!shadingIR) {\n    error('Unknown IR type: ' + raw[0]);\n  }\n  return shadingIR.fromIR(raw);\n}\n\nvar TilingPattern = (function TilingPatternClosure() {\n\n  var PaintType = {\n    COLORED: 1,\n    UNCOLORED: 2\n  };\n\n  var MAX_PATTERN_SIZE = 3000; // 10in @ 300dpi shall be enough\n\n  function TilingPattern(IR, color, ctx, objs, commonObjs, baseTransform) {\n\n    this.operatorList = IR[2];\n    this.matrix = IR[3] || [1, 0, 0, 1, 0, 0];\n    this.bbox = IR[4];\n    this.xstep = IR[5];\n    this.ystep = IR[6];\n    this.paintType = IR[7];\n    this.tilingType = IR[8];\n    this.color = color;\n    this.objs = objs;\n    this.commonObjs = commonObjs;\n    this.baseTransform = baseTransform;\n    this.type = 'Pattern';\n    this.ctx = ctx;\n  }\n\n  TilingPattern.prototype = {\n    createPatternCanvas: function TilinPattern_createPatternCanvas(owner) {\n\n      var operatorList = this.operatorList;\n      var bbox = this.bbox;\n      var xstep = this.xstep;\n      var ystep = this.ystep;\n      var paintType = this.paintType;\n      var tilingType = this.tilingType;\n      var color = this.color;\n      var objs = this.objs;\n      var commonObjs = this.commonObjs;\n\n      info('TilingType: ' + tilingType);\n\n      var x0 = bbox[0], y0 = bbox[1], x1 = bbox[2], y1 = bbox[3];\n\n      var topLeft = [x0, y0];\n      // we want the canvas to be as large as the step size\n      var botRight = [x0 + xstep, y0 + ystep];\n\n      var width = botRight[0] - topLeft[0];\n      var height = botRight[1] - topLeft[1];\n\n      // Obtain scale from matrix and current transformation matrix.\n      var matrixScale = Util.singularValueDecompose2dScale(this.matrix);\n      var curMatrixScale = Util.singularValueDecompose2dScale(\n        this.baseTransform);\n      var combinedScale = [matrixScale[0] * curMatrixScale[0],\n        matrixScale[1] * curMatrixScale[1]];\n\n      // MAX_PATTERN_SIZE is used to avoid OOM situation.\n      // Use width and height values that are as close as possible to the end\n      // result when the pattern is used. Too low value makes the pattern look\n      // blurry. Too large value makes it look too crispy.\n      width = Math.min(Math.ceil(Math.abs(width * combinedScale[0])),\n        MAX_PATTERN_SIZE);\n\n      height = Math.min(Math.ceil(Math.abs(height * combinedScale[1])),\n        MAX_PATTERN_SIZE);\n\n      var tmpCanvas = owner.cachedCanvases.getCanvas('pattern',\n        width, height, true);\n      var tmpCtx = tmpCanvas.context;\n      var graphics = new CanvasGraphics(tmpCtx, commonObjs, objs);\n      graphics.groupLevel = owner.groupLevel;\n\n      this.setFillAndStrokeStyleToContext(tmpCtx, paintType, color);\n\n      this.setScale(width, height, xstep, ystep);\n      this.transformToScale(graphics);\n\n      // transform coordinates to pattern space\n      var tmpTranslate = [1, 0, 0, 1, -topLeft[0], -topLeft[1]];\n      graphics.transform.apply(graphics, tmpTranslate);\n\n      this.clipBbox(graphics, bbox, x0, y0, x1, y1);\n\n      graphics.executeOperatorList(operatorList);\n      return tmpCanvas.canvas;\n    },\n\n    setScale: function TilingPattern_setScale(width, height, xstep, ystep) {\n\n      this.scale = [width / xstep, height / ystep];\n    },\n\n    transformToScale: function TilingPattern_transformToScale(graphics) {\n\n      var scale = this.scale;\n      var tmpScale = [scale[0], 0, 0, scale[1], 0, 0];\n      graphics.transform.apply(graphics, tmpScale);\n    },\n\n    scaleToContext: function TilingPattern_scaleToContext() {\n\n      var scale = this.scale;\n      this.ctx.scale(1 / scale[0], 1 / scale[1]);\n    },\n\n    clipBbox: function clipBbox(graphics, bbox, x0, y0, x1, y1) {\n\n      if (bbox && isArray(bbox) && bbox.length === 4) {\n        var bboxWidth = x1 - x0;\n        var bboxHeight = y1 - y0;\n        graphics.ctx.rect(x0, y0, bboxWidth, bboxHeight);\n        graphics.clip();\n        graphics.endPath();\n      }\n    },\n\n    setFillAndStrokeStyleToContext:\n      function setFillAndStrokeStyleToContext(context, paintType, color) {\n\n        switch (paintType) {\n          case PaintType.COLORED:\n            var ctx = this.ctx;\n            context.fillStyle = ctx.fillStyle;\n            context.strokeStyle = ctx.strokeStyle;\n            break;\n          case PaintType.UNCOLORED:\n            var cssColor = Util.makeCssRgb(color[0], color[1], color[2]);\n            context.fillStyle = cssColor;\n            context.strokeStyle = cssColor;\n            break;\n          default:\n            error('Unsupported paint type: ' + paintType);\n        }\n      },\n\n    getPattern: function TilingPattern_getPattern(ctx, owner) {\n\n      var temporaryPatternCanvas = this.createPatternCanvas(owner);\n\n      ctx = this.ctx;\n      ctx.setTransform.apply(ctx, this.baseTransform);\n      ctx.transform.apply(ctx, this.matrix);\n      this.scaleToContext();\n\n      return ctx.createPattern(temporaryPatternCanvas, 'repeat');\n    }\n  };\n\n  return TilingPattern;\n})();\n\n\nfunction FontLoader(docId) {\n\n  this.docId = docId;\n  this.styleElement = null;\n  this.nativeFontFaces = [];\n  this.loadTestFontId = 0;\n///jsw this\n\n  this.loadingContext = {\n    requests: [],\n    nextRequestId: 0\n  };\n}\nFontLoader.prototype = {\n  insertRule: function fontLoaderInsertRule(rule) {\n\n    var styleElement = this.styleElement;\n    if (!styleElement) {\n      styleElement = this.styleElement = document.createElement('style');\n      styleElement.id = 'PDFJS_FONT_STYLE_TAG_' + this.docId;\n      document.documentElement.getElementsByTagName('head')[0].appendChild(\n        styleElement);\n    }\n///jsw this\n\n    var styleSheet = styleElement.sheet;\n    styleSheet.insertRule(rule, styleSheet.cssRules.length);\n  },\n\n  clear: function fontLoaderClear() {\n\n\n    var styleElement = this.styleElement;\n    if (styleElement) {\n      styleElement.parentNode.removeChild(styleElement);\n      styleElement = this.styleElement = null;\n    }\n///jsw this\n///jsw_end\n\n    this.nativeFontFaces.forEach(function(nativeFontFace) {\n      document.fonts.delete(nativeFontFace);\n    });\n    this.nativeFontFaces.length = 0;\n  },\n  get loadTestFont() {\n    // This is a CFF font with 1 glyph for '.' that fills its entire width and\n    // height.\n    return shadow(this, 'loadTestFont', atob(\n      'T1RUTwALAIAAAwAwQ0ZGIDHtZg4AAAOYAAAAgUZGVE1lkzZwAAAEHAAAABxHREVGABQAFQ' +\n      'AABDgAAAAeT1MvMlYNYwkAAAEgAAAAYGNtYXABDQLUAAACNAAAAUJoZWFk/xVFDQAAALwA' +\n      'AAA2aGhlYQdkA+oAAAD0AAAAJGhtdHgD6AAAAAAEWAAAAAZtYXhwAAJQAAAAARgAAAAGbm' +\n      'FtZVjmdH4AAAGAAAAAsXBvc3T/hgAzAAADeAAAACAAAQAAAAEAALZRFsRfDzz1AAsD6AAA' +\n      'AADOBOTLAAAAAM4KHDwAAAAAA+gDIQAAAAgAAgAAAAAAAAABAAADIQAAAFoD6AAAAAAD6A' +\n      'ABAAAAAAAAAAAAAAAAAAAAAQAAUAAAAgAAAAQD6AH0AAUAAAKKArwAAACMAooCvAAAAeAA' +\n      'MQECAAACAAYJAAAAAAAAAAAAAQAAAAAAAAAAAAAAAFBmRWQAwAAuAC4DIP84AFoDIQAAAA' +\n      'AAAQAAAAAAAAAAACAAIAABAAAADgCuAAEAAAAAAAAAAQAAAAEAAAAAAAEAAQAAAAEAAAAA' +\n      'AAIAAQAAAAEAAAAAAAMAAQAAAAEAAAAAAAQAAQAAAAEAAAAAAAUAAQAAAAEAAAAAAAYAAQ' +\n      'AAAAMAAQQJAAAAAgABAAMAAQQJAAEAAgABAAMAAQQJAAIAAgABAAMAAQQJAAMAAgABAAMA' +\n      'AQQJAAQAAgABAAMAAQQJAAUAAgABAAMAAQQJAAYAAgABWABYAAAAAAAAAwAAAAMAAAAcAA' +\n      'EAAAAAADwAAwABAAAAHAAEACAAAAAEAAQAAQAAAC7//wAAAC7////TAAEAAAAAAAABBgAA' +\n      'AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAA' +\n      'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +\n      'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +\n      'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +\n      'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMAAA' +\n      'AAAAD/gwAyAAAAAQAAAAAAAAAAAAAAAAAAAAABAAQEAAEBAQJYAAEBASH4DwD4GwHEAvgc' +\n      'A/gXBIwMAYuL+nz5tQXkD5j3CBLnEQACAQEBIVhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWF' +\n      'hYWFhYWFhYAAABAQAADwACAQEEE/t3Dov6fAH6fAT+fPp8+nwHDosMCvm1Cvm1DAz6fBQA' +\n      'AAAAAAABAAAAAMmJbzEAAAAAzgTjFQAAAADOBOQpAAEAAAAAAAAADAAUAAQAAAABAAAAAg' +\n      'ABAAAAAAAAAAAD6AAAAAAAAA=='\n    ));\n  },\n\n  addNativeFontFace: function fontLoader_addNativeFontFace(nativeFontFace) {\n\n    this.nativeFontFaces.push(nativeFontFace);\n    document.fonts.add(nativeFontFace);\n  },\n\n  bind: function fontLoaderBind(fonts, callback) {\n\n    assert(!isWorker, 'bind() shall be called from main thread');\n\n    var rules = [];\n    var fontsToLoad = [];\n    var fontLoadPromises = [];\n    var getNativeFontPromise = function(nativeFontFace) {\n\n      // Return a promise that is always fulfilled, even when the font fails to\n      // load.\n      return nativeFontFace.loaded.catch(function(e) {\n\n        warn('Failed to load font \"' + nativeFontFace.family + '\": ' + e);\n      });\n    };\n    for (var i = 0, ii = fonts.length; i < ii; i++) {\n      var font = fonts[i];\n\n      // Add the font to the DOM only once or skip if the font\n      // is already loaded.\n      if (font.attached || font.loading === false) {\n        continue;\n      }\n      font.attached = true;\n///jsw this\n\n      if (FontLoader.isFontLoadingAPISupported) {\n        var nativeFontFace = font.createNativeFontFace();\n        if (nativeFontFace) {\n          this.addNativeFontFace(nativeFontFace);\n          fontLoadPromises.push(getNativeFontPromise(nativeFontFace));\n        }\n      } else {\n        var rule = font.createFontFaceRule();\n        if (rule) {\n          this.insertRule(rule);\n          rules.push(rule);\n          fontsToLoad.push(font);\n        }\n      }\n    }\n\n    var request = this.queueLoadingCallback(callback);\n    if (FontLoader.isFontLoadingAPISupported) {\n      Promise.all(fontLoadPromises).then(function() {\n\n        request.complete();\n      });\n    } else if (rules.length > 0 && !FontLoader.isSyncFontLoadingSupported) {\n      this.prepareFontLoadEvent(rules, fontsToLoad, request);\n    } else {\n      request.complete();\n    }\n  },\n\n  queueLoadingCallback: function FontLoader_queueLoadingCallback(callback) {\n\n    function LoadLoader_completeRequest() {\n\n      assert(!request.end, 'completeRequest() cannot be called twice');\n      request.end = Date.now();\n\n      // sending all completed requests in order how they were queued\n      while (context.requests.length > 0 && context.requests[0].end) {\n        var otherRequest = context.requests.shift();\n        setTimeout(otherRequest.callback, 0);\n      }\n    }\n\n    var context = this.loadingContext;\n    var requestId = 'pdfjs-font-loading-' + (context.nextRequestId++);\n    var request = {\n      id: requestId,\n      complete: LoadLoader_completeRequest,\n      callback: callback,\n      started: Date.now()\n    };\n    context.requests.push(request);\n    return request;\n  },\n\n  prepareFontLoadEvent: function fontLoaderPrepareFontLoadEvent(rules,\n                                                                fonts,\n                                                                request) {\n\n      /** Hack begin */\n      // There's currently no event when a font has finished downloading so the\n      // following code is a dirty hack to 'guess' when a font is\n      // ready. It's assumed fonts are loaded in order, so add a known test\n      // font after the desired fonts and then test for the loading of that\n      // test font.\n\n      function int32(data, offset) {\n\n        return (data.charCodeAt(offset) << 24) |\n               (data.charCodeAt(offset + 1) << 16) |\n               (data.charCodeAt(offset + 2) << 8) |\n               (data.charCodeAt(offset + 3) & 0xff);\n      }\n\n      function spliceString(s, offset, remove, insert) {\n\n        var chunk1 = s.substr(0, offset);\n        var chunk2 = s.substr(offset + remove);\n        return chunk1 + insert + chunk2;\n      }\n\n      var i, ii;\n\n      var canvas = document.createElement('canvas');\n      canvas.width = 1;\n      canvas.height = 1;\n      var ctx = canvas.getContext('2d');\n\n      var called = 0;\n      function isFontReady(name, callback) {\n\n        called++;\n        // With setTimeout clamping this gives the font ~100ms to load.\n        if(called > 30) {\n          warn('Load test font never loaded.');\n          callback();\n          return;\n        }\n        ctx.font = '30px ' + name;\n        ctx.fillText('.', 0, 20);\n        var imageData = ctx.getImageData(0, 0, 1, 1);\n        if (imageData.data[3] > 0) {\n          callback();\n          return;\n        }\n        setTimeout(isFontReady.bind(null, name, callback));\n      }\n\n      var loadTestFontId = 'lt' + Date.now() + this.loadTestFontId++;\n      // Chromium seems to cache fonts based on a hash of the actual font data,\n      // so the font must be modified for each load test else it will appear to\n      // be loaded already.\n      // TODO: This could maybe be made faster by avoiding the btoa of the full\n      // font by splitting it in chunks before hand and padding the font id.\n      var data = this.loadTestFont;\n      var COMMENT_OFFSET = 976; // has to be on 4 byte boundary (for checksum)\n      data = spliceString(data, COMMENT_OFFSET, loadTestFontId.length,\n                          loadTestFontId);\n      // CFF checksum is important for IE, adjusting it\n      var CFF_CHECKSUM_OFFSET = 16;\n      var XXXX_VALUE = 0x58585858; // the \"comment\" filled with 'X'\n      var checksum = int32(data, CFF_CHECKSUM_OFFSET);\n      for (i = 0, ii = loadTestFontId.length - 3; i < ii; i += 4) {\n        checksum = (checksum - XXXX_VALUE + int32(loadTestFontId, i)) | 0;\n      }\n///jsw ctx\n\n      if (i < loadTestFontId.length) { // align to 4 bytes boundary\n        checksum = (checksum - XXXX_VALUE +\n                    int32(loadTestFontId + 'XXX', i)) | 0;\n      }\n      data = spliceString(data, CFF_CHECKSUM_OFFSET, 4, string32(checksum));\n\n      var url = 'url(data:font/opentype;base64,' + btoa(data) + ');';\n      var rule = '@font-face { font-family:\"' + loadTestFontId + '\";src:' +\n                 url + '}';\n      this.insertRule(rule);\n\n      var names = [];\n      for (i = 0, ii = fonts.length; i < ii; i++) {\n        names.push(fonts[i].loadedName);\n      }\n      names.push(loadTestFontId);\n\n      var div = document.createElement('div');\n      div.setAttribute('style',\n                       'visibility: hidden;' +\n                       'width: 10px; height: 10px;' +\n                       'position: absolute; top: 0px; left: 0px;');\n      for (i = 0, ii = names.length; i < ii; ++i) {\n        var span = document.createElement('span');\n        span.textContent = 'Hi';\n        span.style.fontFamily = names[i];\n        div.appendChild(span);\n      }\n      document.body.appendChild(div);\n\n      isFontReady(loadTestFontId, function() {\n\n        document.body.removeChild(div);\n        request.complete();\n      });\n      /** Hack end */\n  }\n};\nFontLoader.isFontLoadingAPISupported = (!isWorker &&\n  typeof document !== 'undefined' && !!document.fonts);\nObject.defineProperty(FontLoader, 'isSyncFontLoadingSupported', {\n  get: function () {\n\n    var supported = false;\n\n    // User agent string sniffing is bad, but there is no reliable way to tell\n    // if font is fully loaded and ready to be used with canvas.\n    var userAgent = window.navigator.userAgent;\n    var m = /Mozilla\\/5.0.*?rv:(\\d+).*? Gecko/.exec(userAgent);\n    if (m && m[1] >= 14) {\n      supported = true;\n    }\n    // TODO other browsers\n    if (userAgent === 'node') {\n      supported = true;\n    }\n    return shadow(FontLoader, 'isSyncFontLoadingSupported', supported);\n  },\n  enumerable: true,\n  configurable: true\n});\n\nvar FontFaceObject = (function FontFaceObjectClosure() {\n\n  function FontFaceObject(translatedData) {\n\n    this.compiledGlyphs = {};\n    // importing translated data\n    for (var i in translatedData) {\n      this[i] = translatedData[i];\n    }\n  }\n  Object.defineProperty(FontFaceObject, 'isEvalSupported', {\n    get: function () {\n\n      var evalSupport = false;\n      if (PDFJS.isEvalSupported) {\n        try {\n          /* jshint evil: true */\n          new Function('');\n          evalSupport = true;\n        } catch (e) {}\n      }\n      return shadow(this, 'isEvalSupported', evalSupport);\n    },\n    enumerable: true,\n    configurable: true\n  });\n  FontFaceObject.prototype = {\n    createNativeFontFace: function FontFaceObject_createNativeFontFace() {\n\n      if (!this.data) {\n        return null;\n      }\n\n      if (PDFJS.disableFontFace) {\n        this.disableFontFace = true;\n        return null;\n      }\n\n      var nativeFontFace = new FontFace(this.loadedName, this.data, {});\n///jsw this\n\n      if (PDFJS.pdfBug && 'FontInspector' in globalScope &&\n          globalScope['FontInspector'].enabled) {\n        globalScope['FontInspector'].fontAdded(this);\n      }\n      return nativeFontFace;\n    },\n\n    createFontFaceRule: function FontFaceObject_createFontFaceRule() {\n\n      if (!this.data) {\n        return null;\n      }\n\n      if (PDFJS.disableFontFace) {\n        this.disableFontFace = true;\n        return null;\n      }\n\n      var data = bytesToString(new Uint8Array(this.data));\n      var fontName = this.loadedName;\n///jsw this\n\n      // Add the font-face rule to the document\n      var url = ('url(data:' + this.mimetype + ';base64,' +\n                 window.btoa(data) + ');');\n      var rule = '@font-face { font-family:\"' + fontName + '\";src:' + url + '}';\n\n      if (PDFJS.pdfBug && 'FontInspector' in globalScope &&\n          globalScope['FontInspector'].enabled) {\n        globalScope['FontInspector'].fontAdded(this, url);\n      }\n\n      return rule;\n    },\n\n    getPathGenerator:\n        function FontFaceObject_getPathGenerator(objs, character) {\n\n      if (!(character in this.compiledGlyphs)) {\n        var cmds = objs.get(this.loadedName + '_path_' + character);\n        var current, i, len;\n///jsw this\n\n        // If we can, compile cmds into JS for MAXIMUM SPEED\n        if (FontFaceObject.isEvalSupported) {\n          var args, js = '';\n          for (i = 0, len = cmds.length; i < len; i++) {\n            current = cmds[i];\n\n            if (current.args !== undefined) {\n              args = current.args.join(',');\n            } else {\n              args = '';\n            }\n\n            js += 'c.' + current.cmd + '(' + args + ');\\n';\n          }\n          /* jshint -W054 */\n          this.compiledGlyphs[character] = new Function('c', 'size', js);\n        } else {\n          // But fall back on using Function.prototype.apply() if we're\n          // blocked from using eval() for whatever reason (like CSP policies)\n          this.compiledGlyphs[character] = function(c, size) {\n\n            for (i = 0, len = cmds.length; i < len; i++) {\n              current = cmds[i];\n\n              if (current.cmd === 'scale') {\n                current.args = [size, -size];\n              }\n\n              c[current.cmd].apply(c, current.args);\n            }\n          };\n        }\n      }\n      return this.compiledGlyphs[character];\n    }\n  };\n  return FontFaceObject;\n})();\n\n\n/**\n * Optimised CSS custom property getter/setter.\n * @class\n */\nvar CustomStyle = (function CustomStyleClosure() {\n///jsw\n\n\n  // As noted on: http://www.zachstronaut.com/posts/2009/02/17/\n  //              animate-css-transforms-firefox-webkit.html\n  // in some versions of IE9 it is critical that ms appear in this list\n  // before Moz\n  var prefixes = ['ms', 'Moz', 'Webkit', 'O'];\n  var _cache = {};\n\n  function CustomStyle() {\n}\n\n  CustomStyle.getProp = function get(propName, element) {\n\n    // check cache only when no element is given\n    if (arguments.length === 1 && typeof _cache[propName] === 'string') {\n      return _cache[propName];\n    }\n\n    element = element || document.documentElement;\n    var style = element.style, prefixed, uPropName;\n\n    // test standard property first\n    if (typeof style[propName] === 'string') {\n      return (_cache[propName] = propName);\n    }\n\n    // capitalize\n    uPropName = propName.charAt(0).toUpperCase() + propName.slice(1);\n\n    // test vendor specific properties\n    for (var i = 0, l = prefixes.length; i < l; i++) {\n      prefixed = prefixes[i] + uPropName;\n      if (typeof style[prefixed] === 'string') {\n        return (_cache[propName] = prefixed);\n      }\n    }\n\n    //if all fails then set to undefined\n    return (_cache[propName] = 'undefined');\n  };\n\n  CustomStyle.setProp = function set(propName, element, str) {\n\n    var prop = this.getProp(propName);\n    if (prop !== 'undefined') {\n      element.style[prop] = str;\n    }\n  };\n\n  return CustomStyle;\n})();\n\nPDFJS.CustomStyle = CustomStyle;\n\n\nvar ANNOT_MIN_SIZE = 10; // px\n\nvar AnnotationLayer = (function AnnotationLayerClosure() {\n\n  // TODO(mack): This dupes some of the logic in CanvasGraphics.setFont()\n  function setTextStyles(element, item, fontObj) {\n\n    var style = element.style;\n    style.fontSize = item.fontSize + 'px';\n    style.direction = item.fontDirection < 0 ? 'rtl': 'ltr';\n\n    if (!fontObj) {\n      return;\n    }\n\n    style.fontWeight = fontObj.black ?\n      (fontObj.bold ? 'bolder' : 'bold') :\n      (fontObj.bold ? 'bold' : 'normal');\n    style.fontStyle = fontObj.italic ? 'italic' : 'normal';\n///jsw style\n\n    var fontName = fontObj.loadedName;\n    var fontFamily = fontName ? '\"' + fontName + '\", ' : '';\n    // Use a reasonable default font if the font doesn't specify a fallback\n    var fallbackName = fontObj.fallbackName || 'Helvetica, sans-serif';\n    style.fontFamily = fontFamily + fallbackName;\n  }\n\n  function getContainer(data, page, viewport) {\n\n    var container = document.createElement('section');\n    var width = data.rect[2] - data.rect[0];\n    var height = data.rect[3] - data.rect[1];\n\n    container.setAttribute('data-annotation-id', data.id);\n\n    data.rect = Util.normalizeRect([\n      data.rect[0],\n      page.view[3] - data.rect[1] + page.view[1],\n      data.rect[2],\n      page.view[3] - data.rect[3] + page.view[1]\n    ]);\n///jsw page\n\n    CustomStyle.setProp('transform', container,\n                        'matrix(' + viewport.transform.join(',') + ')');\n    CustomStyle.setProp('transformOrigin', container,\n                        -data.rect[0] + 'px ' + -data.rect[1] + 'px');\n\n    if (data.borderStyle.width > 0) {\n      container.style.borderWidth = data.borderStyle.width + 'px';\n      if (data.borderStyle.style !== AnnotationBorderStyleType.UNDERLINE) {\n        // Underline styles only have a bottom border, so we do not need\n        // to adjust for all borders. This yields a similar result as\n        // Adobe Acrobat/Reader.\n        width = width - 2 * data.borderStyle.width;\n        height = height - 2 * data.borderStyle.width;\n      }\n\n      var horizontalRadius = data.borderStyle.horizontalCornerRadius;\n      var verticalRadius = data.borderStyle.verticalCornerRadius;\n      if (horizontalRadius > 0 || verticalRadius > 0) {\n        var radius = horizontalRadius + 'px / ' + verticalRadius + 'px';\n        CustomStyle.setProp('borderRadius', container, radius);\n      }\n\n      switch (data.borderStyle.style) {\n        case AnnotationBorderStyleType.SOLID:\n          container.style.borderStyle = 'solid';\n          break;\n\n        case AnnotationBorderStyleType.DASHED:\n          container.style.borderStyle = 'dashed';\n          break;\n\n        case AnnotationBorderStyleType.BEVELED:\n          warn('Unimplemented border style: beveled');\n          break;\n\n        case AnnotationBorderStyleType.INSET:\n          warn('Unimplemented border style: inset');\n          break;\n\n        case AnnotationBorderStyleType.UNDERLINE:\n          container.style.borderBottomStyle = 'solid';\n          break;\n\n        default:\n          break;\n      }\n\n      if (data.color) {\n        container.style.borderColor =\n          Util.makeCssRgb(data.color[0] | 0,\n                          data.color[1] | 0,\n                          data.color[2] | 0);\n      } else {\n        // Transparent (invisible) border, so do not draw it at all.\n        container.style.borderWidth = 0;\n      }\n    }\n\n    container.style.left = data.rect[0] + 'px';\n    container.style.top = data.rect[1] + 'px';\n\n    container.style.width = width + 'px';\n    container.style.height = height + 'px';\n\n    return container;\n  }\n\n  function getHtmlElementForTextWidgetAnnotation(item, page) {\n\n    var element = document.createElement('div');\n    var width = item.rect[2] - item.rect[0];\n    var height = item.rect[3] - item.rect[1];\n    element.style.width = width + 'px';\n    element.style.height = height + 'px';\n    element.style.display = 'table';\n///jsw page\n\n    var content = document.createElement('div');\n    content.textContent = item.fieldValue;\n    var textAlignment = item.textAlignment;\n    content.style.textAlign = ['left', 'center', 'right'][textAlignment];\n    content.style.verticalAlign = 'middle';\n    content.style.display = 'table-cell';\n\n    var fontObj = item.fontRefName ?\n      page.commonObjs.getData(item.fontRefName) : null;\n    setTextStyles(content, item, fontObj);\n\n    element.appendChild(content);\n\n    return element;\n  }\n\n  function getHtmlElementForTextAnnotation(item, page, viewport) {\n\n    var rect = item.rect;\n\n    // sanity check because of OOo-generated PDFs\n    if ((rect[3] - rect[1]) < ANNOT_MIN_SIZE) {\n      rect[3] = rect[1] + ANNOT_MIN_SIZE;\n    }\n    if ((rect[2] - rect[0]) < ANNOT_MIN_SIZE) {\n      rect[2] = rect[0] + (rect[3] - rect[1]); // make it square\n    }\n\n    var container = getContainer(item, page, viewport);\n    container.className = 'annotText';\n\n    var image  = document.createElement('img');\n    image.style.height = container.style.height;\n    image.style.width = container.style.width;\n///jsw page\n    var iconName = item.name;\n    image.src = PDFJS.imageResourcesPath + 'annotation-' +\n      iconName.toLowerCase() + '.svg';\n    image.alt = '[{{type}} Annotation]';\n    image.dataset.l10nId = 'text_annotation_type';\n    image.dataset.l10nArgs = JSON.stringify({type: iconName});\n\n    var contentWrapper = document.createElement('div');\n    contentWrapper.className = 'annotTextContentWrapper';\n    contentWrapper.style.left = Math.floor(rect[2] - rect[0] + 5) + 'px';\n    contentWrapper.style.top = '-10px';\n\n    var content = document.createElement('div');\n    content.className = 'annotTextContent';\n    content.setAttribute('hidden', true);\n///jsw page\n\n    var i, ii;\n    if (item.hasBgColor && item.color) {\n      var color = item.color;\n\n      // Enlighten the color (70%)\n      var BACKGROUND_ENLIGHT = 0.7;\n      var r = BACKGROUND_ENLIGHT * (255 - color[0]) + color[0];\n      var g = BACKGROUND_ENLIGHT * (255 - color[1]) + color[1];\n      var b = BACKGROUND_ENLIGHT * (255 - color[2]) + color[2];\n      content.style.backgroundColor = Util.makeCssRgb(r | 0, g | 0, b | 0);\n    }\n\n    var title = document.createElement('h1');\n    var text = document.createElement('p');\n    title.textContent = item.title;\n\n    if (!item.content && !item.title) {\n      content.setAttribute('hidden', true);\n    } else {\n      var e = document.createElement('span');\n      var lines = item.content.split(/(?:\\r\\n?|\\n)/);\n      for (i = 0, ii = lines.length; i < ii; ++i) {\n        var line = lines[i];\n        e.appendChild(document.createTextNode(line));\n        if (i < (ii - 1)) {\n          e.appendChild(document.createElement('br'));\n        }\n      }\n      text.appendChild(e);\n\n      var pinned = false;\n\n      var showAnnotation = function showAnnotation(pin) {\n\n        if (pin) {\n          pinned = true;\n        }\n        if (content.hasAttribute('hidden')) {\n          container.style.zIndex += 1;\n          content.removeAttribute('hidden');\n        }\n      };\n\n      var hideAnnotation = function hideAnnotation(unpin) {\n\n        if (unpin) {\n          pinned = false;\n        }\n        if (!content.hasAttribute('hidden') && !pinned) {\n          container.style.zIndex -= 1;\n          content.setAttribute('hidden', true);\n        }\n      };\n\n      var toggleAnnotation = function toggleAnnotation() {\n\n        if (pinned) {\n          hideAnnotation(true);\n        } else {\n          showAnnotation(true);\n        }\n      };\n\n      image.addEventListener('click', function image_clickHandler() {\n\n        toggleAnnotation();\n      }, false);\n      image.addEventListener('mouseover', function image_mouseOverHandler() {\n\n        showAnnotation();\n      }, false);\n      image.addEventListener('mouseout', function image_mouseOutHandler() {\n\n        hideAnnotation();\n      }, false);\n\n      content.addEventListener('click', function content_clickHandler() {\n\n        hideAnnotation(true);\n      }, false);\n    }\n\n    content.appendChild(title);\n    content.appendChild(text);\n    contentWrapper.appendChild(content);\n    container.appendChild(image);\n    container.appendChild(contentWrapper);\n\n    return container;\n  }\n\n  function getHtmlElementForLinkAnnotation(item, page, viewport, linkService) {\n\n    function bindLink(link, dest) {\n\n      link.href = linkService.getDestinationHash(dest);\n      link.onclick = function annotationsLayerBuilderLinksOnclick() {\n\n        if (dest) {\n          linkService.navigateTo(dest);\n        }\n        return false;\n      };\n      if (dest) {\n        link.className = 'internalLink';\n      }\n    }\n\n    function bindNamedAction(link, action) {\n\n      link.href = linkService.getAnchorUrl('');\n      link.onclick = function annotationsLayerBuilderNamedActionOnClick() {\n\n        linkService.executeNamedAction(action);\n        return false;\n      };\n      link.className = 'internalLink';\n    }\n\n    var container = getContainer(item, page, viewport);\n    container.className = 'annotLink';\n\n    var link = document.createElement('a');\n    link.href = link.title = item.url || '';\n\n    if (item.url && isExternalLinkTargetSet()) {\n      link.target = LinkTargetStringMap[PDFJS.externalLinkTarget];\n    }\n\n    if (!item.url) {\n      if (item.action) {\n        bindNamedAction(link, item.action);\n      } else {\n        bindLink(link, ('dest' in item) ? item.dest : null);\n      }\n    }\n\n    container.appendChild(link);\n\n    return container;\n  }\n\n  function getHtmlElement(data, page, viewport, linkService) {\n\n    switch (data.annotationType) {\n      case AnnotationType.WIDGET:\n        return getHtmlElementForTextWidgetAnnotation(data, page);\n      case AnnotationType.TEXT:\n        return getHtmlElementForTextAnnotation(data, page, viewport);\n      case AnnotationType.LINK:\n        return getHtmlElementForLinkAnnotation(data, page, viewport,\n                                               linkService);\n      default:\n        throw new Error('Unsupported annotationType: ' + data.annotationType);\n    }\n  }\n\n  function render(viewport, div, annotations, page, linkService) {\n\n    for (var i = 0, ii = annotations.length; i < ii; i++) {\n      var data = annotations[i];\n      if (!data || !data.hasHtml) {\n        continue;\n      }\n\n      var element = getHtmlElement(data, page, viewport, linkService);\n      div.appendChild(element);\n    }\n  }\n\n  function update(viewport, div, annotations) {\n\n    for (var i = 0, ii = annotations.length; i < ii; i++) {\n      var data = annotations[i];\n      var element = div.querySelector(\n        '[data-annotation-id=\"' + data.id + '\"]');\n      if (element) {\n        CustomStyle.setProp('transform', element,\n          'matrix(' + viewport.transform.join(',') + ')');\n      }\n    }\n    div.removeAttribute('hidden');\n  }\n\n  return {\n    render: render,\n    update: update\n  };\n})();\n\nPDFJS.AnnotationLayer = AnnotationLayer;\n\n\n/**\n * Text layer render parameters.\n *\n * @typedef {Object} TextLayerRenderParameters\n * @property {TextContent} textContent - Text content to render (the object is\n *   returned by the page's getTextContent() method).\n * @property {HTMLElement} container - HTML element that will contain text runs.\n * @property {PDFJS.PageViewport} viewport - The target viewport to properly\n *   layout the text runs.\n * @property {Array} textDivs - (optional) HTML elements that are correspond\n *   the text items of the textContent input. This is output and shall be\n *   initially be set to empty array.\n * @property {number} timeout - (optional) Delay in milliseconds before\n *   rendering of the text  runs occurs.\n */\nvar renderTextLayer = (function renderTextLayerClosure() {\n\n  var MAX_TEXT_DIVS_TO_RENDER = 100000;\n\n  var NonWhitespaceRegexp = /\\S/;\n\n  function isAllWhitespace(str) {\n\n    return !NonWhitespaceRegexp.test(str);\n  }\n\n  function appendText(textDivs, viewport, geom, styles) {\n\n    var style = styles[geom.fontName];\n    var textDiv = document.createElement('div');\n    textDivs.push(textDiv);\n    if (isAllWhitespace(geom.str)) {\n      textDiv.dataset.isWhitespace = true;\n      return;\n    }\n///jsw style\n    var tx = PDFJS.Util.transform(viewport.transform, geom.transform);\n    var angle = Math.atan2(tx[1], tx[0]);\n    if (style.vertical) {\n      angle += Math.PI / 2;\n    }\n    var fontHeight = Math.sqrt((tx[2] * tx[2]) + (tx[3] * tx[3]));\n    var fontAscent = fontHeight;\n    if (style.ascent) {\n      fontAscent = style.ascent * fontAscent;\n    } else if (style.descent) {\n      fontAscent = (1 + style.descent) * fontAscent;\n    }\n\n    var left;\n    var top;\n    if (angle === 0) {\n      left = tx[4];\n      top = tx[5] - fontAscent;\n    } else {\n      left = tx[4] + (fontAscent * Math.sin(angle));\n      top = tx[5] - (fontAscent * Math.cos(angle));\n    }\n    textDiv.style.left = left + 'px';\n    textDiv.style.top = top + 'px';\n    textDiv.style.fontSize = fontHeight + 'px';\n    textDiv.style.fontFamily = style.fontFamily;\n\n    textDiv.textContent = geom.str;\n    // |fontName| is only used by the Font Inspector. This test will succeed\n    // when e.g. the Font Inspector is off but the Stepper is on, but it's\n    // not worth the effort to do a more accurate test.\n    if (PDFJS.pdfBug) {\n      textDiv.dataset.fontName = geom.fontName;\n    }\n    // Storing into dataset will convert number into string.\n    if (angle !== 0) {\n      textDiv.dataset.angle = angle * (180 / Math.PI);\n    }\n    // We don't bother scaling single-char text divs, because it has very\n    // little effect on text highlighting. This makes scrolling on docs with\n    // lots of such divs a lot faster.\n    if (geom.str.length > 1) {\n      if (style.vertical) {\n        textDiv.dataset.canvasWidth = geom.height * viewport.scale;\n      } else {\n        textDiv.dataset.canvasWidth = geom.width * viewport.scale;\n      }\n    }\n  }\n\n  function render(task) {\n\n    if (task._canceled) {\n      return;\n    }\n    var textLayerFrag = task._container;\n    var textDivs = task._textDivs;\n    var capability = task._capability;\n    var textDivsLength = textDivs.length;\n\n    // No point in rendering many divs as it would make the browser\n    // unusable even after the divs are rendered.\n    if (textDivsLength > MAX_TEXT_DIVS_TO_RENDER) {\n      capability.resolve();\n      return;\n    }\n\n    var canvas = document.createElement('canvas');\n    canvas.mozOpaque = true;\n    var ctx = canvas.getContext('2d', {alpha: false});\n///jsw ctx\n\n    var lastFontSize;\n    var lastFontFamily;\n    for (var i = 0; i < textDivsLength; i++) {\n      var textDiv = textDivs[i];\n      if (textDiv.dataset.isWhitespace !== undefined) {\n        continue;\n      }\n\n      var fontSize = textDiv.style.fontSize;\n      var fontFamily = textDiv.style.fontFamily;\n\n      // Only build font string and set to context if different from last.\n      if (fontSize !== lastFontSize || fontFamily !== lastFontFamily) {\n        ctx.font = fontSize + ' ' + fontFamily;\n        lastFontSize = fontSize;\n        lastFontFamily = fontFamily;\n      }\n\n      var width = ctx.measureText(textDiv.textContent).width;\n      if (width > 0) {\n        textLayerFrag.appendChild(textDiv);\n        var transform;\n        if (textDiv.dataset.canvasWidth !== undefined) {\n          // Dataset values come of type string.\n          var textScale = textDiv.dataset.canvasWidth / width;\n          transform = 'scaleX(' + textScale + ')';\n        } else {\n          transform = '';\n        }\n        var rotation = textDiv.dataset.angle;\n        if (rotation) {\n          transform = 'rotate(' + rotation + 'deg) ' + transform;\n        }\n        if (transform) {\n          PDFJS.CustomStyle.setProp('transform' , textDiv, transform);\n        }\n      }\n    }\n    capability.resolve();\n  }\n\n  /**\n   * Text layer rendering task.\n   *\n   * @param {TextContent} textContent\n   * @param {HTMLElement} container\n   * @param {PDFJS.PageViewport} viewport\n   * @param {Array} textDivs\n   * @private\n   */\n  function TextLayerRenderTask(textContent, container, viewport, textDivs) {\n\n    this._textContent = textContent;\n    this._container = container;\n    this._viewport = viewport;\n    textDivs = textDivs || [];\n    this._textDivs = textDivs;\n///jsw this\n    this._canceled = false;\n    this._capability = createPromiseCapability();\n    this._renderTimer = null;\n  }\n  TextLayerRenderTask.prototype = {\n    get promise() {\n      return this._capability.promise;\n    },\n\n    cancel: function TextLayer_cancel() {\n\n      this._canceled = true;\n      if (this._renderTimer !== null) {\n        clearTimeout(this._renderTimer);\n        this._renderTimer = null;\n      }\n      this._capability.reject('canceled');\n    },\n\n    _render: function TextLayer_render(timeout) {\n\n      var textItems = this._textContent.items;\n      var styles = this._textContent.styles;\n      var textDivs = this._textDivs;\n      var viewport = this._viewport;\n///jsw this\n\n      for (var i = 0, len = textItems.length; i < len; i++) {\n        appendText(textDivs, viewport, textItems[i], styles);\n      }\n\n      if (!timeout) { // Render right away\n        render(this);\n      } else { // Schedule\n        var self = this;\n        this._renderTimer = setTimeout(function() {\n\n          render(self);\n          self._renderTimer = null;\n        }, timeout);\n      }\n    }\n  };\n\n\n  /**\n   * Starts rendering of the text layer.\n   *\n   * @param {TextLayerRenderParameters} renderParameters\n   * @returns {TextLayerRenderTask}\n   */\n  function renderTextLayer(renderParameters) {\n\n    var task = new TextLayerRenderTask(renderParameters.textContent,\n                                       renderParameters.container,\n                                       renderParameters.viewport,\n                                       renderParameters.textDivs);\n    task._render(renderParameters.timeout);\n    return task;\n  }\n\n  return renderTextLayer;\n})();\n\nPDFJS.renderTextLayer = renderTextLayer;\n\n\nvar SVG_DEFAULTS = {\n  fontStyle: 'normal',\n  fontWeight: 'normal',\n  fillColor: '#000000'\n};\n\nvar convertImgDataToPng = (function convertImgDataToPngClosure() {\n///jsw\n\n  var PNG_HEADER =\n    new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);\n\n  var CHUNK_WRAPPER_SIZE = 12;\n\n  var crcTable = new Int32Array(256);\n  for (var i = 0; i < 256; i++) {\n    var c = i;\n    for (var h = 0; h < 8; h++) {\n      if (c & 1) {\n        c = 0xedB88320 ^ ((c >> 1) & 0x7fffffff);\n      } else {\n        c = (c >> 1) & 0x7fffffff;\n      }\n    }\n    crcTable[i] = c;\n  }\n\n  function crc32(data, start, end) {\n\n    var crc = -1;\n    for (var i = start; i < end; i++) {\n      var a = (crc ^ data[i]) & 0xff;\n      var b = crcTable[a];\n      crc = (crc >>> 8) ^ b;\n    }\n    return crc ^ -1;\n  }\n\n  function writePngChunk(type, body, data, offset) {\n\n    var p = offset;\n    var len = body.length;\n\n    data[p] = len >> 24 & 0xff;\n    data[p + 1] = len >> 16 & 0xff;\n    data[p + 2] = len >> 8 & 0xff;\n    data[p + 3] = len & 0xff;\n    p += 4;\n\n    data[p] = type.charCodeAt(0) & 0xff;\n    data[p + 1] = type.charCodeAt(1) & 0xff;\n    data[p + 2] = type.charCodeAt(2) & 0xff;\n    data[p + 3] = type.charCodeAt(3) & 0xff;\n    p += 4;\n\n    data.set(body, p);\n    p += body.length;\n\n    var crc = crc32(data, offset + 4, p);\n\n    data[p] = crc >> 24 & 0xff;\n    data[p + 1] = crc >> 16 & 0xff;\n    data[p + 2] = crc >> 8 & 0xff;\n    data[p + 3] = crc & 0xff;\n  }\n\n  function adler32(data, start, end) {\n\n    var a = 1;\n    var b = 0;\n    for (var i = start; i < end; ++i) {\n      a = (a + (data[i] & 0xff)) % 65521;\n      b = (b + a) % 65521;\n    }\n    return (b << 16) | a;\n  }\n\n  function encode(imgData, kind) {\n\n    var width = imgData.width;\n    var height = imgData.height;\n    var bitDepth, colorType, lineSize;\n    var bytes = imgData.data;\n\n    switch (kind) {\n      case ImageKind.GRAYSCALE_1BPP:\n        colorType = 0;\n        bitDepth = 1;\n        lineSize = (width + 7) >> 3;\n        break;\n      case ImageKind.RGB_24BPP:\n        colorType = 2;\n        bitDepth = 8;\n        lineSize = width * 3;\n        break;\n      case ImageKind.RGBA_32BPP:\n        colorType = 6;\n        bitDepth = 8;\n        lineSize = width * 4;\n        break;\n      default:\n        throw new Error('invalid format');\n    }\n\n    // prefix every row with predictor 0\n    var literals = new Uint8Array((1 + lineSize) * height);\n    var offsetLiterals = 0, offsetBytes = 0;\n    var y, i;\n    for (y = 0; y < height; ++y) {\n      literals[offsetLiterals++] = 0; // no prediction\n      literals.set(bytes.subarray(offsetBytes, offsetBytes + lineSize),\n                   offsetLiterals);\n      offsetBytes += lineSize;\n      offsetLiterals += lineSize;\n    }\n\n    if (kind === ImageKind.GRAYSCALE_1BPP) {\n      // inverting for B/W\n      offsetLiterals = 0;\n      for (y = 0; y < height; y++) {\n        offsetLiterals++; // skipping predictor\n        for (i = 0; i < lineSize; i++) {\n          literals[offsetLiterals++] ^= 0xFF;\n        }\n      }\n    }\n\n    var ihdr = new Uint8Array([\n      width >> 24 & 0xff,\n      width >> 16 & 0xff,\n      width >> 8 & 0xff,\n      width & 0xff,\n      height >> 24 & 0xff,\n      height >> 16 & 0xff,\n      height >> 8 & 0xff,\n      height & 0xff,\n      bitDepth, // bit depth\n      colorType, // color type\n      0x00, // compression method\n      0x00, // filter method\n      0x00 // interlace method\n    ]);\n\n    var len = literals.length;\n    var maxBlockLength = 0xFFFF;\n\n    var deflateBlocks = Math.ceil(len / maxBlockLength);\n    var idat = new Uint8Array(2 + len + deflateBlocks * 5 + 4);\n    var pi = 0;\n    idat[pi++] = 0x78; // compression method and flags\n    idat[pi++] = 0x9c; // flags\n\n    var pos = 0;\n    while (len > maxBlockLength) {\n      // writing non-final DEFLATE blocks type 0 and length of 65535\n      idat[pi++] = 0x00;\n      idat[pi++] = 0xff;\n      idat[pi++] = 0xff;\n      idat[pi++] = 0x00;\n      idat[pi++] = 0x00;\n      idat.set(literals.subarray(pos, pos + maxBlockLength), pi);\n      pi += maxBlockLength;\n      pos += maxBlockLength;\n      len -= maxBlockLength;\n    }\n\n    // writing non-final DEFLATE blocks type 0\n    idat[pi++] = 0x01;\n    idat[pi++] = len & 0xff;\n    idat[pi++] = len >> 8 & 0xff;\n    idat[pi++] = (~len & 0xffff) & 0xff;\n    idat[pi++] = (~len & 0xffff) >> 8 & 0xff;\n    idat.set(literals.subarray(pos), pi);\n    pi += literals.length - pos;\n\n    var adler = adler32(literals, 0, literals.length); // checksum\n    idat[pi++] = adler >> 24 & 0xff;\n    idat[pi++] = adler >> 16 & 0xff;\n    idat[pi++] = adler >> 8 & 0xff;\n    idat[pi++] = adler & 0xff;\n\n    // PNG will consists: header, IHDR+data, IDAT+data, and IEND.\n    var pngLength = PNG_HEADER.length + (CHUNK_WRAPPER_SIZE * 3) +\n                    ihdr.length + idat.length;\n    var data = new Uint8Array(pngLength);\n    var offset = 0;\n    data.set(PNG_HEADER, offset);\n    offset += PNG_HEADER.length;\n    writePngChunk('IHDR', ihdr, data, offset);\n    offset += CHUNK_WRAPPER_SIZE + ihdr.length;\n    writePngChunk('IDATA', idat, data, offset);\n    offset += CHUNK_WRAPPER_SIZE + idat.length;\n    writePngChunk('IEND', new Uint8Array(0), data, offset);\n\n    return PDFJS.createObjectURL(data, 'image/png');\n  }\n\n  return function convertImgDataToPng(imgData) {\n\n    var kind = (imgData.kind === undefined ?\n                ImageKind.GRAYSCALE_1BPP : imgData.kind);\n    return encode(imgData, kind);\n  };\n})();\n\nvar SVGExtraState = (function SVGExtraStateClosure() {\n\n  function SVGExtraState() {\n\n    this.fontSizeScale = 1;\n    this.fontWeight = SVG_DEFAULTS.fontWeight;\n    this.fontSize = 0;\n\n    this.textMatrix = IDENTITY_MATRIX;\n    this.fontMatrix = FONT_IDENTITY_MATRIX;\n    this.leading = 0;\n\n    // Current point (in user coordinates)\n    this.x = 0;\n    this.y = 0;\n\n    // Start of text line (in text coordinates)\n    this.lineX = 0;\n    this.lineY = 0;\n\n    // Character and word spacing\n    this.charSpacing = 0;\n    this.wordSpacing = 0;\n    this.textHScale = 1;\n    this.textRise = 0;\n\n    // Default foreground and background colors\n    this.fillColor = SVG_DEFAULTS.fillColor;\n    this.strokeColor = '#000000';\n\n    this.fillAlpha = 1;\n    this.strokeAlpha = 1;\n    this.lineWidth = 1;\n    this.lineJoin = '';\n    this.lineCap = '';\n    this.miterLimit = 0;\n\n    this.dashArray = [];\n    this.dashPhase = 0;\n\n    this.dependencies = [];\n\n    // Clipping\n    this.clipId = '';\n    this.pendingClip = false;\n\n    this.maskId = '';\n  }\n\n  SVGExtraState.prototype = {\n    clone: function SVGExtraState_clone() {\n\n      return Object.create(this);\n    },\n    setCurrentPoint: function SVGExtraState_setCurrentPoint(x, y) {\n\n      this.x = x;\n      this.y = y;\n    }\n  };\n  return SVGExtraState;\n})();\n\nvar SVGGraphics = (function SVGGraphicsClosure() {\n\n  function createScratchSVG(width, height) {\n\n    var NS = 'http://www.w3.org/2000/svg';\n    var svg = document.createElementNS(NS, 'svg:svg');\n    svg.setAttributeNS(null, 'version', '1.1');\n    svg.setAttributeNS(null, 'width', width + 'px');\n    svg.setAttributeNS(null, 'height', height + 'px');\n    svg.setAttributeNS(null, 'viewBox', '0 0 ' + width + ' ' + height);\n    return svg;\n  }\n\n  function opListToTree(opList) {\n\n    var opTree = [];\n    var tmp = [];\n    var opListLen = opList.length;\n\n    for (var x = 0; x < opListLen; x++) {\n      if (opList[x].fn === 'save') {\n        opTree.push({'fnId': 92, 'fn': 'group', 'items': []});\n        tmp.push(opTree);\n        opTree = opTree[opTree.length - 1].items;\n        continue;\n      }\n\n      if(opList[x].fn === 'restore') {\n        opTree = tmp.pop();\n      } else {\n        opTree.push(opList[x]);\n      }\n    }\n    return opTree;\n  }\n\n  /**\n   * Formats float number.\n   * @param value {number} number to format.\n   * @returns {string}\n   */\n  function pf(value) {\n\n    if (value === (value | 0)) { // integer number\n      return value.toString();\n    }\n    var s = value.toFixed(10);\n    var i = s.length - 1;\n    if (s[i] !== '0') {\n      return s;\n    }\n    // removing trailing zeros\n    do {\n      i--;\n    } while (s[i] === '0');\n    return s.substr(0, s[i] === '.' ? i : i + 1);\n  }\n\n  /**\n   * Formats transform matrix. The standard rotation, scale and translate\n   * matrices are replaced by their shorter forms, and for identity matrix\n   * returns empty string to save the memory.\n   * @param m {Array} matrix to format.\n   * @returns {string}\n   */\n  function pm(m) {\n\n    if (m[4] === 0 && m[5] === 0) {\n      if (m[1] === 0 && m[2] === 0) {\n        if (m[0] === 1 && m[3] === 1) {\n          return '';\n        }\n        return 'scale(' + pf(m[0]) + ' ' + pf(m[3]) + ')';\n      }\n      if (m[0] === m[3] && m[1] === -m[2]) {\n        var a = Math.acos(m[0]) * 180 / Math.PI;\n        return 'rotate(' + pf(a) + ')';\n      }\n    } else {\n      if (m[0] === 1 && m[1] === 0 && m[2] === 0 && m[3] === 1) {\n        return 'translate(' + pf(m[4]) + ' ' + pf(m[5]) + ')';\n      }\n    }\n    return 'matrix(' + pf(m[0]) + ' ' + pf(m[1]) + ' ' + pf(m[2]) + ' ' +\n      pf(m[3]) + ' ' + pf(m[4]) + ' ' + pf(m[5]) + ')';\n  }\n\n  function SVGGraphics(commonObjs, objs) {\n///jsw\n\n    this.current = new SVGExtraState();\n    this.transformMatrix = IDENTITY_MATRIX; // Graphics state matrix\n    this.transformStack = [];\n    this.extraStack = [];\n    this.commonObjs = commonObjs;\n///jsw this\n    this.objs = objs;\n    this.pendingEOFill = false;\n\n    this.embedFonts = false;\n    this.embeddedFonts = {};\n    this.cssStyle = null;\n  }\n\n  var NS = 'http://www.w3.org/2000/svg';\n  var XML_NS = 'http://www.w3.org/XML/1998/namespace';\n  var XLINK_NS = 'http://www.w3.org/1999/xlink';\n  var LINE_CAP_STYLES = ['butt', 'round', 'square'];\n  var LINE_JOIN_STYLES = ['miter', 'round', 'bevel'];\n  var clipCount = 0;\n  var maskCount = 0;\n\n  SVGGraphics.prototype = {\n    save: function SVGGraphics_save() {\n\n      this.transformStack.push(this.transformMatrix);\n      var old = this.current;\n///jsw this\n      this.extraStack.push(old);\n      this.current = old.clone();\n    },\n\n    restore: function SVGGraphics_restore() {\n\n      this.transformMatrix = this.transformStack.pop();\n      this.current = this.extraStack.pop();\n///jsw this\n\n      this.tgrp = document.createElementNS(NS, 'svg:g');\n      this.tgrp.setAttributeNS(null, 'transform', pm(this.transformMatrix));\n      this.pgrp.appendChild(this.tgrp);\n    },\n\n    group: function SVGGraphics_group(items) {\n\n      this.save();\n///jsw this\n      this.executeOpTree(items);\n      this.restore();\n    },\n\n    loadDependencies: function SVGGraphics_loadDependencies(operatorList) {\n\n      var fnArray = operatorList.fnArray;\n      var fnArrayLen = fnArray.length;\n      var argsArray = operatorList.argsArray;\n\n      var self = this;\n///jsw this\n      for (var i = 0; i < fnArrayLen; i++) {\n        if (OPS.dependency === fnArray[i]) {\n          var deps = argsArray[i];\n          for (var n = 0, nn = deps.length; n < nn; n++) {\n            var obj = deps[n];\n            var common = obj.substring(0, 2) === 'g_';\n            var promise;\n            if (common) {\n              promise = new Promise(function(resolve) {\n\n                self.commonObjs.get(obj, resolve);\n              });\n            } else {\n              promise = new Promise(function(resolve) {\n\n                self.objs.get(obj, resolve);\n              });\n            }\n            this.current.dependencies.push(promise);\n          }\n        }\n      }\n      return Promise.all(this.current.dependencies);\n    },\n\n    transform: function SVGGraphics_transform(a, b, c, d, e, f) {\n\n      var transformMatrix = [a, b, c, d, e, f];\n      this.transformMatrix = PDFJS.Util.transform(this.transformMatrix,\n                                                  transformMatrix);\n\n      this.tgrp = document.createElementNS(NS, 'svg:g');\n///jsw this\n      this.tgrp.setAttributeNS(null, 'transform', pm(this.transformMatrix));\n    },\n\n    getSVG: function SVGGraphics_getSVG(operatorList, viewport) {\n\n      this.svg = createScratchSVG(viewport.width, viewport.height);\n      this.viewport = viewport;\n\n      return this.loadDependencies(operatorList).then(function () {\n\n        this.transformMatrix = IDENTITY_MATRIX;\n        this.pgrp = document.createElementNS(NS, 'svg:g'); // Parent group\n        this.pgrp.setAttributeNS(null, 'transform', pm(viewport.transform));\n        this.tgrp = document.createElementNS(NS, 'svg:g'); // Transform group\n        this.tgrp.setAttributeNS(null, 'transform', pm(this.transformMatrix));\n        this.defs = document.createElementNS(NS, 'svg:defs');\n        this.pgrp.appendChild(this.defs);\n        this.pgrp.appendChild(this.tgrp);\n        this.svg.appendChild(this.pgrp);\n///jsw this\n        var opTree = this.convertOpList(operatorList);\n        this.executeOpTree(opTree);\n        return this.svg;\n      }.bind(this));\n    },\n\n    convertOpList: function SVGGraphics_convertOpList(operatorList) {\n\n      var argsArray = operatorList.argsArray;\n      var fnArray = operatorList.fnArray;\n      var fnArrayLen  = fnArray.length;\n      var REVOPS = [];\n      var opList = [];\n\n      for (var op in OPS) {\n        REVOPS[OPS[op]] = op;\n      }\n\n      for (var x = 0; x < fnArrayLen; x++) {\n        var fnId = fnArray[x];\n        opList.push({'fnId' : fnId, 'fn': REVOPS[fnId], 'args': argsArray[x]});\n      }\n      return opListToTree(opList);\n    },\n\n    executeOpTree: function SVGGraphics_executeOpTree(opTree) {\n\n      var opTreeLen = opTree.length;\n      for(var x = 0; x < opTreeLen; x++) {\n        var fn = opTree[x].fn;\n        var fnId = opTree[x].fnId;\n        var args = opTree[x].args;\n\n        switch (fnId | 0) {\n          case OPS.beginText:\n            this.beginText();\n            break;\n          case OPS.setLeading:\n            this.setLeading(args);\n            break;\n          case OPS.setLeadingMoveText:\n            this.setLeadingMoveText(args[0], args[1]);\n            break;\n          case OPS.setFont:\n            this.setFont(args);\n            break;\n          case OPS.showText:\n            this.showText(args[0]);\n            break;\n          case OPS.showSpacedText:\n            this.showText(args[0]);\n            break;\n          case OPS.endText:\n            this.endText();\n            break;\n          case OPS.moveText:\n            this.moveText(args[0], args[1]);\n            break;\n          case OPS.setCharSpacing:\n            this.setCharSpacing(args[0]);\n            break;\n          case OPS.setWordSpacing:\n            this.setWordSpacing(args[0]);\n            break;\n          case OPS.setHScale:\n            this.setHScale(args[0]);\n            break;\n          case OPS.setTextMatrix:\n            this.setTextMatrix(args[0], args[1], args[2],\n                               args[3], args[4], args[5]);\n            break;\n          case OPS.setLineWidth:\n            this.setLineWidth(args[0]);\n            break;\n          case OPS.setLineJoin:\n            this.setLineJoin(args[0]);\n            break;\n          case OPS.setLineCap:\n            this.setLineCap(args[0]);\n            break;\n          case OPS.setMiterLimit:\n            this.setMiterLimit(args[0]);\n            break;\n          case OPS.setFillRGBColor:\n            this.setFillRGBColor(args[0], args[1], args[2]);\n            break;\n          case OPS.setStrokeRGBColor:\n            this.setStrokeRGBColor(args[0], args[1], args[2]);\n            break;\n          case OPS.setDash:\n            this.setDash(args[0], args[1]);\n            break;\n          case OPS.setGState:\n            this.setGState(args[0]);\n            break;\n          case OPS.fill:\n            this.fill();\n            break;\n          case OPS.eoFill:\n            this.eoFill();\n            break;\n          case OPS.stroke:\n            this.stroke();\n            break;\n          case OPS.fillStroke:\n            this.fillStroke();\n            break;\n          case OPS.eoFillStroke:\n            this.eoFillStroke();\n            break;\n          case OPS.clip:\n            this.clip('nonzero');\n            break;\n          case OPS.eoClip:\n            this.clip('evenodd');\n            break;\n          case OPS.paintSolidColorImageMask:\n            this.paintSolidColorImageMask();\n            break;\n          case OPS.paintJpegXObject:\n            this.paintJpegXObject(args[0], args[1], args[2]);\n            break;\n          case OPS.paintImageXObject:\n            this.paintImageXObject(args[0]);\n            break;\n          case OPS.paintInlineImageXObject:\n            this.paintInlineImageXObject(args[0]);\n            break;\n          case OPS.paintImageMaskXObject:\n            this.paintImageMaskXObject(args[0]);\n            break;\n          case OPS.paintFormXObjectBegin:\n            this.paintFormXObjectBegin(args[0], args[1]);\n            break;\n          case OPS.paintFormXObjectEnd:\n            this.paintFormXObjectEnd();\n            break;\n          case OPS.closePath:\n            this.closePath();\n            break;\n          case OPS.closeStroke:\n            this.closeStroke();\n            break;\n          case OPS.closeFillStroke:\n            this.closeFillStroke();\n            break;\n          case OPS.nextLine:\n            this.nextLine();\n            break;\n          case OPS.transform:\n            this.transform(args[0], args[1], args[2], args[3],\n                           args[4], args[5]);\n            break;\n          case OPS.constructPath:\n            this.constructPath(args[0], args[1]);\n            break;\n          case OPS.endPath:\n            this.endPath();\n            break;\n          case 92:\n            this.group(opTree[x].items);\n            break;\n          default:\n            warn('Unimplemented method '+ fn);\n            break;\n        }\n      }\n    },\n\n    setWordSpacing: function SVGGraphics_setWordSpacing(wordSpacing) {\n\n      this.current.wordSpacing = wordSpacing;\n    },\n\n    setCharSpacing: function SVGGraphics_setCharSpacing(charSpacing) {\n\n      this.current.charSpacing = charSpacing;\n    },\n\n    nextLine: function SVGGraphics_nextLine() {\n\n      this.moveText(0, this.current.leading);\n    },\n\n    setTextMatrix: function SVGGraphics_setTextMatrix(a, b, c, d, e, f) {\n\n      var current = this.current;\n      this.current.textMatrix = this.current.lineMatrix = [a, b, c, d, e, f];\n\n      this.current.x = this.current.lineX = 0;\n      this.current.y = this.current.lineY = 0;\n///jsw this\n\n      current.xcoords = [];\n      current.tspan = document.createElementNS(NS, 'svg:tspan');\n      current.tspan.setAttributeNS(null, 'font-family', current.fontFamily);\n      current.tspan.setAttributeNS(null, 'font-size',\n                                   pf(current.fontSize) + 'px');\n      current.tspan.setAttributeNS(null, 'y', pf(-current.y));\n\n      current.txtElement = document.createElementNS(NS, 'svg:text');\n      current.txtElement.appendChild(current.tspan);\n    },\n\n    beginText: function SVGGraphics_beginText() {\n\n      this.current.x = this.current.lineX = 0;\n      this.current.y = this.current.lineY = 0;\n      this.current.textMatrix = IDENTITY_MATRIX;\n      this.current.lineMatrix = IDENTITY_MATRIX;\n      this.current.tspan = document.createElementNS(NS, 'svg:tspan');\n      this.current.txtElement = document.createElementNS(NS, 'svg:text');\n      this.current.txtgrp = document.createElementNS(NS, 'svg:g');\n///jsw this\n      this.current.xcoords = [];\n    },\n\n    moveText: function SVGGraphics_moveText(x, y) {\n\n      var current = this.current;\n      this.current.x = this.current.lineX += x;\n      this.current.y = this.current.lineY += y;\n\n      current.xcoords = [];\n///jsw this\n      current.tspan = document.createElementNS(NS, 'svg:tspan');\n      current.tspan.setAttributeNS(null, 'font-family', current.fontFamily);\n      current.tspan.setAttributeNS(null, 'font-size',\n                                   pf(current.fontSize) + 'px');\n      current.tspan.setAttributeNS(null, 'y', pf(-current.y));\n    },\n\n    showText: function SVGGraphics_showText(glyphs) {\n\n      var current = this.current;\n      var font = current.font;\n      var fontSize = current.fontSize;\n\n      if (fontSize === 0) {\n        return;\n      }\n\n      var charSpacing = current.charSpacing;\n      var wordSpacing = current.wordSpacing;\n      var fontDirection = current.fontDirection;\n      var textHScale = current.textHScale * fontDirection;\n      var glyphsLength = glyphs.length;\n      var vertical = font.vertical;\n      var widthAdvanceScale = fontSize * current.fontMatrix[0];\n\n      var x = 0, i;\n      for (i = 0; i < glyphsLength; ++i) {\n        var glyph = glyphs[i];\n        if (glyph === null) {\n          // word break\n          x += fontDirection * wordSpacing;\n          continue;\n        } else if (isNum(glyph)) {\n          x += -glyph * fontSize * 0.001;\n          continue;\n        }\n        current.xcoords.push(current.x + x * textHScale);\n\n        var width = glyph.width;\n        var character = glyph.fontChar;\n        var charWidth = width * widthAdvanceScale + charSpacing * fontDirection;\n        x += charWidth;\n\n        current.tspan.textContent += character;\n      }\n      if (vertical) {\n        current.y -= x * textHScale;\n      } else {\n        current.x += x * textHScale;\n      }\n\n      current.tspan.setAttributeNS(null, 'x',\n                                   current.xcoords.map(pf).join(' '));\n      current.tspan.setAttributeNS(null, 'y', pf(-current.y));\n      current.tspan.setAttributeNS(null, 'font-family', current.fontFamily);\n      current.tspan.setAttributeNS(null, 'font-size',\n                                   pf(current.fontSize) + 'px');\n      if (current.fontStyle !== SVG_DEFAULTS.fontStyle) {\n        current.tspan.setAttributeNS(null, 'font-style', current.fontStyle);\n      }\n      if (current.fontWeight !== SVG_DEFAULTS.fontWeight) {\n        current.tspan.setAttributeNS(null, 'font-weight', current.fontWeight);\n      }\n      if (current.fillColor !== SVG_DEFAULTS.fillColor) {\n        current.tspan.setAttributeNS(null, 'fill', current.fillColor);\n      }\n\n      current.txtElement.setAttributeNS(null, 'transform',\n                                        pm(current.textMatrix) +\n                                        ' scale(1, -1)' );\n      current.txtElement.setAttributeNS(XML_NS, 'xml:space', 'preserve');\n      current.txtElement.appendChild(current.tspan);\n      current.txtgrp.appendChild(current.txtElement);\n///jsw this\n\n      this.tgrp.appendChild(current.txtElement);\n\n    },\n\n    setLeadingMoveText: function SVGGraphics_setLeadingMoveText(x, y) {\n\n      this.setLeading(-y);\n      this.moveText(x, y);\n    },\n\n    addFontStyle: function SVGGraphics_addFontStyle(fontObj) {\n\n      if (!this.cssStyle) {\n        this.cssStyle = document.createElementNS(NS, 'svg:style');\n        this.cssStyle.setAttributeNS(null, 'type', 'text/css');\n        this.defs.appendChild(this.cssStyle);\n///jsw this\n\n      }\n\n      var url = PDFJS.createObjectURL(fontObj.data, fontObj.mimetype);\n      this.cssStyle.textContent +=\n        '@font-face { font-family: \"' + fontObj.loadedName + '\";' +\n        ' src: url(' + url + '); }\\n';\n    },\n\n    setFont: function SVGGraphics_setFont(details) {\n\n      var current = this.current;\n      var fontObj = this.commonObjs.get(details[0]);\n      var size = details[1];\n      this.current.font = fontObj;\n\n      if (this.embedFonts && fontObj.data &&\n          !this.embeddedFonts[fontObj.loadedName]) {\n        this.addFontStyle(fontObj);\n        this.embeddedFonts[fontObj.loadedName] = fontObj;\n      }\n\n      current.fontMatrix = (fontObj.fontMatrix ?\n                            fontObj.fontMatrix : FONT_IDENTITY_MATRIX);\n\n      var bold = fontObj.black ? (fontObj.bold ? 'bolder' : 'bold') :\n                                 (fontObj.bold ? 'bold' : 'normal');\n      var italic = fontObj.italic ? 'italic' : 'normal';\n\n      if (size < 0) {\n        size = -size;\n        current.fontDirection = -1;\n      } else {\n        current.fontDirection = 1;\n      }\n      current.fontSize = size;\n      current.fontFamily = fontObj.loadedName;\n      current.fontWeight = bold;\n      current.fontStyle = italic;\n\n      current.tspan = document.createElementNS(NS, 'svg:tspan');\n      current.tspan.setAttributeNS(null, 'y', pf(-current.y));\n      current.xcoords = [];\n    },\n\n    endText: function SVGGraphics_endText() {\n\n      if (this.current.pendingClip) {\n        this.cgrp.appendChild(this.tgrp);\n        this.pgrp.appendChild(this.cgrp);\n      } else {\n        this.pgrp.appendChild(this.tgrp);\n      }\n      this.tgrp = document.createElementNS(NS, 'svg:g');\n      this.tgrp.setAttributeNS(null, 'transform', pm(this.transformMatrix));\n    },\n\n    // Path properties\n    setLineWidth: function SVGGraphics_setLineWidth(width) {\n\n      this.current.lineWidth = width;\n    },\n    setLineCap: function SVGGraphics_setLineCap(style) {\n\n      this.current.lineCap = LINE_CAP_STYLES[style];\n    },\n    setLineJoin: function SVGGraphics_setLineJoin(style) {\n\n      this.current.lineJoin = LINE_JOIN_STYLES[style];\n    },\n    setMiterLimit: function SVGGraphics_setMiterLimit(limit) {\n\n      this.current.miterLimit = limit;\n    },\n    setStrokeRGBColor: function SVGGraphics_setStrokeRGBColor(r, g, b) {\n\n      var color = Util.makeCssRgb(r, g, b);\n      this.current.strokeColor = color;\n    },\n    setFillRGBColor: function SVGGraphics_setFillRGBColor(r, g, b) {\n\n      var color = Util.makeCssRgb(r, g, b);\n      this.current.fillColor = color;\n      this.current.tspan = document.createElementNS(NS, 'svg:tspan');\n      this.current.xcoords = [];\n    },\n    setDash: function SVGGraphics_setDash(dashArray, dashPhase) {\n\n      this.current.dashArray = dashArray;\n      this.current.dashPhase = dashPhase;\n    },\n\n    constructPath: function SVGGraphics_constructPath(ops, args) {\n\n      var current = this.current;\n      var x = current.x, y = current.y;\n      current.path = document.createElementNS(NS, 'svg:path');\n      var d = [];\n      var opLength = ops.length;\n\n      for (var i = 0, j = 0; i < opLength; i++) {\n        switch (ops[i] | 0) {\n          case OPS.rectangle:\n            x = args[j++];\n            y = args[j++];\n            var width = args[j++];\n            var height = args[j++];\n            var xw = x + width;\n            var yh = y + height;\n            d.push('M', pf(x), pf(y), 'L', pf(xw) , pf(y), 'L', pf(xw), pf(yh),\n                   'L', pf(x), pf(yh), 'Z');\n            break;\n          case OPS.moveTo:\n            x = args[j++];\n            y = args[j++];\n            d.push('M', pf(x), pf(y));\n            break;\n          case OPS.lineTo:\n            x = args[j++];\n            y = args[j++];\n            d.push('L', pf(x) , pf(y));\n            break;\n          case OPS.curveTo:\n            x = args[j + 4];\n            y = args[j + 5];\n            d.push('C', pf(args[j]), pf(args[j + 1]), pf(args[j + 2]),\n                   pf(args[j + 3]), pf(x), pf(y));\n            j += 6;\n            break;\n          case OPS.curveTo2:\n            x = args[j + 2];\n            y = args[j + 3];\n            d.push('C', pf(x), pf(y), pf(args[j]), pf(args[j + 1]),\n                   pf(args[j + 2]), pf(args[j + 3]));\n            j += 4;\n            break;\n          case OPS.curveTo3:\n            x = args[j + 2];\n            y = args[j + 3];\n            d.push('C', pf(args[j]), pf(args[j + 1]), pf(x), pf(y),\n                   pf(x), pf(y));\n            j += 4;\n            break;\n          case OPS.closePath:\n            d.push('Z');\n            break;\n        }\n      }\n      current.path.setAttributeNS(null, 'd', d.join(' '));\n      current.path.setAttributeNS(null, 'stroke-miterlimit',\n                                  pf(current.miterLimit));\n      current.path.setAttributeNS(null, 'stroke-linecap', current.lineCap);\n      current.path.setAttributeNS(null, 'stroke-linejoin', current.lineJoin);\n      current.path.setAttributeNS(null, 'stroke-width',\n                                  pf(current.lineWidth) + 'px');\n      current.path.setAttributeNS(null, 'stroke-dasharray',\n                                  current.dashArray.map(pf).join(' '));\n      current.path.setAttributeNS(null, 'stroke-dashoffset',\n                                  pf(current.dashPhase) + 'px');\n      current.path.setAttributeNS(null, 'fill', 'none');\n///jsw this\n\n      this.tgrp.appendChild(current.path);\n      if (current.pendingClip) {\n        this.cgrp.appendChild(this.tgrp);\n        this.pgrp.appendChild(this.cgrp);\n      } else {\n        this.pgrp.appendChild(this.tgrp);\n      }\n      // Saving a reference in current.element so that it can be addressed\n      // in 'fill' and 'stroke'\n      current.element = current.path;\n      current.setCurrentPoint(x, y);\n    },\n\n    endPath: function SVGGraphics_endPath() {\n\n      var current = this.current;\n      if (current.pendingClip) {\n        this.cgrp.appendChild(this.tgrp);\n        this.pgrp.appendChild(this.cgrp);\n      } else {\n        this.pgrp.appendChild(this.tgrp);\n      }\n///jsw this\n      this.tgrp = document.createElementNS(NS, 'svg:g');\n      this.tgrp.setAttributeNS(null, 'transform', pm(this.transformMatrix));\n    },\n\n    clip: function SVGGraphics_clip(type) {\n\n      var current = this.current;\n      // Add current path to clipping path\n      current.clipId = 'clippath' + clipCount;\n      clipCount++;\n      this.clippath = document.createElementNS(NS, 'svg:clipPath');\n      this.clippath.setAttributeNS(null, 'id', current.clipId);\n      var clipElement = current.element.cloneNode();\n      if (type === 'evenodd') {\n        clipElement.setAttributeNS(null, 'clip-rule', 'evenodd');\n      } else {\n        clipElement.setAttributeNS(null, 'clip-rule', 'nonzero');\n      }\n      this.clippath.setAttributeNS(null, 'transform', pm(this.transformMatrix));\n      this.clippath.appendChild(clipElement);\n      this.defs.appendChild(this.clippath);\n///jsw this\n\n      // Create a new group with that attribute\n      current.pendingClip = true;\n      this.cgrp = document.createElementNS(NS, 'svg:g');\n      this.cgrp.setAttributeNS(null, 'clip-path',\n                               'url(#' + current.clipId + ')');\n      this.pgrp.appendChild(this.cgrp);\n    },\n\n    closePath: function SVGGraphics_closePath() {\n\n      var current = this.current;\n      var d = current.path.getAttributeNS(null, 'd');\n      d += 'Z';\n      current.path.setAttributeNS(null, 'd', d);\n    },\n\n    setLeading: function SVGGraphics_setLeading(leading) {\n\n      this.current.leading = -leading;\n    },\n\n    setTextRise: function SVGGraphics_setTextRise(textRise) {\n\n      this.current.textRise = textRise;\n    },\n\n    setHScale: function SVGGraphics_setHScale(scale) {\n\n      this.current.textHScale = scale / 100;\n    },\n\n    setGState: function SVGGraphics_setGState(states) {\n\n      for (var i = 0, ii = states.length; i < ii; i++) {\n        var state = states[i];\n        var key = state[0];\n        var value = state[1];\n\n        switch (key) {\n          case 'LW':\n            this.setLineWidth(value);\n            break;\n          case 'LC':\n            this.setLineCap(value);\n            break;\n          case 'LJ':\n            this.setLineJoin(value);\n            break;\n          case 'ML':\n            this.setMiterLimit(value);\n            break;\n          case 'D':\n            this.setDash(value[0], value[1]);\n            break;\n          case 'RI':\n            break;\n          case 'FL':\n            break;\n          case 'Font':\n            this.setFont(value);\n            break;\n          case 'CA':\n            break;\n          case 'ca':\n            break;\n          case 'BM':\n            break;\n          case 'SMask':\n            break;\n        }\n      }\n    },\n\n    fill: function SVGGraphics_fill() {\n\n      var current = this.current;\n      current.element.setAttributeNS(null, 'fill', current.fillColor);\n    },\n\n    stroke: function SVGGraphics_stroke() {\n\n      var current = this.current;\n      current.element.setAttributeNS(null, 'stroke', current.strokeColor);\n      current.element.setAttributeNS(null, 'fill', 'none');\n    },\n\n    eoFill: function SVGGraphics_eoFill() {\n\n      var current = this.current;\n      current.element.setAttributeNS(null, 'fill', current.fillColor);\n      current.element.setAttributeNS(null, 'fill-rule', 'evenodd');\n    },\n\n    fillStroke: function SVGGraphics_fillStroke() {\n\n      // Order is important since stroke wants fill to be none.\n      // First stroke, then if fill needed, it will be overwritten.\n      this.stroke();\n      this.fill();\n    },\n\n    eoFillStroke: function SVGGraphics_eoFillStroke() {\n\n      this.current.element.setAttributeNS(null, 'fill-rule', 'evenodd');\n      this.fillStroke();\n    },\n\n    closeStroke: function SVGGraphics_closeStroke() {\n\n      this.closePath();\n      this.stroke();\n    },\n\n    closeFillStroke: function SVGGraphics_closeFillStroke() {\n\n      this.closePath();\n      this.fillStroke();\n    },\n\n    paintSolidColorImageMask:\n        function SVGGraphics_paintSolidColorImageMask() {\n\n      var current = this.current;\n      var rect = document.createElementNS(NS, 'svg:rect');\n      rect.setAttributeNS(null, 'x', '0');\n      rect.setAttributeNS(null, 'y', '0');\n      rect.setAttributeNS(null, 'width', '1px');\n      rect.setAttributeNS(null, 'height', '1px');\n      rect.setAttributeNS(null, 'fill', current.fillColor);\n      this.tgrp.appendChild(rect);\n    },\n\n    paintJpegXObject: function SVGGraphics_paintJpegXObject(objId, w, h) {\n\n      var current = this.current;\n      var imgObj = this.objs.get(objId);\n      var imgEl = document.createElementNS(NS, 'svg:image');\n      imgEl.setAttributeNS(XLINK_NS, 'xlink:href', imgObj.src);\n      imgEl.setAttributeNS(null, 'width', imgObj.width + 'px');\n      imgEl.setAttributeNS(null, 'height', imgObj.height + 'px');\n      imgEl.setAttributeNS(null, 'x', '0');\n      imgEl.setAttributeNS(null, 'y', pf(-h));\n      imgEl.setAttributeNS(null, 'transform',\n                           'scale(' + pf(1 / w) + ' ' + pf(-1 / h) + ')');\n\n      this.tgrp.appendChild(imgEl);\n      if (current.pendingClip) {\n        this.cgrp.appendChild(this.tgrp);\n        this.pgrp.appendChild(this.cgrp);\n      } else {\n        this.pgrp.appendChild(this.tgrp);\n      }\n    },\n\n    paintImageXObject: function SVGGraphics_paintImageXObject(objId) {\n\n      var imgData = this.objs.get(objId);\n      if (!imgData) {\n        warn('Dependent image isn\\'t ready yet');\n        return;\n      }\n      this.paintInlineImageXObject(imgData);\n    },\n\n    paintInlineImageXObject:\n        function SVGGraphics_paintInlineImageXObject(imgData, mask) {\n\n      var current = this.current;\n      var width = imgData.width;\n      var height = imgData.height;\n\n      var imgSrc = convertImgDataToPng(imgData);\n      var cliprect = document.createElementNS(NS, 'svg:rect');\n      cliprect.setAttributeNS(null, 'x', '0');\n      cliprect.setAttributeNS(null, 'y', '0');\n      cliprect.setAttributeNS(null, 'width', pf(width));\n      cliprect.setAttributeNS(null, 'height', pf(height));\n      current.element = cliprect;\n      this.clip('nonzero');\n      var imgEl = document.createElementNS(NS, 'svg:image');\n      imgEl.setAttributeNS(XLINK_NS, 'xlink:href', imgSrc);\n      imgEl.setAttributeNS(null, 'x', '0');\n      imgEl.setAttributeNS(null, 'y', pf(-height));\n      imgEl.setAttributeNS(null, 'width', pf(width) + 'px');\n      imgEl.setAttributeNS(null, 'height', pf(height) + 'px');\n      imgEl.setAttributeNS(null, 'transform',\n                           'scale(' + pf(1 / width) + ' ' +\n                           pf(-1 / height) + ')');\n      if (mask) {\n        mask.appendChild(imgEl);\n      } else {\n        this.tgrp.appendChild(imgEl);\n      }\n      if (current.pendingClip) {\n        this.cgrp.appendChild(this.tgrp);\n        this.pgrp.appendChild(this.cgrp);\n      } else {\n        this.pgrp.appendChild(this.tgrp);\n      }\n    },\n\n    paintImageMaskXObject:\n        function SVGGraphics_paintImageMaskXObject(imgData) {\n\n      var current = this.current;\n      var width = imgData.width;\n      var height = imgData.height;\n      var fillColor = current.fillColor;\n\n      current.maskId = 'mask' + maskCount++;\n      var mask = document.createElementNS(NS, 'svg:mask');\n      mask.setAttributeNS(null, 'id', current.maskId);\n\n      var rect = document.createElementNS(NS, 'svg:rect');\n      rect.setAttributeNS(null, 'x', '0');\n      rect.setAttributeNS(null, 'y', '0');\n      rect.setAttributeNS(null, 'width', pf(width));\n      rect.setAttributeNS(null, 'height', pf(height));\n      rect.setAttributeNS(null, 'fill', fillColor);\n      rect.setAttributeNS(null, 'mask', 'url(#' + current.maskId +')');\n      this.defs.appendChild(mask);\n      this.tgrp.appendChild(rect);\n///jsw this\n\n      this.paintInlineImageXObject(imgData, mask);\n    },\n\n    paintFormXObjectBegin:\n        function SVGGraphics_paintFormXObjectBegin(matrix, bbox) {\n\n      this.save();\n\n      if (isArray(matrix) && matrix.length === 6) {\n        this.transform(matrix[0], matrix[1], matrix[2],\n                       matrix[3], matrix[4], matrix[5]);\n      }\n\n      if (isArray(bbox) && bbox.length === 4) {\n        var width = bbox[2] - bbox[0];\n        var height = bbox[3] - bbox[1];\n\n        var cliprect = document.createElementNS(NS, 'svg:rect');\n        cliprect.setAttributeNS(null, 'x', bbox[0]);\n        cliprect.setAttributeNS(null, 'y', bbox[1]);\n        cliprect.setAttributeNS(null, 'width', pf(width));\n        cliprect.setAttributeNS(null, 'height', pf(height));\n        this.current.element = cliprect;\n        this.clip('nonzero');\n        this.endPath();\n///jsw this\n      }\n    },\n\n    paintFormXObjectEnd:\n        function SVGGraphics_paintFormXObjectEnd() {\n\n      this.restore();\n    }\n  };\n  return SVGGraphics;\n})();\n\nPDFJS.SVGGraphics = SVGGraphics;\n\n\n}).call((typeof window === 'undefined') ? this : window);\n\nif (!PDFJS.workerSrc && typeof document !== 'undefined') {\n  // workerSrc is not set -- using last script url to define default location\n  PDFJS.workerSrc = (function () {\n\n    'use strict';\n    var pdfJsSrc = document.currentScript.src;\n    return pdfJsSrc && pdfJsSrc.replace(/\\.js$/i, '.worker.js');\n  })();\n}\n\n///jsw_global PDFJS\n";
/* Copyright 2012 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// annotated for js-watermark preprocessor

/*jshint globalstrict: false */
/* globals PDFJS */

// Initializing PDFJS global object (if still undefined)
if (typeof PDFJS === 'undefined') {
  (typeof window !== 'undefined' ? window : this).PDFJS = {};
}

PDFJS.version = '1.3.91';
PDFJS.build = 'd1e83b5';

(function pdfjsWrapper() {

  // Use strict in our context only - users might not want it
  'use strict';



var globalScope = (typeof window === 'undefined') ? this : window;

var isWorker = (typeof window === 'undefined');

var FONT_IDENTITY_MATRIX = [0.001, 0, 0, 0.001, 0, 0];

var TextRenderingMode = {
  FILL: 0,
  STROKE: 1,
  FILL_STROKE: 2,
  INVISIBLE: 3,
  FILL_ADD_TO_PATH: 4,
  STROKE_ADD_TO_PATH: 5,
  FILL_STROKE_ADD_TO_PATH: 6,
  ADD_TO_PATH: 7,
  FILL_STROKE_MASK: 3,
  ADD_TO_PATH_FLAG: 4
};

var ImageKind = {
  GRAYSCALE_1BPP: 1,
  RGB_24BPP: 2,
  RGBA_32BPP: 3
};

var AnnotationType = {
  TEXT: 1,
  LINK: 2,
  FREETEXT: 3,
  LINE: 4,
  SQUARE: 5,
  CIRCLE: 6,
  POLYGON: 7,
  POLYLINE: 8,
  HIGHLIGHT: 9,
  UNDERLINE: 10,
  SQUIGGLY: 11,
  STRIKEOUT: 12,
  STAMP: 13,
  CARET: 14,
  INK: 15,
  POPUP: 16,
  FILEATTACHMENT: 17,
  SOUND: 18,
  MOVIE: 19,
  WIDGET: 20,
  SCREEN: 21,
  PRINTERMARK: 22,
  TRAPNET: 23,
  WATERMARK: 24,
  THREED: 25,
  REDACT: 26
};

var AnnotationFlag = {
  INVISIBLE: 0x01,
  HIDDEN: 0x02,
  PRINT: 0x04,
  NOZOOM: 0x08,
  NOROTATE: 0x10,
  NOVIEW: 0x20,
  READONLY: 0x40,
  LOCKED: 0x80,
  TOGGLENOVIEW: 0x100,
  LOCKEDCONTENTS: 0x200
};

var AnnotationBorderStyleType = {
  SOLID: 1,
  DASHED: 2,
  BEVELED: 3,
  INSET: 4,
  UNDERLINE: 5
};

var StreamType = {
  UNKNOWN: 0,
  FLATE: 1,
  LZW: 2,
  DCT: 3,
  JPX: 4,
  JBIG: 5,
  A85: 6,
  AHX: 7,
  CCF: 8,
  RL: 9
};

var FontType = {
  UNKNOWN: 0,
  TYPE1: 1,
  TYPE1C: 2,
  CIDFONTTYPE0: 3,
  CIDFONTTYPE0C: 4,
  TRUETYPE: 5,
  CIDFONTTYPE2: 6,
  TYPE3: 7,
  OPENTYPE: 8,
  TYPE0: 9,
  MMTYPE1: 10
};

// The global PDFJS object exposes the API
// In production, it will be declared outside a global wrapper
// In development, it will be declared here
if (!globalScope.PDFJS) {
  globalScope.PDFJS = {};
}

globalScope.PDFJS.pdfBug = false;

PDFJS.VERBOSITY_LEVELS = {
  errors: 0,
  warnings: 1,
  infos: 5
};

// All the possible operations for an operator list.
var OPS = PDFJS.OPS = {
  // Intentionally start from 1 so it is easy to spot bad operators that will be
  // 0's.
  dependency: 1,
  setLineWidth: 2,
  setLineCap: 3,
  setLineJoin: 4,
  setMiterLimit: 5,
  setDash: 6,
  setRenderingIntent: 7,
  setFlatness: 8,
  setGState: 9,
  save: 10,
  restore: 11,
  transform: 12,
  moveTo: 13,
  lineTo: 14,
  curveTo: 15,
  curveTo2: 16,
  curveTo3: 17,
  closePath: 18,
  rectangle: 19,
  stroke: 20,
  closeStroke: 21,
  fill: 22,
  eoFill: 23,
  fillStroke: 24,
  eoFillStroke: 25,
  closeFillStroke: 26,
  closeEOFillStroke: 27,
  endPath: 28,
  clip: 29,
  eoClip: 30,
  beginText: 31,
  endText: 32,
  setCharSpacing: 33,
  setWordSpacing: 34,
  setHScale: 35,
  setLeading: 36,
  setFont: 37,
  setTextRenderingMode: 38,
  setTextRise: 39,
  moveText: 40,
  setLeadingMoveText: 41,
  setTextMatrix: 42,
  nextLine: 43,
  showText: 44,
  showSpacedText: 45,
  nextLineShowText: 46,
  nextLineSetSpacingShowText: 47,
  setCharWidth: 48,
  setCharWidthAndBounds: 49,
  setStrokeColorSpace: 50,
  setFillColorSpace: 51,
  setStrokeColor: 52,
  setStrokeColorN: 53,
  setFillColor: 54,
  setFillColorN: 55,
  setStrokeGray: 56,
  setFillGray: 57,
  setStrokeRGBColor: 58,
  setFillRGBColor: 59,
  setStrokeCMYKColor: 60,
  setFillCMYKColor: 61,
  shadingFill: 62,
  beginInlineImage: 63,
  beginImageData: 64,
  endInlineImage: 65,
  paintXObject: 66,
  markPoint: 67,
  markPointProps: 68,
  beginMarkedContent: 69,
  beginMarkedContentProps: 70,
  endMarkedContent: 71,
  beginCompat: 72,
  endCompat: 73,
  paintFormXObjectBegin: 74,
  paintFormXObjectEnd: 75,
  beginGroup: 76,
  endGroup: 77,
  beginAnnotations: 78,
  endAnnotations: 79,
  beginAnnotation: 80,
  endAnnotation: 81,
  paintJpegXObject: 82,
  paintImageMaskXObject: 83,
  paintImageMaskXObjectGroup: 84,
  paintImageXObject: 85,
  paintInlineImageXObject: 86,
  paintInlineImageXObjectGroup: 87,
  paintImageXObjectRepeat: 88,
  paintImageMaskXObjectRepeat: 89,
  paintSolidColorImageMask: 90,
  constructPath: 91
};

// A notice for devs. These are good for things that are helpful to devs, such
// as warning that Workers were disabled, which is important to devs but not
// end users.
function info(msg) {

  if (PDFJS.verbosity >= PDFJS.VERBOSITY_LEVELS.infos) {
    console.log('Info: ' + msg);
  }
}

// Non-fatal warnings.
function warn(msg) {

  if (PDFJS.verbosity >= PDFJS.VERBOSITY_LEVELS.warnings) {
    console.log('Warning: ' + msg);
  }
}

// Deprecated API function -- treated as warnings.
function deprecated(details) {

  warn('Deprecated API usage: ' + details);
}

// Fatal errors that should trigger the fallback UI and halt execution by
// throwing an exception.
function error(msg) {

  if (PDFJS.verbosity >= PDFJS.VERBOSITY_LEVELS.errors) {
    console.log('Error: ' + msg);
    console.log(backtrace());
  }
  throw new Error(msg);
}

function backtrace() {

  try {
    throw new Error();
  } catch (e) {
    return e.stack ? e.stack.split('\n').slice(2).join('\n') : '';
  }
}

function assert(cond, msg) {

  if (!cond) {
    error(msg);
  }
}

var UNSUPPORTED_FEATURES = PDFJS.UNSUPPORTED_FEATURES = {
  unknown: 'unknown',
  forms: 'forms',
  javaScript: 'javaScript',
  smask: 'smask',
  shadingPattern: 'shadingPattern',
  font: 'font'
};

// Combines two URLs. The baseUrl shall be absolute URL. If the url is an
// absolute URL, it will be returned as is.
function combineUrl(baseUrl, url) {

  if (!url) {
    return baseUrl;
  }
  return new URL(url, baseUrl).href;
}

// Validates if URL is safe and allowed, e.g. to avoid XSS.
function isValidUrl(url, allowRelative) {

  if (!url) {
    return false;
  }
  // RFC 3986 (http://tools.ietf.org/html/rfc3986#section-3.1)
  // scheme = ALPHA *( ALPHA / DIGIT / "+" / "-" / "." )
  var protocol = /^[a-z][a-z0-9+\-.]*(?=:)/i.exec(url);
  if (!protocol) {
    return allowRelative;
  }
  protocol = protocol[0].toLowerCase();
  switch (protocol) {
    case 'http':
    case 'https':
    case 'ftp':
    case 'mailto':
    case 'tel':
      return true;
    default:
      return false;
  }
}
PDFJS.isValidUrl = isValidUrl;

function shadow(obj, prop, value) {

  Object.defineProperty(obj, prop, { value: value,
                                     enumerable: true,
                                     configurable: true,
                                     writable: false });
  return value;
}
PDFJS.shadow = shadow;

var LinkTarget = PDFJS.LinkTarget = {
  NONE: 0, // Default value.
  SELF: 1,
  BLANK: 2,
  PARENT: 3,
  TOP: 4,
};
var LinkTargetStringMap = [
  '',
  '_self',
  '_blank',
  '_parent',
  '_top'
];

function isExternalLinkTargetSet() {

  if (PDFJS.openExternalLinksInNewWindow) {
    deprecated('PDFJS.openExternalLinksInNewWindow, please use ' +
               '"PDFJS.externalLinkTarget = PDFJS.LinkTarget.BLANK" instead.');
    if (PDFJS.externalLinkTarget === LinkTarget.NONE) {
      PDFJS.externalLinkTarget = LinkTarget.BLANK;
    }
    // Reset the deprecated parameter, to suppress further warnings.
    PDFJS.openExternalLinksInNewWindow = false;
  }
  switch (PDFJS.externalLinkTarget) {
    case LinkTarget.NONE:
      return false;
    case LinkTarget.SELF:
    case LinkTarget.BLANK:
    case LinkTarget.PARENT:
    case LinkTarget.TOP:
      return true;
  }
  warn('PDFJS.externalLinkTarget is invalid: ' + PDFJS.externalLinkTarget);
  // Reset the external link target, to suppress further warnings.
  PDFJS.externalLinkTarget = LinkTarget.NONE;
  return false;
}
PDFJS.isExternalLinkTargetSet = isExternalLinkTargetSet;

var PasswordResponses = PDFJS.PasswordResponses = {
  NEED_PASSWORD: 1,
  INCORRECT_PASSWORD: 2
};

var PasswordException = (function PasswordExceptionClosure() {

  function PasswordException(msg, code) {

    this.name = 'PasswordException';
    this.message = msg;
    this.code = code;
  }

  PasswordException.prototype = new Error();
  PasswordException.constructor = PasswordException;

  return PasswordException;
})();
PDFJS.PasswordException = PasswordException;

var UnknownErrorException = (function UnknownErrorExceptionClosure() {

  function UnknownErrorException(msg, details) {

    this.name = 'UnknownErrorException';
    this.message = msg;
    this.details = details;
  }

  UnknownErrorException.prototype = new Error();
  UnknownErrorException.constructor = UnknownErrorException;

  return UnknownErrorException;
})();
PDFJS.UnknownErrorException = UnknownErrorException;

var InvalidPDFException = (function InvalidPDFExceptionClosure() {

  function InvalidPDFException(msg) {

    this.name = 'InvalidPDFException';
    this.message = msg;
  }

  InvalidPDFException.prototype = new Error();
  InvalidPDFException.constructor = InvalidPDFException;

  return InvalidPDFException;
})();
PDFJS.InvalidPDFException = InvalidPDFException;

var MissingPDFException = (function MissingPDFExceptionClosure() {

  function MissingPDFException(msg) {

    this.name = 'MissingPDFException';
    this.message = msg;
  }

  MissingPDFException.prototype = new Error();
  MissingPDFException.constructor = MissingPDFException;

  return MissingPDFException;
})();
PDFJS.MissingPDFException = MissingPDFException;

var UnexpectedResponseException =
    (function UnexpectedResponseExceptionClosure() {

  function UnexpectedResponseException(msg, status) {

    this.name = 'UnexpectedResponseException';
    this.message = msg;
    this.status = status;
  }

  UnexpectedResponseException.prototype = new Error();
  UnexpectedResponseException.constructor = UnexpectedResponseException;

  return UnexpectedResponseException;
})();
PDFJS.UnexpectedResponseException = UnexpectedResponseException;

var NotImplementedException = (function NotImplementedExceptionClosure() {

  function NotImplementedException(msg) {

    this.message = msg;
  }

  NotImplementedException.prototype = new Error();
  NotImplementedException.prototype.name = 'NotImplementedException';
  NotImplementedException.constructor = NotImplementedException;

  return NotImplementedException;
})();

var MissingDataException = (function MissingDataExceptionClosure() {

  function MissingDataException(begin, end) {

    this.begin = begin;
    this.end = end;
    this.message = 'Missing data [' + begin + ', ' + end + ')';
  }

  MissingDataException.prototype = new Error();
  MissingDataException.prototype.name = 'MissingDataException';
  MissingDataException.constructor = MissingDataException;

  return MissingDataException;
})();

var XRefParseException = (function XRefParseExceptionClosure() {

  function XRefParseException(msg) {

    this.message = msg;
  }

  XRefParseException.prototype = new Error();
  XRefParseException.prototype.name = 'XRefParseException';
  XRefParseException.constructor = XRefParseException;

  return XRefParseException;
})();


function bytesToString(bytes) {

  assert(bytes !== null && typeof bytes === 'object' &&
         bytes.length !== undefined, 'Invalid argument for bytesToString');
  var length = bytes.length;
  var MAX_ARGUMENT_COUNT = 8192;
  if (length < MAX_ARGUMENT_COUNT) {
    return String.fromCharCode.apply(null, bytes);
  }
  var strBuf = [];
  for (var i = 0; i < length; i += MAX_ARGUMENT_COUNT) {
    var chunkEnd = Math.min(i + MAX_ARGUMENT_COUNT, length);
    var chunk = bytes.subarray(i, chunkEnd);
    strBuf.push(String.fromCharCode.apply(null, chunk));
  }
  return strBuf.join('');
}

function stringToBytes(str) {

  assert(typeof str === 'string', 'Invalid argument for stringToBytes');
  var length = str.length;
  var bytes = new Uint8Array(length);
  for (var i = 0; i < length; ++i) {
    bytes[i] = str.charCodeAt(i) & 0xFF;
  }
  return bytes;
}

function string32(value) {

  return String.fromCharCode((value >> 24) & 0xff, (value >> 16) & 0xff,
                             (value >> 8) & 0xff, value & 0xff);
}

function log2(x) {

  var n = 1, i = 0;
  while (x > n) {
    n <<= 1;
    i++;
  }
  return i;
}

function readInt8(data, start) {

  return (data[start] << 24) >> 24;
}

function readUint16(data, offset) {

  return (data[offset] << 8) | data[offset + 1];
}

function readUint32(data, offset) {

  return ((data[offset] << 24) | (data[offset + 1] << 16) |
         (data[offset + 2] << 8) | data[offset + 3]) >>> 0;
}

// Lazy test the endianness of the platform
// NOTE: This will be 'true' for simulated TypedArrays
function isLittleEndian() {

  var buffer8 = new Uint8Array(2);
  buffer8[0] = 1;
  var buffer16 = new Uint16Array(buffer8.buffer);
  return (buffer16[0] === 1);
}

Object.defineProperty(PDFJS, 'isLittleEndian', {
  configurable: true,
  get: function PDFJS_isLittleEndian() {

    return shadow(PDFJS, 'isLittleEndian', isLittleEndian());
  }
});

  // Lazy test if the userAgent support CanvasTypedArrays
function hasCanvasTypedArrays() {

  var canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1;
  var ctx = canvas.getContext('2d');
  var imageData = ctx.createImageData(1, 1);
  return (typeof imageData.data.buffer !== 'undefined');
}

Object.defineProperty(PDFJS, 'hasCanvasTypedArrays', {
  configurable: true,
  get: function PDFJS_hasCanvasTypedArrays() {

    return shadow(PDFJS, 'hasCanvasTypedArrays', hasCanvasTypedArrays());
  }
});

var Uint32ArrayView = (function Uint32ArrayViewClosure() {


  function Uint32ArrayView(buffer, length) {

    this.buffer = buffer;
    this.byteLength = buffer.length;
    this.length = length === undefined ? (this.byteLength >> 2) : length;
    ensureUint32ArrayViewProps(this.length);
  }
  Uint32ArrayView.prototype = Object.create(null);

  var uint32ArrayViewSetters = 0;
  function createUint32ArrayProp(index) {

    return {
      get: function () {

        var buffer = this.buffer, offset = index << 2;
        return (buffer[offset] | (buffer[offset + 1] << 8) |
          (buffer[offset + 2] << 16) | (buffer[offset + 3] << 24)) >>> 0;
      },
      set: function (value) {

        var buffer = this.buffer, offset = index << 2;
        buffer[offset] = value & 255;
        buffer[offset + 1] = (value >> 8) & 255;
        buffer[offset + 2] = (value >> 16) & 255;
        buffer[offset + 3] = (value >>> 24) & 255;
      }
    };
  }

  function ensureUint32ArrayViewProps(length) {

    while (uint32ArrayViewSetters < length) {
      Object.defineProperty(Uint32ArrayView.prototype,
        uint32ArrayViewSetters,
        createUint32ArrayProp(uint32ArrayViewSetters));
      uint32ArrayViewSetters++;
    }
  }

  return Uint32ArrayView;
})();

var IDENTITY_MATRIX = [1, 0, 0, 1, 0, 0];

var Util = PDFJS.Util = (function UtilClosure() {

  function Util() {
}

  var rgbBuf = ['rgb(', 0, ',', 0, ',', 0, ')'];

  // makeCssRgb() can be called thousands of times. Using |rgbBuf| avoids
  // creating many intermediate strings.
  Util.makeCssRgb = function Util_makeCssRgb(r, g, b) {

    rgbBuf[1] = r;
    rgbBuf[3] = g;
    rgbBuf[5] = b;
    return rgbBuf.join('');
  };

  // Concatenates two transformation matrices together and returns the result.
  Util.transform = function Util_transform(m1, m2) {

    return [
      m1[0] * m2[0] + m1[2] * m2[1],
      m1[1] * m2[0] + m1[3] * m2[1],
      m1[0] * m2[2] + m1[2] * m2[3],
      m1[1] * m2[2] + m1[3] * m2[3],
      m1[0] * m2[4] + m1[2] * m2[5] + m1[4],
      m1[1] * m2[4] + m1[3] * m2[5] + m1[5]
    ];
  };

  // For 2d affine transforms
  Util.applyTransform = function Util_applyTransform(p, m) {

    var xt = p[0] * m[0] + p[1] * m[2] + m[4];
    var yt = p[0] * m[1] + p[1] * m[3] + m[5];
    return [xt, yt];
  };

  Util.applyInverseTransform = function Util_applyInverseTransform(p, m) {

    var d = m[0] * m[3] - m[1] * m[2];
    var xt = (p[0] * m[3] - p[1] * m[2] + m[2] * m[5] - m[4] * m[3]) / d;
    var yt = (-p[0] * m[1] + p[1] * m[0] + m[4] * m[1] - m[5] * m[0]) / d;
    return [xt, yt];
  };

  // Applies the transform to the rectangle and finds the minimum axially
  // aligned bounding box.
  Util.getAxialAlignedBoundingBox =
    function Util_getAxialAlignedBoundingBox(r, m) {


    var p1 = Util.applyTransform(r, m);
    var p2 = Util.applyTransform(r.slice(2, 4), m);
    var p3 = Util.applyTransform([r[0], r[3]], m);
    var p4 = Util.applyTransform([r[2], r[1]], m);
    return [
      Math.min(p1[0], p2[0], p3[0], p4[0]),
      Math.min(p1[1], p2[1], p3[1], p4[1]),
      Math.max(p1[0], p2[0], p3[0], p4[0]),
      Math.max(p1[1], p2[1], p3[1], p4[1])
    ];
  };

  Util.inverseTransform = function Util_inverseTransform(m) {

    var d = m[0] * m[3] - m[1] * m[2];
    return [m[3] / d, -m[1] / d, -m[2] / d, m[0] / d,
      (m[2] * m[5] - m[4] * m[3]) / d, (m[4] * m[1] - m[5] * m[0]) / d];
  };

  // Apply a generic 3d matrix M on a 3-vector v:
  //   | a b c |   | X |
  //   | d e f | x | Y |
  //   | g h i |   | Z |
  // M is assumed to be serialized as [a,b,c,d,e,f,g,h,i],
  // with v as [X,Y,Z]
  Util.apply3dTransform = function Util_apply3dTransform(m, v) {

    return [
      m[0] * v[0] + m[1] * v[1] + m[2] * v[2],
      m[3] * v[0] + m[4] * v[1] + m[5] * v[2],
      m[6] * v[0] + m[7] * v[1] + m[8] * v[2]
    ];
  };

  // This calculation uses Singular Value Decomposition.
  // The SVD can be represented with formula A = USV. We are interested in the
  // matrix S here because it represents the scale values.
  Util.singularValueDecompose2dScale =
    function Util_singularValueDecompose2dScale(m) {


    var transpose = [m[0], m[2], m[1], m[3]];

    // Multiply matrix m with its transpose.
    var a = m[0] * transpose[0] + m[1] * transpose[2];
    var b = m[0] * transpose[1] + m[1] * transpose[3];
    var c = m[2] * transpose[0] + m[3] * transpose[2];
    var d = m[2] * transpose[1] + m[3] * transpose[3];

    // Solve the second degree polynomial to get roots.
    var first = (a + d) / 2;
    var second = Math.sqrt((a + d) * (a + d) - 4 * (a * d - c * b)) / 2;
    var sx = first + second || 1;
    var sy = first - second || 1;

    // Scale values are the square roots of the eigenvalues.
    return [Math.sqrt(sx), Math.sqrt(sy)];
  };

  // Normalize rectangle rect=[x1, y1, x2, y2] so that (x1,y1) < (x2,y2)
  // For coordinate systems whose origin lies in the bottom-left, this
  // means normalization to (BL,TR) ordering. For systems with origin in the
  // top-left, this means (TL,BR) ordering.
  Util.normalizeRect = function Util_normalizeRect(rect) {

    var r = rect.slice(0); // clone rect
    if (rect[0] > rect[2]) {
      r[0] = rect[2];
      r[2] = rect[0];
    }
    if (rect[1] > rect[3]) {
      r[1] = rect[3];
      r[3] = rect[1];
    }
    return r;
  };

  // Returns a rectangle [x1, y1, x2, y2] corresponding to the
  // intersection of rect1 and rect2. If no intersection, returns 'false'
  // The rectangle coordinates of rect1, rect2 should be [x1, y1, x2, y2]
  Util.intersect = function Util_intersect(rect1, rect2) {

    function compare(a, b) {

      return a - b;
    }

    // Order points along the axes
    var orderedX = [rect1[0], rect1[2], rect2[0], rect2[2]].sort(compare),
        orderedY = [rect1[1], rect1[3], rect2[1], rect2[3]].sort(compare),
        result = [];

    rect1 = Util.normalizeRect(rect1);
    rect2 = Util.normalizeRect(rect2);

    // X: first and second points belong to different rectangles?
    if ((orderedX[0] === rect1[0] && orderedX[1] === rect2[0]) ||
        (orderedX[0] === rect2[0] && orderedX[1] === rect1[0])) {
      // Intersection must be between second and third points
      result[0] = orderedX[1];
      result[2] = orderedX[2];
    } else {
      return false;
    }

    // Y: first and second points belong to different rectangles?
    if ((orderedY[0] === rect1[1] && orderedY[1] === rect2[1]) ||
        (orderedY[0] === rect2[1] && orderedY[1] === rect1[1])) {
      // Intersection must be between second and third points
      result[1] = orderedY[1];
      result[3] = orderedY[2];
    } else {
      return false;
    }

    return result;
  };

  Util.sign = function Util_sign(num) {

    return num < 0 ? -1 : 1;
  };

  Util.appendToArray = function Util_appendToArray(arr1, arr2) {

    Array.prototype.push.apply(arr1, arr2);
  };

  Util.prependToArray = function Util_prependToArray(arr1, arr2) {

    Array.prototype.unshift.apply(arr1, arr2);
  };

  Util.extendObj = function extendObj(obj1, obj2) {

    for (var key in obj2) {
      obj1[key] = obj2[key];
    }
  };

  Util.getInheritableProperty = function Util_getInheritableProperty(dict,
                                                                     name) {

    while (dict && !dict.has(name)) {
      dict = dict.get('Parent');
    }
    if (!dict) {
      return null;
    }
    return dict.get(name);
  };

  Util.inherit = function Util_inherit(sub, base, prototype) {

    sub.prototype = Object.create(base.prototype);
    sub.prototype.constructor = sub;
    for (var prop in prototype) {
      sub.prototype[prop] = prototype[prop];
    }
  };

  Util.loadScript = function Util_loadScript(src, callback) {

    var script = document.createElement('script');
    var loaded = false;
    script.setAttribute('src', src);
    if (callback) {
      script.onload = function() {

        if (!loaded) {
          callback();
        }
        loaded = true;
      };
    }
    document.getElementsByTagName('head')[0].appendChild(script);
  };

  return Util;
})();

/**
 * PDF page viewport created based on scale, rotation and offset.
 * @class
 * @alias PDFJS.PageViewport
 */
var PageViewport = PDFJS.PageViewport = (function PageViewportClosure() {

  /**
   * @constructor
   * @private
   * @param viewBox {Array} xMin, yMin, xMax and yMax coordinates.
   * @param scale {number} scale of the viewport.
   * @param rotation {number} rotations of the viewport in degrees.
   * @param offsetX {number} offset X
   * @param offsetY {number} offset Y
   * @param dontFlip {boolean} if true, axis Y will not be flipped.
   */
  function PageViewport(viewBox, scale, rotation, offsetX, offsetY, dontFlip) {

    this.viewBox = viewBox;
    this.scale = scale;
    this.rotation = rotation;
    this.offsetX = offsetX;
    this.offsetY = offsetY;

    // creating transform to convert pdf coordinate system to the normal
    // canvas like coordinates taking in account scale and rotation
    var centerX = (viewBox[2] + viewBox[0]) / 2;
    var centerY = (viewBox[3] + viewBox[1]) / 2;
    var rotateA, rotateB, rotateC, rotateD;
    rotation = rotation % 360;
    rotation = rotation < 0 ? rotation + 360 : rotation;
    switch (rotation) {
      case 180:
        rotateA = -1; rotateB = 0; rotateC = 0; rotateD = 1;
        break;
      case 90:
        rotateA = 0; rotateB = 1; rotateC = 1; rotateD = 0;
        break;
      case 270:
        rotateA = 0; rotateB = -1; rotateC = -1; rotateD = 0;
        break;
      //case 0:
      default:
        rotateA = 1; rotateB = 0; rotateC = 0; rotateD = -1;
        break;
    }

    if (dontFlip) {
      rotateC = -rotateC; rotateD = -rotateD;
    }

    var offsetCanvasX, offsetCanvasY;
    var width, height;
    if (rotateA === 0) {
      offsetCanvasX = Math.abs(centerY - viewBox[1]) * scale + offsetX;
      offsetCanvasY = Math.abs(centerX - viewBox[0]) * scale + offsetY;
      width = Math.abs(viewBox[3] - viewBox[1]) * scale;
      height = Math.abs(viewBox[2] - viewBox[0]) * scale;
    } else {
      offsetCanvasX = Math.abs(centerX - viewBox[0]) * scale + offsetX;
      offsetCanvasY = Math.abs(centerY - viewBox[1]) * scale + offsetY;
      width = Math.abs(viewBox[2] - viewBox[0]) * scale;
      height = Math.abs(viewBox[3] - viewBox[1]) * scale;
    }
    // creating transform for the following operations:
    // translate(-centerX, -centerY), rotate and flip vertically,
    // scale, and translate(offsetCanvasX, offsetCanvasY)
    this.transform = [
      rotateA * scale,
      rotateB * scale,
      rotateC * scale,
      rotateD * scale,
      offsetCanvasX - rotateA * scale * centerX - rotateC * scale * centerY,
      offsetCanvasY - rotateB * scale * centerX - rotateD * scale * centerY
    ];

    this.width = width;
    this.height = height;
    this.fontScale = scale;
  }
  PageViewport.prototype = /** @lends PDFJS.PageViewport.prototype */ {
    /**
     * Clones viewport with additional properties.
     * @param args {Object} (optional) If specified, may contain the 'scale' or
     * 'rotation' properties to override the corresponding properties in
     * the cloned viewport.
     * @returns {PDFJS.PageViewport} Cloned viewport.
     */
    clone: function PageViewPort_clone(args) {

      args = args || {};
      var scale = 'scale' in args ? args.scale : this.scale;
      var rotation = 'rotation' in args ? args.rotation : this.rotation;
      return new PageViewport(this.viewBox.slice(), scale, rotation,
                              this.offsetX, this.offsetY, args.dontFlip);
    },
    /**
     * Converts PDF point to the viewport coordinates. For examples, useful for
     * converting PDF location into canvas pixel coordinates.
     * @param x {number} X coordinate.
     * @param y {number} Y coordinate.
     * @returns {Object} Object that contains 'x' and 'y' properties of the
     * point in the viewport coordinate space.
     * @see {@link convertToPdfPoint}
     * @see {@link convertToViewportRectangle}
     */
    convertToViewportPoint: function PageViewport_convertToViewportPoint(x, y) {

      return Util.applyTransform([x, y], this.transform);
    },
    /**
     * Converts PDF rectangle to the viewport coordinates.
     * @param rect {Array} xMin, yMin, xMax and yMax coordinates.
     * @returns {Array} Contains corresponding coordinates of the rectangle
     * in the viewport coordinate space.
     * @see {@link convertToViewportPoint}
     */
    convertToViewportRectangle:
      function PageViewport_convertToViewportRectangle(rect) {

      var tl = Util.applyTransform([rect[0], rect[1]], this.transform);
      var br = Util.applyTransform([rect[2], rect[3]], this.transform);
      return [tl[0], tl[1], br[0], br[1]];
    },
    /**
     * Converts viewport coordinates to the PDF location. For examples, useful
     * for converting canvas pixel location into PDF one.
     * @param x {number} X coordinate.
     * @param y {number} Y coordinate.
     * @returns {Object} Object that contains 'x' and 'y' properties of the
     * point in the PDF coordinate space.
     * @see {@link convertToViewportPoint}
     */
    convertToPdfPoint: function PageViewport_convertToPdfPoint(x, y) {

      return Util.applyInverseTransform([x, y], this.transform);
    }
  };
  return PageViewport;
})();

var PDFStringTranslateTable = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0x2D8, 0x2C7, 0x2C6, 0x2D9, 0x2DD, 0x2DB, 0x2DA, 0x2DC, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0x2022, 0x2020, 0x2021, 0x2026, 0x2014,
  0x2013, 0x192, 0x2044, 0x2039, 0x203A, 0x2212, 0x2030, 0x201E, 0x201C,
  0x201D, 0x2018, 0x2019, 0x201A, 0x2122, 0xFB01, 0xFB02, 0x141, 0x152, 0x160,
  0x178, 0x17D, 0x131, 0x142, 0x153, 0x161, 0x17E, 0, 0x20AC
];

function stringToPDFString(str) {

  var i, n = str.length, strBuf = [];
  if (str[0] === '\xFE' && str[1] === '\xFF') {
    // UTF16BE BOM
    for (i = 2; i < n; i += 2) {
      strBuf.push(String.fromCharCode(
        (str.charCodeAt(i) << 8) | str.charCodeAt(i + 1)));
    }
  } else {
    for (i = 0; i < n; ++i) {
      var code = PDFStringTranslateTable[str.charCodeAt(i)];
      strBuf.push(code ? String.fromCharCode(code) : str.charAt(i));
    }
  }
  return strBuf.join('');
}

function stringToUTF8String(str) {

  return decodeURIComponent(escape(str));
}

function utf8StringToString(str) {

  return unescape(encodeURIComponent(str));
}

function isEmptyObj(obj) {

  for (var key in obj) {
    return false;
  }
  return true;
}

function isBool(v) {

  return typeof v === 'boolean';
}

function isInt(v) {

  return typeof v === 'number' && ((v | 0) === v);
}

function isNum(v) {

  return typeof v === 'number';
}

function isString(v) {

  return typeof v === 'string';
}

function isName(v) {

  return v instanceof Name;
}

function isCmd(v, cmd) {

  return v instanceof Cmd && (cmd === undefined || v.cmd === cmd);
}

function isDict(v, type) {

  if (!(v instanceof Dict)) {
    return false;
  }
  if (!type) {
    return true;
  }
  var dictType = v.get('Type');
  return isName(dictType) && dictType.name === type;
}

function isArray(v) {

  return v instanceof Array;
}

function isStream(v) {

  return typeof v === 'object' && v !== null && v.getBytes !== undefined;
}

function isArrayBuffer(v) {

  return typeof v === 'object' && v !== null && v.byteLength !== undefined;
}

function isRef(v) {

  return v instanceof Ref;
}

/**
 * Promise Capability object.
 *
 * @typedef {Object} PromiseCapability
 * @property {Promise} promise - A promise object.
 * @property {function} resolve - Fullfills the promise.
 * @property {function} reject - Rejects the promise.
 */

/**
 * Creates a promise capability object.
 * @alias PDFJS.createPromiseCapability
 *
 * @return {PromiseCapability} A capability object contains:
 * - a Promise, resolve and reject methods.
 */
function createPromiseCapability() {

  var capability = {};
  capability.promise = new Promise(function (resolve, reject) {

    capability.resolve = resolve;
    capability.reject = reject;
  });
  return capability;
}

PDFJS.createPromiseCapability = createPromiseCapability;

/**
 * Polyfill for Promises:
 * The following promise implementation tries to generally implement the
 * Promise/A+ spec. Some notable differences from other promise libaries are:
 * - There currently isn't a seperate deferred and promise object.
 * - Unhandled rejections eventually show an error if they aren't handled.
 *
 * Based off of the work in:
 * https://bugzilla.mozilla.org/show_bug.cgi?id=810490
 */
(function PromiseClosure() {

  if (globalScope.Promise) {
    // Promises existing in the DOM/Worker, checking presence of all/resolve
    if (typeof globalScope.Promise.all !== 'function') {
      globalScope.Promise.all = function (iterable) {

        var count = 0, results = [], resolve, reject;
        var promise = new globalScope.Promise(function (resolve_, reject_) {

          resolve = resolve_;
          reject = reject_;
        });
        iterable.forEach(function (p, i) {
          count++;
          p.then(function (result) {
            results[i] = result;
            count--;
            if (count === 0) {
              resolve(results);
            }
          }, reject);
        });
        if (count === 0) {
          resolve(results);
        }
        return promise;
      };
    }
    if (typeof globalScope.Promise.resolve !== 'function') {
      globalScope.Promise.resolve = function (value) {

        return new globalScope.Promise(function (resolve) {
 resolve(value); });
      };
    }
    if (typeof globalScope.Promise.reject !== 'function') {
      globalScope.Promise.reject = function (reason) {

        return new globalScope.Promise(function (resolve, reject) {

          reject(reason);
        });
      };
    }
    if (typeof globalScope.Promise.prototype.catch !== 'function') {
      globalScope.Promise.prototype.catch = function (onReject) {

        return globalScope.Promise.prototype.then(undefined, onReject);
      };
    }
    return;
  }
  var STATUS_PENDING = 0;
  var STATUS_RESOLVED = 1;
  var STATUS_REJECTED = 2;

  // In an attempt to avoid silent exceptions, unhandled rejections are
  // tracked and if they aren't handled in a certain amount of time an
  // error is logged.
  var REJECTION_TIMEOUT = 500;

  var HandlerManager = {
    handlers: [],
    running: false,
    unhandledRejections: [],
    pendingRejectionCheck: false,

    scheduleHandlers: function scheduleHandlers(promise) {

      if (promise._status === STATUS_PENDING) {
        return;
      }

      this.handlers = this.handlers.concat(promise._handlers);
      promise._handlers = [];

      if (this.running) {
        return;
      }
      this.running = true;

      setTimeout(this.runHandlers.bind(this), 0);
    },

    runHandlers: function runHandlers() {

      var RUN_TIMEOUT = 1; // ms
      var timeoutAt = Date.now() + RUN_TIMEOUT;
      while (this.handlers.length > 0) {
        var handler = this.handlers.shift();

        var nextStatus = handler.thisPromise._status;
        var nextValue = handler.thisPromise._value;

        try {
          if (nextStatus === STATUS_RESOLVED) {
            if (typeof handler.onResolve === 'function') {
              nextValue = handler.onResolve(nextValue);
            }
          } else if (typeof handler.onReject === 'function') {

              nextValue = handler.onReject(nextValue);
              nextStatus = STATUS_RESOLVED;

              if (handler.thisPromise._unhandledRejection) {
                this.removeUnhandeledRejection(handler.thisPromise);
              }
          }
        } catch (ex) {
          nextStatus = STATUS_REJECTED;
          nextValue = ex;
        }

        handler.nextPromise._updateStatus(nextStatus, nextValue);
        if (Date.now() >= timeoutAt) {
          break;
        }
      }

      if (this.handlers.length > 0) {
        setTimeout(this.runHandlers.bind(this), 0);
        return;
      }

      this.running = false;
    },

    addUnhandledRejection: function addUnhandledRejection(promise) {

      this.unhandledRejections.push({
        promise: promise,
        time: Date.now()
      });
      this.scheduleRejectionCheck();
    },

    removeUnhandeledRejection: function removeUnhandeledRejection(promise) {

      promise._unhandledRejection = false;
      for (var i = 0; i < this.unhandledRejections.length; i++) {
        if (this.unhandledRejections[i].promise === promise) {
          this.unhandledRejections.splice(i);
          i--;
        }
      }
    },

    scheduleRejectionCheck: function scheduleRejectionCheck() {

      if (this.pendingRejectionCheck) {
        return;
      }
      this.pendingRejectionCheck = true;
      setTimeout(function rejectionCheck() {

        this.pendingRejectionCheck = false;
        var now = Date.now();
        for (var i = 0; i < this.unhandledRejections.length; i++) {
          if (now - this.unhandledRejections[i].time > REJECTION_TIMEOUT) {
            var unhandled = this.unhandledRejections[i].promise._value;
            var msg = 'Unhandled rejection: ' + unhandled;
            if (unhandled.stack) {
              msg += '\n' + unhandled.stack;
            }
            warn(msg);
            this.unhandledRejections.splice(i);
            i--;
          }
        }
        if (this.unhandledRejections.length) {
          this.scheduleRejectionCheck();
        }
      }.bind(this), REJECTION_TIMEOUT);
    }
  };

  function Promise(resolver) {

    this._status = STATUS_PENDING;
    this._handlers = [];
    try {
      resolver.call(this, this._resolve.bind(this), this._reject.bind(this));
    } catch (e) {
      this._reject(e);
    }
  }
  /**
   * Builds a promise that is resolved when all the passed in promises are
   * resolved.
   * @param {array} array of data and/or promises to wait for.
   * @return {Promise} New dependant promise.
   */
  Promise.all = function Promise_all(promises) {

    var resolveAll, rejectAll;
    var deferred = new Promise(function (resolve, reject) {

      resolveAll = resolve;
      rejectAll = reject;
    });
    var unresolved = promises.length;
    var results = [];
    if (unresolved === 0) {
      resolveAll(results);
      return deferred;
    }
    function reject(reason) {

      if (deferred._status === STATUS_REJECTED) {
        return;
      }
      results = [];
      rejectAll(reason);
    }
    for (var i = 0, ii = promises.length; i < ii; ++i) {
      var promise = promises[i];
      var resolve = (function(i) {

        return function(value) {

          if (deferred._status === STATUS_REJECTED) {
            return;
          }
          results[i] = value;
          unresolved--;
          if (unresolved === 0) {
            resolveAll(results);
          }
        };
      })(i);
      if (Promise.isPromise(promise)) {
        promise.then(resolve, reject);
      } else {
        resolve(promise);
      }
    }
    return deferred;
  };

  /**
   * Checks if the value is likely a promise (has a 'then' function).
   * @return {boolean} true if value is thenable
   */
  Promise.isPromise = function Promise_isPromise(value) {

    return value && typeof value.then === 'function';
  };

  /**
   * Creates resolved promise
   * @param value resolve value
   * @returns {Promise}
   */
  Promise.resolve = function Promise_resolve(value) {

    return new Promise(function (resolve) {
 resolve(value); });
  };

  /**
   * Creates rejected promise
   * @param reason rejection value
   * @returns {Promise}
   */
  Promise.reject = function Promise_reject(reason) {

    return new Promise(function (resolve, reject) {
 reject(reason); });
  };

  Promise.prototype = {
    _status: null,
    _value: null,
    _handlers: null,
    _unhandledRejection: null,

    _updateStatus: function Promise__updateStatus(status, value) {

      if (this._status === STATUS_RESOLVED ||
          this._status === STATUS_REJECTED) {
        return;
      }

      if (status === STATUS_RESOLVED &&
          Promise.isPromise(value)) {
        value.then(this._updateStatus.bind(this, STATUS_RESOLVED),
                   this._updateStatus.bind(this, STATUS_REJECTED));
        return;
      }

      this._status = status;
      this._value = value;

      if (status === STATUS_REJECTED && this._handlers.length === 0) {
        this._unhandledRejection = true;
        HandlerManager.addUnhandledRejection(this);
      }

      HandlerManager.scheduleHandlers(this);
    },

    _resolve: function Promise_resolve(value) {

      this._updateStatus(STATUS_RESOLVED, value);
    },

    _reject: function Promise_reject(reason) {

      this._updateStatus(STATUS_REJECTED, reason);
    },

    then: function Promise_then(onResolve, onReject) {

      var nextPromise = new Promise(function (resolve, reject) {

        this.resolve = resolve;
        this.reject = reject;
      });
      this._handlers.push({
        thisPromise: this,
        onResolve: onResolve,
        onReject: onReject,
        nextPromise: nextPromise
      });
      HandlerManager.scheduleHandlers(this);
      return nextPromise;
    },

    catch: function Promise_catch(onReject) {

      return this.then(undefined, onReject);
    }
  };

  globalScope.Promise = Promise;
})();

var StatTimer = (function StatTimerClosure() {

  function rpad(str, pad, length) {

    while (str.length < length) {
      str += pad;
    }
    return str;
  }
  function StatTimer() {

    this.started = {};
    this.times = [];
    this.enabled = true;
  }
  StatTimer.prototype = {
    time: function StatTimer_time(name) {

      if (!this.enabled) {
        return;
      }
      if (name in this.started) {
        warn('Timer is already running for ' + name);
      }
      this.started[name] = Date.now();
    },
    timeEnd: function StatTimer_timeEnd(name) {

      if (!this.enabled) {
        return;
      }
      if (!(name in this.started)) {
        warn('Timer has not been started for ' + name);
      }
      this.times.push({
        'name': name,
        'start': this.started[name],
        'end': Date.now()
      });
      // Remove timer from started so it can be called again.
      delete this.started[name];
    },
    toString: function StatTimer_toString() {

      var i, ii;
      var times = this.times;
      var out = '';
      // Find the longest name for padding purposes.
      var longest = 0;
      for (i = 0, ii = times.length; i < ii; ++i) {
        var name = times[i]['name'];
        if (name.length > longest) {
          longest = name.length;
        }
      }
      for (i = 0, ii = times.length; i < ii; ++i) {
        var span = times[i];
        var duration = span.end - span.start;
        out += rpad(span['name'], ' ', longest) + ' ' + duration + 'ms\n';
      }
      return out;
    }
  };
  return StatTimer;
})();

PDFJS.createBlob = function createBlob(data, contentType) {

  if (typeof Blob !== 'undefined') {
    return new Blob([data], { type: contentType });
  }
  // Blob builder is deprecated in FF14 and removed in FF18.
  var bb = new MozBlobBuilder();
  bb.append(data);
  return bb.getBlob(contentType);
};

PDFJS.createObjectURL = (function createObjectURLClosure() {

  // Blob/createObjectURL is not available, falling back to data schema.
  var digits =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

  return function createObjectURL(data, contentType) {

    if (!PDFJS.disableCreateObjectURL &&
        typeof URL !== 'undefined' && URL.createObjectURL) {
      var blob = PDFJS.createBlob(data, contentType);
      return URL.createObjectURL(blob);
    }

    var buffer = 'data:' + contentType + ';base64,';
    for (var i = 0, ii = data.length; i < ii; i += 3) {
      var b1 = data[i] & 0xFF;
      var b2 = data[i + 1] & 0xFF;
      var b3 = data[i + 2] & 0xFF;
      var d1 = b1 >> 2, d2 = ((b1 & 3) << 4) | (b2 >> 4);
      var d3 = i + 1 < ii ? ((b2 & 0xF) << 2) | (b3 >> 6) : 64;
      var d4 = i + 2 < ii ? (b3 & 0x3F) : 64;
      buffer += digits[d1] + digits[d2] + digits[d3] + digits[d4];
    }
    return buffer;
  };
})();

function MessageHandler(sourceName, targetName, comObj) {

  this.sourceName = sourceName;
  this.targetName = targetName;
  this.comObj = comObj;
  this.callbackIndex = 1;
  this.postMessageTransfers = true;
  var callbacksCapabilities = this.callbacksCapabilities = {};
  var ah = this.actionHandler = {};
trace_stack.push({location:0,context:{'this':this}});

  this._onComObjOnMessage = function messageHandlerComObjOnMessage(event) {


    var data = event.data;
    if (data.targetName !== this.sourceName) {
      return;
    }
    if (data.isReply) {
      var callbackId = data.callbackId;
      if (data.callbackId in callbacksCapabilities) {
        var callback = callbacksCapabilities[callbackId];
        delete callbacksCapabilities[callbackId];
        if ('error' in data) {
          callback.reject(data.error);
        } else {
          callback.resolve(data.data);
        }
      } else {
        error('Cannot resolve callback ' + callbackId);
      }
    } else if (data.action in ah) {
      var action = ah[data.action];
      if (data.callbackId) {
        var sourceName = this.sourceName;
        var targetName = data.sourceName;
        Promise.resolve().then(function () {

          return action[0].call(action[1], data.data);
        }).then(function (result) {

          comObj.postMessage({
            sourceName: sourceName,
            targetName: targetName,
            isReply: true,
            callbackId: data.callbackId,
            data: result
          });
        }, function (reason) {

          if (reason instanceof Error) {
            // Serialize error to avoid "DataCloneError"
            reason = reason + '';
          }
          comObj.postMessage({
            sourceName: sourceName,
            targetName: targetName,
            isReply: true,
            callbackId: data.callbackId,
            error: reason
          });
        });
      } else {
        action[0].call(action[1], data.data);
      }
    } else {
      error('Unknown action from worker: ' + data.action);
    }
  }.bind(this);
  comObj.addEventListener('message', this._onComObjOnMessage);
}

MessageHandler.prototype = {
  on: function messageHandlerOn(actionName, handler, scope) {

    var ah = this.actionHandler;
    if (ah[actionName]) {
      error('There is already an actionName called "' + actionName + '"');
    }
    ah[actionName] = [handler, scope];
  },
  /**
   * Sends a message to the comObj to invoke the action with the supplied data.
   * @param {String} actionName Action to call.
   * @param {JSON} data JSON data to send.
   * @param {Array} [transfers] Optional list of transfers/ArrayBuffers
   */
  send: function messageHandlerSend(actionName, data, transfers) {

    var message = {
      sourceName: this.sourceName,
      targetName: this.targetName,
      action: actionName,
      data: data
    };
    this.postMessage(message, transfers);
  },
  /**
   * Sends a message to the comObj to invoke the action with the supplied data.
   * Expects that other side will callback with the response.
   * @param {String} actionName Action to call.
   * @param {JSON} data JSON data to send.
   * @param {Array} [transfers] Optional list of transfers/ArrayBuffers.
   * @returns {Promise} Promise to be resolved with response data.
   */
  sendWithPromise:
    function messageHandlerSendWithPromise(actionName, data, transfers) {

    var callbackId = this.callbackIndex++;
    var message = {
      sourceName: this.sourceName,
      targetName: this.targetName,
      action: actionName,
      data: data,
      callbackId: callbackId
    };
    var capability = createPromiseCapability();
    this.callbacksCapabilities[callbackId] = capability;
    try {
      this.postMessage(message, transfers);
    } catch (e) {
      capability.reject(e);
    }
    return capability.promise;
  },
  /**
   * Sends raw message to the comObj.
   * @private
   * @param message {Object} Raw message.
   * @param transfers List of transfers/ArrayBuffers, or undefined.
   */
  postMessage: function (message, transfers) {

    if (transfers && this.postMessageTransfers) {
      this.comObj.postMessage(message, transfers);
    } else {
      this.comObj.postMessage(message);
    }
  },

  destroy: function () {

    this.comObj.removeEventListener('message', this._onComObjOnMessage);
  }
};

function loadJpegStream(id, imageUrl, objs) {

  var img = new Image();
  img.onload = (function loadJpegStream_onloadClosure() {

    objs.resolve(id, img);
  });
  img.onerror = (function loadJpegStream_onerrorClosure() {

    objs.resolve(id, null);
    warn('Error during JPEG image loading');
  });
  img.src = imageUrl;
}

  // Polyfill from https://github.com/Polymer/URL
/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */
(function checkURLConstructor(scope) {

  /* jshint ignore:start */

  // feature detect for URL constructor
  var hasWorkingUrl = false;
  if (typeof URL === 'function' && ('origin' in URL.prototype)) {

    try {
      var u = new URL('b', 'http://a');
      u.pathname = 'c%20d';
      hasWorkingUrl = u.href === 'http://a/c%20d';
    } catch(e) {}
  }

  if (hasWorkingUrl)
    return;

  var relative = Object.create(null);
  relative['ftp'] = 21;
  relative['file'] = 0;
  relative['gopher'] = 70;
  relative['http'] = 80;
  relative['https'] = 443;
  relative['ws'] = 80;
  relative['wss'] = 443;

  var relativePathDotMapping = Object.create(null);
  relativePathDotMapping['%2e'] = '.';
  relativePathDotMapping['.%2e'] = '..';
  relativePathDotMapping['%2e.'] = '..';
  relativePathDotMapping['%2e%2e'] = '..';

  function isRelativeScheme(scheme) {

    return relative[scheme] !== undefined;
  }

  function invalid() {

    clear.call(this);
    this._isInvalid = true;
  }

  function IDNAToASCII(h) {

    if ('' == h) {
      invalid.call(this)
    }
    // XXX
    return h.toLowerCase()
  }

  function percentEscape(c) {

    var unicode = c.charCodeAt(0);
    if (unicode > 0x20 &&
       unicode < 0x7F &&
       // " # < > ? `
       [0x22, 0x23, 0x3C, 0x3E, 0x3F, 0x60].indexOf(unicode) == -1
      ) {
      return c;
    }
    return encodeURIComponent(c);
  }

  function percentEscapeQuery(c) {

    // XXX This actually needs to encode c using encoding and then
    // convert the bytes one-by-one.

    var unicode = c.charCodeAt(0);
    if (unicode > 0x20 &&
       unicode < 0x7F &&
       // " # < > ` (do not escape '?')
       [0x22, 0x23, 0x3C, 0x3E, 0x60].indexOf(unicode) == -1
      ) {
      return c;
    }
    return encodeURIComponent(c);
  }

  var EOF = undefined,
      ALPHA = /[a-zA-Z]/,
      ALPHANUMERIC = /[a-zA-Z0-9\+\-\.]/;

  function parse(input, stateOverride, base) {

    function err(message) {

      errors.push(message)
    }

    var state = stateOverride || 'scheme start',
        cursor = 0,
        buffer = '',
        seenAt = false,
        seenBracket = false,
        errors = [];

//jsw input 

    loop: while ((input[cursor - 1] != EOF || cursor == 0) && !this._isInvalid) {
      var c = input[cursor];
      switch (state) {
        case 'scheme start':
          if (c && ALPHA.test(c)) {
            buffer += c.toLowerCase(); // ASCII-safe
            state = 'scheme';
          } else if (!stateOverride) {
            buffer = '';
            state = 'no scheme';
            continue;
          } else {
            err('Invalid scheme.');
            break loop;
          }
          break;

        case 'scheme':
          if (c && ALPHANUMERIC.test(c)) {
            buffer += c.toLowerCase(); // ASCII-safe
          } else if (':' == c) {
            this._scheme = buffer;
            buffer = '';
            if (stateOverride) {
              break loop;
            }
            if (isRelativeScheme(this._scheme)) {
              this._isRelative = true;
            }
            if ('file' == this._scheme) {
              state = 'relative';
            } else if (this._isRelative && base && base._scheme == this._scheme) {
              state = 'relative or authority';
            } else if (this._isRelative) {
              state = 'authority first slash';
            } else {
              state = 'scheme data';
            }
          } else if (!stateOverride) {
            buffer = '';
            cursor = 0;
            state = 'no scheme';
            continue;
          } else if (EOF == c) {
            break loop;
          } else {
            err('Code point not allowed in scheme: ' + c)
            break loop;
          }
          break;

        case 'scheme data':
          if ('?' == c) {
            this._query = '?';
            state = 'query';
          } else if ('#' == c) {
            this._fragment = '#';
            state = 'fragment';
          } else {
            // XXX error handling
            if (EOF != c && '\t' != c && '\n' != c && '\r' != c) {
              this._schemeData += percentEscape(c);
            }
          }
          break;

        case 'no scheme':
          if (!base || !(isRelativeScheme(base._scheme))) {
            err('Missing scheme.');
            invalid.call(this);
          } else {
            state = 'relative';
            continue;
          }
          break;

        case 'relative or authority':
          if ('/' == c && '/' == input[cursor+1]) {
            state = 'authority ignore slashes';
          } else {
            err('Expected /, got: ' + c);
            state = 'relative';
            continue
          }
          break;

        case 'relative':
          this._isRelative = true;
          if ('file' != this._scheme)
            this._scheme = base._scheme;
          if (EOF == c) {
            this._host = base._host;
            this._port = base._port;
            this._path = base._path.slice();
            this._query = base._query;
            this._username = base._username;
            this._password = base._password;
            break loop;
          } else if ('/' == c || '\\' == c) {
            if ('\\' == c)
              err('\\ is an invalid code point.');
            state = 'relative slash';
          } else if ('?' == c) {
            this._host = base._host;
            this._port = base._port;
            this._path = base._path.slice();
            this._query = '?';
            this._username = base._username;
            this._password = base._password;
            state = 'query';
          } else if ('#' == c) {
            this._host = base._host;
            this._port = base._port;
            this._path = base._path.slice();
            this._query = base._query;
            this._fragment = '#';
            this._username = base._username;
            this._password = base._password;
            state = 'fragment';
          } else {
            var nextC = input[cursor+1]
            var nextNextC = input[cursor+2]
            if (
              'file' != this._scheme || !ALPHA.test(c) ||
              (nextC != ':' && nextC != '|') ||
              (EOF != nextNextC && '/' != nextNextC && '\\' != nextNextC && '?' != nextNextC && '#' != nextNextC)) {
              this._host = base._host;
              this._port = base._port;
              this._username = base._username;
              this._password = base._password;
              this._path = base._path.slice();
              this._path.pop();
            }
            state = 'relative path';
            continue;
          }
          break;

        case 'relative slash':
          if ('/' == c || '\\' == c) {
            if ('\\' == c) {
              err('\\ is an invalid code point.');
            }
            if ('file' == this._scheme) {
              state = 'file host';
            } else {
              state = 'authority ignore slashes';
            }
          } else {
            if ('file' != this._scheme) {
              this._host = base._host;
              this._port = base._port;
              this._username = base._username;
              this._password = base._password;
            }
            state = 'relative path';
            continue;
          }
          break;

        case 'authority first slash':
          if ('/' == c) {
            state = 'authority second slash';
          } else {
            err("Expected '/', got: " + c);
            state = 'authority ignore slashes';
            continue;
          }
          break;

        case 'authority second slash':
          state = 'authority ignore slashes';
          if ('/' != c) {
            err("Expected '/', got: " + c);
            continue;
          }
          break;

        case 'authority ignore slashes':
          if ('/' != c && '\\' != c) {
            state = 'authority';
            continue;
          } else {
            err('Expected authority, got: ' + c);
          }
          break;

        case 'authority':
          if ('@' == c) {
            if (seenAt) {
              err('@ already seen.');
              buffer += '%40';
            }
            seenAt = true;
            for (var i = 0; i < buffer.length; i++) {
              var cp = buffer[i];
              if ('\t' == cp || '\n' == cp || '\r' == cp) {
                err('Invalid whitespace in authority.');
                continue;
              }
              // XXX check URL code points
              if (':' == cp && null === this._password) {
                this._password = '';
                continue;
              }
              var tempC = percentEscape(cp);
              (null !== this._password) ? this._password += tempC : this._username += tempC;
            }
            buffer = '';
          } else if (EOF == c || '/' == c || '\\' == c || '?' == c || '#' == c) {
            cursor -= buffer.length;
            buffer = '';
            state = 'host';
            continue;
          } else {
            buffer += c;
          }
          break;

        case 'file host':
          if (EOF == c || '/' == c || '\\' == c || '?' == c || '#' == c) {
            if (buffer.length == 2 && ALPHA.test(buffer[0]) && (buffer[1] == ':' || buffer[1] == '|')) {
              state = 'relative path';
            } else if (buffer.length == 0) {
              state = 'relative path start';
            } else {
              this._host = IDNAToASCII.call(this, buffer);
              buffer = '';
              state = 'relative path start';
            }
            continue;
          } else if ('\t' == c || '\n' == c || '\r' == c) {
            err('Invalid whitespace in file host.');
          } else {
            buffer += c;
          }
          break;

        case 'host':
        case 'hostname':
          if (':' == c && !seenBracket) {
            // XXX host parsing
            this._host = IDNAToASCII.call(this, buffer);
            buffer = '';
            state = 'port';
            if ('hostname' == stateOverride) {
              break loop;
            }
          } else if (EOF == c || '/' == c || '\\' == c || '?' == c || '#' == c) {
            this._host = IDNAToASCII.call(this, buffer);
            buffer = '';
            state = 'relative path start';
            if (stateOverride) {
              break loop;
            }
            continue;
          } else if ('\t' != c && '\n' != c && '\r' != c) {
            if ('[' == c) {
              seenBracket = true;
            } else if (']' == c) {
              seenBracket = false;
            }
            buffer += c;
          } else {
            err('Invalid code point in host/hostname: ' + c);
          }
          break;

        case 'port':
          if (/[0-9]/.test(c)) {
            buffer += c;
          } else if (EOF == c || '/' == c || '\\' == c || '?' == c || '#' == c || stateOverride) {
            if ('' != buffer) {
              var temp = parseInt(buffer, 10);
              if (temp != relative[this._scheme]) {
                this._port = temp + '';
              }
              buffer = '';
            }
            if (stateOverride) {
              break loop;
            }
            state = 'relative path start';
            continue;
          } else if ('\t' == c || '\n' == c || '\r' == c) {
            err('Invalid code point in port: ' + c);
          } else {
            invalid.call(this);
          }
          break;

        case 'relative path start':
          if ('\\' == c)
            err("'\\' not allowed in path.");
          state = 'relative path';
          if ('/' != c && '\\' != c) {
            continue;
          }
          break;

        case 'relative path':
          if (EOF == c || '/' == c || '\\' == c || (!stateOverride && ('?' == c || '#' == c))) {
            if ('\\' == c) {
              err('\\ not allowed in relative path.');
            }
            var tmp;
            if (tmp = relativePathDotMapping[buffer.toLowerCase()]) {
              buffer = tmp;
            }
            if ('..' == buffer) {
              this._path.pop();
              if ('/' != c && '\\' != c) {
                this._path.push('');
              }
            } else if ('.' == buffer && '/' != c && '\\' != c) {
              this._path.push('');
            } else if ('.' != buffer) {
              if ('file' == this._scheme && this._path.length == 0 && buffer.length == 2 && ALPHA.test(buffer[0]) && buffer[1] == '|') {
                buffer = buffer[0] + ':';
              }
              this._path.push(buffer);
            }
            buffer = '';
            if ('?' == c) {
              this._query = '?';
              state = 'query';
            } else if ('#' == c) {
              this._fragment = '#';
              state = 'fragment';
            }
          } else if ('\t' != c && '\n' != c && '\r' != c) {
            buffer += percentEscape(c);
          }
          break;

        case 'query':
          if (!stateOverride && '#' == c) {
            this._fragment = '#';
            state = 'fragment';
          } else if (EOF != c && '\t' != c && '\n' != c && '\r' != c) {
            this._query += percentEscapeQuery(c);
          }
          break;

        case 'fragment':
          if (EOF != c && '\t' != c && '\n' != c && '\r' != c) {
            this._fragment += c;
          }
          break;
      }

      cursor++;
    }
  }

  function clear() {

    this._scheme = '';
    this._schemeData = '';
    this._username = '';
    this._password = null;
    this._host = '';
    this._port = '';
    this._path = [];
    this._query = '';
    this._fragment = '';
    this._isInvalid = false;
    this._isRelative = false;
  }

  // Does not process domain names or IP addresses.
  // Does not handle encoding for the query parameter.
  function jURL(url, base /* , encoding */) {

    if (base !== undefined && !(base instanceof jURL))
      base = new jURL(String(base));

    this._url = url;
    clear.call(this);

    var input = url.replace(/^[ \t\r\n\f]+|[ \t\r\n\f]+$/g, '');
    // encoding = encoding || 'utf-8'

    parse.call(this, input, null, base);
  }

  jURL.prototype = {
    toString: function() {

      return this.href;
    },
    get href() {
      if (this._isInvalid)
        return this._url;

      var authority = '';
      if ('' != this._username || null != this._password) {
        authority = this._username +
            (null != this._password ? ':' + this._password : '') + '@';
      }

      return this.protocol +
          (this._isRelative ? '//' + authority + this.host : '') +
          this.pathname + this._query + this._fragment;
    },
    set href(href) {
      clear.call(this);
      parse.call(this, href);
    },

    get protocol() {
      return this._scheme + ':';
    },
    set protocol(protocol) {
      if (this._isInvalid)
        return;
      parse.call(this, protocol + ':', 'scheme start');
    },

    get host() {
      return this._isInvalid ? '' : this._port ?
          this._host + ':' + this._port : this._host;
    },
    set host(host) {
      if (this._isInvalid || !this._isRelative)
        return;
      parse.call(this, host, 'host');
    },

    get hostname() {
      return this._host;
    },
    set hostname(hostname) {
      if (this._isInvalid || !this._isRelative)
        return;
      parse.call(this, hostname, 'hostname');
    },

    get port() {
      return this._port;
    },
    set port(port) {
      if (this._isInvalid || !this._isRelative)
        return;
      parse.call(this, port, 'port');
    },

    get pathname() {
      return this._isInvalid ? '' : this._isRelative ?
          '/' + this._path.join('/') : this._schemeData;
    },
    set pathname(pathname) {
      if (this._isInvalid || !this._isRelative)
        return;
      this._path = [];
      parse.call(this, pathname, 'relative path start');
    },

    get search() {
      return this._isInvalid || !this._query || '?' == this._query ?
          '' : this._query;
    },
    set search(search) {
      if (this._isInvalid || !this._isRelative)
        return;
      this._query = '?';
      if ('?' == search[0])
        search = search.slice(1);
      parse.call(this, search, 'query');
    },

    get hash() {
      return this._isInvalid || !this._fragment || '#' == this._fragment ?
          '' : this._fragment;
    },
    set hash(hash) {
      if (this._isInvalid)
        return;
      this._fragment = '#';
      if ('#' == hash[0])
        hash = hash.slice(1);
      parse.call(this, hash, 'fragment');
    },

    get origin() {
      var host;
      if (this._isInvalid || !this._scheme) {
        return '';
      }
      // javascript: Gecko returns String(""), WebKit/Blink String("null")
      // Gecko throws error for "data://"
      // data: Gecko returns "", Blink returns "data://", WebKit returns "null"
      // Gecko returns String("") for file: mailto:
      // WebKit/Blink returns String("SCHEME://") for file: mailto:
      switch (this._scheme) {
        case 'data':
        case 'file':
        case 'javascript':
        case 'mailto':
          return 'null';
      }
      host = this.host;
      if (!host) {
        return '';
      }
      return this._scheme + '://' + host;
    }
  };

  // Copy over the static methods
  var OriginalURL = scope.URL;
  if (OriginalURL) {
    jURL.createObjectURL = function(blob) {

      // IE extension allows a second optional options argument.
      // http://msdn.microsoft.com/en-us/library/ie/hh772302(v=vs.85).aspx
      return OriginalURL.createObjectURL.apply(OriginalURL, arguments);
    };
    jURL.revokeObjectURL = function(url) {

      OriginalURL.revokeObjectURL(url);
    };
  }

  scope.URL = jURL;
  /* jshint ignore:end */
})(globalScope);


var DEFAULT_RANGE_CHUNK_SIZE = 65536; // 2^16 = 65536

/**
 * The maximum allowed image size in total pixels e.g. width * height. Images
 * above this value will not be drawn. Use -1 for no limit.
 * @var {number}
 */
PDFJS.maxImageSize = (PDFJS.maxImageSize === undefined ?
                      -1 : PDFJS.maxImageSize);

/**
 * The url of where the predefined Adobe CMaps are located. Include trailing
 * slash.
 * @var {string}
 */
PDFJS.cMapUrl = (PDFJS.cMapUrl === undefined ? null : PDFJS.cMapUrl);

/**
 * Specifies if CMaps are binary packed.
 * @var {boolean}
 */
PDFJS.cMapPacked = PDFJS.cMapPacked === undefined ? false : PDFJS.cMapPacked;

/**
 * By default fonts are converted to OpenType fonts and loaded via font face
 * rules. If disabled, the font will be rendered using a built in font renderer
 * that constructs the glyphs with primitive path commands.
 * @var {boolean}
 */
PDFJS.disableFontFace = (PDFJS.disableFontFace === undefined ?
                         false : PDFJS.disableFontFace);

/**
 * Path for image resources, mainly for annotation icons. Include trailing
 * slash.
 * @var {string}
 */
PDFJS.imageResourcesPath = (PDFJS.imageResourcesPath === undefined ?
                            '' : PDFJS.imageResourcesPath);

/**
 * Disable the web worker and run all code on the main thread. This will happen
 * automatically if the browser doesn't support workers or sending typed arrays
 * to workers.
 * @var {boolean}
 */
PDFJS.disableWorker = (PDFJS.disableWorker === undefined ?
                       false : PDFJS.disableWorker);

/**
 * Path and filename of the worker file. Required when the worker is enabled in
 * development mode. If unspecified in the production build, the worker will be
 * loaded based on the location of the pdf.js file. It is recommended that
 * the workerSrc is set in a custom application to prevent issues caused by
 * third-party frameworks and libraries.
 * @var {string}
 */
PDFJS.workerSrc = (PDFJS.workerSrc === undefined ? null : PDFJS.workerSrc);

/**
 * Disable range request loading of PDF files. When enabled and if the server
 * supports partial content requests then the PDF will be fetched in chunks.
 * Enabled (false) by default.
 * @var {boolean}
 */
PDFJS.disableRange = (PDFJS.disableRange === undefined ?
                      false : PDFJS.disableRange);

/**
 * Disable streaming of PDF file data. By default PDF.js attempts to load PDF
 * in chunks. This default behavior can be disabled.
 * @var {boolean}
 */
PDFJS.disableStream = (PDFJS.disableStream === undefined ?
                       false : PDFJS.disableStream);

/**
 * Disable pre-fetching of PDF file data. When range requests are enabled PDF.js
 * will automatically keep fetching more data even if it isn't needed to display
 * the current page. This default behavior can be disabled.
 *
 * NOTE: It is also necessary to disable streaming, see above,
 *       in order for disabling of pre-fetching to work correctly.
 * @var {boolean}
 */
PDFJS.disableAutoFetch = (PDFJS.disableAutoFetch === undefined ?
                          false : PDFJS.disableAutoFetch);

/**
 * Enables special hooks for debugging PDF.js.
 * @var {boolean}
 */
PDFJS.pdfBug = (PDFJS.pdfBug === undefined ? false : PDFJS.pdfBug);

/**
 * Enables transfer usage in postMessage for ArrayBuffers.
 * @var {boolean}
 */
PDFJS.postMessageTransfers = (PDFJS.postMessageTransfers === undefined ?
                              true : PDFJS.postMessageTransfers);

/**
 * Disables URL.createObjectURL usage.
 * @var {boolean}
 */
PDFJS.disableCreateObjectURL = (PDFJS.disableCreateObjectURL === undefined ?
                                false : PDFJS.disableCreateObjectURL);

/**
 * Disables WebGL usage.
 * @var {boolean}
 */
PDFJS.disableWebGL = (PDFJS.disableWebGL === undefined ?
                      true : PDFJS.disableWebGL);

/**
 * Disables fullscreen support, and by extension Presentation Mode,
 * in browsers which support the fullscreen API.
 * @var {boolean}
 */
PDFJS.disableFullscreen = (PDFJS.disableFullscreen === undefined ?
                           false : PDFJS.disableFullscreen);

/**
 * Enables CSS only zooming.
 * @var {boolean}
 */
PDFJS.useOnlyCssZoom = (PDFJS.useOnlyCssZoom === undefined ?
                        false : PDFJS.useOnlyCssZoom);

/**
 * Controls the logging level.
 * The constants from PDFJS.VERBOSITY_LEVELS should be used:
 * - errors
 * - warnings [default]
 * - infos
 * @var {number}
 */
PDFJS.verbosity = (PDFJS.verbosity === undefined ?
                   PDFJS.VERBOSITY_LEVELS.warnings : PDFJS.verbosity);

/**
 * The maximum supported canvas size in total pixels e.g. width * height.
 * The default value is 4096 * 4096. Use -1 for no limit.
 * @var {number}
 */
PDFJS.maxCanvasPixels = (PDFJS.maxCanvasPixels === undefined ?
                         16777216 : PDFJS.maxCanvasPixels);

/**
 * (Deprecated) Opens external links in a new window if enabled.
 * The default behavior opens external links in the PDF.js window.
 *
 * NOTE: This property has been deprecated, please use
 *       `PDFJS.externalLinkTarget = PDFJS.LinkTarget.BLANK` instead.
 * @var {boolean}
 */
PDFJS.openExternalLinksInNewWindow = (
  PDFJS.openExternalLinksInNewWindow === undefined ?
    false : PDFJS.openExternalLinksInNewWindow);

/**
 * Specifies the |target| attribute for external links.
 * The constants from PDFJS.LinkTarget should be used:
 *  - NONE [default]
 *  - SELF
 *  - BLANK
 *  - PARENT
 *  - TOP
 * @var {number}
 */
PDFJS.externalLinkTarget = (PDFJS.externalLinkTarget === undefined ?
                            PDFJS.LinkTarget.NONE : PDFJS.externalLinkTarget);

/**
  * Determines if we can eval strings as JS. Primarily used to improve
  * performance for font rendering.
  * @var {boolean}
  */
PDFJS.isEvalSupported = (PDFJS.isEvalSupported === undefined ?
                         true : PDFJS.isEvalSupported);

/**
 * Document initialization / loading parameters object.
 *
 * @typedef {Object} DocumentInitParameters
 * @property {string}     url   - The URL of the PDF.
 * @property {TypedArray|Array|string} data - Binary PDF data. Use typed arrays
 *   (Uint8Array) to improve the memory usage. If PDF data is BASE64-encoded,
 *   use atob() to convert it to a binary string first.
 * @property {Object}     httpHeaders - Basic authentication headers.
 * @property {boolean}    withCredentials - Indicates whether or not cross-site
 *   Access-Control requests should be made using credentials such as cookies
 *   or authorization headers. The default is false.
 * @property {string}     password - For decrypting password-protected PDFs.
 * @property {TypedArray} initialData - A typed array with the first portion or
 *   all of the pdf data. Used by the extension since some data is already
 *   loaded before the switch to range requests.
 * @property {number}     length - The PDF file length. It's used for progress
 *   reports and range requests operations.
 * @property {PDFDataRangeTransport} range
 * @property {number}     rangeChunkSize - Optional parameter to specify
 *   maximum number of bytes fetched per range request. The default value is
 *   2^16 = 65536.
 * @property {PDFWorker}  worker - The worker that will be used for the loading
 *   and parsing of the PDF data.
 */

/**
 * @typedef {Object} PDFDocumentStats
 * @property {Array} streamTypes - Used stream types in the document (an item
 *   is set to true if specific stream ID was used in the document).
 * @property {Array} fontTypes - Used font type in the document (an item is set
 *   to true if specific font ID was used in the document).
 */

/**
 * This is the main entry point for loading a PDF and interacting with it.
 * NOTE: If a URL is used to fetch the PDF data a standard XMLHttpRequest(XHR)
 * is used, which means it must follow the same origin rules that any XHR does
 * e.g. No cross domain requests without CORS.
 *
 * @param {string|TypedArray|DocumentInitParameters|PDFDataRangeTransport} src
 * Can be a url to where a PDF is located, a typed array (Uint8Array)
 * already populated with data or parameter object.
 *
 * @param {PDFDataRangeTransport} pdfDataRangeTransport (deprecated) It is used
 * if you want to manually serve range requests for data in the PDF.
 *
 * @param {function} passwordCallback (deprecated) It is used to request a
 * password if wrong or no password was provided. The callback receives two
 * parameters: function that needs to be called with new password and reason
 * (see {
PasswordResponses}).
 *
 * @param {function} progressCallback (deprecated) It is used to be able to
 * monitor the loading progress of the PDF file (necessary to implement e.g.
 * a loading bar). The callback receives an {
Object} with the properties:
 * {number} loaded and {number} total.
 *
 * @return {PDFDocumentLoadingTask}
 */
PDFJS.getDocument = function getDocument(src,
                                         pdfDataRangeTransport,
                                         passwordCallback,
                                         progressCallback) {

  var task = new PDFDocumentLoadingTask();

  // Support of the obsolete arguments (for compatibility with API v1.0)
  if (arguments.length > 1) {
    deprecated('getDocument is called with pdfDataRangeTransport, ' +
               'passwordCallback or progressCallback argument');
  }
  if (pdfDataRangeTransport) {
    if (!(pdfDataRangeTransport instanceof PDFDataRangeTransport)) {
      // Not a PDFDataRangeTransport instance, trying to add missing properties.
      pdfDataRangeTransport = Object.create(pdfDataRangeTransport);
      pdfDataRangeTransport.length = src.length;
      pdfDataRangeTransport.initialData = src.initialData;
      if (!pdfDataRangeTransport.abort) {
        pdfDataRangeTransport.abort = function () {
};
      }
    }
    src = Object.create(src);
    src.range = pdfDataRangeTransport;
  }
  task.onPassword = passwordCallback || null;
  task.onProgress = progressCallback || null;

//jsw src

  var source;
  if (typeof src === 'string') {
    source = { url: src };
  } else if (isArrayBuffer(src)) {
    source = { data: src };
  } else if (src instanceof PDFDataRangeTransport) {
    source = { range: src };
  } else {
    if (typeof src !== 'object') {
      error('Invalid parameter in getDocument, need either Uint8Array, ' +
        'string or a parameter object');
    }
    if (!src.url && !src.data && !src.range) {
      error('Invalid parameter object: need either .data, .range or .url');
    }

    source = src;
  }

  var params = {};
  var rangeTransport = null;
  var worker = null;
  for (var key in source) {
    if (key === 'url' && typeof window !== 'undefined') {
      // The full path is required in the 'url' field.
      params[key] = combineUrl(window.location.href, source[key]);
      continue;
    } else if (key === 'range') {
      rangeTransport = source[key];
      continue;
    } else if (key === 'worker') {
      worker = source[key];
      continue;
    } else if (key === 'data' && !(source[key] instanceof Uint8Array)) {
      // Converting string or array-like data to Uint8Array.
      var pdfBytes = source[key];
      if (typeof pdfBytes === 'string') {
        params[key] = stringToBytes(pdfBytes);
      } else if (typeof pdfBytes === 'object' && pdfBytes !== null &&
                 !isNaN(pdfBytes.length)) {
        params[key] = new Uint8Array(pdfBytes);
      } else if (isArrayBuffer(pdfBytes)) {
        params[key] = new Uint8Array(pdfBytes);
      } else {
        error('Invalid PDF binary data: either typed array, string or ' +
              'array-like object is expected in the data property.');
      }
      continue;
    }
    params[key] = source[key];
  }

  params.rangeChunkSize = params.rangeChunkSize || DEFAULT_RANGE_CHUNK_SIZE;

  if (!worker) {
    // Worker was not provided -- creating and owning our own.
    worker = new PDFWorker();
    task._worker = worker;
  }
  var docId = task.docId;
  worker.promise.then(function () {

    if (task.destroyed) {
      throw new Error('Loading aborted');
    }
    return _fetchDocument(worker, params, rangeTransport, docId).then(
        function (workerId) {

      if (task.destroyed) {
        throw new Error('Loading aborted');
      }
      var messageHandler = new MessageHandler(docId, workerId, worker.port);
      messageHandler.send('Ready', null);
      var transport = new WorkerTransport(messageHandler, task, rangeTransport);
      task._transport = transport;
    });
  }, task._capability.reject);

  return task;
};

/**
 * Starts fetching of specified PDF document/data.
 * @param {PDFWorker} worker
 * @param {Object} source
 * @param {PDFDataRangeTransport} pdfDataRangeTransport
 * @param {string} docId Unique document id, used as MessageHandler id.
 * @returns {Promise} The promise, which is resolved when worker id of
 *                    MessageHandler is known.
 * @private
 */
function _fetchDocument(worker, source, pdfDataRangeTransport, docId) {


  if (worker.destroyed) {
    return Promise.reject(new Error('Worker was destroyed'));
  }

trace_stack.push({location:1,context:{'worker':worker, 'source':source}});

  source.disableAutoFetch = PDFJS.disableAutoFetch;
  source.disableStream = PDFJS.disableStream;
  source.chunkedViewerLoading = !!pdfDataRangeTransport;
  if (pdfDataRangeTransport) {
    source.length = pdfDataRangeTransport.length;
    source.initialData = pdfDataRangeTransport.initialData;
  }
  return worker.messageHandler.sendWithPromise('GetDocRequest', {
    docId: docId,
    source: source,
    disableRange: PDFJS.disableRange,
    maxImageSize: PDFJS.maxImageSize,
    cMapUrl: PDFJS.cMapUrl,
    cMapPacked: PDFJS.cMapPacked,
    disableFontFace: PDFJS.disableFontFace,
    disableCreateObjectURL: PDFJS.disableCreateObjectURL,
    verbosity: PDFJS.verbosity
  }).then(function (workerId) {

    if (worker.destroyed) {
      throw new Error('Worker was destroyed');
    }
    return workerId;
  });
}

/**
 * PDF document loading operation.
 * @class
 * @alias PDFDocumentLoadingTask
 */
var PDFDocumentLoadingTask = (function PDFDocumentLoadingTaskClosure() {

  var nextDocumentId = 0;

  /** @constructs PDFDocumentLoadingTask */
  function PDFDocumentLoadingTask() {

    this._capability = createPromiseCapability();
    this._transport = null;
    this._worker = null;

    /**
     * Unique document loading task id -- used in MessageHandlers.
     * @type {string}
     */
    this.docId = 'd' + (nextDocumentId++);

    /**
     * Shows if loading task is destroyed.
     * @type {boolean}
     */
    this.destroyed = false;

    /**
     * Callback to request a password if wrong or no password was provided.
     * The callback receives two parameters: function that needs to be called
     * with new password and reason (see {PasswordResponses}).
     */
    this.onPassword = null;

    /**
     * Callback to be able to monitor the loading progress of the PDF file
     * (necessary to implement e.g. a loading bar). The callback receives
     * an {
trace_stack.push({location:2,context:{}});
Object} with the properties: {number} loaded and {number} total.
     */
    this.onProgress = null;

    /**
     * Callback to when unsupported feature is used. The callback receives
     * an {PDFJS.UNSUPPORTED_FEATURES} argument.
     */
    this.onUnsupportedFeature = null;
  }

  PDFDocumentLoadingTask.prototype =
      /** @lends PDFDocumentLoadingTask.prototype */ {
    /**
     * @return {Promise}
     */
    get promise() {
      return this._capability.promise;
    },

    /**
     * Aborts all network requests and destroys worker.
     * @return {Promise} A promise that is resolved after destruction activity
     *                   is completed.
     */
    destroy: function () {

      this.destroyed = true;

      var transportDestroyed = !this._transport ? Promise.resolve() :
        this._transport.destroy();
      return transportDestroyed.then(function () {

        this._transport = null;
        if (this._worker) {
          this._worker.destroy();
          this._worker = null;
        }
      }.bind(this));
    },

    /**
     * Registers callbacks to indicate the document loading completion.
     *
     * @param {function} onFulfilled The callback for the loading completion.
     * @param {function} onRejected The callback for the loading failure.
     * @return {Promise} A promise that is resolved after the onFulfilled or
     *                   onRejected callback.
     */
    then: function PDFDocumentLoadingTask_then(onFulfilled, onRejected) {

      return this.promise.then.apply(this.promise, arguments);
    }
  };

  return PDFDocumentLoadingTask;
})();

/**
 * Abstract class to support range requests file loading.
 * @class
 * @alias PDFJS.PDFDataRangeTransport
 * @param {number} length
 * @param {Uint8Array} initialData
 */
var PDFDataRangeTransport = (function pdfDataRangeTransportClosure() {

  function PDFDataRangeTransport(length, initialData) {

    this.length = length;
    this.initialData = initialData;

    this._rangeListeners = [];
    this._progressListeners = [];
    this._progressiveReadListeners = [];
    this._readyCapability = createPromiseCapability();
  }
  PDFDataRangeTransport.prototype =
      /** @lends PDFDataRangeTransport.prototype */ {
    addRangeListener:
        function PDFDataRangeTransport_addRangeListener(listener) {

      this._rangeListeners.push(listener);
    },

    addProgressListener:
        function PDFDataRangeTransport_addProgressListener(listener) {

      this._progressListeners.push(listener);
    },

    addProgressiveReadListener:
        function PDFDataRangeTransport_addProgressiveReadListener(listener) {

      this._progressiveReadListeners.push(listener);
    },

    onDataRange: function PDFDataRangeTransport_onDataRange(begin, chunk) {

      var listeners = this._rangeListeners;
      for (var i = 0, n = listeners.length; i < n; ++i) {
        listeners[i](begin, chunk);
      }
    },

    onDataProgress: function PDFDataRangeTransport_onDataProgress(loaded) {

      this._readyCapability.promise.then(function () {

        var listeners = this._progressListeners;
        for (var i = 0, n = listeners.length; i < n; ++i) {
          listeners[i](loaded);
        }
      }.bind(this));
    },

    onDataProgressiveRead:
        function PDFDataRangeTransport_onDataProgress(chunk) {

      this._readyCapability.promise.then(function () {

        var listeners = this._progressiveReadListeners;
        for (var i = 0, n = listeners.length; i < n; ++i) {
          listeners[i](chunk);
        }
      }.bind(this));
    },

    transportReady: function PDFDataRangeTransport_transportReady() {

      this._readyCapability.resolve();
    },

    requestDataRange:
        function PDFDataRangeTransport_requestDataRange(begin, end) {

      throw new Error('Abstract method PDFDataRangeTransport.requestDataRange');
    },

    abort: function PDFDataRangeTransport_abort() {

    }
  };
  return PDFDataRangeTransport;
})();

PDFJS.PDFDataRangeTransport = PDFDataRangeTransport;

/**
 * Proxy to a PDFDocument in the worker thread. Also, contains commonly used
 * properties that can be read synchronously.
 * @class
 * @alias PDFDocumentProxy
 */
var PDFDocumentProxy = (function PDFDocumentProxyClosure() {

  function PDFDocumentProxy(pdfInfo, transport, loadingTask) {
trace_stack.push({location:3,context:{'this':this, 'transport':transport}});

    this.pdfInfo = pdfInfo;
    this.transport = transport;
    this.loadingTask = loadingTask;
  }
  PDFDocumentProxy.prototype = /** @lends PDFDocumentProxy.prototype */ {
    /**
     * @return {number} Total number of pages the PDF contains.
     */
    get numPages() {
      return this.pdfInfo.numPages;
    },
    /**
     * @return {string} A unique ID to identify a PDF. Not guaranteed to be
     * unique.
     */
    get fingerprint() {
      return this.pdfInfo.fingerprint;
    },
    /**
     * @param {number} pageNumber The page number to get. The first page is 1.
     * @return {Promise} A promise that is resolved with a {@link PDFPageProxy}
     * object.
     */
    getPage: function PDFDocumentProxy_getPage(pageNumber) {

      return this.transport.getPage(pageNumber);
    },
    /**
     * @param {{num: number, gen: number}} ref The page reference. Must have
     *   the 'num' and 'gen' properties.
     * @return {Promise} A promise that is resolved with the page index that is
     * associated with the reference.
     */
    getPageIndex: function PDFDocumentProxy_getPageIndex(ref) {

      return this.transport.getPageIndex(ref);
    },
    /**
     * @return {Promise} A promise that is resolved with a lookup table for
     * mapping named destinations to reference numbers.
     *
     * This can be slow for large documents: use getDestination instead
     */
    getDestinations: function PDFDocumentProxy_getDestinations() {

      return this.transport.getDestinations();
    },
    /**
     * @param {string} id The named destination to get.
     * @return {Promise} A promise that is resolved with all information
     * of the given named destination.
     */
    getDestination: function PDFDocumentProxy_getDestination(id) {

      return this.transport.getDestination(id);
    },
    /**
     * @return {Promise} A promise that is resolved with a lookup table for
     * mapping named attachments to their content.
     */
    getAttachments: function PDFDocumentProxy_getAttachments() {

      return this.transport.getAttachments();
    },
    /**
     * @return {Promise} A promise that is resolved with an array of all the
     * JavaScript strings in the name tree.
     */
    getJavaScript: function PDFDocumentProxy_getJavaScript() {

      return this.transport.getJavaScript();
    },
    /**
     * @return {Promise} A promise that is resolved with an {Array} that is a
     * tree outline (if it has one) of the PDF. The tree is in the format of:
     * [
     *  {
     *   title: string,
     *   bold: boolean,
     *   italic: boolean,
     *   color: rgb array,
     *   dest: dest obj,
     *   items: array of more items like this
     *  },
     *  ...
     * ].
     */
    getOutline: function PDFDocumentProxy_getOutline() {

      return this.transport.getOutline();
    },
    /**
     * @return {Promise} A promise that is resolved with an {Object} that has
     * info and metadata properties.  Info is an {Object} filled with anything
     * available in the information dictionary and similarly metadata is a
     * {Metadata} object with information from the metadata section of the PDF.
     */
    getMetadata: function PDFDocumentProxy_getMetadata() {
      return this.transport.getMetadata();
    },
    /**
     * @return {Promise} A promise that is resolved with a TypedArray that has
     * the raw data from the PDF.
     */
    getData: function PDFDocumentProxy_getData() {

      return this.transport.getData();
    },
    /**
     * @return {Promise} A promise that is resolved when the document's data
     * is loaded. It is resolved with an {Object} that contains the length
     * property that indicates size of the PDF data in bytes.
     */
    getDownloadInfo: function PDFDocumentProxy_getDownloadInfo() {

      return this.transport.downloadInfoCapability.promise;
    },
    /**
     * @return {Promise} A promise this is resolved with current stats about
     * document structures (see {@link PDFDocumentStats}).
     */
    getStats: function PDFDocumentProxy_getStats() {

      return this.transport.getStats();
    },
    /**
     * Cleans up resources allocated by the document, e.g. created @font-face.
     */
    cleanup: function PDFDocumentProxy_cleanup() {

      this.transport.startCleanup();
    },
    /**
     * Destroys current document instance and terminates worker.
     */
    destroy: function PDFDocumentProxy_destroy() {

      return this.loadingTask.destroy();
    }
  };
  return PDFDocumentProxy;
})();

/**
 * Page getTextContent parameters.
 *
 * @typedef {Object} getTextContentParameters
 * @param {boolean} normalizeWhitespace - replaces all occurrences of
 *   whitespace with standard spaces (0x20). The default value is `false`.
 */

/**
 * Page text content.
 *
 * @typedef {Object} TextContent
 * @property {array} items - array of {@link TextItem}
 * @property {Object} styles - {@link TextStyles} objects, indexed by font
 *                    name.
 */

/**
 * Page text content part.
 *
 * @typedef {Object} TextItem
 * @property {string} str - text content.
 * @property {string} dir - text direction: 'ttb', 'ltr' or 'rtl'.
 * @property {array} transform - transformation matrix.
 * @property {number} width - width in device space.
 * @property {number} height - height in device space.
 * @property {string} fontName - font name used by pdf.js for converted font.
 */

/**
 * Text style.
 *
 * @typedef {Object} TextStyle
 * @property {number} ascent - font ascent.
 * @property {number} descent - font descent.
 * @property {boolean} vertical - text is in vertical mode.
 * @property {string} fontFamily - possible font family
 */

/**
 * Page annotation parameters.
 *
 * @typedef {Object} GetAnnotationsParameters
 * @param {string} intent - Determines the annotations that will be fetched,
 *                 can be either 'display' (viewable annotations) or 'print'
 *                 (printable annotations).
 *                 If the parameter is omitted, all annotations are fetched.
 */

/**
 * Page render parameters.
 *
 * @typedef {Object} RenderParameters
 * @property {Object} canvasContext - A 2D context of a DOM Canvas object.
 * @property {PDFJS.PageViewport} viewport - Rendering viewport obtained by
 *                                calling of PDFPage.getViewport method.
 * @property {string} intent - Rendering intent, can be 'display' or 'print'
 *                    (default value is 'display').
 * @property {Array}  transform - (optional) Additional transform, applied
 *                    just before viewport transform.
 * @property {Object} imageLayer - (optional) An object that has beginLayout,
 *                    endLayout and appendImage functions.
 * @property {function} continueCallback - (deprecated) A function that will be
 *                      called each time the rendering is paused.  To continue
 *                      rendering call the function that is the first argument
 *                      to the callback.
 */

/**
 * PDF page operator list.
 *
 * @typedef {
trace_stack.push({location:4,context:{}});
Object} PDFOperatorList
 * @property {Array} fnArray - Array containing the operator functions.
 * @property {Array} argsArray - Array containing the arguments of the
 *                               functions.
 */

/**
 * Proxy to a PDFPage in the worker thread.
 * @class
 * @alias PDFPageProxy
 */
var PDFPageProxy = (function PDFPageProxyClosure() {
  function PDFPageProxy(pageIndex, pageInfo, transport) {
    this.pageIndex = pageIndex;
    this.pageInfo = pageInfo;
    this.transport = transport;
    this.stats = new StatTimer();
    this.stats.enabled = !!globalScope.PDFJS.enableStats;
    this.commonObjs = transport.commonObjs;
    this.objs = new PDFObjects();
    this.cleanupAfterRender = false;
    this.pendingCleanup = false;
    this.intentStates = {};
    this.destroyed = false;
  }
  PDFPageProxy.prototype = /** @lends PDFPageProxy.prototype */ {
    /**
     * @return {number} Page number of the page. First page is 1.
     */
    get pageNumber() {
      return this.pageIndex + 1;
    },
    /**
     * @return {number} The number of degrees the page is rotated clockwise.
     */
    get rotate() {
      return this.pageInfo.rotate;
    },
    /**
     * @return {Object} The reference that points to this page. It has 'num' and
     * 'gen' properties.
     */
    get ref() {
      return this.pageInfo.ref;
    },
    /**
     * @return {Array} An array of the visible portion of the PDF page in the
     * user space units - [x1, y1, x2, y2].
     */
    get view() {
      return this.pageInfo.view;
    },
    /**
     * @param {number} scale The desired scale of the viewport.
     * @param {number} rotate Degrees to rotate the viewport. If omitted this
     * defaults to the page rotation.
     * @return {PDFJS.PageViewport} Contains 'width' and 'height' properties
     * along with transforms required for rendering.
     */
    getViewport: function PDFPageProxy_getViewport(scale, rotate) {
      if (arguments.length < 2) {
        rotate = this.rotate;
      }
      return new PDFJS.PageViewport(this.view, scale, rotate, 0, 0);
    },
    /**
     * @param {GetAnnotationsParameters} params - Annotation parameters.
     * @return {Promise} A promise that is resolved with an {Array} of the
     * annotation objects.
     */
    getAnnotations: function PDFPageProxy_getAnnotations(params) {
      var intent = (params && params.intent) || null;

      if (!this.annotationsPromise || this.annotationsIntent !== intent) {
        this.annotationsPromise = this.transport.getAnnotations(this.pageIndex,
                                                                intent);
        this.annotationsIntent = intent;
      }
      return this.annotationsPromise;
    },
    /**
     * Begins the process of rendering a page to the desired context.
     * @param {RenderParameters} params Page render parameters.
     * @return {RenderTask} An object that contains the promise, which
     *                      is resolved when the page finishes rendering.
     */
    render: function PDFPageProxy_render(params) {
      var stats = this.stats;
      stats.time('Overall');

      // If there was a pending destroy cancel it so no cleanup happens during
      // this call to render.
      this.pendingCleanup = false;

      var renderingIntent = (params.intent === 'print' ? 'print' : 'display');

      if (!this.intentStates[renderingIntent]) {
        this.intentStates[renderingIntent] = {};
      }
      var intentState = this.intentStates[renderingIntent];

trace_stack.push({location:5,context:{'this':this}});

      // If there's no displayReadyCapability yet, then the operatorList
      // was never requested before. Make the request and create the promise.
      if (!intentState.displayReadyCapability) {
        intentState.receivingOperatorList = true;
        intentState.displayReadyCapability = createPromiseCapability();
        intentState.operatorList = {
          fnArray: [],
          argsArray: [],
          lastChunk: false
        };

        this.stats.time('Page Request');
        this.transport.messageHandler.send('RenderPageRequest', {
          pageIndex: this.pageNumber - 1,
          intent: renderingIntent
        });
      }

      var internalRenderTask = new InternalRenderTask(complete, params,
                                                      this.objs,
                                                      this.commonObjs,
                                                      intentState.operatorList,
                                                      this.pageNumber);
      internalRenderTask.useRequestAnimationFrame = renderingIntent !== 'print';
      if (!intentState.renderTasks) {
        intentState.renderTasks = [];
      }
      intentState.renderTasks.push(internalRenderTask);
      var renderTask = internalRenderTask.task;

      // Obsolete parameter support
      if (params.continueCallback) {
        deprecated('render is used with continueCallback parameter');
        renderTask.onContinue = params.continueCallback;
      }

      var self = this;
      intentState.displayReadyCapability.promise.then(
        function pageDisplayReadyPromise(transparency) {
          if (self.pendingCleanup) {
            complete();
            return;
          }
          stats.time('Rendering');
          internalRenderTask.initalizeGraphics(transparency);
          internalRenderTask.operatorListChanged();
        },
        function pageDisplayReadPromiseError(reason) {
          complete(reason);
        }
      );

      function complete(error) {
        var i = intentState.renderTasks.indexOf(internalRenderTask);
        if (i >= 0) {
          intentState.renderTasks.splice(i, 1);
        }

        if (self.cleanupAfterRender) {
          self.pendingCleanup = true;
        }
        self._tryCleanup();

        if (error) {
          internalRenderTask.capability.reject(error);
        } else {
          internalRenderTask.capability.resolve();
        }
        stats.timeEnd('Rendering');
        stats.timeEnd('Overall');
      }

      return renderTask;
    },

    /**
     * @return {Promise} A promise resolved with an {@link PDFOperatorList}
     * object that represents page's operator list.
     */
    getOperatorList: function PDFPageProxy_getOperatorList() {
      function operatorListChanged() {
        if (intentState.operatorList.lastChunk) {
          intentState.opListReadCapability.resolve(intentState.operatorList);
        }
      }

      var renderingIntent = 'oplist';
      if (!this.intentStates[renderingIntent]) {
        this.intentStates[renderingIntent] = {};
      }
      var intentState = this.intentStates[renderingIntent];

      if (!intentState.opListReadCapability) {
        var opListTask = {};
        opListTask.operatorListChanged = operatorListChanged;
        intentState.receivingOperatorList = true;
        intentState.opListReadCapability = createPromiseCapability();
        intentState.renderTasks = [];
        intentState.renderTasks.push(opListTask);
        intentState.operatorList = {
          fnArray: [],
          argsArray: [],
          lastChunk: false
        };

        this.transport.messageHandler.send('RenderPageRequest', {
          pageIndex: this.pageIndex,
          intent: renderingIntent
        });
      }
      return intentState.opListReadCapability.promise;
    },

    /**
     * @param {getTextContentParameters} params - getTextContent parameters.
     * @return {Promise} That is resolved a {@link TextContent}
     * object that represent the page text content.
     */
    getTextContent: function PDFPageProxy_getTextContent(params) {
      var normalizeWhitespace = (params && params.normalizeWhitespace) || false;

      return this.transport.messageHandler.sendWithPromise('GetTextContent', {
        pageIndex: this.pageNumber - 1,
        normalizeWhitespace: normalizeWhitespace,
      });
    },

    /**
     * Destroys page object.
     */
    _destroy: function PDFPageProxy_destroy() {
      this.destroyed = true;
      this.transport.pageCache[this.pageIndex] = null;

      var waitOn = [];
      Object.keys(this.intentStates).forEach(function(intent) {
        var intentState = this.intentStates[intent];
        intentState.renderTasks.forEach(function(renderTask) {
          var renderCompleted = renderTask.capability.promise.
            catch(function () {}); // ignoring failures
          waitOn.push(renderCompleted);
          renderTask.cancel();
        });
      }, this);
      this.objs.clear();
      this.annotationsPromise = null;
      this.pendingCleanup = false;
      return Promise.all(waitOn);
    },

    /**
     * Cleans up resources allocated by the page. (deprecated)
     */
    destroy: function() {
      deprecated('page destroy method, use cleanup() instead');
      this.cleanup();
    },

    /**
     * Cleans up resources allocated by the page.
     */
    cleanup: function PDFPageProxy_cleanup() {
      this.pendingCleanup = true;
      this._tryCleanup();
    },
    /**
     * For internal use only. Attempts to clean up if rendering is in a state
     * where that's possible.
     * @ignore
     */
    _tryCleanup: function PDFPageProxy_tryCleanup() {
      if (!this.pendingCleanup ||
          Object.keys(this.intentStates).some(function(intent) {
            var intentState = this.intentStates[intent];
            return (intentState.renderTasks.length !== 0 ||
                    intentState.receivingOperatorList);
          }, this)) {
        return;
      }

      Object.keys(this.intentStates).forEach(function(intent) {
        delete this.intentStates[intent];
      }, this);
      this.objs.clear();
      this.annotationsPromise = null;
      this.pendingCleanup = false;
    },
    /**
     * For internal use only.
     * @ignore
     */
    _startRenderPage: function PDFPageProxy_startRenderPage(transparency,
                                                            intent) {
      var intentState = this.intentStates[intent];
      // TODO Refactor RenderPageRequest to separate rendering
      // and operator list logic
      if (intentState.displayReadyCapability) {
        intentState.displayReadyCapability.resolve(transparency);
      }
    },
    /**
     * For internal use only.
     * @ignore
     */
    _renderPageChunk: function PDFPageProxy_renderPageChunk(operatorListChunk,
                                                            intent) {
      var intentState = this.intentStates[intent];
      var i, ii;
      // Add the new chunk to the current operator list.
      for (i = 0, ii = operatorListChunk.length; i < ii; i++) {
        intentState.operatorList.fnArray.push(operatorListChunk.fnArray[i]);
        intentState.operatorList.argsArray.push(
          operatorListChunk.argsArray[i]);
      }
      intentState.operatorList.lastChunk = operatorListChunk.lastChunk;

      // Notify all the rendering tasks there are more operators to be consumed.
      for (i = 0; i < intentState.renderTasks.length; i++) {
        intentState.renderTasks[i].operatorListChanged();
      }

      if (operatorListChunk.lastChunk) {
        intentState.receivingOperatorList = false;
        this._tryCleanup();
      }
    }
  };
  return PDFPageProxy;
})();

/**
 * PDF.js web worker abstraction, it controls instantiation of PDF documents and
 * WorkerTransport for them.  If creation of a web worker is not possible,
 * a "fake" worker will be used instead.
 * @class
 */
var PDFWorker = (function PDFWorkerClosure() {

  var nextFakeWorkerId = 0;

  // Loads worker code into main thread.
  function setupFakeWorkerGlobal() {

    if (!PDFJS.fakeWorkerFilesLoadedCapability) {
      PDFJS.fakeWorkerFilesLoadedCapability = createPromiseCapability();
      // In the developer build load worker_loader which in turn loads all the
      // other files and resolves the promise. In production only the
      // pdf.worker.js file is needed.
      Util.loadScript(PDFJS.workerSrc, function() {

        PDFJS.fakeWorkerFilesLoadedCapability.resolve();
      });
    }
    return PDFJS.fakeWorkerFilesLoadedCapability.promise;
  }

  function PDFWorker(name) {
trace_stack.push({location:6,context:{}});

    this.name = name;
    this.destroyed = false;

    this._readyCapability = createPromiseCapability();
    this._port = null;
    this._webWorker = null;
    this._messageHandler = null;
    this._initialize();
  }

  PDFWorker.prototype =  /** @lends PDFWorker.prototype */ {
    get promise() {
      return this._readyCapability.promise;
    },

    get port() {
      return this._port;
    },

    get messageHandler() {
      return this._messageHandler;
    },

    _initialize: function PDFWorker_initialize() {

      // If worker support isn't disabled explicit and the browser has worker
      // support, create a new web worker and test if it/the browser fullfills
      // all requirements to run parts of pdf.js in a web worker.
      // Right now, the requirement is, that an Uint8Array is still an
      // Uint8Array as it arrives on the worker. (Chrome added this with v.15.)
      if (!globalScope.PDFJS.disableWorker && typeof Worker !== 'undefined') {
        var workerSrc = PDFJS.workerSrc;
        if (!workerSrc) {
          error('No PDFJS.workerSrc specified');
        }
trace_stack.push({location:7,context:{'this':this}});

        try {
          // Some versions of FF can't create a worker on localhost, see:
          // https://bugzilla.mozilla.org/show_bug.cgi?id=683280
          var worker = new Worker(workerSrc);
          var messageHandler = new MessageHandler('main', 'worker', worker);

          messageHandler.on('test', function PDFWorker_test(data) {


            if (this.destroyed) {
              this._readyCapability.reject(new Error('Worker was destroyed'));
              messageHandler.destroy();
              worker.terminate();
              return; // worker was destroyed
            }
            var supportTypedArray = data && data.supportTypedArray;
            if (supportTypedArray) {
              this._messageHandler = messageHandler;
              this._port = worker;
              this._webWorker = worker;
              if (!data.supportTransfers) {
                PDFJS.postMessageTransfers = false;
              }
              this._readyCapability.resolve();
            } else {
              this._setupFakeWorker();
              messageHandler.destroy();
              worker.terminate();
            }
          }.bind(this));

          messageHandler.on('console_log', function (data) {

            console.log.apply(console, data);
          });
          messageHandler.on('console_error', function (data) {

            console.error.apply(console, data);
          });

          var testObj = new Uint8Array([PDFJS.postMessageTransfers ? 255 : 0]);
          // Some versions of Opera throw a DATA_CLONE_ERR on serializing the
          // typed array. Also, checking if we can use transfers.
          try {
            messageHandler.send('test', testObj, [testObj.buffer]);
          } catch (ex) {
            info('Cannot use postMessage transfers');
            testObj[0] = 0;
            messageHandler.send('test', testObj);
          }
          return;
        } catch (e) {
          info('The worker has been disabled.');
        }
      }
      // Either workers are disabled, not supported or have thrown an exception.
      // Thus, we fallback to a faked worker.
      this._setupFakeWorker();
    },

    _setupFakeWorker: function PDFWorker_setupFakeWorker() {

      warn('Setting up fake worker.');
      globalScope.PDFJS.disableWorker = true;

      setupFakeWorkerGlobal().then(function () {
trace_stack.push({location:8,context:{'this':this}});

        if (this.destroyed) {
          this._readyCapability.reject(new Error('Worker was destroyed'));
          return;
        }

        // If we don't use a worker, just post/sendMessage to the main thread.
        var port = {
          _listeners: [],
          postMessage: function (obj) {

            var e = {data: obj};
            this._listeners.forEach(function (listener) {
              listener.call(this, e);
            }, this);
          },
          addEventListener: function (name, listener) {

            this._listeners.push(listener);
          },
          removeEventListener: function (name, listener) {

            var i = this._listeners.indexOf(listener);
            this._listeners.splice(i, 1);
          },
          terminate: function () {
}
        };
        this._port = port;

        // All fake workers use the same port, making id unique.
        var id = 'fake' + (nextFakeWorkerId++);

        // If the main thread is our worker, setup the handling for the
        // messages -- the main thread sends to it self.
        var workerHandler = new MessageHandler(id + '_worker', id, port);
        PDFJS.WorkerMessageHandler.setup(workerHandler, port);

        var messageHandler = new MessageHandler(id, id + '_worker', port);
        this._messageHandler = messageHandler;
        this._readyCapability.resolve();
      }.bind(this));
    },

    /**
     * Destroys the worker instance.
     */
    destroy: function PDFWorker_destroy() {
trace_stack.push({location:9,context:{'this':this}});

      this.destroyed = true;
      if (this._webWorker) {
        // We need to terminate only web worker created resource.
        this._webWorker.terminate();
        this._webWorker = null;
      }
      this._port = null;
      if (this._messageHandler) {
        this._messageHandler.destroy();
        this._messageHandler = null;
      }
    }
  };

  return PDFWorker;
})();
PDFJS.PDFWorker = PDFWorker;

/**
 * For internal use only.
 * @ignore
 */
var WorkerTransport = (function WorkerTransportClosure() {

  function WorkerTransport(messageHandler, loadingTask, pdfDataRangeTransport) {


    this.messageHandler = messageHandler;
    this.loadingTask = loadingTask;
    this.pdfDataRangeTransport = pdfDataRangeTransport;
    this.commonObjs = new PDFObjects();
    this.fontLoader = new FontLoader(loadingTask.docId);

trace_stack.push({location:10,context:{'this':this}});

    this.destroyed = false;
    this.destroyCapability = null;

    this.pageCache = [];
    this.pagePromises = [];
    this.downloadInfoCapability = createPromiseCapability();

    this.setupMessageHandler();
  }
  WorkerTransport.prototype = {
    destroy: function WorkerTransport_destroy() {


      if (this.destroyCapability) {
        return this.destroyCapability.promise;
      }

      this.destroyed = true;
      this.destroyCapability = createPromiseCapability();

trace_stack.push({location:11,context:{'this':this}});

      var waitOn = [];
      // We need to wait for all renderings to be completed, e.g.
      // timeout/rAF can take a long time.
      this.pageCache.forEach(function (page) {
        if (page) {
          waitOn.push(page._destroy());
        }
      });
      this.pageCache = [];
      this.pagePromises = [];
      var self = this;
      // We also need to wait for the worker to finish its long running tasks.
      var terminated = this.messageHandler.sendWithPromise('Terminate', null);
      waitOn.push(terminated);
      Promise.all(waitOn).then(function () {

        self.fontLoader.clear();
        if (self.pdfDataRangeTransport) {
          self.pdfDataRangeTransport.abort();
          self.pdfDataRangeTransport = null;
        }
        if (self.messageHandler) {
          self.messageHandler.destroy();
          self.messageHandler = null;
        }
        self.destroyCapability.resolve();
      }, this.destroyCapability.reject);
      return this.destroyCapability.promise;
    },

    setupMessageHandler:
      function WorkerTransport_setupMessageHandler() {

      var messageHandler = this.messageHandler;

      function updatePassword(password) {

        messageHandler.send('UpdatePassword', password);
      }

      var pdfDataRangeTransport = this.pdfDataRangeTransport;
      if (pdfDataRangeTransport) {
        pdfDataRangeTransport.addRangeListener(function(begin, chunk) {

          messageHandler.send('OnDataRange', {
            begin: begin,
            chunk: chunk
          });
        });

        pdfDataRangeTransport.addProgressListener(function(loaded) {

          messageHandler.send('OnDataProgress', {
            loaded: loaded
          });
        });

        pdfDataRangeTransport.addProgressiveReadListener(function(chunk) {

          messageHandler.send('OnDataRange', {
            chunk: chunk
          });
        });

        messageHandler.on('RequestDataRange',
          function transportDataRange(data) {

            pdfDataRangeTransport.requestDataRange(data.begin, data.end);
          }, this);
      }

      messageHandler.on('GetDoc', function transportDoc(data) {
trace_stack.push({location:12,context:{'data':data, 'this':this}});

        var pdfInfo = data.pdfInfo;
        this.numPages = data.pdfInfo.numPages;
        var loadingTask = this.loadingTask;
        var pdfDocument = new PDFDocumentProxy(pdfInfo, this, loadingTask);
        this.pdfDocument = pdfDocument;
        loadingTask._capability.resolve(pdfDocument);
      }, this);

      messageHandler.on('NeedPassword',
                        function transportNeedPassword(exception) {
trace_stack.push({location:13,context:{'this':this}});

        var loadingTask = this.loadingTask;
        if (loadingTask.onPassword) {
          return loadingTask.onPassword(updatePassword,
                                        PasswordResponses.NEED_PASSWORD);
        }
        loadingTask._capability.reject(
          new PasswordException(exception.message, exception.code));
      }, this);

      messageHandler.on('IncorrectPassword',
                        function transportIncorrectPassword(exception) {
trace_stack.push({location:14,context:{}});

        var loadingTask = this.loadingTask;
        if (loadingTask.onPassword) {
          return loadingTask.onPassword(updatePassword,
                                        PasswordResponses.INCORRECT_PASSWORD);
        }
        loadingTask._capability.reject(
          new PasswordException(exception.message, exception.code));
      }, this);

      messageHandler.on('InvalidPDF', function transportInvalidPDF(exception) {

        this.loadingTask._capability.reject(
          new InvalidPDFException(exception.message));
      }, this);

      messageHandler.on('MissingPDF', function transportMissingPDF(exception) {

        this.loadingTask._capability.reject(
          new MissingPDFException(exception.message));
      }, this);

      messageHandler.on('UnexpectedResponse',
                        function transportUnexpectedResponse(exception) {

        this.loadingTask._capability.reject(
          new UnexpectedResponseException(exception.message, exception.status));
      }, this);

      messageHandler.on('UnknownError',
                        function transportUnknownError(exception) {

        this.loadingTask._capability.reject(
          new UnknownErrorException(exception.message, exception.details));
      }, this);

      messageHandler.on('DataLoaded', function transportPage(data) {

        this.downloadInfoCapability.resolve(data);
      }, this);

      messageHandler.on('PDFManagerReady', function transportPage(data) {

        if (this.pdfDataRangeTransport) {
          this.pdfDataRangeTransport.transportReady();
        }
      }, this);

      messageHandler.on('StartRenderPage', function transportRender(data) {
trace_stack.push({location:15,context:{'this':this}});

        if (this.destroyed) {
          return; // Ignore any pending requests if the worker was terminated.
        }
        var page = this.pageCache[data.pageIndex];

        page.stats.timeEnd('Page Request');
        page._startRenderPage(data.transparency, data.intent);
      }, this);

      messageHandler.on('RenderPageChunk', function transportRender(data) {

        if (this.destroyed) {
          return; // Ignore any pending requests if the worker was terminated.
        }
        var page = this.pageCache[data.pageIndex];

        page._renderPageChunk(data.operatorList, data.intent);
      }, this);

      messageHandler.on('commonobj', function transportObj(data) {
trace_stack.push({location:16,context:{'data':data, 'this':this}});

        if (this.destroyed) {
          return; // Ignore any pending requests if the worker was terminated.
        }

        var id = data[0];
        var type = data[1];
        if (this.commonObjs.hasData(id)) {
          return;
        }

        switch (type) {
          case 'Font':
            var exportedData = data[2];

            var font;
            if ('error' in exportedData) {
              var error = exportedData.error;
              warn('Error during font loading: ' + error);
              this.commonObjs.resolve(id, error);
              break;
            } else {
              font = new FontFaceObject(exportedData);
            }

            this.fontLoader.bind(
              [font],
              function fontReady(fontObjs) {

                this.commonObjs.resolve(id, font);
              }.bind(this)
            );
            break;
          case 'FontPath':
            this.commonObjs.resolve(id, data[2]);
            break;
          default:
            error('Got unknown common object type ' + type);
        }
      }, this);

      messageHandler.on('obj', function transportObj(data) {

        if (this.destroyed) {
          return; // Ignore any pending requests if the worker was terminated.
        }

        var id = data[0];
        var pageIndex = data[1];
        var type = data[2];
        var pageProxy = this.pageCache[pageIndex];
        var imageData;
        if (pageProxy.objs.hasData(id)) {
          return;
        }

trace_stack.push({location:17,context:{'data':data, 'this':this}});

        switch (type) {
          case 'JpegStream':
            imageData = data[3];
            loadJpegStream(id, imageData, pageProxy.objs);
            break;
          case 'Image':
            imageData = data[3];
            pageProxy.objs.resolve(id, imageData);

            // heuristics that will allow not to store large data
            var MAX_IMAGE_SIZE_TO_STORE = 8000000;
            if (imageData && 'data' in imageData &&
                imageData.data.length > MAX_IMAGE_SIZE_TO_STORE) {
              pageProxy.cleanupAfterRender = true;
            }
            break;
          default:
            error('Got unknown object type ' + type);
        }
      }, this);

      messageHandler.on('DocProgress', function transportDocProgress(data) {

        if (this.destroyed) {
          return; // Ignore any pending requests if the worker was terminated.
        }

        var loadingTask = this.loadingTask;
        if (loadingTask.onProgress) {
          loadingTask.onProgress({
            loaded: data.loaded,
            total: data.total
          });
        }
      }, this);

      messageHandler.on('PageError', function transportError(data) {
trace_stack.push({location:18,context:{'this':this}});

        if (this.destroyed) {
          return; // Ignore any pending requests if the worker was terminated.
        }

        var page = this.pageCache[data.pageNum - 1];
        var intentState = page.intentStates[data.intent];
        if (intentState.displayReadyCapability) {
          intentState.displayReadyCapability.reject(data.error);
        } else {
          error(data.error);
        }
      }, this);

      messageHandler.on('UnsupportedFeature',
          function transportUnsupportedFeature(data) {
trace_stack.push({location:19,context:{'this':this}});

        if (this.destroyed) {
          return; // Ignore any pending requests if the worker was terminated.
        }
        var featureId = data.featureId;
        var loadingTask = this.loadingTask;
        if (loadingTask.onUnsupportedFeature) {
          loadingTask.onUnsupportedFeature(featureId);
        }
        PDFJS.UnsupportedManager.notify(featureId);
      }, this);

      messageHandler.on('JpegDecode', function(data) {
trace_stack.push({location:20,context:{'this':this}});

        if (this.destroyed) {
          return Promise.reject('Worker was terminated');
        }

        var imageUrl = data[0];
        var components = data[1];
        if (components !== 3 && components !== 1) {
          return Promise.reject(
            new Error('Only 3 components or 1 component can be returned'));
        }

        return new Promise(function (resolve, reject) {

          var img = new Image();
          img.onload = function () {

            var width = img.width;
            var height = img.height;
            var size = width * height;
            var rgbaLength = size * 4;
            var buf = new Uint8Array(size * components);
            var tmpCanvas = createScratchCanvas(width, height);
            var tmpCtx = tmpCanvas.getContext('2d');
            tmpCtx.drawImage(img, 0, 0);
            var data = tmpCtx.getImageData(0, 0, width, height).data;
            var i, j;
trace_stack.push({location:21,context:{'this':this}});

            if (components === 3) {
              for (i = 0, j = 0; i < rgbaLength; i += 4, j += 3) {
                buf[j] = data[i];
                buf[j + 1] = data[i + 1];
                buf[j + 2] = data[i + 2];
              }
            } else if (components === 1) {
              for (i = 0, j = 0; i < rgbaLength; i += 4, j++) {
                buf[j] = data[i];
              }
            }
            resolve({ data: buf, width: width, height: height});
          };
          img.onerror = function () {

            reject(new Error('JpegDecode failed to load image'));
          };
          img.src = imageUrl;
        });
      }, this);
    },

    getData: function WorkerTransport_getData() {

      return this.messageHandler.sendWithPromise('GetData', null);
    },

    getPage: function WorkerTransport_getPage(pageNumber, capability) {

      if (pageNumber <= 0 || pageNumber > this.numPages ||
          (pageNumber|0) !== pageNumber) {
        return Promise.reject(new Error('Invalid page request'));
      }

      var pageIndex = pageNumber - 1;
      if (pageIndex in this.pagePromises) {
        return this.pagePromises[pageIndex];
      }
      var promise = this.messageHandler.sendWithPromise('GetPage', {
        pageIndex: pageIndex
      }).then(function (pageInfo) {

        if (this.destroyed) {
          throw new Error('Transport destroyed');
        }
        var page = new PDFPageProxy(pageIndex, pageInfo, this);
        this.pageCache[pageIndex] = page;
        return page;
      }.bind(this));
      this.pagePromises[pageIndex] = promise;
      return promise;
    },

    getPageIndex: function WorkerTransport_getPageIndexByRef(ref) {

      return this.messageHandler.sendWithPromise('GetPageIndex', { ref: ref });
    },

    getAnnotations: function WorkerTransport_getAnnotations(pageIndex, intent) {

      return this.messageHandler.sendWithPromise('GetAnnotations', {
        pageIndex: pageIndex,
        intent: intent,
      });
    },

    getDestinations: function WorkerTransport_getDestinations() {

      return this.messageHandler.sendWithPromise('GetDestinations', null);
    },

    getDestination: function WorkerTransport_getDestination(id) {

      return this.messageHandler.sendWithPromise('GetDestination', { id: id });
    },

    getAttachments: function WorkerTransport_getAttachments() {

      return this.messageHandler.sendWithPromise('GetAttachments', null);
    },

    getJavaScript: function WorkerTransport_getJavaScript() {

      return this.messageHandler.sendWithPromise('GetJavaScript', null);
    },

    getOutline: function WorkerTransport_getOutline() {

      return this.messageHandler.sendWithPromise('GetOutline', null);
    },

    getMetadata: function WorkerTransport_getMetadata() {

      return this.messageHandler.sendWithPromise('GetMetadata', null).
        then(function transportMetadata(results) {

        return {
          info: results[0],
          metadata: (results[1] ? new PDFJS.Metadata(results[1]) : null)
        };
      });
    },

    getStats: function WorkerTransport_getStats() {

      return this.messageHandler.sendWithPromise('GetStats', null);
    },

    startCleanup: function WorkerTransport_startCleanup() {

      this.messageHandler.sendWithPromise('Cleanup', null).
        then(function endCleanup() {
trace_stack.push({location:22,context:{'this':this}});

        for (var i = 0, ii = this.pageCache.length; i < ii; i++) {
          var page = this.pageCache[i];
          if (page) {
            page.cleanup();
          }
        }
        this.commonObjs.clear();
        this.fontLoader.clear();
      }.bind(this));
    }
  };
  return WorkerTransport;

})();

/**
 * A PDF document and page is built of many objects. E.g. there are objects
 * for fonts, images, rendering code and such. These objects might get processed
 * inside of a worker. The `PDFObjects` implements some basic functions to
 * manage these objects.
 * @ignore
 */
var PDFObjects = (function PDFObjectsClosure() {
  function PDFObjects() {
    this.objs = {};
  }

  PDFObjects.prototype = {
    /**
     * Internal function.
     * Ensures there is an object defined for `objId`.
     */
    ensureObj: function PDFObjects_ensureObj(objId) {
      if (this.objs[objId]) {
        return this.objs[objId];
      }

      var obj = {
        capability: createPromiseCapability(),
        data: null,
        resolved: false
      };
      this.objs[objId] = obj;

      return obj;
    },

    /**
     * If called *without* callback, this returns the data of `objId` but the
     * object needs to be resolved. If it isn't, this function throws.
     *
     * If called *with* a callback, the callback is called with the data of the
     * object once the object is resolved. That means, if you call this
     * function and the object is already resolved, the callback gets called
     * right away.
     */
    get: function PDFObjects_get(objId, callback) {
      // If there is a callback, then the get can be async and the object is
      // not required to be resolved right now
      if (callback) {
        this.ensureObj(objId).capability.promise.then(callback);
        return null;
      }

      // If there isn't a callback, the user expects to get the resolved data
      // directly.
      var obj = this.objs[objId];

trace_stack.push({location:23,context:{'this':this}});

      // If there isn't an object yet or the object isn't resolved, then the
      // data isn't ready yet!
      if (!obj || !obj.resolved) {
        error('Requesting object that isn\'t resolved yet ' + objId);
      }

      return obj.data;
    },

    /**
     * Resolves the object `objId` with optional `data`.
     */
    resolve: function PDFObjects_resolve(objId, data) {
      var obj = this.ensureObj(objId);

      obj.resolved = true;
      obj.data = data;
      obj.capability.resolve(data);
    },

    isResolved: function PDFObjects_isResolved(objId) {
      var objs = this.objs;

      if (!objs[objId]) {
        return false;
      } else {
        return objs[objId].resolved;
      }
    },

    hasData: function PDFObjects_hasData(objId) {
      return this.isResolved(objId);
    },

    /**
     * Returns the data of `objId` if object exists, null otherwise.
     */
    getData: function PDFObjects_getData(objId) {
      var objs = this.objs;
      if (!objs[objId] || !objs[objId].resolved) {
        return null;
      } else {
        return objs[objId].data;
      }
    },

    clear: function PDFObjects_clear() {
      this.objs = {};
    }
  };
  return PDFObjects;
})();

/**
 * Allows controlling of the rendering tasks.
 * @class
 * @alias RenderTask
 */
var RenderTask = (function RenderTaskClosure() {

  function RenderTask(internalRenderTask) {

    this._internalRenderTask = internalRenderTask;

    /**
     * Callback for incremental rendering -- a function that will be called
     * each time the rendering is paused.  To continue rendering call the
     * function that is the first argument to the callback.
     * @type {function}
     */
    this.onContinue = null;
  }

  RenderTask.prototype = /** @lends RenderTask.prototype */ {
    /**
     * Promise for rendering task completion.
     * @return {Promise}
     */
    get promise() {

      return this._internalRenderTask.capability.promise;
    },

    /**
     * Cancels the rendering task. If the task is currently rendering it will
     * not be cancelled until graphics pauses with a timeout. The promise that
     * this object extends will resolved when cancelled.
     */
    cancel: function RenderTask_cancel() {

      this._internalRenderTask.cancel();
    },

    /**
     * Registers callbacks to indicate the rendering task completion.
     *
     * @param {function} onFulfilled The callback for the rendering completion.
     * @param {function} onRejected The callback for the rendering failure.
     * @return {Promise} A promise that is resolved after the onFulfilled or
     *                   onRejected callback.
     */
    then: function RenderTask_then(onFulfilled, onRejected) {

      return this.promise.then.apply(this.promise, arguments);
    }
  };

  return RenderTask;
})();

/**
 * For internal use only.
 * @ignore
 */
var InternalRenderTask = (function InternalRenderTaskClosure() {


  function InternalRenderTask(callback, params, objs, commonObjs, operatorList,
                              pageNumber) {

    this.callback = callback;
    this.params = params;
    this.objs = objs;
    this.commonObjs = commonObjs;
    this.operatorListIdx = null;
    this.operatorList = operatorList;
    this.pageNumber = pageNumber;
    this.running = false;
    this.graphicsReadyCallback = null;
    this.graphicsReady = false;
    this.useRequestAnimationFrame = false;
    this.cancelled = false;
    this.capability = createPromiseCapability();
    this.task = new RenderTask(this);
trace_stack.push({location:24,context:{'this':this}});
    // caching this-bound methods
    this._continueBound = this._continue.bind(this);
    this._scheduleNextBound = this._scheduleNext.bind(this);
    this._nextBound = this._next.bind(this);
  }

  InternalRenderTask.prototype = {

    initalizeGraphics:
        function InternalRenderTask_initalizeGraphics(transparency) {


      if (this.cancelled) {
        return;
      }
      if (PDFJS.pdfBug && 'StepperManager' in globalScope &&
          globalScope.StepperManager.enabled) {
        this.stepper = globalScope.StepperManager.create(this.pageNumber - 1);
        this.stepper.init(this.operatorList);
        this.stepper.nextBreakPoint = this.stepper.getNextBreakPoint();
      }
trace_stack.push({location:25,context:{'this':this}});

      var params = this.params;
      this.gfx = new CanvasGraphics(params.canvasContext, this.commonObjs,
                                    this.objs, params.imageLayer);

      this.gfx.beginDrawing(params.transform, params.viewport, transparency);
      this.operatorListIdx = 0;
      this.graphicsReady = true;
      if (this.graphicsReadyCallback) {
        this.graphicsReadyCallback();
      }
    },

    cancel: function InternalRenderTask_cancel() {

      this.running = false;
      this.cancelled = true;
      this.callback('cancelled');
    },

    operatorListChanged: function InternalRenderTask_operatorListChanged() {

      if (!this.graphicsReady) {
        if (!this.graphicsReadyCallback) {
          this.graphicsReadyCallback = this._continueBound;
        }
        return;
      }
trace_stack.push({location:26,context:{'this':this}});

      if (this.stepper) {
        this.stepper.updateOperatorList(this.operatorList);
      }

      if (this.running) {
        return;
      }
      this._continue();
    },

    _continue: function InternalRenderTask__continue() {

      this.running = true;
      if (this.cancelled) {
        return;
      }
      if (this.task.onContinue) {
        this.task.onContinue.call(this.task, this._scheduleNextBound);
      } else {
        this._scheduleNext();
      }
    },

    _scheduleNext: function InternalRenderTask__scheduleNext() {

      if (this.useRequestAnimationFrame) {
        window.requestAnimationFrame(this._nextBound);
      } else {
        Promise.resolve(undefined).then(this._nextBound);
      }
    },

    _next: function InternalRenderTask__next() {

      if (this.cancelled) {
        return;
      }
      this.operatorListIdx = this.gfx.executeOperatorList(this.operatorList,
                                        this.operatorListIdx,
                                        this._continueBound,
                                        this.stepper);
      if (this.operatorListIdx === this.operatorList.argsArray.length) {
        this.running = false;
        if (this.operatorList.lastChunk) {
          this.gfx.endDrawing();
          this.callback();
        }
      }
    }

  };

  return InternalRenderTask;
})();

/**
 * (Deprecated) Global observer of unsupported feature usages. Use
 * onUnsupportedFeature callback of the {PDFDocumentLoadingTask} instance.
 */
PDFJS.UnsupportedManager = (function UnsupportedManagerClosure() {

  var listeners = [];
  return {
    listen: function (cb) {

      deprecated('Global UnsupportedManager.listen is used: ' +
                 ' use PDFDocumentLoadingTask.onUnsupportedFeature instead');
      listeners.push(cb);
    },
    notify: function (featureId) {
      for (var i = 0, ii = listeners.length; i < ii; i++) {
        listeners[i](featureId);
      }
    }
  };
})();


var Metadata = PDFJS.Metadata = (function MetadataClosure() {

  function fixMetadata(meta) {

    return meta.replace(/>\\376\\377([^<]+)/g, function(all, codes) {

      var bytes = codes.replace(/\\([0-3])([0-7])([0-7])/g,
                                function(code, d1, d2, d3) {

        return String.fromCharCode(d1 * 64 + d2 * 8 + d3 * 1);
      });
trace_stack.push({location:27,context:{'codes':codes}});
      var chars = '';
      for (var i = 0; i < bytes.length; i += 2) {
        var code = bytes.charCodeAt(i) * 256 + bytes.charCodeAt(i + 1);
        chars += code >= 32 && code < 127 && code !== 60 && code !== 62 &&
          code !== 38 && false ? String.fromCharCode(code) :
          '&#x' + (0x10000 + code).toString(16).substring(1) + ';';
      }
      return '>' + chars;
    });
  }

  function Metadata(meta) {

    if (typeof meta === 'string') {
      // Ghostscript produces invalid metadata
      meta = fixMetadata(meta);

      var parser = new DOMParser();
      meta = parser.parseFromString(meta, 'application/xml');
    } else if (!(meta instanceof Document)) {
      error('Metadata: Invalid metadata object');
    }
trace_stack.push({location:28,context:{'meta':meta}});

    this.metaDocument = meta;
    this.metadata = {};
    this.parse();
  }

  Metadata.prototype = {
    parse: function Metadata_parse() {

      var doc = this.metaDocument;
      var rdf = doc.documentElement;

      if (rdf.nodeName.toLowerCase() !== 'rdf:rdf') { // Wrapped in <xmpmeta>
        rdf = rdf.firstChild;
        while (rdf && rdf.nodeName.toLowerCase() !== 'rdf:rdf') {
          rdf = rdf.nextSibling;
        }
      }
trace_stack.push({location:29,context:{'doc':doc, 'rdf':rdf}});

      var nodeName = (rdf) ? rdf.nodeName.toLowerCase() : null;
      if (!rdf || nodeName !== 'rdf:rdf' || !rdf.hasChildNodes()) {
        return;
      }

      var children = rdf.childNodes, desc, entry, name, i, ii, length, iLength;
      for (i = 0, length = children.length; i < length; i++) {
        desc = children[i];
        if (desc.nodeName.toLowerCase() !== 'rdf:description') {
          continue;
        }

        for (ii = 0, iLength = desc.childNodes.length; ii < iLength; ii++) {
          if (desc.childNodes[ii].nodeName.toLowerCase() !== '#text') {
            entry = desc.childNodes[ii];
            name = entry.nodeName.toLowerCase();
            this.metadata[name] = entry.textContent.trim();
          }
        }
      }
    },

    get: function Metadata_get(name) {

      return this.metadata[name] || null;
    },

    has: function Metadata_has(name) {

      return typeof this.metadata[name] !== 'undefined';
    }
  };

  return Metadata;
})();


// <canvas> contexts store most of the state we need natively.
// However, PDF needs a bit more state, which we store here.

// Minimal font size that would be used during canvas fillText operations.
var MIN_FONT_SIZE = 16;
// Maximum font size that would be used during canvas fillText operations.
var MAX_FONT_SIZE = 100;
var MAX_GROUP_SIZE = 4096;

// Heuristic value used when enforcing minimum line widths.
var MIN_WIDTH_FACTOR = 0.65;

var COMPILE_TYPE3_GLYPHS = true;
var MAX_SIZE_TO_COMPILE = 1000;

var FULL_CHUNK_HEIGHT = 16;

function createScratchCanvas(width, height) {

  var canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function addContextCurrentTransform(ctx) {

  // If the context doesn't expose a `mozCurrentTransform`, add a JS based one.
  if (!ctx.mozCurrentTransform) {
    ctx._originalSave = ctx.save;
    ctx._originalRestore = ctx.restore;
    ctx._originalRotate = ctx.rotate;
    ctx._originalScale = ctx.scale;
    ctx._originalTranslate = ctx.translate;
    ctx._originalTransform = ctx.transform;
    ctx._originalSetTransform = ctx.setTransform;

    ctx._transformMatrix = ctx._transformMatrix || [1, 0, 0, 1, 0, 0];
    ctx._transformStack = [];

    Object.defineProperty(ctx, 'mozCurrentTransform', {
      get: function getCurrentTransform() {

        return this._transformMatrix;
      }
    });

    Object.defineProperty(ctx, 'mozCurrentTransformInverse', {
      get: function getCurrentTransformInverse() {

        // Calculation done using WolframAlpha:
        // http://www.wolframalpha.com/input/?
        //   i=Inverse+{{a%2C+c%2C+e}%2C+{b%2C+d%2C+f}%2C+{0%2C+0%2C+1}}

        var m = this._transformMatrix;
        var a = m[0], b = m[1], c = m[2], d = m[3], e = m[4], f = m[5];

        var ad_bc = a * d - b * c;
        var bc_ad = b * c - a * d;

        return [
          d / ad_bc,
          b / bc_ad,
          c / bc_ad,
          a / ad_bc,
          (d * e - c * f) / bc_ad,
          (b * e - a * f) / ad_bc
        ];
      }
    });

    ctx.save = function ctxSave() {
trace_stack.push({location:30,context:{'this':this}});

      var old = this._transformMatrix;
      this._transformStack.push(old);
      this._transformMatrix = old.slice(0, 6);

      this._originalSave();
    };

    ctx.restore = function ctxRestore() {
trace_stack.push({location:31,context:{'this':this}});

      var prev = this._transformStack.pop();
      if (prev) {
        this._transformMatrix = prev;
        this._originalRestore();
      }
    };

    ctx.translate = function ctxTranslate(x, y) {

      var m = this._transformMatrix;
      m[4] = m[0] * x + m[2] * y + m[4];
      m[5] = m[1] * x + m[3] * y + m[5];

      this._originalTranslate(x, y);
    };

    ctx.scale = function ctxScale(x, y) {

      var m = this._transformMatrix;
      m[0] = m[0] * x;
      m[1] = m[1] * x;
      m[2] = m[2] * y;
      m[3] = m[3] * y;

      this._originalScale(x, y);
    };

    ctx.transform = function ctxTransform(a, b, c, d, e, f) {

      var m = this._transformMatrix;
      this._transformMatrix = [
        m[0] * a + m[2] * b,
        m[1] * a + m[3] * b,
        m[0] * c + m[2] * d,
        m[1] * c + m[3] * d,
        m[0] * e + m[2] * f + m[4],
        m[1] * e + m[3] * f + m[5]
      ];

      ctx._originalTransform(a, b, c, d, e, f);
    };

    ctx.setTransform = function ctxSetTransform(a, b, c, d, e, f) {

      this._transformMatrix = [a, b, c, d, e, f];

      ctx._originalSetTransform(a, b, c, d, e, f);
    };

    ctx.rotate = function ctxRotate(angle) {

      var cosValue = Math.cos(angle);
      var sinValue = Math.sin(angle);

      var m = this._transformMatrix;
      this._transformMatrix = [
        m[0] * cosValue + m[2] * sinValue,
        m[1] * cosValue + m[3] * sinValue,
        m[0] * (-sinValue) + m[2] * cosValue,
        m[1] * (-sinValue) + m[3] * cosValue,
        m[4],
        m[5]
      ];

      this._originalRotate(angle);
    };
  }
}

var CachedCanvases = (function CachedCanvasesClosure() {

  function CachedCanvases() {

    this.cache = Object.create(null);
  }
  CachedCanvases.prototype = {
    getCanvas: function CachedCanvases_getCanvas(id, width, height,
                                                 trackTransform) {

      var canvasEntry;
      if (this.cache[id] !== undefined) {
        canvasEntry = this.cache[id];
        canvasEntry.canvas.width = width;
        canvasEntry.canvas.height = height;
        // reset canvas transform for emulated mozCurrentTransform, if needed
        canvasEntry.context.setTransform(1, 0, 0, 1, 0, 0);
      } else {
        var canvas = createScratchCanvas(width, height);
        var ctx = canvas.getContext('2d');
trace_stack.push({location:32,context:{'this':this}});
        if (trackTransform) {
          addContextCurrentTransform(ctx);
        }
        this.cache[id] = canvasEntry = {canvas: canvas, context: ctx};
      }
      return canvasEntry;
    },
    clear: function () {
trace_stack.push({location:33,context:{'this':this}});

      for (var id in this.cache) {
        var canvasEntry = this.cache[id];
        // Zeroing the width and height causes Firefox to release graphics
        // resources immediately, which can greatly reduce memory consumption.
        canvasEntry.canvas.width = 0;
        canvasEntry.canvas.height = 0;
        delete this.cache[id];
      }
    }
  };
  return CachedCanvases;
})();

function compileType3Glyph(imgData) {

  var POINT_TO_PROCESS_LIMIT = 1000;

  var width = imgData.width, height = imgData.height;
  var i, j, j0, width1 = width + 1;
  var points = new Uint8Array(width1 * (height + 1));
  var POINT_TYPES =
      new Uint8Array([0, 2, 4, 0, 1, 0, 5, 4, 8, 10, 0, 8, 0, 2, 1, 0]);

  // decodes bit-packed mask data
  var lineSize = (width + 7) & ~7, data0 = imgData.data;
  var data = new Uint8Array(lineSize * height), pos = 0, ii;
  for (i = 0, ii = data0.length; i < ii; i++) {
    var mask = 128, elem = data0[i];
    while (mask > 0) {
      data[pos++] = (elem & mask) ? 0 : 255;
      mask >>= 1;
    }
  }

  // finding iteresting points: every point is located between mask pixels,
  // so there will be points of the (width + 1)x(height + 1) grid. Every point
  // will have flags assigned based on neighboring mask pixels:
  //   4 | 8
  //   --P--
  //   2 | 1
  // We are interested only in points with the flags:
  //   - outside corners: 1, 2, 4, 8;
  //   - inside corners: 7, 11, 13, 14;
  //   - and, intersections: 5, 10.
  var count = 0;
  pos = 0;
  if (data[pos] !== 0) {
    points[0] = 1;
    ++count;
  }
  for (j = 1; j < width; j++) {
    if (data[pos] !== data[pos + 1]) {
      points[j] = data[pos] ? 2 : 1;
      ++count;
    }
    pos++;
  }
  if (data[pos] !== 0) {
    points[j] = 2;
    ++count;
  }
  for (i = 1; i < height; i++) {
    pos = i * lineSize;
    j0 = i * width1;
    if (data[pos - lineSize] !== data[pos]) {
      points[j0] = data[pos] ? 1 : 8;
      ++count;
    }
    // 'sum' is the position of the current pixel configuration in the 'TYPES'
    // array (in order 8-1-2-4, so we can use '>>2' to shift the column).
    var sum = (data[pos] ? 4 : 0) + (data[pos - lineSize] ? 8 : 0);
    for (j = 1; j < width; j++) {
      sum = (sum >> 2) + (data[pos + 1] ? 4 : 0) +
            (data[pos - lineSize + 1] ? 8 : 0);
      if (POINT_TYPES[sum]) {
        points[j0 + j] = POINT_TYPES[sum];
        ++count;
      }
      pos++;
    }
    if (data[pos - lineSize] !== data[pos]) {
      points[j0 + j] = data[pos] ? 2 : 4;
      ++count;
    }

    if (count > POINT_TO_PROCESS_LIMIT) {
      return null;
    }
  }

  pos = lineSize * (height - 1);
  j0 = i * width1;
  if (data[pos] !== 0) {
    points[j0] = 8;
    ++count;
  }
  for (j = 1; j < width; j++) {
    if (data[pos] !== data[pos + 1]) {
      points[j0 + j] = data[pos] ? 4 : 8;
      ++count;
    }
    pos++;
  }
  if (data[pos] !== 0) {
    points[j0 + j] = 4;
    ++count;
  }
  if (count > POINT_TO_PROCESS_LIMIT) {
    return null;
  }

  // building outlines
  var steps = new Int32Array([0, width1, -1, 0, -width1, 0, 0, 0, 1]);
  var outlines = [];
  for (i = 0; count && i <= height; i++) {
    var p = i * width1;
    var end = p + width;
    while (p < end && !points[p]) {
      p++;
    }
    if (p === end) {
      continue;
    }
    var coords = [p % width1, i];

    var type = points[p], p0 = p, pp;
    do {
      var step = steps[type];
      do {
        p += step;
      } while (!points[p]);

      pp = points[p];
      if (pp !== 5 && pp !== 10) {
        // set new direction
        type = pp;
        // delete mark
        points[p] = 0;
      } else { // type is 5 or 10, ie, a crossing
        // set new direction
        type = pp & ((0x33 * type) >> 4);
        // set new type for "future hit"
        points[p] &= (type >> 2 | type << 2);
      }

      coords.push(p % width1);
      coords.push((p / width1) | 0);
      --count;
    } while (p0 !== p);
    outlines.push(coords);
    --i;
  }

  var drawOutline = function(c) {

    c.save();
    // the path shall be painted in [0..1]x[0..1] space
    c.scale(1 / width, -1 / height);
    c.translate(0, -height);
    c.beginPath();
    for (var i = 0, ii = outlines.length; i < ii; i++) {
      var o = outlines[i];
      c.moveTo(o[0], o[1]);
      for (var j = 2, jj = o.length; j < jj; j += 2) {
        c.lineTo(o[j], o[j+1]);
      }
    }
trace_stack.push({location:34,context:{'c':c}});
    c.fill();
    c.beginPath();
    c.restore();
  };

  return drawOutline;
}

var CanvasExtraState = (function CanvasExtraStateClosure() {

  function CanvasExtraState(old) {

    // Are soft masks and alpha values shapes or opacities?
    this.alphaIsShape = false;
    this.fontSize = 0;
    this.fontSizeScale = 1;
    this.textMatrix = IDENTITY_MATRIX;
    this.textMatrixScale = 1;
    this.fontMatrix = FONT_IDENTITY_MATRIX;
    this.leading = 0;
    // Current point (in user coordinates)
    this.x = 0;
    this.y = 0;
    // Start of text line (in text coordinates)
    this.lineX = 0;
    this.lineY = 0;
    // Character and word spacing
    this.charSpacing = 0;
    this.wordSpacing = 0;
    this.textHScale = 1;
    this.textRenderingMode = TextRenderingMode.FILL;
    this.textRise = 0;
trace_stack.push({location:35,context:{'this':this}});
    // Default fore and background colors
    this.fillColor = '#000000';
    this.strokeColor = '#000000';
    this.patternFill = false;
    // Note: fill alpha applies to all non-stroking operations
    this.fillAlpha = 1;
    this.strokeAlpha = 1;
    this.lineWidth = 1;
    this.activeSMask = null; // nonclonable field (see the save method below)

    this.old = old;
  }

  CanvasExtraState.prototype = {
    clone: function CanvasExtraState_clone() {

      return Object.create(this);
    },
    setCurrentPoint: function CanvasExtraState_setCurrentPoint(x, y) {

      this.x = x;
      this.y = y;
    }
  };
  return CanvasExtraState;
})();

var CanvasGraphics = (function CanvasGraphicsClosure() {

  // Defines the time the executeOperatorList is going to be executing
  // before it stops and shedules a continue of execution.
  var EXECUTION_TIME = 15;
  // Defines the number of steps before checking the execution time
  var EXECUTION_STEPS = 10;

  function CanvasGraphics(canvasCtx, commonObjs, objs, imageLayer) {

    this.ctx = canvasCtx;
    this.current = new CanvasExtraState();
    this.stateStack = [];
    this.pendingClip = null;
    this.pendingEOFill = false;
    this.res = null;
    this.xobjs = null;
    this.commonObjs = commonObjs;
    this.objs = objs;
    this.imageLayer = imageLayer;
    this.groupStack = [];
    this.processingType3 = null;
trace_stack.push({location:36,context:{'this':this}});
    // Patterns are painted relative to the initial page/form transform, see pdf
    // spec 8.7.2 NOTE 1.
    this.baseTransform = null;
    this.baseTransformStack = [];
    this.groupLevel = 0;
    this.smaskStack = [];
    this.smaskCounter = 0;
    this.tempSMask = null;
    this.cachedCanvases = new CachedCanvases();
    if (canvasCtx) {
      // NOTE: if mozCurrentTransform is polyfilled, then the current state of
      // the transformation must already be set in canvasCtx._transformMatrix.
      addContextCurrentTransform(canvasCtx);
    }
    this.cachedGetSinglePixelWidth = null;
  }

  function putBinaryImageData(ctx, imgData) {

    if (typeof ImageData !== 'undefined' && imgData instanceof ImageData) {
      ctx.putImageData(imgData, 0, 0);
      return;
    }

    // Put the image data to the canvas in chunks, rather than putting the
    // whole image at once.  This saves JS memory, because the ImageData object
    // is smaller. It also possibly saves C++ memory within the implementation
    // of putImageData(). (E.g. in Firefox we make two short-lived copies of
    // the data passed to putImageData()). |n| shouldn't be too small, however,
    // because too many putImageData() calls will slow things down.
    //
    // Note: as written, if the last chunk is partial, the putImageData() call
    // will (conceptually) put pixels past the bounds of the canvas.  But
    // that's ok; any such pixels are ignored.

    var height = imgData.height, width = imgData.width;
    var partialChunkHeight = height % FULL_CHUNK_HEIGHT;
    var fullChunks = (height - partialChunkHeight) / FULL_CHUNK_HEIGHT;
    var totalChunks = partialChunkHeight === 0 ? fullChunks : fullChunks + 1;

    var chunkImgData = ctx.createImageData(width, FULL_CHUNK_HEIGHT);
    var srcPos = 0, destPos;
    var src = imgData.data;
    var dest = chunkImgData.data;
    var i, j, thisChunkHeight, elemsInThisChunk;
trace_stack.push({location:37,context:{}});

    // There are multiple forms in which the pixel data can be passed, and
    // imgData.kind tells us which one this is.
    if (imgData.kind === ImageKind.GRAYSCALE_1BPP) {
      // Grayscale, 1 bit per pixel (i.e. black-and-white).
      var srcLength = src.byteLength;
      var dest32 = PDFJS.hasCanvasTypedArrays ? new Uint32Array(dest.buffer) :
        new Uint32ArrayView(dest);
      var dest32DataLength = dest32.length;
      var fullSrcDiff = (width + 7) >> 3;
      var white = 0xFFFFFFFF;
      var black = (PDFJS.isLittleEndian || !PDFJS.hasCanvasTypedArrays) ?
        0xFF000000 : 0x000000FF;
      for (i = 0; i < totalChunks; i++) {
        thisChunkHeight =
          (i < fullChunks) ? FULL_CHUNK_HEIGHT : partialChunkHeight;
        destPos = 0;
        for (j = 0; j < thisChunkHeight; j++) {
          var srcDiff = srcLength - srcPos;
          var k = 0;
          var kEnd = (srcDiff > fullSrcDiff) ? width : srcDiff * 8 - 7;
          var kEndUnrolled = kEnd & ~7;
          var mask = 0;
          var srcByte = 0;
          for (; k < kEndUnrolled; k += 8) {
            srcByte = src[srcPos++];
            dest32[destPos++] = (srcByte & 128) ? white : black;
            dest32[destPos++] = (srcByte & 64) ? white : black;
            dest32[destPos++] = (srcByte & 32) ? white : black;
            dest32[destPos++] = (srcByte & 16) ? white : black;
            dest32[destPos++] = (srcByte & 8) ? white : black;
            dest32[destPos++] = (srcByte & 4) ? white : black;
            dest32[destPos++] = (srcByte & 2) ? white : black;
            dest32[destPos++] = (srcByte & 1) ? white : black;
          }
          for (; k < kEnd; k++) {
             if (mask === 0) {
               srcByte = src[srcPos++];
               mask = 128;
             }

            dest32[destPos++] = (srcByte & mask) ? white : black;
            mask >>= 1;
          }
        }
        // We ran out of input. Make all remaining pixels transparent.
        while (destPos < dest32DataLength) {
          dest32[destPos++] = 0;
        }

        ctx.putImageData(chunkImgData, 0, i * FULL_CHUNK_HEIGHT);
      }
    } else if (imgData.kind === ImageKind.RGBA_32BPP) {
      // RGBA, 32-bits per pixel.

      j = 0;
      elemsInThisChunk = width * FULL_CHUNK_HEIGHT * 4;
      for (i = 0; i < fullChunks; i++) {
        dest.set(src.subarray(srcPos, srcPos + elemsInThisChunk));
        srcPos += elemsInThisChunk;

        ctx.putImageData(chunkImgData, 0, j);
        j += FULL_CHUNK_HEIGHT;
      }
      if (i < totalChunks) {
        elemsInThisChunk = width * partialChunkHeight * 4;
        dest.set(src.subarray(srcPos, srcPos + elemsInThisChunk));
        ctx.putImageData(chunkImgData, 0, j);
      }

    } else if (imgData.kind === ImageKind.RGB_24BPP) {
      // RGB, 24-bits per pixel.
      thisChunkHeight = FULL_CHUNK_HEIGHT;
      elemsInThisChunk = width * thisChunkHeight;
      for (i = 0; i < totalChunks; i++) {
        if (i >= fullChunks) {
          thisChunkHeight = partialChunkHeight;
          elemsInThisChunk = width * thisChunkHeight;
        }

        destPos = 0;
        for (j = elemsInThisChunk; j--;) {
          dest[destPos++] = src[srcPos++];
          dest[destPos++] = src[srcPos++];
          dest[destPos++] = src[srcPos++];
          dest[destPos++] = 255;
        }
        ctx.putImageData(chunkImgData, 0, i * FULL_CHUNK_HEIGHT);
      }
    } else {
      error('bad image kind: ' + imgData.kind);
    }
  }

  function putBinaryImageMask(ctx, imgData) {

    var height = imgData.height, width = imgData.width;
    var partialChunkHeight = height % FULL_CHUNK_HEIGHT;
    var fullChunks = (height - partialChunkHeight) / FULL_CHUNK_HEIGHT;
    var totalChunks = partialChunkHeight === 0 ? fullChunks : fullChunks + 1;

    var chunkImgData = ctx.createImageData(width, FULL_CHUNK_HEIGHT);
    var srcPos = 0;
    var src = imgData.data;
    var dest = chunkImgData.data;
trace_stack.push({location:38,context:{'ctx':ctx}});

    for (var i = 0; i < totalChunks; i++) {
      var thisChunkHeight =
        (i < fullChunks) ? FULL_CHUNK_HEIGHT : partialChunkHeight;

      // Expand the mask so it can be used by the canvas.  Any required
      // inversion has already been handled.
      var destPos = 3; // alpha component offset
      for (var j = 0; j < thisChunkHeight; j++) {
        var mask = 0;
        for (var k = 0; k < width; k++) {
          if (!mask) {
            var elem = src[srcPos++];
            mask = 128;
          }
          dest[destPos] = (elem & mask) ? 0 : 255;
          destPos += 4;
          mask >>= 1;
        }
      }
      ctx.putImageData(chunkImgData, 0, i * FULL_CHUNK_HEIGHT);
    }
  }

  function copyCtxState(sourceCtx, destCtx) {

    var properties = ['strokeStyle', 'fillStyle', 'fillRule', 'globalAlpha',
                      'lineWidth', 'lineCap', 'lineJoin', 'miterLimit',
                      'globalCompositeOperation', 'font'];
    for (var i = 0, ii = properties.length; i < ii; i++) {
      var property = properties[i];
      if (sourceCtx[property] !== undefined) {
        destCtx[property] = sourceCtx[property];
      }
    }
    if (sourceCtx.setLineDash !== undefined) {
      destCtx.setLineDash(sourceCtx.getLineDash());
      destCtx.lineDashOffset =  sourceCtx.lineDashOffset;
    } else if (sourceCtx.mozDashOffset !== undefined) {
      destCtx.mozDash = sourceCtx.mozDash;
      destCtx.mozDashOffset = sourceCtx.mozDashOffset;
    }
  }

  function composeSMaskBackdrop(bytes, r0, g0, b0) {

    var length = bytes.length;
    for (var i = 3; i < length; i += 4) {
      var alpha = bytes[i];
      if (alpha === 0) {
        bytes[i - 3] = r0;
        bytes[i - 2] = g0;
        bytes[i - 1] = b0;
      } else if (alpha < 255) {
        var alpha_ = 255 - alpha;
        bytes[i - 3] = (bytes[i - 3] * alpha + r0 * alpha_) >> 8;
        bytes[i - 2] = (bytes[i - 2] * alpha + g0 * alpha_) >> 8;
        bytes[i - 1] = (bytes[i - 1] * alpha + b0 * alpha_) >> 8;
      }
    }
  }

  function composeSMaskAlpha(maskData, layerData, transferMap) {

    var length = maskData.length;
    var scale = 1 / 255;
    for (var i = 3; i < length; i += 4) {
      var alpha = transferMap ? transferMap[maskData[i]] : maskData[i];
      layerData[i] = (layerData[i] * alpha * scale) | 0;
    }
  }

  function composeSMaskLuminosity(maskData, layerData, transferMap) {

    var length = maskData.length;
    for (var i = 3; i < length; i += 4) {
      var y = (maskData[i - 3] * 77) +  // * 0.3 / 255 * 0x10000
              (maskData[i - 2] * 152) + // * 0.59 ....
              (maskData[i - 1] * 28);   // * 0.11 ....
      layerData[i] = transferMap ?
        (layerData[i] * transferMap[y >> 8]) >> 8 :
        (layerData[i] * y) >> 16;
    }
  }

  function genericComposeSMask(maskCtx, layerCtx, width, height,
                               subtype, backdrop, transferMap) {

    var hasBackdrop = !!backdrop;
    var r0 = hasBackdrop ? backdrop[0] : 0;
    var g0 = hasBackdrop ? backdrop[1] : 0;
    var b0 = hasBackdrop ? backdrop[2] : 0;

    var composeFn;
    if (subtype === 'Luminosity') {
      composeFn = composeSMaskLuminosity;
    } else {
      composeFn = composeSMaskAlpha;
    }
trace_stack.push({location:39,context:{'backdrop':backdrop}});

    // processing image in chunks to save memory
    var PIXELS_TO_PROCESS = 1048576;
    var chunkSize = Math.min(height, Math.ceil(PIXELS_TO_PROCESS / width));
    for (var row = 0; row < height; row += chunkSize) {
      var chunkHeight = Math.min(chunkSize, height - row);
      var maskData = maskCtx.getImageData(0, row, width, chunkHeight);
      var layerData = layerCtx.getImageData(0, row, width, chunkHeight);

      if (hasBackdrop) {
        composeSMaskBackdrop(maskData.data, r0, g0, b0);
      }
      composeFn(maskData.data, layerData.data, transferMap);

      maskCtx.putImageData(layerData, 0, row);
    }
  }

  function composeSMask(ctx, smask, layerCtx) {

    var mask = smask.canvas;
    var maskCtx = smask.context;

    ctx.setTransform(smask.scaleX, 0, 0, smask.scaleY,
                     smask.offsetX, smask.offsetY);

    var backdrop = smask.backdrop || null;
trace_stack.push({location:40,context:{'ctx':ctx, 'smask':smask}});

    if (!smask.transferMap && WebGLUtils.isEnabled) {
      var composed = WebGLUtils.composeSMask(layerCtx.canvas, mask,
        {subtype: smask.subtype, backdrop: backdrop});
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(composed, smask.offsetX, smask.offsetY);
      return;
    }
    genericComposeSMask(maskCtx, layerCtx, mask.width, mask.height,
                        smask.subtype, backdrop, smask.transferMap);
    ctx.drawImage(mask, 0, 0);
  }

  var LINE_CAP_STYLES = ['butt', 'round', 'square'];
  var LINE_JOIN_STYLES = ['miter', 'round', 'bevel'];
  var NORMAL_CLIP = {};
  var EO_CLIP = {};

  CanvasGraphics.prototype = {

    beginDrawing: function CanvasGraphics_beginDrawing(transform, viewport,
                                                       transparency) {

      // For pdfs that use blend modes we have to clear the canvas else certain
      // blend modes can look wrong since we'd be blending with a white
      // backdrop. The problem with a transparent backdrop though is we then
      // don't get sub pixel anti aliasing on text, creating temporary
      // transparent canvas when we have blend modes.
      var width = this.ctx.canvas.width;
      var height = this.ctx.canvas.height;

      this.ctx.save();
      this.ctx.fillStyle = 'rgb(255, 255, 255)';
      this.ctx.fillRect(0, 0, width, height);
      this.ctx.restore();

trace_stack.push({location:41,context:{'this':this}});

      if (transparency) {
        var transparentCanvas = this.cachedCanvases.getCanvas(
          'transparent', width, height, true);
        this.compositeCtx = this.ctx;
        this.transparentCanvas = transparentCanvas.canvas;
        this.ctx = transparentCanvas.context;
        this.ctx.save();
        // The transform can be applied before rendering, transferring it to
        // the new canvas.
        this.ctx.transform.apply(this.ctx,
                                 this.compositeCtx.mozCurrentTransform);
      }

      this.ctx.save();
      if (transform) {
        this.ctx.transform.apply(this.ctx, transform);
      }
      this.ctx.transform.apply(this.ctx, viewport.transform);

      this.baseTransform = this.ctx.mozCurrentTransform.slice();

      if (this.imageLayer) {
        this.imageLayer.beginLayout();
      }
    },

    executeOperatorList: function CanvasGraphics_executeOperatorList(
                                    operatorList,
                                    executionStartIdx, continueCallback,
                                    stepper) {

      var argsArray = operatorList.argsArray;
      var fnArray = operatorList.fnArray;
      var i = executionStartIdx || 0;
      var argsArrayLen = argsArray.length;

      // Sometimes the OperatorList to execute is empty.
      if (argsArrayLen === i) {
        return i;
      }

      var chunkOperations = (argsArrayLen - i > EXECUTION_STEPS &&
                             typeof continueCallback === 'function');
      var endTime = chunkOperations ? Date.now() + EXECUTION_TIME : 0;
      var steps = 0;

      var commonObjs = this.commonObjs;
      var objs = this.objs;
      var fnId;
trace_stack.push({location:42,context:{'this':this}});

      while (true) {

        if (stepper !== undefined && i === stepper.nextBreakPoint) {
          stepper.breakIt(i, continueCallback);
          return i;
        }

        fnId = fnArray[i];

        if (fnId !== OPS.dependency) {
          this[fnId].apply(this, argsArray[i]);
        } else {
          var deps = argsArray[i];
          for (var n = 0, nn = deps.length; n < nn; n++) {
            var depObjId = deps[n];
            var common = depObjId[0] === 'g' && depObjId[1] === '_';
            var objsPool = common ? commonObjs : objs;

            // If the promise isn't resolved yet, add the continueCallback
            // to the promise and bail out.
            if (!objsPool.isResolved(depObjId)) {
              objsPool.get(depObjId, continueCallback);
              return i;
            }
          }
        }

        i++;

        // If the entire operatorList was executed, stop as were done.
        if (i === argsArrayLen) {
          return i;
        }

        // If the execution took longer then a certain amount of time and
        // `continueCallback` is specified, interrupt the execution.
        if (chunkOperations && ++steps > EXECUTION_STEPS) {
          if (Date.now() > endTime) {
            continueCallback();
            return i;
          }
          steps = 0;
        }

        // If the operatorList isn't executed completely yet OR the execution
        // time was short enough, do another execution round.
      }
    },

    endDrawing: function CanvasGraphics_endDrawing() {

      this.ctx.restore();

      if (this.transparentCanvas) {
        this.ctx = this.compositeCtx;
        this.ctx.drawImage(this.transparentCanvas, 0, 0);
        this.transparentCanvas = null;
      }
trace_stack.push({location:43,context:{'this':this}});

      this.cachedCanvases.clear();
      WebGLUtils.clear();

      if (this.imageLayer) {
        this.imageLayer.endLayout();
      }
    },

    // Graphics state
    setLineWidth: function CanvasGraphics_setLineWidth(width) {

      this.current.lineWidth = width;
      this.ctx.lineWidth = width;
    },
    setLineCap: function CanvasGraphics_setLineCap(style) {

      this.ctx.lineCap = LINE_CAP_STYLES[style];
    },
    setLineJoin: function CanvasGraphics_setLineJoin(style) {

      this.ctx.lineJoin = LINE_JOIN_STYLES[style];
    },
    setMiterLimit: function CanvasGraphics_setMiterLimit(limit) {

      this.ctx.miterLimit = limit;
    },
    setDash: function CanvasGraphics_setDash(dashArray, dashPhase) {

      var ctx = this.ctx;
trace_stack.push({location:44,context:{'this':this}});
      if (ctx.setLineDash !== undefined) {
        ctx.setLineDash(dashArray);
        ctx.lineDashOffset = dashPhase;
      } else {
        ctx.mozDash = dashArray;
        ctx.mozDashOffset = dashPhase;
      }
    },
    setRenderingIntent: function CanvasGraphics_setRenderingIntent(intent) {

      // Maybe if we one day fully support color spaces this will be important
      // for now we can ignore.
      // TODO set rendering intent?
    },
    setFlatness: function CanvasGraphics_setFlatness(flatness) {

      // There's no way to control this with canvas, but we can safely ignore.
      // TODO set flatness?
    },
    setGState: function CanvasGraphics_setGState(states) {

      for (var i = 0, ii = states.length; i < ii; i++) {
        var state = states[i];
        var key = state[0];
        var value = state[1];

        switch (key) {
          case 'LW':
            this.setLineWidth(value);
            break;
          case 'LC':
            this.setLineCap(value);
            break;
          case 'LJ':
            this.setLineJoin(value);
            break;
          case 'ML':
            this.setMiterLimit(value);
            break;
          case 'D':
            this.setDash(value[0], value[1]);
            break;
          case 'RI':
            this.setRenderingIntent(value);
            break;
          case 'FL':
            this.setFlatness(value);
            break;
          case 'Font':
            this.setFont(value[0], value[1]);
            break;
          case 'CA':
            this.current.strokeAlpha = state[1];
            break;
          case 'ca':
            this.current.fillAlpha = state[1];
            this.ctx.globalAlpha = state[1];
            break;
          case 'BM':
            if (value && value.name && (value.name !== 'Normal')) {
              var mode = value.name.replace(/([A-Z])/g,
                function(c) {

                  return '-' + c.toLowerCase();
                }
              ).substring(1);
              this.ctx.globalCompositeOperation = mode;
              if (this.ctx.globalCompositeOperation !== mode) {
                warn('globalCompositeOperation "' + mode +
                     '" is not supported');
              }
            } else {
              this.ctx.globalCompositeOperation = 'source-over';
            }
            break;
          case 'SMask':
            if (this.current.activeSMask) {
              this.endSMaskGroup();
            }
            this.current.activeSMask = value ? this.tempSMask : null;
            if (this.current.activeSMask) {
              this.beginSMaskGroup();
            }
            this.tempSMask = null;
            break;
        }
      }
    },
    beginSMaskGroup: function CanvasGraphics_beginSMaskGroup() {

      var activeSMask = this.current.activeSMask;
      var drawnWidth = activeSMask.canvas.width;
      var drawnHeight = activeSMask.canvas.height;
      var cacheId = 'smaskGroupAt' + this.groupLevel;
      var scratchCanvas = this.cachedCanvases.getCanvas(
        cacheId, drawnWidth, drawnHeight, true);

      var currentCtx = this.ctx;
      var currentTransform = currentCtx.mozCurrentTransform;
      this.ctx.save();
trace_stack.push({location:45,context:{'this':this}});

      var groupCtx = scratchCanvas.context;
      groupCtx.scale(1 / activeSMask.scaleX, 1 / activeSMask.scaleY);
      groupCtx.translate(-activeSMask.offsetX, -activeSMask.offsetY);
      groupCtx.transform.apply(groupCtx, currentTransform);

      copyCtxState(currentCtx, groupCtx);
      this.ctx = groupCtx;
      this.setGState([
        ['BM', 'Normal'],
        ['ca', 1],
        ['CA', 1]
      ]);
      this.groupStack.push(currentCtx);
      this.groupLevel++;
    },
    endSMaskGroup: function CanvasGraphics_endSMaskGroup() {

      var groupCtx = this.ctx;
      this.groupLevel--;
      this.ctx = this.groupStack.pop();
trace_stack.push({location:46,context:{'this':this}});

      composeSMask(this.ctx, this.current.activeSMask, groupCtx);
      this.ctx.restore();
      copyCtxState(groupCtx, this.ctx);
    },
    save: function CanvasGraphics_save() {

      this.ctx.save();
      var old = this.current;
trace_stack.push({location:47,context:{'this':this}});
      this.stateStack.push(old);
      this.current = old.clone();
      this.current.activeSMask = null;
    },
    restore: function CanvasGraphics_restore() {

      if (this.stateStack.length !== 0) {
        if (this.current.activeSMask !== null) {
          this.endSMaskGroup();
        }
trace_stack.push({location:48,context:{'this':this}});

        this.current = this.stateStack.pop();
        this.ctx.restore();

        // Ensure that the clipping path is reset (fixes issue6413.pdf).
        this.pendingClip = null;

        this.cachedGetSinglePixelWidth = null;
      }
    },
    transform: function CanvasGraphics_transform(a, b, c, d, e, f) {

      this.ctx.transform(a, b, c, d, e, f);

      this.cachedGetSinglePixelWidth = null;
    },

    // Path
    constructPath: function CanvasGraphics_constructPath(ops, args) {

      var ctx = this.ctx;
      var current = this.current;
      var x = current.x, y = current.y;
      for (var i = 0, j = 0, ii = ops.length; i < ii; i++) {
        switch (ops[i] | 0) {
          case OPS.rectangle:
            x = args[j++];
            y = args[j++];
            var width = args[j++];
            var height = args[j++];
            if (width === 0) {
              width = this.getSinglePixelWidth();
            }
            if (height === 0) {
              height = this.getSinglePixelWidth();
            }
            var xw = x + width;
            var yh = y + height;
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(xw, y);
            this.ctx.lineTo(xw, yh);
            this.ctx.lineTo(x, yh);
            this.ctx.lineTo(x, y);
            this.ctx.closePath();
            break;
          case OPS.moveTo:
            x = args[j++];
            y = args[j++];
            ctx.moveTo(x, y);
            break;
          case OPS.lineTo:
            x = args[j++];
            y = args[j++];
            ctx.lineTo(x, y);
            break;
          case OPS.curveTo:
            x = args[j + 4];
            y = args[j + 5];
            ctx.bezierCurveTo(args[j], args[j + 1], args[j + 2], args[j + 3],
                              x, y);
            j += 6;
            break;
          case OPS.curveTo2:
            ctx.bezierCurveTo(x, y, args[j], args[j + 1],
                              args[j + 2], args[j + 3]);
            x = args[j + 2];
            y = args[j + 3];
            j += 4;
            break;
          case OPS.curveTo3:
            x = args[j + 2];
            y = args[j + 3];
            ctx.bezierCurveTo(args[j], args[j + 1], x, y, x, y);
            j += 4;
            break;
          case OPS.closePath:
            ctx.closePath();
            break;
        }
      }
      current.setCurrentPoint(x, y);
    },
    closePath: function CanvasGraphics_closePath() {

      this.ctx.closePath();
    },
    stroke: function CanvasGraphics_stroke(consumePath) {

      consumePath = typeof consumePath !== 'undefined' ? consumePath : true;
      var ctx = this.ctx;
      var strokeColor = this.current.strokeColor;
      // Prevent drawing too thin lines by enforcing a minimum line width.
      ctx.lineWidth = Math.max(this.getSinglePixelWidth() * MIN_WIDTH_FACTOR,
                               this.current.lineWidth);
      // For stroke we want to temporarily change the global alpha to the
      // stroking alpha.
      ctx.globalAlpha = this.current.strokeAlpha;
      if (strokeColor && strokeColor.hasOwnProperty('type') &&
          strokeColor.type === 'Pattern') {
        // for patterns, we transform to pattern space, calculate
        // the pattern, call stroke, and restore to user space
        ctx.save();
        ctx.strokeStyle = strokeColor.getPattern(ctx, this);
        ctx.stroke();
        ctx.restore();
      } else {
        ctx.stroke();
      }
      if (consumePath) {
        this.consumePath();
      }
trace_stack.push({location:49,context:{'this':this}});
      // Restore the global alpha to the fill alpha
      ctx.globalAlpha = this.current.fillAlpha;
    },
    closeStroke: function CanvasGraphics_closeStroke() {

      this.closePath();
      this.stroke();
    },
    fill: function CanvasGraphics_fill(consumePath) {

      consumePath = typeof consumePath !== 'undefined' ? consumePath : true;
      var ctx = this.ctx;
      var fillColor = this.current.fillColor;
      var isPatternFill = this.current.patternFill;
      var needRestore = false;

      if (isPatternFill) {
        ctx.save();
        if (this.baseTransform) {
          ctx.setTransform.apply(ctx, this.baseTransform);
        }
        ctx.fillStyle = fillColor.getPattern(ctx, this);
        needRestore = true;
      }
trace_stack.push({location:50,context:{'this':this}});

      if (this.pendingEOFill) {
        if (ctx.mozFillRule !== undefined) {
          ctx.mozFillRule = 'evenodd';
          ctx.fill();
          ctx.mozFillRule = 'nonzero';
        } else {
          ctx.fill('evenodd');
        }
        this.pendingEOFill = false;
      } else {
        ctx.fill();
      }

      if (needRestore) {
        ctx.restore();
      }
      if (consumePath) {
        this.consumePath();
      }
    },
    eoFill: function CanvasGraphics_eoFill() {

      this.pendingEOFill = true;
      this.fill();
    },
    fillStroke: function CanvasGraphics_fillStroke() {

      this.fill(false);
      this.stroke(false);

      this.consumePath();
    },
    eoFillStroke: function CanvasGraphics_eoFillStroke() {

      this.pendingEOFill = true;
      this.fillStroke();
    },
    closeFillStroke: function CanvasGraphics_closeFillStroke() {

      this.closePath();
      this.fillStroke();
    },
    closeEOFillStroke: function CanvasGraphics_closeEOFillStroke() {

      this.pendingEOFill = true;
      this.closePath();
      this.fillStroke();
    },
    endPath: function CanvasGraphics_endPath() {

      this.consumePath();
    },

    // Clipping
    clip: function CanvasGraphics_clip() {

      this.pendingClip = NORMAL_CLIP;
    },
    eoClip: function CanvasGraphics_eoClip() {

      this.pendingClip = EO_CLIP;
    },

    // Text
    beginText: function CanvasGraphics_beginText() {

      this.current.textMatrix = IDENTITY_MATRIX;
      this.current.textMatrixScale = 1;
      this.current.x = this.current.lineX = 0;
      this.current.y = this.current.lineY = 0;
    },
    endText: function CanvasGraphics_endText() {

      var paths = this.pendingTextPaths;
      var ctx = this.ctx;
      if (paths === undefined) {
        ctx.beginPath();
        return;
      }

      ctx.save();
      ctx.beginPath();
      for (var i = 0; i < paths.length; i++) {
        var path = paths[i];
        ctx.setTransform.apply(ctx, path.transform);
        ctx.translate(path.x, path.y);
        path.addToPath(ctx, path.fontSize);
      }
      ctx.restore();
      ctx.clip();
      ctx.beginPath();
      delete this.pendingTextPaths;
    },
    setCharSpacing: function CanvasGraphics_setCharSpacing(spacing) {

      this.current.charSpacing = spacing;
    },
    setWordSpacing: function CanvasGraphics_setWordSpacing(spacing) {

      this.current.wordSpacing = spacing;
    },
    setHScale: function CanvasGraphics_setHScale(scale) {

      this.current.textHScale = scale / 100;
    },
    setLeading: function CanvasGraphics_setLeading(leading) {

      this.current.leading = -leading;
    },
    setFont: function CanvasGraphics_setFont(fontRefName, size) {

      var fontObj = this.commonObjs.get(fontRefName);
      var current = this.current;

      if (!fontObj) {
        error('Can\'t find font for ' + fontRefName);
      }

      current.fontMatrix = (fontObj.fontMatrix ?
                            fontObj.fontMatrix : FONT_IDENTITY_MATRIX);

      // A valid matrix needs all main diagonal elements to be non-zero
      // This also ensures we bypass FF bugzilla bug #719844.
      if (current.fontMatrix[0] === 0 ||
          current.fontMatrix[3] === 0) {
        warn('Invalid font matrix for font ' + fontRefName);
      }

      // The spec for Tf (setFont) says that 'size' specifies the font 'scale',
      // and in some docs this can be negative (inverted x-y axes).
      if (size < 0) {
        size = -size;
        current.fontDirection = -1;
      } else {
        current.fontDirection = 1;
      }
trace_stack.push({location:51,context:{'this':this}});

      this.current.font = fontObj;
      this.current.fontSize = size;

      if (fontObj.isType3Font) {
        return; // we don't need ctx.font for Type3 fonts
      }

      var name = fontObj.loadedName || 'sans-serif';
      var bold = fontObj.black ? (fontObj.bold ? '900' : 'bold') :
                                 (fontObj.bold ? 'bold' : 'normal');

      var italic = fontObj.italic ? 'italic' : 'normal';
      var typeface = '"' + name + '", ' + fontObj.fallbackName;

      // Some font backends cannot handle fonts below certain size.
      // Keeping the font at minimal size and using the fontSizeScale to change
      // the current transformation matrix before the fillText/strokeText.
      // See https://bugzilla.mozilla.org/show_bug.cgi?id=726227
      var browserFontSize = size < MIN_FONT_SIZE ? MIN_FONT_SIZE :
                            size > MAX_FONT_SIZE ? MAX_FONT_SIZE : size;
      this.current.fontSizeScale = size / browserFontSize;
trace_stack.push({location:52,context:{'this':this}});

      var rule = italic + ' ' + bold + ' ' + browserFontSize + 'px ' + typeface;
      this.ctx.font = rule;
    },
    setTextRenderingMode: function CanvasGraphics_setTextRenderingMode(mode) {

      this.current.textRenderingMode = mode;
    },
    setTextRise: function CanvasGraphics_setTextRise(rise) {

      this.current.textRise = rise;
    },
    moveText: function CanvasGraphics_moveText(x, y) {

      this.current.x = this.current.lineX += x;
      this.current.y = this.current.lineY += y;
    },
    setLeadingMoveText: function CanvasGraphics_setLeadingMoveText(x, y) {

      this.setLeading(-y);
      this.moveText(x, y);
    },
    setTextMatrix: function CanvasGraphics_setTextMatrix(a, b, c, d, e, f) {

      this.current.textMatrix = [a, b, c, d, e, f];
      this.current.textMatrixScale = Math.sqrt(a * a + b * b);
trace_stack.push({location:53,context:{'this':this}});

      this.current.x = this.current.lineX = 0;
      this.current.y = this.current.lineY = 0;
    },
    nextLine: function CanvasGraphics_nextLine() {

      this.moveText(0, this.current.leading);
    },

    paintChar: function CanvasGraphics_paintChar(character, x, y) {

      var ctx = this.ctx;
      var current = this.current;
      var font = current.font;
      var textRenderingMode = current.textRenderingMode;
      var fontSize = current.fontSize / current.fontSizeScale;
      var fillStrokeMode = textRenderingMode &
        TextRenderingMode.FILL_STROKE_MASK;
      var isAddToPathSet = !!(textRenderingMode &
        TextRenderingMode.ADD_TO_PATH_FLAG);
trace_stack.push({location:54,context:{'this':this}});

      var addToPath;
      if (font.disableFontFace || isAddToPathSet) {
        addToPath = font.getPathGenerator(this.commonObjs, character);
      }

      if (font.disableFontFace) {
        ctx.save();
        ctx.translate(x, y);
        ctx.beginPath();
        addToPath(ctx, fontSize);
        if (fillStrokeMode === TextRenderingMode.FILL ||
            fillStrokeMode === TextRenderingMode.FILL_STROKE) {
          ctx.fill();
        }
        if (fillStrokeMode === TextRenderingMode.STROKE ||
            fillStrokeMode === TextRenderingMode.FILL_STROKE) {
          ctx.stroke();
        }
        ctx.restore();
      } else {
        if (fillStrokeMode === TextRenderingMode.FILL ||
            fillStrokeMode === TextRenderingMode.FILL_STROKE) {
          ctx.fillText(character, x, y);
        }
        if (fillStrokeMode === TextRenderingMode.STROKE ||
            fillStrokeMode === TextRenderingMode.FILL_STROKE) {
          ctx.strokeText(character, x, y);
        }
      }

      if (isAddToPathSet) {
        var paths = this.pendingTextPaths || (this.pendingTextPaths = []);
        paths.push({
          transform: ctx.mozCurrentTransform,
          x: x,
          y: y,
          fontSize: fontSize,
          addToPath: addToPath
        });
      }
    },

    get isFontSubpixelAAEnabled() {
      // Checks if anti-aliasing is enabled when scaled text is painted.
      // On Windows GDI scaled fonts looks bad.
      var ctx = document.createElement('canvas').getContext('2d');
      ctx.scale(1.5, 1);
      ctx.fillText('I', 0, 10);
      var data = ctx.getImageData(0, 0, 10, 10).data;
      var enabled = false;
      for (var i = 3; i < data.length; i += 4) {
        if (data[i] > 0 && data[i] < 255) {
          enabled = true;
          break;
        }
      }
      return shadow(this, 'isFontSubpixelAAEnabled', enabled);
    },

    showText: function CanvasGraphics_showText(glyphs) {

      var current = this.current;
      var font = current.font;
      if (font.isType3Font) {
        return this.showType3Text(glyphs);
      }

      var fontSize = current.fontSize;
      if (fontSize === 0) {
        return;
      }

      var ctx = this.ctx;
      var fontSizeScale = current.fontSizeScale;
      var charSpacing = current.charSpacing;
      var wordSpacing = current.wordSpacing;
      var fontDirection = current.fontDirection;
      var textHScale = current.textHScale * fontDirection;
      var glyphsLength = glyphs.length;
      var vertical = font.vertical;
      var spacingDir = vertical ? 1 : -1;
      var defaultVMetrics = font.defaultVMetrics;
      var widthAdvanceScale = fontSize * current.fontMatrix[0];
trace_stack.push({location:55,context:{'this':this}});

      var simpleFillText =
        current.textRenderingMode === TextRenderingMode.FILL &&
        !font.disableFontFace;

      ctx.save();
      ctx.transform.apply(ctx, current.textMatrix);
      ctx.translate(current.x, current.y + current.textRise);

      if (fontDirection > 0) {
        ctx.scale(textHScale, -1);
      } else {
        ctx.scale(textHScale, 1);
      }

      var lineWidth = current.lineWidth;
      var scale = current.textMatrixScale;
      if (scale === 0 || lineWidth === 0) {
        var fillStrokeMode = current.textRenderingMode &
          TextRenderingMode.FILL_STROKE_MASK;
        if (fillStrokeMode === TextRenderingMode.STROKE ||
            fillStrokeMode === TextRenderingMode.FILL_STROKE) {
          this.cachedGetSinglePixelWidth = null;
          lineWidth = this.getSinglePixelWidth() * MIN_WIDTH_FACTOR;
        }
      } else {
        lineWidth /= scale;
      }

      if (fontSizeScale !== 1.0) {
        ctx.scale(fontSizeScale, fontSizeScale);
        lineWidth /= fontSizeScale;
      }

      ctx.lineWidth = lineWidth;

      var x = 0, i;
      for (i = 0; i < glyphsLength; ++i) {
        var glyph = glyphs[i];
        if (isNum(glyph)) {
          x += spacingDir * glyph * fontSize / 1000;
          continue;
        }

        var restoreNeeded = false;
        var spacing = (glyph.isSpace ? wordSpacing : 0) + charSpacing;
        var character = glyph.fontChar;
        var accent = glyph.accent;
        var scaledX, scaledY, scaledAccentX, scaledAccentY;
        var width = glyph.width;
        if (vertical) {
          var vmetric, vx, vy;
          vmetric = glyph.vmetric || defaultVMetrics;
          vx = glyph.vmetric ? vmetric[1] : width * 0.5;
          vx = -vx * widthAdvanceScale;
          vy = vmetric[2] * widthAdvanceScale;

          width = vmetric ? -vmetric[0] : width;
          scaledX = vx / fontSizeScale;
          scaledY = (x + vy) / fontSizeScale;
        } else {
          scaledX = x / fontSizeScale;
          scaledY = 0;
        }

        if (font.remeasure && width > 0) {
          // Some standard fonts may not have the exact width: rescale per
          // character if measured width is greater than expected glyph width
          // and subpixel-aa is enabled, otherwise just center the glyph.
          var measuredWidth = ctx.measureText(character).width * 1000 /
            fontSize * fontSizeScale;
          if (width < measuredWidth && this.isFontSubpixelAAEnabled) {
            var characterScaleX = width / measuredWidth;
            restoreNeeded = true;
            ctx.save();
            ctx.scale(characterScaleX, 1);
            scaledX /= characterScaleX;
          } else if (width !== measuredWidth) {
            scaledX += (width - measuredWidth) / 2000 *
              fontSize / fontSizeScale;
          }
        }

        if (simpleFillText && !accent) {
          // common case
          ctx.fillText(character, scaledX, scaledY);
        } else {
          this.paintChar(character, scaledX, scaledY);
          if (accent) {
            scaledAccentX = scaledX + accent.offset.x / fontSizeScale;
            scaledAccentY = scaledY - accent.offset.y / fontSizeScale;
            this.paintChar(accent.fontChar, scaledAccentX, scaledAccentY);
          }
        }

        var charWidth = width * widthAdvanceScale + spacing * fontDirection;
        x += charWidth;

        if (restoreNeeded) {
          ctx.restore();
        }
      }
      if (vertical) {
        current.y -= x * textHScale;
      } else {
        current.x += x * textHScale;
      }
      ctx.restore();
    },

    showType3Text: function CanvasGraphics_showType3Text(glyphs) {

      // Type3 fonts - each glyph is a "mini-PDF"
      var ctx = this.ctx;
      var current = this.current;
      var font = current.font;
      var fontSize = current.fontSize;
      var fontDirection = current.fontDirection;
      var spacingDir = font.vertical ? 1 : -1;
      var charSpacing = current.charSpacing;
      var wordSpacing = current.wordSpacing;
      var textHScale = current.textHScale * fontDirection;
      var fontMatrix = current.fontMatrix || FONT_IDENTITY_MATRIX;
      var glyphsLength = glyphs.length;
      var isTextInvisible =
        current.textRenderingMode === TextRenderingMode.INVISIBLE;
      var i, glyph, width, spacingLength;
trace_stack.push({location:56,context:{'this':this}});

      if (isTextInvisible || fontSize === 0) {
        return;
      }
      this.cachedGetSinglePixelWidth = null;

      ctx.save();
      ctx.transform.apply(ctx, current.textMatrix);
      ctx.translate(current.x, current.y);

      ctx.scale(textHScale, fontDirection);

      for (i = 0; i < glyphsLength; ++i) {
        glyph = glyphs[i];
        if (isNum(glyph)) {
          spacingLength = spacingDir * glyph * fontSize / 1000;
          this.ctx.translate(spacingLength, 0);
          current.x += spacingLength * textHScale;
          continue;
        }

        var spacing = (glyph.isSpace ? wordSpacing : 0) + charSpacing;
        var operatorList = font.charProcOperatorList[glyph.operatorListId];
        if (!operatorList) {
          warn('Type3 character \"' + glyph.operatorListId +
               '\" is not available');
          continue;
        }
        this.processingType3 = glyph;
        this.save();
        ctx.scale(fontSize, fontSize);
        ctx.transform.apply(ctx, fontMatrix);
        this.executeOperatorList(operatorList);
        this.restore();

        var transformed = Util.applyTransform([glyph.width, 0], fontMatrix);
        width = transformed[0] * fontSize + spacing;

        ctx.translate(width, 0);
        current.x += width * textHScale;
      }
      ctx.restore();
      this.processingType3 = null;
    },

    // Type3 fonts
    setCharWidth: function CanvasGraphics_setCharWidth(xWidth, yWidth) {

      // We can safely ignore this since the width should be the same
      // as the width in the Widths array.
    },
    setCharWidthAndBounds: function CanvasGraphics_setCharWidthAndBounds(xWidth,
                                                                        yWidth,
                                                                        llx,
                                                                        lly,
                                                                        urx,
                                                                        ury) {

      // TODO According to the spec we're also suppose to ignore any operators
      // that set color or include images while processing this type3 font.
      this.ctx.rect(llx, lly, urx - llx, ury - lly);
      this.clip();
      this.endPath();
    },

    // Color
    getColorN_Pattern: function CanvasGraphics_getColorN_Pattern(IR) {

      var pattern;
      if (IR[0] === 'TilingPattern') {
        var color = IR[1];
        var baseTransform = this.baseTransform ||
                            this.ctx.mozCurrentTransform.slice();
        pattern = new TilingPattern(IR, color, this.ctx, this.objs,
                                    this.commonObjs, baseTransform);
      } else {
        pattern = getShadingPatternFromIR(IR);
      }
      return pattern;
    },
    setStrokeColorN: function CanvasGraphics_setStrokeColorN(/*...*/) {

      this.current.strokeColor = this.getColorN_Pattern(arguments);
    },
    setFillColorN: function CanvasGraphics_setFillColorN(/*...*/) {

      this.current.fillColor = this.getColorN_Pattern(arguments);
      this.current.patternFill = true;
    },
    setStrokeRGBColor: function CanvasGraphics_setStrokeRGBColor(r, g, b) {

      var color = Util.makeCssRgb(r, g, b);
      this.ctx.strokeStyle = color;
      this.current.strokeColor = color;
    },
    setFillRGBColor: function CanvasGraphics_setFillRGBColor(r, g, b) {

      var color = Util.makeCssRgb(r, g, b);
      this.ctx.fillStyle = color;
      this.current.fillColor = color;
      this.current.patternFill = false;
    },

    shadingFill: function CanvasGraphics_shadingFill(patternIR) {

      var ctx = this.ctx;

      this.save();
      var pattern = getShadingPatternFromIR(patternIR);
      ctx.fillStyle = pattern.getPattern(ctx, this, true);
trace_stack.push({location:57,context:{'this':this}});

      var inv = ctx.mozCurrentTransformInverse;
      if (inv) {
        var canvas = ctx.canvas;
        var width = canvas.width;
        var height = canvas.height;

        var bl = Util.applyTransform([0, 0], inv);
        var br = Util.applyTransform([0, height], inv);
        var ul = Util.applyTransform([width, 0], inv);
        var ur = Util.applyTransform([width, height], inv);

        var x0 = Math.min(bl[0], br[0], ul[0], ur[0]);
        var y0 = Math.min(bl[1], br[1], ul[1], ur[1]);
        var x1 = Math.max(bl[0], br[0], ul[0], ur[0]);
        var y1 = Math.max(bl[1], br[1], ul[1], ur[1]);

        this.ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
      } else {
        // HACK to draw the gradient onto an infinite rectangle.
        // PDF gradients are drawn across the entire image while
        // Canvas only allows gradients to be drawn in a rectangle
        // The following bug should allow us to remove this.
        // https://bugzilla.mozilla.org/show_bug.cgi?id=664884

        this.ctx.fillRect(-1e10, -1e10, 2e10, 2e10);
      }

      this.restore();
    },

    // Images
    beginInlineImage: function CanvasGraphics_beginInlineImage() {

      error('Should not call beginInlineImage');
    },
    beginImageData: function CanvasGraphics_beginImageData() {

      error('Should not call beginImageData');
    },

    paintFormXObjectBegin: function CanvasGraphics_paintFormXObjectBegin(matrix,
                                                                        bbox) {

      this.save();
      this.baseTransformStack.push(this.baseTransform);

      if (isArray(matrix) && 6 === matrix.length) {
        this.transform.apply(this, matrix);
      }
trace_stack.push({location:58,context:{'this':this}});

      this.baseTransform = this.ctx.mozCurrentTransform;

      if (isArray(bbox) && 4 === bbox.length) {
        var width = bbox[2] - bbox[0];
        var height = bbox[3] - bbox[1];
        this.ctx.rect(bbox[0], bbox[1], width, height);
        this.clip();
        this.endPath();
      }
    },

    paintFormXObjectEnd: function CanvasGraphics_paintFormXObjectEnd() {

      this.restore();
      this.baseTransform = this.baseTransformStack.pop();
    },

    beginGroup: function CanvasGraphics_beginGroup(group) {

      this.save();
      var currentCtx = this.ctx;
      // TODO non-isolated groups - according to Rik at adobe non-isolated
      // group results aren't usually that different and they even have tools
      // that ignore this setting. Notes from Rik on implmenting:
      // - When you encounter an transparency group, create a new canvas with
      // the dimensions of the bbox
      // - copy the content from the previous canvas to the new canvas
      // - draw as usual
      // - remove the backdrop alpha:
      // alphaNew = 1 - (1 - alpha)/(1 - alphaBackdrop) with 'alpha' the alpha
      // value of your transparency group and 'alphaBackdrop' the alpha of the
      // backdrop
      // - remove background color:
      // colorNew = color - alphaNew *colorBackdrop /(1 - alphaNew)
      if (!group.isolated) {
        info('TODO: Support non-isolated groups.');
      }

      // TODO knockout - supposedly possible with the clever use of compositing
      // modes.
      if (group.knockout) {
        warn('Knockout groups not supported.');
      }

      var currentTransform = currentCtx.mozCurrentTransform;
      if (group.matrix) {
        currentCtx.transform.apply(currentCtx, group.matrix);
      }
      assert(group.bbox, 'Bounding box is required.');

      // Based on the current transform figure out how big the bounding box
      // will actually be.
      var bounds = Util.getAxialAlignedBoundingBox(
                    group.bbox,
                    currentCtx.mozCurrentTransform);
trace_stack.push({location:59,context:{'this':this}});

      // Clip the bounding box to the current canvas.
      var canvasBounds = [0,
                          0,
                          currentCtx.canvas.width,
                          currentCtx.canvas.height];
      bounds = Util.intersect(bounds, canvasBounds) || [0, 0, 0, 0];
      // Use ceil in case we're between sizes so we don't create canvas that is
      // too small and make the canvas at least 1x1 pixels.
      var offsetX = Math.floor(bounds[0]);
      var offsetY = Math.floor(bounds[1]);
      var drawnWidth = Math.max(Math.ceil(bounds[2]) - offsetX, 1);
      var drawnHeight = Math.max(Math.ceil(bounds[3]) - offsetY, 1);
      var scaleX = 1, scaleY = 1;
      if (drawnWidth > MAX_GROUP_SIZE) {
        scaleX = drawnWidth / MAX_GROUP_SIZE;
        drawnWidth = MAX_GROUP_SIZE;
      }
      if (drawnHeight > MAX_GROUP_SIZE) {
        scaleY = drawnHeight / MAX_GROUP_SIZE;
        drawnHeight = MAX_GROUP_SIZE;
      }

      var cacheId = 'groupAt' + this.groupLevel;
      if (group.smask) {
        // Using two cache entries is case if masks are used one after another.
        cacheId +=  '_smask_' + ((this.smaskCounter++) % 2);
      }
      var scratchCanvas = this.cachedCanvases.getCanvas(
        cacheId, drawnWidth, drawnHeight, true);
      var groupCtx = scratchCanvas.context;
trace_stack.push({location:60,context:{'this':this}});
      // Since we created a new canvas that is just the size of the bounding box
      // we have to translate the group ctx.
      groupCtx.scale(1 / scaleX, 1 / scaleY);
      groupCtx.translate(-offsetX, -offsetY);
      groupCtx.transform.apply(groupCtx, currentTransform);

      if (group.smask) {
        // Saving state and cached mask to be used in setGState.
        this.smaskStack.push({
          canvas: scratchCanvas.canvas,
          context: groupCtx,
          offsetX: offsetX,
          offsetY: offsetY,
          scaleX: scaleX,
          scaleY: scaleY,
          subtype: group.smask.subtype,
          backdrop: group.smask.backdrop,
          transferMap: group.smask.transferMap || null
        });
      } else {
        // Setup the current ctx so when the group is popped we draw it at the
        // right location.
        currentCtx.setTransform(1, 0, 0, 1, 0, 0);
        currentCtx.translate(offsetX, offsetY);
        currentCtx.scale(scaleX, scaleY);
      }
      // The transparency group inherits all off the current graphics state
      // except the blend mode, soft mask, and alpha constants.
      copyCtxState(currentCtx, groupCtx);
trace_stack.push({location:61,context:{'this':this}});
      this.ctx = groupCtx;
      this.setGState([
        ['BM', 'Normal'],
        ['ca', 1],
        ['CA', 1]
      ]);
      this.groupStack.push(currentCtx);
      this.groupLevel++;
    },

    endGroup: function CanvasGraphics_endGroup(group) {

      this.groupLevel--;
      var groupCtx = this.ctx;
      this.ctx = this.groupStack.pop();
      // Turn off image smoothing to avoid sub pixel interpolation which can
      // look kind of blurry for some pdfs.
      if (this.ctx.imageSmoothingEnabled !== undefined) {
        this.ctx.imageSmoothingEnabled = false;
      } else {
        this.ctx.mozImageSmoothingEnabled = false;
      }
trace_stack.push({location:62,context:{'this':this}});
      if (group.smask) {
        this.tempSMask = this.smaskStack.pop();
      } else {
        this.ctx.drawImage(groupCtx.canvas, 0, 0);
      }
      this.restore();
    },

    beginAnnotations: function CanvasGraphics_beginAnnotations() {

      this.save();
      this.current = new CanvasExtraState();
    },

    endAnnotations: function CanvasGraphics_endAnnotations() {

      this.restore();
    },

    beginAnnotation: function CanvasGraphics_beginAnnotation(rect, transform,
                                                             matrix) {

      this.save();

      if (isArray(rect) && 4 === rect.length) {
        var width = rect[2] - rect[0];
        var height = rect[3] - rect[1];
        this.ctx.rect(rect[0], rect[1], width, height);
        this.clip();
        this.endPath();
      }

      this.transform.apply(this, transform);
      this.transform.apply(this, matrix);
    },

    endAnnotation: function CanvasGraphics_endAnnotation() {

      this.restore();
    },

    paintJpegXObject: function CanvasGraphics_paintJpegXObject(objId, w, h) {

      var domImage = this.objs.get(objId);
      if (!domImage) {
        warn('Dependent image isn\'t ready yet');
        return;
      }

      this.save();
trace_stack.push({location:63,context:{'this':this}});

      var ctx = this.ctx;
      // scale the image to the unit square
      ctx.scale(1 / w, -1 / h);

      ctx.drawImage(domImage, 0, 0, domImage.width, domImage.height,
                    0, -h, w, h);
      if (this.imageLayer) {
        var currentTransform = ctx.mozCurrentTransformInverse;
        var position = this.getCanvasPosition(0, 0);
        this.imageLayer.appendImage({
          objId: objId,
          left: position[0],
          top: position[1],
          width: w / currentTransform[0],
          height: h / currentTransform[3]
        });
      }
      this.restore();
    },

    paintImageMaskXObject: function CanvasGraphics_paintImageMaskXObject(img) {

      var ctx = this.ctx;
      var width = img.width, height = img.height;
      var fillColor = this.current.fillColor;
      var isPatternFill = this.current.patternFill;
trace_stack.push({location:64,context:{'this':this}});

      var glyph = this.processingType3;

      if (COMPILE_TYPE3_GLYPHS && glyph && glyph.compiled === undefined) {
        if (width <= MAX_SIZE_TO_COMPILE && height <= MAX_SIZE_TO_COMPILE) {
          glyph.compiled =
            compileType3Glyph({data: img.data, width: width, height: height});
        } else {
          glyph.compiled = null;
        }
      }

      if (glyph && glyph.compiled) {
        glyph.compiled(ctx);
        return;
      }

      var maskCanvas = this.cachedCanvases.getCanvas('maskCanvas',
                                                     width, height);
      var maskCtx = maskCanvas.context;
      maskCtx.save();

      putBinaryImageMask(maskCtx, img);

      maskCtx.globalCompositeOperation = 'source-in';

      maskCtx.fillStyle = isPatternFill ?
                          fillColor.getPattern(maskCtx, this) : fillColor;
      maskCtx.fillRect(0, 0, width, height);

      maskCtx.restore();

      this.paintInlineImageXObject(maskCanvas.canvas);
    },

    paintImageMaskXObjectRepeat:
      function CanvasGraphics_paintImageMaskXObjectRepeat(imgData, scaleX,
                                                          scaleY, positions) {

      var width = imgData.width;
      var height = imgData.height;
      var fillColor = this.current.fillColor;
      var isPatternFill = this.current.patternFill;

      var maskCanvas = this.cachedCanvases.getCanvas('maskCanvas',
                                                     width, height);
      var maskCtx = maskCanvas.context;
      maskCtx.save();

      putBinaryImageMask(maskCtx, imgData);

      maskCtx.globalCompositeOperation = 'source-in';

trace_stack.push({location:65,context:{'this':this}});

      maskCtx.fillStyle = isPatternFill ?
                          fillColor.getPattern(maskCtx, this) : fillColor;
      maskCtx.fillRect(0, 0, width, height);

      maskCtx.restore();

      var ctx = this.ctx;
      for (var i = 0, ii = positions.length; i < ii; i += 2) {
        ctx.save();
        ctx.transform(scaleX, 0, 0, scaleY, positions[i], positions[i + 1]);
        ctx.scale(1, -1);
        ctx.drawImage(maskCanvas.canvas, 0, 0, width, height,
          0, -1, 1, 1);
        ctx.restore();
      }
    },

    paintImageMaskXObjectGroup:
      function CanvasGraphics_paintImageMaskXObjectGroup(images) {

      var ctx = this.ctx;

      var fillColor = this.current.fillColor;
      var isPatternFill = this.current.patternFill;
      for (var i = 0, ii = images.length; i < ii; i++) {
        var image = images[i];
        var width = image.width, height = image.height;

        var maskCanvas = this.cachedCanvases.getCanvas('maskCanvas',
                                                       width, height);
        var maskCtx = maskCanvas.context;
        maskCtx.save();

        putBinaryImageMask(maskCtx, image);

        maskCtx.globalCompositeOperation = 'source-in';
trace_stack.push({location:66,context:{'this':this}});

        maskCtx.fillStyle = isPatternFill ?
                            fillColor.getPattern(maskCtx, this) : fillColor;
        maskCtx.fillRect(0, 0, width, height);

        maskCtx.restore();

        ctx.save();
        ctx.transform.apply(ctx, image.transform);
        ctx.scale(1, -1);
        ctx.drawImage(maskCanvas.canvas, 0, 0, width, height,
                      0, -1, 1, 1);
        ctx.restore();
      }
    },

    paintImageXObject: function CanvasGraphics_paintImageXObject(objId) {

      var imgData = this.objs.get(objId);
      if (!imgData) {
        warn('Dependent image isn\'t ready yet');
        return;
      }

      this.paintInlineImageXObject(imgData);
    },

    paintImageXObjectRepeat:
      function CanvasGraphics_paintImageXObjectRepeat(objId, scaleX, scaleY,
                                                          positions) {

      var imgData = this.objs.get(objId);
      if (!imgData) {
        warn('Dependent image isn\'t ready yet');
        return;
      }

      var width = imgData.width;
      var height = imgData.height;
      var map = [];
      for (var i = 0, ii = positions.length; i < ii; i += 2) {
        map.push({transform: [scaleX, 0, 0, scaleY, positions[i],
                 positions[i + 1]], x: 0, y: 0, w: width, h: height});
      }
      this.paintInlineImageXObjectGroup(imgData, map);
    },

    paintInlineImageXObject:
      function CanvasGraphics_paintInlineImageXObject(imgData) {

      var width = imgData.width;
      var height = imgData.height;
      var ctx = this.ctx;
trace_stack.push({location:67,context:{'this':this}});

      this.save();
      // scale the image to the unit square
      ctx.scale(1 / width, -1 / height);

      var currentTransform = ctx.mozCurrentTransformInverse;
      var a = currentTransform[0], b = currentTransform[1];
      var widthScale = Math.max(Math.sqrt(a * a + b * b), 1);
      var c = currentTransform[2], d = currentTransform[3];
      var heightScale = Math.max(Math.sqrt(c * c + d * d), 1);

      var imgToPaint, tmpCanvas;
      // instanceof HTMLElement does not work in jsdom node.js module
      if (imgData instanceof HTMLElement || !imgData.data) {
        imgToPaint = imgData;
      } else {
        tmpCanvas = this.cachedCanvases.getCanvas('inlineImage',
                                                  width, height);
        var tmpCtx = tmpCanvas.context;
        putBinaryImageData(tmpCtx, imgData);
        imgToPaint = tmpCanvas.canvas;
      }

      var paintWidth = width, paintHeight = height;
      var tmpCanvasId = 'prescale1';
      // Vertial or horizontal scaling shall not be more than 2 to not loose the
      // pixels during drawImage operation, painting on the temporary canvas(es)
      // that are twice smaller in size
      while ((widthScale > 2 && paintWidth > 1) ||
             (heightScale > 2 && paintHeight > 1)) {
        var newWidth = paintWidth, newHeight = paintHeight;
        if (widthScale > 2 && paintWidth > 1) {
          newWidth = Math.ceil(paintWidth / 2);
          widthScale /= paintWidth / newWidth;
        }
        if (heightScale > 2 && paintHeight > 1) {
          newHeight = Math.ceil(paintHeight / 2);
          heightScale /= paintHeight / newHeight;
        }
        tmpCanvas = this.cachedCanvases.getCanvas(tmpCanvasId,
                                                  newWidth, newHeight);
        tmpCtx = tmpCanvas.context;
        tmpCtx.clearRect(0, 0, newWidth, newHeight);
        tmpCtx.drawImage(imgToPaint, 0, 0, paintWidth, paintHeight,
                                     0, 0, newWidth, newHeight);
        imgToPaint = tmpCanvas.canvas;
        paintWidth = newWidth;
        paintHeight = newHeight;
        tmpCanvasId = tmpCanvasId === 'prescale1' ? 'prescale2' : 'prescale1';
      }
      ctx.drawImage(imgToPaint, 0, 0, paintWidth, paintHeight,
                                0, -height, width, height);
trace_stack.push({location:68,context:{'this':this}});

      if (this.imageLayer) {
        var position = this.getCanvasPosition(0, -height);
        this.imageLayer.appendImage({
          imgData: imgData,
          left: position[0],
          top: position[1],
          width: width / currentTransform[0],
          height: height / currentTransform[3]
        });
      }
      this.restore();
    },

    paintInlineImageXObjectGroup:
      function CanvasGraphics_paintInlineImageXObjectGroup(imgData, map) {

      var ctx = this.ctx;
      var w = imgData.width;
      var h = imgData.height;

      var tmpCanvas = this.cachedCanvases.getCanvas('inlineImage', w, h);
      var tmpCtx = tmpCanvas.context;
trace_stack.push({location:69,context:{'this':this}});

      putBinaryImageData(tmpCtx, imgData);

      for (var i = 0, ii = map.length; i < ii; i++) {
        var entry = map[i];
        ctx.save();
        ctx.transform.apply(ctx, entry.transform);
        ctx.scale(1, -1);
        ctx.drawImage(tmpCanvas.canvas, entry.x, entry.y, entry.w, entry.h,
                      0, -1, 1, 1);
        if (this.imageLayer) {
          var position = this.getCanvasPosition(entry.x, entry.y);
          this.imageLayer.appendImage({
            imgData: imgData,
            left: position[0],
            top: position[1],
            width: w,
            height: h
          });
        }
        ctx.restore();
      }
    },

    paintSolidColorImageMask:
      function CanvasGraphics_paintSolidColorImageMask() {

        this.ctx.fillRect(0, 0, 1, 1);
    },

    paintXObject: function CanvasGraphics_paintXObject() {

      warn('Unsupported \'paintXObject\' command.');
    },

    // Marked content

    markPoint: function CanvasGraphics_markPoint(tag) {

      // TODO Marked content.
    },
    markPointProps: function CanvasGraphics_markPointProps(tag, properties) {

      // TODO Marked content.
    },
    beginMarkedContent: function CanvasGraphics_beginMarkedContent(tag) {

      // TODO Marked content.
    },
    beginMarkedContentProps: function CanvasGraphics_beginMarkedContentProps(
                                        tag, properties) {

      // TODO Marked content.
    },
    endMarkedContent: function CanvasGraphics_endMarkedContent() {

      // TODO Marked content.
    },

    // Compatibility

    beginCompat: function CanvasGraphics_beginCompat() {

      // TODO ignore undefined operators (should we do that anyway?)
    },
    endCompat: function CanvasGraphics_endCompat() {

      // TODO stop ignoring undefined operators
    },

    // Helper functions

    consumePath: function CanvasGraphics_consumePath() {

      var ctx = this.ctx;
      if (this.pendingClip) {
        if (this.pendingClip === EO_CLIP) {
          if (ctx.mozFillRule !== undefined) {
            ctx.mozFillRule = 'evenodd';
            ctx.clip();
            ctx.mozFillRule = 'nonzero';
          } else {
            ctx.clip('evenodd');
          }
        } else {
          ctx.clip();
        }
        this.pendingClip = null;
      }
      ctx.beginPath();
    },
    getSinglePixelWidth: function CanvasGraphics_getSinglePixelWidth(scale) {

      if (this.cachedGetSinglePixelWidth === null) {
        var inverse = this.ctx.mozCurrentTransformInverse;
        // max of the current horizontal and vertical scale
        this.cachedGetSinglePixelWidth = Math.sqrt(Math.max(
          (inverse[0] * inverse[0] + inverse[1] * inverse[1]),
          (inverse[2] * inverse[2] + inverse[3] * inverse[3])));
      }
      return this.cachedGetSinglePixelWidth;
    },
    getCanvasPosition: function CanvasGraphics_getCanvasPosition(x, y) {

        var transform = this.ctx.mozCurrentTransform;
        return [
          transform[0] * x + transform[2] * y + transform[4],
          transform[1] * x + transform[3] * y + transform[5]
        ];
    }
  };

  for (var op in OPS) {
    CanvasGraphics.prototype[OPS[op]] = CanvasGraphics.prototype[op];
  }

  return CanvasGraphics;
})();


var WebGLUtils = (function WebGLUtilsClosure() {

  function loadShader(gl, code, shaderType) {

    var shader = gl.createShader(shaderType);
    gl.shaderSource(shader, code);
    gl.compileShader(shader);
trace_stack.push({location:70,context:{'gl':gl}});

    var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!compiled) {
      var errorMsg = gl.getShaderInfoLog(shader);
      throw new Error('Error during shader compilation: ' + errorMsg);
    }
    return shader;
  }
  function createVertexShader(gl, code) {

    return loadShader(gl, code, gl.VERTEX_SHADER);
  }
  function createFragmentShader(gl, code) {

    return loadShader(gl, code, gl.FRAGMENT_SHADER);
  }
  function createProgram(gl, shaders) {

    var program = gl.createProgram();
    for (var i = 0, ii = shaders.length; i < ii; ++i) {
      gl.attachShader(program, shaders[i]);
    }
    gl.linkProgram(program);
trace_stack.push({location:71,context:{'gl':gl}});

    var linked = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!linked) {
      var errorMsg = gl.getProgramInfoLog(program);
      throw new Error('Error during program linking: ' + errorMsg);
    }
    return program;
  }
  function createTexture(gl, image, textureId) {

    gl.activeTexture(textureId);
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
trace_stack.push({location:72,context:{'gl':gl}});

    // Set the parameters so we can render any size image.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    // Upload the image into the texture.
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    return texture;
  }

  var currentGL, currentCanvas;
  function generateGL() {

    if (currentGL) {
      return;
    }
    currentCanvas = document.createElement('canvas');
    currentGL = currentCanvas.getContext('webgl',
      { premultipliedalpha: false });
  }

  var smaskVertexShaderCode = '\
  attribute vec2 a_position;                                    \
  attribute vec2 a_texCoord;                                    \
                                                                \
  uniform vec2 u_resolution;                                    \
                                                                \
  varying vec2 v_texCoord;                                      \
                                                                \
  void main() {                                                 \
    vec2 clipSpace = (a_position / u_resolution) * 2.0 - 1.0;   \
    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);          \
                                                                \
    v_texCoord = a_texCoord;                                    \
  }                                                             ';

  var smaskFragmentShaderCode = '\
  precision mediump float;                                      \
                                                                \
  uniform vec4 u_backdrop;                                      \
  uniform int u_subtype;                                        \
  uniform sampler2D u_image;                                    \
  uniform sampler2D u_mask;                                     \
                                                                \
  varying vec2 v_texCoord;                                      \
                                                                \
  void main() {                                                 \
    vec4 imageColor = texture2D(u_image, v_texCoord);           \
    vec4 maskColor = texture2D(u_mask, v_texCoord);             \
    if (u_backdrop.a > 0.0) {                                   \
      maskColor.rgb = maskColor.rgb * maskColor.a +             \
                      u_backdrop.rgb * (1.0 - maskColor.a);     \
    }                                                           \
    float lum;                                                  \
    if (u_subtype == 0) {                                       \
      lum = maskColor.a;                                        \
    } else {                                                    \
      lum = maskColor.r * 0.3 + maskColor.g * 0.59 +            \
            maskColor.b * 0.11;                                 \
    }                                                           \
    imageColor.a *= lum;                                        \
    imageColor.rgb *= imageColor.a;                             \
    gl_FragColor = imageColor;                                  \
  }                                                             ';

  var smaskCache = null;

  function initSmaskGL() {

    var canvas, gl;

    generateGL();
    canvas = currentCanvas;
    currentCanvas = null;
    gl = currentGL;
    currentGL = null;

    // setup a GLSL program
    var vertexShader = createVertexShader(gl, smaskVertexShaderCode);
    var fragmentShader = createFragmentShader(gl, smaskFragmentShaderCode);
    var program = createProgram(gl, [vertexShader, fragmentShader]);
    gl.useProgram(program);
trace_stack.push({location:73,context:{'gl':gl}});

    var cache = {};
    cache.gl = gl;
    cache.canvas = canvas;
    cache.resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    cache.positionLocation = gl.getAttribLocation(program, 'a_position');
    cache.backdropLocation = gl.getUniformLocation(program, 'u_backdrop');
    cache.subtypeLocation = gl.getUniformLocation(program, 'u_subtype');

    var texCoordLocation = gl.getAttribLocation(program, 'a_texCoord');
    var texLayerLocation = gl.getUniformLocation(program, 'u_image');
    var texMaskLocation = gl.getUniformLocation(program, 'u_mask');

    // provide texture coordinates for the rectangle.
    var texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      0.0,  0.0,
      1.0,  0.0,
      0.0,  1.0,
      0.0,  1.0,
      1.0,  0.0,
      1.0,  1.0]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(texCoordLocation);
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);
trace_stack.push({location:74,context:{'gl':gl}});

    gl.uniform1i(texLayerLocation, 0);
    gl.uniform1i(texMaskLocation, 1);

    smaskCache = cache;
  }

  function composeSMask(layer, mask, properties) {

    var width = layer.width, height = layer.height;

    if (!smaskCache) {
      initSmaskGL();
    }
    var cache = smaskCache,canvas = cache.canvas, gl = cache.gl;
    canvas.width = width;
    canvas.height = height;
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.uniform2f(cache.resolutionLocation, width, height);
trace_stack.push({location:75,context:{'gl':gl}});

    if (properties.backdrop) {
      gl.uniform4f(cache.resolutionLocation, properties.backdrop[0],
                   properties.backdrop[1], properties.backdrop[2], 1);
    } else {
      gl.uniform4f(cache.resolutionLocation, 0, 0, 0, 0);
    }
    gl.uniform1i(cache.subtypeLocation,
                 properties.subtype === 'Luminosity' ? 1 : 0);

    // Create a textures
    var texture = createTexture(gl, layer, gl.TEXTURE0);
    var maskTexture = createTexture(gl, mask, gl.TEXTURE1);


    // Create a buffer and put a single clipspace rectangle in
    // it (2 triangles)
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      0, 0,
      width, 0,
      0, height,
      0, height,
      width, 0,
      width, height]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(cache.positionLocation);
    gl.vertexAttribPointer(cache.positionLocation, 2, gl.FLOAT, false, 0, 0);

    // draw
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.clear(gl.COLOR_BUFFER_BIT);
trace_stack.push({location:76,context:{'gl':gl}});

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    gl.flush();

    gl.deleteTexture(texture);
    gl.deleteTexture(maskTexture);
    gl.deleteBuffer(buffer);

    return canvas;
  }

  var figuresVertexShaderCode = '\
  attribute vec2 a_position;                                    \
  attribute vec3 a_color;                                       \
                                                                \
  uniform vec2 u_resolution;                                    \
  uniform vec2 u_scale;                                         \
  uniform vec2 u_offset;                                        \
                                                                \
  varying vec4 v_color;                                         \
                                                                \
  void main() {                                                 \
    vec2 position = (a_position + u_offset) * u_scale;          \
    vec2 clipSpace = (position / u_resolution) * 2.0 - 1.0;     \
    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);          \
                                                                \
    v_color = vec4(a_color / 255.0, 1.0);                       \
  }                                                             ';

  var figuresFragmentShaderCode = '\
  precision mediump float;                                      \
                                                                \
  varying vec4 v_color;                                         \
                                                                \
  void main() {                                                 \
    gl_FragColor = v_color;                                     \
  }                                                             ';

  var figuresCache = null;

  function initFiguresGL() {

    var canvas, gl;

    generateGL();
    canvas = currentCanvas;
    currentCanvas = null;
    gl = currentGL;
    currentGL = null;

    // setup a GLSL program
    var vertexShader = createVertexShader(gl, figuresVertexShaderCode);
    var fragmentShader = createFragmentShader(gl, figuresFragmentShaderCode);
    var program = createProgram(gl, [vertexShader, fragmentShader]);
trace_stack.push({location:77,context:{'gl':gl}});

    gl.useProgram(program);

    var cache = {};
    cache.gl = gl;
    cache.canvas = canvas;
    cache.resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    cache.scaleLocation = gl.getUniformLocation(program, 'u_scale');
    cache.offsetLocation = gl.getUniformLocation(program, 'u_offset');
    cache.positionLocation = gl.getAttribLocation(program, 'a_position');
    cache.colorLocation = gl.getAttribLocation(program, 'a_color');

    figuresCache = cache;
  }

  function drawFigures(width, height, backgroundColor, figures, context) {

    if (!figuresCache) {
      initFiguresGL();
    }
    var cache = figuresCache, canvas = cache.canvas, gl = cache.gl;

    canvas.width = width;
    canvas.height = height;
trace_stack.push({location:78,context:{'gl':gl}});
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.uniform2f(cache.resolutionLocation, width, height);

    // count triangle points
    var count = 0;
    var i, ii, rows;
    for (i = 0, ii = figures.length; i < ii; i++) {
      switch (figures[i].type) {
        case 'lattice':
          rows = (figures[i].coords.length / figures[i].verticesPerRow) | 0;
          count += (rows - 1) * (figures[i].verticesPerRow - 1) * 6;
          break;
        case 'triangles':
          count += figures[i].coords.length;
          break;
      }
    }
    // transfer data
    var coords = new Float32Array(count * 2);
    var colors = new Uint8Array(count * 3);
    var coordsMap = context.coords, colorsMap = context.colors;
    var pIndex = 0, cIndex = 0;
    for (i = 0, ii = figures.length; i < ii; i++) {
      var figure = figures[i], ps = figure.coords, cs = figure.colors;
      switch (figure.type) {
        case 'lattice':
          var cols = figure.verticesPerRow;
          rows = (ps.length / cols) | 0;
          for (var row = 1; row < rows; row++) {
            var offset = row * cols + 1;
            for (var col = 1; col < cols; col++, offset++) {
              coords[pIndex] = coordsMap[ps[offset - cols - 1]];
              coords[pIndex + 1] = coordsMap[ps[offset - cols - 1] + 1];
              coords[pIndex + 2] = coordsMap[ps[offset - cols]];
              coords[pIndex + 3] = coordsMap[ps[offset - cols] + 1];
              coords[pIndex + 4] = coordsMap[ps[offset - 1]];
              coords[pIndex + 5] = coordsMap[ps[offset - 1] + 1];
              colors[cIndex] = colorsMap[cs[offset - cols - 1]];
              colors[cIndex + 1] = colorsMap[cs[offset - cols - 1] + 1];
              colors[cIndex + 2] = colorsMap[cs[offset - cols - 1] + 2];
              colors[cIndex + 3] = colorsMap[cs[offset - cols]];
              colors[cIndex + 4] = colorsMap[cs[offset - cols] + 1];
              colors[cIndex + 5] = colorsMap[cs[offset - cols] + 2];
              colors[cIndex + 6] = colorsMap[cs[offset - 1]];
              colors[cIndex + 7] = colorsMap[cs[offset - 1] + 1];
              colors[cIndex + 8] = colorsMap[cs[offset - 1] + 2];

              coords[pIndex + 6] = coords[pIndex + 2];
              coords[pIndex + 7] = coords[pIndex + 3];
              coords[pIndex + 8] = coords[pIndex + 4];
              coords[pIndex + 9] = coords[pIndex + 5];
              coords[pIndex + 10] = coordsMap[ps[offset]];
              coords[pIndex + 11] = coordsMap[ps[offset] + 1];
              colors[cIndex + 9] = colors[cIndex + 3];
              colors[cIndex + 10] = colors[cIndex + 4];
              colors[cIndex + 11] = colors[cIndex + 5];
              colors[cIndex + 12] = colors[cIndex + 6];
              colors[cIndex + 13] = colors[cIndex + 7];
              colors[cIndex + 14] = colors[cIndex + 8];
              colors[cIndex + 15] = colorsMap[cs[offset]];
              colors[cIndex + 16] = colorsMap[cs[offset] + 1];
              colors[cIndex + 17] = colorsMap[cs[offset] + 2];
              pIndex += 12;
              cIndex += 18;
            }
          }
          break;
        case 'triangles':
          for (var j = 0, jj = ps.length; j < jj; j++) {
            coords[pIndex] = coordsMap[ps[j]];
            coords[pIndex + 1] = coordsMap[ps[j] + 1];
            colors[cIndex] = colorsMap[cs[j]];
            colors[cIndex + 1] = colorsMap[cs[j] + 1];
            colors[cIndex + 2] = colorsMap[cs[j] + 2];
            pIndex += 2;
            cIndex += 3;
          }
          break;
      }
    }

    // draw
    if (backgroundColor) {
      gl.clearColor(backgroundColor[0] / 255, backgroundColor[1] / 255,
                    backgroundColor[2] / 255, 1.0);
    } else {
      gl.clearColor(0, 0, 0, 0);
    }
    gl.clear(gl.COLOR_BUFFER_BIT);

    var coordsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, coordsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, coords, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(cache.positionLocation);
    gl.vertexAttribPointer(cache.positionLocation, 2, gl.FLOAT, false, 0, 0);

    var colorsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(cache.colorLocation);
    gl.vertexAttribPointer(cache.colorLocation, 3, gl.UNSIGNED_BYTE, false,
                           0, 0);

    gl.uniform2f(cache.scaleLocation, context.scaleX, context.scaleY);
    gl.uniform2f(cache.offsetLocation, context.offsetX, context.offsetY);
trace_stack.push({location:79,context:{'gl':gl}});

    gl.drawArrays(gl.TRIANGLES, 0, count);

    gl.flush();

    gl.deleteBuffer(coordsBuffer);
    gl.deleteBuffer(colorsBuffer);

    return canvas;
  }

  function cleanup() {

    if (smaskCache && smaskCache.canvas) {
      smaskCache.canvas.width = 0;
      smaskCache.canvas.height = 0;
    }
    if (figuresCache && figuresCache.canvas) {
      figuresCache.canvas.width = 0;
      figuresCache.canvas.height = 0;
    }
    smaskCache = null;
    figuresCache = null;
  }

  return {
    get isEnabled() {
      if (PDFJS.disableWebGL) {
        return false;
      }
      var enabled = false;
      try {
        generateGL();
        enabled = !!currentGL;
      } catch (e) { }
      return shadow(this, 'isEnabled', enabled);
    },
    composeSMask: composeSMask,
    drawFigures: drawFigures,
    clear: cleanup
  };
})();


var ShadingIRs = {};

ShadingIRs.RadialAxial = {
  fromIR: function RadialAxial_fromIR(raw) {

    var type = raw[1];
    var colorStops = raw[2];
    var p0 = raw[3];
    var p1 = raw[4];
    var r0 = raw[5];
    var r1 = raw[6];
    return {
      type: 'Pattern',
      getPattern: function RadialAxial_getPattern(ctx) {

        var grad;
        if (type === 'axial') {
          grad = ctx.createLinearGradient(p0[0], p0[1], p1[0], p1[1]);
        } else if (type === 'radial') {
          grad = ctx.createRadialGradient(p0[0], p0[1], r0, p1[0], p1[1], r1);
        }

        for (var i = 0, ii = colorStops.length; i < ii; ++i) {
          var c = colorStops[i];
          grad.addColorStop(c[0], c[1]);
        }
        return grad;
      }
    };
  }
};

var createMeshCanvas = (function createMeshCanvasClosure() {

  function drawTriangle(data, context, p1, p2, p3, c1, c2, c3) {

    // Very basic Gouraud-shaded triangle rasterization algorithm.
    var coords = context.coords, colors = context.colors;
    var bytes = data.data, rowSize = data.width * 4;
    var tmp;
    if (coords[p1 + 1] > coords[p2 + 1]) {
      tmp = p1; p1 = p2; p2 = tmp; tmp = c1; c1 = c2; c2 = tmp;
    }
    if (coords[p2 + 1] > coords[p3 + 1]) {
      tmp = p2; p2 = p3; p3 = tmp; tmp = c2; c2 = c3; c3 = tmp;
    }
    if (coords[p1 + 1] > coords[p2 + 1]) {
      tmp = p1; p1 = p2; p2 = tmp; tmp = c1; c1 = c2; c2 = tmp;
    }
    var x1 = (coords[p1] + context.offsetX) * context.scaleX;
    var y1 = (coords[p1 + 1] + context.offsetY) * context.scaleY;
    var x2 = (coords[p2] + context.offsetX) * context.scaleX;
    var y2 = (coords[p2 + 1] + context.offsetY) * context.scaleY;
    var x3 = (coords[p3] + context.offsetX) * context.scaleX;
    var y3 = (coords[p3 + 1] + context.offsetY) * context.scaleY;
    if (y1 >= y3) {
      return;
    }
    var c1r = colors[c1], c1g = colors[c1 + 1], c1b = colors[c1 + 2];
    var c2r = colors[c2], c2g = colors[c2 + 1], c2b = colors[c2 + 2];
    var c3r = colors[c3], c3g = colors[c3 + 1], c3b = colors[c3 + 2];

    var minY = Math.round(y1), maxY = Math.round(y3);
    var xa, car, cag, cab;
    var xb, cbr, cbg, cbb;
    var k;
    for (var y = minY; y <= maxY; y++) {
      if (y < y2) {
        k = y < y1 ? 0 : y1 === y2 ? 1 : (y1 - y) / (y1 - y2);
        xa = x1 - (x1 - x2) * k;
        car = c1r - (c1r - c2r) * k;
        cag = c1g - (c1g - c2g) * k;
        cab = c1b - (c1b - c2b) * k;
      } else {
        k = y > y3 ? 1 : y2 === y3 ? 0 : (y2 - y) / (y2 - y3);
        xa = x2 - (x2 - x3) * k;
        car = c2r - (c2r - c3r) * k;
        cag = c2g - (c2g - c3g) * k;
        cab = c2b - (c2b - c3b) * k;
      }
      k = y < y1 ? 0 : y > y3 ? 1 : (y1 - y) / (y1 - y3);
      xb = x1 - (x1 - x3) * k;
      cbr = c1r - (c1r - c3r) * k;
      cbg = c1g - (c1g - c3g) * k;
      cbb = c1b - (c1b - c3b) * k;
      var x1_ = Math.round(Math.min(xa, xb));
      var x2_ = Math.round(Math.max(xa, xb));
      var j = rowSize * y + x1_ * 4;
      for (var x = x1_; x <= x2_; x++) {
        k = (xa - x) / (xa - xb);
        k = k < 0 ? 0 : k > 1 ? 1 : k;
        bytes[j++] = (car - (car - cbr) * k) | 0;
        bytes[j++] = (cag - (cag - cbg) * k) | 0;
        bytes[j++] = (cab - (cab - cbb) * k) | 0;
        bytes[j++] = 255;
      }
    }
  }

  function drawFigure(data, figure, context) {

    var ps = figure.coords;
    var cs = figure.colors;
    var i, ii;
    switch (figure.type) {
      case 'lattice':
        var verticesPerRow = figure.verticesPerRow;
        var rows = Math.floor(ps.length / verticesPerRow) - 1;
        var cols = verticesPerRow - 1;
        for (i = 0; i < rows; i++) {
          var q = i * verticesPerRow;
          for (var j = 0; j < cols; j++, q++) {
            drawTriangle(data, context,
              ps[q], ps[q + 1], ps[q + verticesPerRow],
              cs[q], cs[q + 1], cs[q + verticesPerRow]);
            drawTriangle(data, context,
              ps[q + verticesPerRow + 1], ps[q + 1], ps[q + verticesPerRow],
              cs[q + verticesPerRow + 1], cs[q + 1], cs[q + verticesPerRow]);
          }
        }
        break;
      case 'triangles':
        for (i = 0, ii = ps.length; i < ii; i += 3) {
          drawTriangle(data, context,
            ps[i], ps[i + 1], ps[i + 2],
            cs[i], cs[i + 1], cs[i + 2]);
        }
        break;
      default:
        error('illigal figure');
        break;
    }
  }

  function createMeshCanvas(bounds, combinesScale, coords, colors, figures,
                            backgroundColor, cachedCanvases) {

    // we will increase scale on some weird factor to let antialiasing take
    // care of "rough" edges
    var EXPECTED_SCALE = 1.1;
    // MAX_PATTERN_SIZE is used to avoid OOM situation.
    var MAX_PATTERN_SIZE = 3000; // 10in @ 300dpi shall be enough

    var offsetX = Math.floor(bounds[0]);
    var offsetY = Math.floor(bounds[1]);
    var boundsWidth = Math.ceil(bounds[2]) - offsetX;
    var boundsHeight = Math.ceil(bounds[3]) - offsetY;

    var width = Math.min(Math.ceil(Math.abs(boundsWidth * combinesScale[0] *
      EXPECTED_SCALE)), MAX_PATTERN_SIZE);
    var height = Math.min(Math.ceil(Math.abs(boundsHeight * combinesScale[1] *
      EXPECTED_SCALE)), MAX_PATTERN_SIZE);
    var scaleX = boundsWidth / width;
    var scaleY = boundsHeight / height;

    var context = {
      coords: coords,
      colors: colors,
      offsetX: -offsetX,
      offsetY: -offsetY,
      scaleX: 1 / scaleX,
      scaleY: 1 / scaleY
    };

    var canvas, tmpCanvas, i, ii;
    if (WebGLUtils.isEnabled) {
      canvas = WebGLUtils.drawFigures(width, height, backgroundColor,
                                      figures, context);

      // https://bugzilla.mozilla.org/show_bug.cgi?id=972126
      tmpCanvas = cachedCanvases.getCanvas('mesh', width, height, false);
      tmpCanvas.context.drawImage(canvas, 0, 0);
      canvas = tmpCanvas.canvas;
    } else {
      tmpCanvas = cachedCanvases.getCanvas('mesh', width, height, false);
      var tmpCtx = tmpCanvas.context;

      var data = tmpCtx.createImageData(width, height);
      if (backgroundColor) {
        var bytes = data.data;
        for (i = 0, ii = bytes.length; i < ii; i += 4) {
          bytes[i] = backgroundColor[0];
          bytes[i + 1] = backgroundColor[1];
          bytes[i + 2] = backgroundColor[2];
          bytes[i + 3] = 255;
        }
      }
      for (i = 0; i < figures.length; i++) {
        drawFigure(data, figures[i], context);
      }
      tmpCtx.putImageData(data, 0, 0);
      canvas = tmpCanvas.canvas;
    }

    return {canvas: canvas, offsetX: offsetX, offsetY: offsetY,
            scaleX: scaleX, scaleY: scaleY};
  }
  return createMeshCanvas;
})();

ShadingIRs.Mesh = {
  fromIR: function Mesh_fromIR(raw) {

    //var type = raw[1];
    var coords = raw[2];
    var colors = raw[3];
    var figures = raw[4];
    var bounds = raw[5];
    var matrix = raw[6];
    //var bbox = raw[7];
    var background = raw[8];
    return {
      type: 'Pattern',
      getPattern: function Mesh_getPattern(ctx, owner, shadingFill) {

        var scale;
        if (shadingFill) {
          scale = Util.singularValueDecompose2dScale(ctx.mozCurrentTransform);
        } else {
          // Obtain scale from matrix and current transformation matrix.
          scale = Util.singularValueDecompose2dScale(owner.baseTransform);
          if (matrix) {
            var matrixScale = Util.singularValueDecompose2dScale(matrix);
            scale = [scale[0] * matrixScale[0],
                     scale[1] * matrixScale[1]];
          }
        }


        // Rasterizing on the main thread since sending/queue large canvases
        // might cause OOM.
        var temporaryPatternCanvas = createMeshCanvas(bounds, scale, coords,
          colors, figures, shadingFill ? null : background,
          owner.cachedCanvases);

        if (!shadingFill) {
          ctx.setTransform.apply(ctx, owner.baseTransform);
          if (matrix) {
            ctx.transform.apply(ctx, matrix);
          }
        }

        ctx.translate(temporaryPatternCanvas.offsetX,
                      temporaryPatternCanvas.offsetY);
        ctx.scale(temporaryPatternCanvas.scaleX,
                  temporaryPatternCanvas.scaleY);

        return ctx.createPattern(temporaryPatternCanvas.canvas, 'no-repeat');
      }
    };
  }
};

ShadingIRs.Dummy = {
  fromIR: function Dummy_fromIR() {

    return {
      type: 'Pattern',
      getPattern: function Dummy_fromIR_getPattern() {

        return 'hotpink';
      }
    };
  }
};

function getShadingPatternFromIR(raw) {

  var shadingIR = ShadingIRs[raw[0]];
  if (!shadingIR) {
    error('Unknown IR type: ' + raw[0]);
  }
  return shadingIR.fromIR(raw);
}

var TilingPattern = (function TilingPatternClosure() {

  var PaintType = {
    COLORED: 1,
    UNCOLORED: 2
  };

  var MAX_PATTERN_SIZE = 3000; // 10in @ 300dpi shall be enough

  function TilingPattern(IR, color, ctx, objs, commonObjs, baseTransform) {

    this.operatorList = IR[2];
    this.matrix = IR[3] || [1, 0, 0, 1, 0, 0];
    this.bbox = IR[4];
    this.xstep = IR[5];
    this.ystep = IR[6];
    this.paintType = IR[7];
    this.tilingType = IR[8];
    this.color = color;
    this.objs = objs;
    this.commonObjs = commonObjs;
    this.baseTransform = baseTransform;
    this.type = 'Pattern';
    this.ctx = ctx;
  }

  TilingPattern.prototype = {
    createPatternCanvas: function TilinPattern_createPatternCanvas(owner) {

      var operatorList = this.operatorList;
      var bbox = this.bbox;
      var xstep = this.xstep;
      var ystep = this.ystep;
      var paintType = this.paintType;
      var tilingType = this.tilingType;
      var color = this.color;
      var objs = this.objs;
      var commonObjs = this.commonObjs;

      info('TilingType: ' + tilingType);

      var x0 = bbox[0], y0 = bbox[1], x1 = bbox[2], y1 = bbox[3];

      var topLeft = [x0, y0];
      // we want the canvas to be as large as the step size
      var botRight = [x0 + xstep, y0 + ystep];

      var width = botRight[0] - topLeft[0];
      var height = botRight[1] - topLeft[1];

      // Obtain scale from matrix and current transformation matrix.
      var matrixScale = Util.singularValueDecompose2dScale(this.matrix);
      var curMatrixScale = Util.singularValueDecompose2dScale(
        this.baseTransform);
      var combinedScale = [matrixScale[0] * curMatrixScale[0],
        matrixScale[1] * curMatrixScale[1]];

      // MAX_PATTERN_SIZE is used to avoid OOM situation.
      // Use width and height values that are as close as possible to the end
      // result when the pattern is used. Too low value makes the pattern look
      // blurry. Too large value makes it look too crispy.
      width = Math.min(Math.ceil(Math.abs(width * combinedScale[0])),
        MAX_PATTERN_SIZE);

      height = Math.min(Math.ceil(Math.abs(height * combinedScale[1])),
        MAX_PATTERN_SIZE);

      var tmpCanvas = owner.cachedCanvases.getCanvas('pattern',
        width, height, true);
      var tmpCtx = tmpCanvas.context;
      var graphics = new CanvasGraphics(tmpCtx, commonObjs, objs);
      graphics.groupLevel = owner.groupLevel;

      this.setFillAndStrokeStyleToContext(tmpCtx, paintType, color);

      this.setScale(width, height, xstep, ystep);
      this.transformToScale(graphics);

      // transform coordinates to pattern space
      var tmpTranslate = [1, 0, 0, 1, -topLeft[0], -topLeft[1]];
      graphics.transform.apply(graphics, tmpTranslate);

      this.clipBbox(graphics, bbox, x0, y0, x1, y1);

      graphics.executeOperatorList(operatorList);
      return tmpCanvas.canvas;
    },

    setScale: function TilingPattern_setScale(width, height, xstep, ystep) {

      this.scale = [width / xstep, height / ystep];
    },

    transformToScale: function TilingPattern_transformToScale(graphics) {

      var scale = this.scale;
      var tmpScale = [scale[0], 0, 0, scale[1], 0, 0];
      graphics.transform.apply(graphics, tmpScale);
    },

    scaleToContext: function TilingPattern_scaleToContext() {

      var scale = this.scale;
      this.ctx.scale(1 / scale[0], 1 / scale[1]);
    },

    clipBbox: function clipBbox(graphics, bbox, x0, y0, x1, y1) {

      if (bbox && isArray(bbox) && bbox.length === 4) {
        var bboxWidth = x1 - x0;
        var bboxHeight = y1 - y0;
        graphics.ctx.rect(x0, y0, bboxWidth, bboxHeight);
        graphics.clip();
        graphics.endPath();
      }
    },

    setFillAndStrokeStyleToContext:
      function setFillAndStrokeStyleToContext(context, paintType, color) {

        switch (paintType) {
          case PaintType.COLORED:
            var ctx = this.ctx;
            context.fillStyle = ctx.fillStyle;
            context.strokeStyle = ctx.strokeStyle;
            break;
          case PaintType.UNCOLORED:
            var cssColor = Util.makeCssRgb(color[0], color[1], color[2]);
            context.fillStyle = cssColor;
            context.strokeStyle = cssColor;
            break;
          default:
            error('Unsupported paint type: ' + paintType);
        }
      },

    getPattern: function TilingPattern_getPattern(ctx, owner) {

      var temporaryPatternCanvas = this.createPatternCanvas(owner);

      ctx = this.ctx;
      ctx.setTransform.apply(ctx, this.baseTransform);
      ctx.transform.apply(ctx, this.matrix);
      this.scaleToContext();

      return ctx.createPattern(temporaryPatternCanvas, 'repeat');
    }
  };

  return TilingPattern;
})();


function FontLoader(docId) {

  this.docId = docId;
  this.styleElement = null;
  this.nativeFontFaces = [];
  this.loadTestFontId = 0;
trace_stack.push({location:80,context:{'this':this}});

  this.loadingContext = {
    requests: [],
    nextRequestId: 0
  };
}
FontLoader.prototype = {
  insertRule: function fontLoaderInsertRule(rule) {

    var styleElement = this.styleElement;
    if (!styleElement) {
      styleElement = this.styleElement = document.createElement('style');
      styleElement.id = 'PDFJS_FONT_STYLE_TAG_' + this.docId;
      document.documentElement.getElementsByTagName('head')[0].appendChild(
        styleElement);
    }
trace_stack.push({location:81,context:{'this':this}});

    var styleSheet = styleElement.sheet;
    styleSheet.insertRule(rule, styleSheet.cssRules.length);
  },

  clear: function fontLoaderClear() {


    var styleElement = this.styleElement;
    if (styleElement) {
      styleElement.parentNode.removeChild(styleElement);
      styleElement = this.styleElement = null;
    }
trace_stack.push({location:82,context:{'this':this}});
trace_stack.watermark(trace_stack)

    this.nativeFontFaces.forEach(function(nativeFontFace) {
      document.fonts.delete(nativeFontFace);
    });
    this.nativeFontFaces.length = 0;
  },
  get loadTestFont() {
    // This is a CFF font with 1 glyph for '.' that fills its entire width and
    // height.
    return shadow(this, 'loadTestFont', atob(
      'T1RUTwALAIAAAwAwQ0ZGIDHtZg4AAAOYAAAAgUZGVE1lkzZwAAAEHAAAABxHREVGABQAFQ' +
      'AABDgAAAAeT1MvMlYNYwkAAAEgAAAAYGNtYXABDQLUAAACNAAAAUJoZWFk/xVFDQAAALwA' +
      'AAA2aGhlYQdkA+oAAAD0AAAAJGhtdHgD6AAAAAAEWAAAAAZtYXhwAAJQAAAAARgAAAAGbm' +
      'FtZVjmdH4AAAGAAAAAsXBvc3T/hgAzAAADeAAAACAAAQAAAAEAALZRFsRfDzz1AAsD6AAA' +
      'AADOBOTLAAAAAM4KHDwAAAAAA+gDIQAAAAgAAgAAAAAAAAABAAADIQAAAFoD6AAAAAAD6A' +
      'ABAAAAAAAAAAAAAAAAAAAAAQAAUAAAAgAAAAQD6AH0AAUAAAKKArwAAACMAooCvAAAAeAA' +
      'MQECAAACAAYJAAAAAAAAAAAAAQAAAAAAAAAAAAAAAFBmRWQAwAAuAC4DIP84AFoDIQAAAA' +
      'AAAQAAAAAAAAAAACAAIAABAAAADgCuAAEAAAAAAAAAAQAAAAEAAAAAAAEAAQAAAAEAAAAA' +
      'AAIAAQAAAAEAAAAAAAMAAQAAAAEAAAAAAAQAAQAAAAEAAAAAAAUAAQAAAAEAAAAAAAYAAQ' +
      'AAAAMAAQQJAAAAAgABAAMAAQQJAAEAAgABAAMAAQQJAAIAAgABAAMAAQQJAAMAAgABAAMA' +
      'AQQJAAQAAgABAAMAAQQJAAUAAgABAAMAAQQJAAYAAgABWABYAAAAAAAAAwAAAAMAAAAcAA' +
      'EAAAAAADwAAwABAAAAHAAEACAAAAAEAAQAAQAAAC7//wAAAC7////TAAEAAAAAAAABBgAA' +
      'AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAA' +
      'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
      'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
      'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
      'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMAAA' +
      'AAAAD/gwAyAAAAAQAAAAAAAAAAAAAAAAAAAAABAAQEAAEBAQJYAAEBASH4DwD4GwHEAvgc' +
      'A/gXBIwMAYuL+nz5tQXkD5j3CBLnEQACAQEBIVhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWF' +
      'hYWFhYWFhYAAABAQAADwACAQEEE/t3Dov6fAH6fAT+fPp8+nwHDosMCvm1Cvm1DAz6fBQA' +
      'AAAAAAABAAAAAMmJbzEAAAAAzgTjFQAAAADOBOQpAAEAAAAAAAAADAAUAAQAAAABAAAAAg' +
      'ABAAAAAAAAAAAD6AAAAAAAAA=='
    ));
  },

  addNativeFontFace: function fontLoader_addNativeFontFace(nativeFontFace) {

    this.nativeFontFaces.push(nativeFontFace);
    document.fonts.add(nativeFontFace);
  },

  bind: function fontLoaderBind(fonts, callback) {

    assert(!isWorker, 'bind() shall be called from main thread');

    var rules = [];
    var fontsToLoad = [];
    var fontLoadPromises = [];
    var getNativeFontPromise = function(nativeFontFace) {

      // Return a promise that is always fulfilled, even when the font fails to
      // load.
      return nativeFontFace.loaded.catch(function(e) {

        warn('Failed to load font "' + nativeFontFace.family + '": ' + e);
      });
    };
    for (var i = 0, ii = fonts.length; i < ii; i++) {
      var font = fonts[i];

      // Add the font to the DOM only once or skip if the font
      // is already loaded.
      if (font.attached || font.loading === false) {
        continue;
      }
      font.attached = true;
trace_stack.push({location:83,context:{'this':this}});

      if (FontLoader.isFontLoadingAPISupported) {
        var nativeFontFace = font.createNativeFontFace();
        if (nativeFontFace) {
          this.addNativeFontFace(nativeFontFace);
          fontLoadPromises.push(getNativeFontPromise(nativeFontFace));
        }
      } else {
        var rule = font.createFontFaceRule();
        if (rule) {
          this.insertRule(rule);
          rules.push(rule);
          fontsToLoad.push(font);
        }
      }
    }

    var request = this.queueLoadingCallback(callback);
    if (FontLoader.isFontLoadingAPISupported) {
      Promise.all(fontLoadPromises).then(function() {

        request.complete();
      });
    } else if (rules.length > 0 && !FontLoader.isSyncFontLoadingSupported) {
      this.prepareFontLoadEvent(rules, fontsToLoad, request);
    } else {
      request.complete();
    }
  },

  queueLoadingCallback: function FontLoader_queueLoadingCallback(callback) {

    function LoadLoader_completeRequest() {

      assert(!request.end, 'completeRequest() cannot be called twice');
      request.end = Date.now();

      // sending all completed requests in order how they were queued
      while (context.requests.length > 0 && context.requests[0].end) {
        var otherRequest = context.requests.shift();
        setTimeout(otherRequest.callback, 0);
      }
    }

    var context = this.loadingContext;
    var requestId = 'pdfjs-font-loading-' + (context.nextRequestId++);
    var request = {
      id: requestId,
      complete: LoadLoader_completeRequest,
      callback: callback,
      started: Date.now()
    };
    context.requests.push(request);
    return request;
  },

  prepareFontLoadEvent: function fontLoaderPrepareFontLoadEvent(rules,
                                                                fonts,
                                                                request) {

      /** Hack begin */
      // There's currently no event when a font has finished downloading so the
      // following code is a dirty hack to 'guess' when a font is
      // ready. It's assumed fonts are loaded in order, so add a known test
      // font after the desired fonts and then test for the loading of that
      // test font.

      function int32(data, offset) {

        return (data.charCodeAt(offset) << 24) |
               (data.charCodeAt(offset + 1) << 16) |
               (data.charCodeAt(offset + 2) << 8) |
               (data.charCodeAt(offset + 3) & 0xff);
      }

      function spliceString(s, offset, remove, insert) {

        var chunk1 = s.substr(0, offset);
        var chunk2 = s.substr(offset + remove);
        return chunk1 + insert + chunk2;
      }

      var i, ii;

      var canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      var ctx = canvas.getContext('2d');

      var called = 0;
      function isFontReady(name, callback) {

        called++;
        // With setTimeout clamping this gives the font ~100ms to load.
        if(called > 30) {
          warn('Load test font never loaded.');
          callback();
          return;
        }
        ctx.font = '30px ' + name;
        ctx.fillText('.', 0, 20);
        var imageData = ctx.getImageData(0, 0, 1, 1);
        if (imageData.data[3] > 0) {
          callback();
          return;
        }
        setTimeout(isFontReady.bind(null, name, callback));
      }

      var loadTestFontId = 'lt' + Date.now() + this.loadTestFontId++;
      // Chromium seems to cache fonts based on a hash of the actual font data,
      // so the font must be modified for each load test else it will appear to
      // be loaded already.
      // TODO: This could maybe be made faster by avoiding the btoa of the full
      // font by splitting it in chunks before hand and padding the font id.
      var data = this.loadTestFont;
      var COMMENT_OFFSET = 976; // has to be on 4 byte boundary (for checksum)
      data = spliceString(data, COMMENT_OFFSET, loadTestFontId.length,
                          loadTestFontId);
      // CFF checksum is important for IE, adjusting it
      var CFF_CHECKSUM_OFFSET = 16;
      var XXXX_VALUE = 0x58585858; // the "comment" filled with 'X'
      var checksum = int32(data, CFF_CHECKSUM_OFFSET);
      for (i = 0, ii = loadTestFontId.length - 3; i < ii; i += 4) {
        checksum = (checksum - XXXX_VALUE + int32(loadTestFontId, i)) | 0;
      }
trace_stack.push({location:84,context:{'ctx':ctx}});

      if (i < loadTestFontId.length) { // align to 4 bytes boundary
        checksum = (checksum - XXXX_VALUE +
                    int32(loadTestFontId + 'XXX', i)) | 0;
      }
      data = spliceString(data, CFF_CHECKSUM_OFFSET, 4, string32(checksum));

      var url = 'url(data:font/opentype;base64,' + btoa(data) + ');';
      var rule = '@font-face { font-family:"' + loadTestFontId + '";src:' +
                 url + '}';
      this.insertRule(rule);

      var names = [];
      for (i = 0, ii = fonts.length; i < ii; i++) {
        names.push(fonts[i].loadedName);
      }
      names.push(loadTestFontId);

      var div = document.createElement('div');
      div.setAttribute('style',
                       'visibility: hidden;' +
                       'width: 10px; height: 10px;' +
                       'position: absolute; top: 0px; left: 0px;');
      for (i = 0, ii = names.length; i < ii; ++i) {
        var span = document.createElement('span');
        span.textContent = 'Hi';
        span.style.fontFamily = names[i];
        div.appendChild(span);
      }
      document.body.appendChild(div);

      isFontReady(loadTestFontId, function() {

        document.body.removeChild(div);
        request.complete();
      });
      /** Hack end */
  }
};
FontLoader.isFontLoadingAPISupported = (!isWorker &&
  typeof document !== 'undefined' && !!document.fonts);
Object.defineProperty(FontLoader, 'isSyncFontLoadingSupported', {
  get: function () {

    var supported = false;

    // User agent string sniffing is bad, but there is no reliable way to tell
    // if font is fully loaded and ready to be used with canvas.
    var userAgent = window.navigator.userAgent;
    var m = /Mozilla\/5.0.*?rv:(\d+).*? Gecko/.exec(userAgent);
    if (m && m[1] >= 14) {
      supported = true;
    }
    // TODO other browsers
    if (userAgent === 'node') {
      supported = true;
    }
    return shadow(FontLoader, 'isSyncFontLoadingSupported', supported);
  },
  enumerable: true,
  configurable: true
});

var FontFaceObject = (function FontFaceObjectClosure() {

  function FontFaceObject(translatedData) {

    this.compiledGlyphs = {};
    // importing translated data
    for (var i in translatedData) {
      this[i] = translatedData[i];
    }
  }
  Object.defineProperty(FontFaceObject, 'isEvalSupported', {
    get: function () {

      var evalSupport = false;
      if (PDFJS.isEvalSupported) {
        try {
          /* jshint evil: true */
          new Function('');
          evalSupport = true;
        } catch (e) {}
      }
      return shadow(this, 'isEvalSupported', evalSupport);
    },
    enumerable: true,
    configurable: true
  });
  FontFaceObject.prototype = {
    createNativeFontFace: function FontFaceObject_createNativeFontFace() {

      if (!this.data) {
        return null;
      }

      if (PDFJS.disableFontFace) {
        this.disableFontFace = true;
        return null;
      }

      var nativeFontFace = new FontFace(this.loadedName, this.data, {});
trace_stack.push({location:85,context:{'this':this}});

      if (PDFJS.pdfBug && 'FontInspector' in globalScope &&
          globalScope['FontInspector'].enabled) {
        globalScope['FontInspector'].fontAdded(this);
      }
      return nativeFontFace;
    },

    createFontFaceRule: function FontFaceObject_createFontFaceRule() {

      if (!this.data) {
        return null;
      }

      if (PDFJS.disableFontFace) {
        this.disableFontFace = true;
        return null;
      }

      var data = bytesToString(new Uint8Array(this.data));
      var fontName = this.loadedName;
trace_stack.push({location:86,context:{'this':this}});

      // Add the font-face rule to the document
      var url = ('url(data:' + this.mimetype + ';base64,' +
                 window.btoa(data) + ');');
      var rule = '@font-face { font-family:"' + fontName + '";src:' + url + '}';

      if (PDFJS.pdfBug && 'FontInspector' in globalScope &&
          globalScope['FontInspector'].enabled) {
        globalScope['FontInspector'].fontAdded(this, url);
      }

      return rule;
    },

    getPathGenerator:
        function FontFaceObject_getPathGenerator(objs, character) {

      if (!(character in this.compiledGlyphs)) {
        var cmds = objs.get(this.loadedName + '_path_' + character);
        var current, i, len;
trace_stack.push({location:87,context:{'this':this}});

        // If we can, compile cmds into JS for MAXIMUM SPEED
        if (FontFaceObject.isEvalSupported) {
          var args, js = '';
          for (i = 0, len = cmds.length; i < len; i++) {
            current = cmds[i];

            if (current.args !== undefined) {
              args = current.args.join(',');
            } else {
              args = '';
            }

            js += 'c.' + current.cmd + '(' + args + ');\n';
          }
          /* jshint -W054 */
          this.compiledGlyphs[character] = new Function('c', 'size', js);
        } else {
          // But fall back on using Function.prototype.apply() if we're
          // blocked from using eval() for whatever reason (like CSP policies)
          this.compiledGlyphs[character] = function(c, size) {

            for (i = 0, len = cmds.length; i < len; i++) {
              current = cmds[i];

              if (current.cmd === 'scale') {
                current.args = [size, -size];
              }

              c[current.cmd].apply(c, current.args);
            }
          };
        }
      }
      return this.compiledGlyphs[character];
    }
  };
  return FontFaceObject;
})();


/**
 * Optimised CSS custom property getter/setter.
 * @class
 */
var CustomStyle = (function CustomStyleClosure() {
trace_stack.push({location:88,context:{}});


  // As noted on: http://www.zachstronaut.com/posts/2009/02/17/
  //              animate-css-transforms-firefox-webkit.html
  // in some versions of IE9 it is critical that ms appear in this list
  // before Moz
  var prefixes = ['ms', 'Moz', 'Webkit', 'O'];
  var _cache = {};

  function CustomStyle() {
}

  CustomStyle.getProp = function get(propName, element) {

    // check cache only when no element is given
    if (arguments.length === 1 && typeof _cache[propName] === 'string') {
      return _cache[propName];
    }

    element = element || document.documentElement;
    var style = element.style, prefixed, uPropName;

    // test standard property first
    if (typeof style[propName] === 'string') {
      return (_cache[propName] = propName);
    }

    // capitalize
    uPropName = propName.charAt(0).toUpperCase() + propName.slice(1);

    // test vendor specific properties
    for (var i = 0, l = prefixes.length; i < l; i++) {
      prefixed = prefixes[i] + uPropName;
      if (typeof style[prefixed] === 'string') {
        return (_cache[propName] = prefixed);
      }
    }

    //if all fails then set to undefined
    return (_cache[propName] = 'undefined');
  };

  CustomStyle.setProp = function set(propName, element, str) {

    var prop = this.getProp(propName);
    if (prop !== 'undefined') {
      element.style[prop] = str;
    }
  };

  return CustomStyle;
})();

PDFJS.CustomStyle = CustomStyle;


var ANNOT_MIN_SIZE = 10; // px

var AnnotationLayer = (function AnnotationLayerClosure() {

  // TODO(mack): This dupes some of the logic in CanvasGraphics.setFont()
  function setTextStyles(element, item, fontObj) {

    var style = element.style;
    style.fontSize = item.fontSize + 'px';
    style.direction = item.fontDirection < 0 ? 'rtl': 'ltr';

    if (!fontObj) {
      return;
    }

    style.fontWeight = fontObj.black ?
      (fontObj.bold ? 'bolder' : 'bold') :
      (fontObj.bold ? 'bold' : 'normal');
    style.fontStyle = fontObj.italic ? 'italic' : 'normal';
trace_stack.push({location:89,context:{'style':style}});

    var fontName = fontObj.loadedName;
    var fontFamily = fontName ? '"' + fontName + '", ' : '';
    // Use a reasonable default font if the font doesn't specify a fallback
    var fallbackName = fontObj.fallbackName || 'Helvetica, sans-serif';
    style.fontFamily = fontFamily + fallbackName;
  }

  function getContainer(data, page, viewport) {

    var container = document.createElement('section');
    var width = data.rect[2] - data.rect[0];
    var height = data.rect[3] - data.rect[1];

    container.setAttribute('data-annotation-id', data.id);

    data.rect = Util.normalizeRect([
      data.rect[0],
      page.view[3] - data.rect[1] + page.view[1],
      data.rect[2],
      page.view[3] - data.rect[3] + page.view[1]
    ]);
trace_stack.push({location:90,context:{'page':page}});

    CustomStyle.setProp('transform', container,
                        'matrix(' + viewport.transform.join(',') + ')');
    CustomStyle.setProp('transformOrigin', container,
                        -data.rect[0] + 'px ' + -data.rect[1] + 'px');

    if (data.borderStyle.width > 0) {
      container.style.borderWidth = data.borderStyle.width + 'px';
      if (data.borderStyle.style !== AnnotationBorderStyleType.UNDERLINE) {
        // Underline styles only have a bottom border, so we do not need
        // to adjust for all borders. This yields a similar result as
        // Adobe Acrobat/Reader.
        width = width - 2 * data.borderStyle.width;
        height = height - 2 * data.borderStyle.width;
      }

      var horizontalRadius = data.borderStyle.horizontalCornerRadius;
      var verticalRadius = data.borderStyle.verticalCornerRadius;
      if (horizontalRadius > 0 || verticalRadius > 0) {
        var radius = horizontalRadius + 'px / ' + verticalRadius + 'px';
        CustomStyle.setProp('borderRadius', container, radius);
      }

      switch (data.borderStyle.style) {
        case AnnotationBorderStyleType.SOLID:
          container.style.borderStyle = 'solid';
          break;

        case AnnotationBorderStyleType.DASHED:
          container.style.borderStyle = 'dashed';
          break;

        case AnnotationBorderStyleType.BEVELED:
          warn('Unimplemented border style: beveled');
          break;

        case AnnotationBorderStyleType.INSET:
          warn('Unimplemented border style: inset');
          break;

        case AnnotationBorderStyleType.UNDERLINE:
          container.style.borderBottomStyle = 'solid';
          break;

        default:
          break;
      }

      if (data.color) {
        container.style.borderColor =
          Util.makeCssRgb(data.color[0] | 0,
                          data.color[1] | 0,
                          data.color[2] | 0);
      } else {
        // Transparent (invisible) border, so do not draw it at all.
        container.style.borderWidth = 0;
      }
    }

    container.style.left = data.rect[0] + 'px';
    container.style.top = data.rect[1] + 'px';

    container.style.width = width + 'px';
    container.style.height = height + 'px';

    return container;
  }

  function getHtmlElementForTextWidgetAnnotation(item, page) {

    var element = document.createElement('div');
    var width = item.rect[2] - item.rect[0];
    var height = item.rect[3] - item.rect[1];
    element.style.width = width + 'px';
    element.style.height = height + 'px';
    element.style.display = 'table';
trace_stack.push({location:91,context:{'page':page}});

    var content = document.createElement('div');
    content.textContent = item.fieldValue;
    var textAlignment = item.textAlignment;
    content.style.textAlign = ['left', 'center', 'right'][textAlignment];
    content.style.verticalAlign = 'middle';
    content.style.display = 'table-cell';

    var fontObj = item.fontRefName ?
      page.commonObjs.getData(item.fontRefName) : null;
    setTextStyles(content, item, fontObj);

    element.appendChild(content);

    return element;
  }

  function getHtmlElementForTextAnnotation(item, page, viewport) {

    var rect = item.rect;

    // sanity check because of OOo-generated PDFs
    if ((rect[3] - rect[1]) < ANNOT_MIN_SIZE) {
      rect[3] = rect[1] + ANNOT_MIN_SIZE;
    }
    if ((rect[2] - rect[0]) < ANNOT_MIN_SIZE) {
      rect[2] = rect[0] + (rect[3] - rect[1]); // make it square
    }

    var container = getContainer(item, page, viewport);
    container.className = 'annotText';

    var image  = document.createElement('img');
    image.style.height = container.style.height;
    image.style.width = container.style.width;
trace_stack.push({location:92,context:{'page':page}});
    var iconName = item.name;
    image.src = PDFJS.imageResourcesPath + 'annotation-' +
      iconName.toLowerCase() + '.svg';
    image.alt = '[{{type}} Annotation]';
    image.dataset.l10nId = 'text_annotation_type';
    image.dataset.l10nArgs = JSON.stringify({type: iconName});

    var contentWrapper = document.createElement('div');
    contentWrapper.className = 'annotTextContentWrapper';
    contentWrapper.style.left = Math.floor(rect[2] - rect[0] + 5) + 'px';
    contentWrapper.style.top = '-10px';

    var content = document.createElement('div');
    content.className = 'annotTextContent';
    content.setAttribute('hidden', true);
trace_stack.push({location:93,context:{'page':page}});

    var i, ii;
    if (item.hasBgColor && item.color) {
      var color = item.color;

      // Enlighten the color (70%)
      var BACKGROUND_ENLIGHT = 0.7;
      var r = BACKGROUND_ENLIGHT * (255 - color[0]) + color[0];
      var g = BACKGROUND_ENLIGHT * (255 - color[1]) + color[1];
      var b = BACKGROUND_ENLIGHT * (255 - color[2]) + color[2];
      content.style.backgroundColor = Util.makeCssRgb(r | 0, g | 0, b | 0);
    }

    var title = document.createElement('h1');
    var text = document.createElement('p');
    title.textContent = item.title;

    if (!item.content && !item.title) {
      content.setAttribute('hidden', true);
    } else {
      var e = document.createElement('span');
      var lines = item.content.split(/(?:\r\n?|\n)/);
      for (i = 0, ii = lines.length; i < ii; ++i) {
        var line = lines[i];
        e.appendChild(document.createTextNode(line));
        if (i < (ii - 1)) {
          e.appendChild(document.createElement('br'));
        }
      }
      text.appendChild(e);

      var pinned = false;

      var showAnnotation = function showAnnotation(pin) {

        if (pin) {
          pinned = true;
        }
        if (content.hasAttribute('hidden')) {
          container.style.zIndex += 1;
          content.removeAttribute('hidden');
        }
      };

      var hideAnnotation = function hideAnnotation(unpin) {

        if (unpin) {
          pinned = false;
        }
        if (!content.hasAttribute('hidden') && !pinned) {
          container.style.zIndex -= 1;
          content.setAttribute('hidden', true);
        }
      };

      var toggleAnnotation = function toggleAnnotation() {

        if (pinned) {
          hideAnnotation(true);
        } else {
          showAnnotation(true);
        }
      };

      image.addEventListener('click', function image_clickHandler() {

        toggleAnnotation();
      }, false);
      image.addEventListener('mouseover', function image_mouseOverHandler() {

        showAnnotation();
      }, false);
      image.addEventListener('mouseout', function image_mouseOutHandler() {

        hideAnnotation();
      }, false);

      content.addEventListener('click', function content_clickHandler() {

        hideAnnotation(true);
      }, false);
    }

    content.appendChild(title);
    content.appendChild(text);
    contentWrapper.appendChild(content);
    container.appendChild(image);
    container.appendChild(contentWrapper);

    return container;
  }

  function getHtmlElementForLinkAnnotation(item, page, viewport, linkService) {

    function bindLink(link, dest) {

      link.href = linkService.getDestinationHash(dest);
      link.onclick = function annotationsLayerBuilderLinksOnclick() {

        if (dest) {
          linkService.navigateTo(dest);
        }
        return false;
      };
      if (dest) {
        link.className = 'internalLink';
      }
    }

    function bindNamedAction(link, action) {

      link.href = linkService.getAnchorUrl('');
      link.onclick = function annotationsLayerBuilderNamedActionOnClick() {

        linkService.executeNamedAction(action);
        return false;
      };
      link.className = 'internalLink';
    }

    var container = getContainer(item, page, viewport);
    container.className = 'annotLink';

    var link = document.createElement('a');
    link.href = link.title = item.url || '';

    if (item.url && isExternalLinkTargetSet()) {
      link.target = LinkTargetStringMap[PDFJS.externalLinkTarget];
    }

    if (!item.url) {
      if (item.action) {
        bindNamedAction(link, item.action);
      } else {
        bindLink(link, ('dest' in item) ? item.dest : null);
      }
    }

    container.appendChild(link);

    return container;
  }

  function getHtmlElement(data, page, viewport, linkService) {

    switch (data.annotationType) {
      case AnnotationType.WIDGET:
        return getHtmlElementForTextWidgetAnnotation(data, page);
      case AnnotationType.TEXT:
        return getHtmlElementForTextAnnotation(data, page, viewport);
      case AnnotationType.LINK:
        return getHtmlElementForLinkAnnotation(data, page, viewport,
                                               linkService);
      default:
        throw new Error('Unsupported annotationType: ' + data.annotationType);
    }
  }

  function render(viewport, div, annotations, page, linkService) {

    for (var i = 0, ii = annotations.length; i < ii; i++) {
      var data = annotations[i];
      if (!data || !data.hasHtml) {
        continue;
      }

      var element = getHtmlElement(data, page, viewport, linkService);
      div.appendChild(element);
    }
  }

  function update(viewport, div, annotations) {

    for (var i = 0, ii = annotations.length; i < ii; i++) {
      var data = annotations[i];
      var element = div.querySelector(
        '[data-annotation-id="' + data.id + '"]');
      if (element) {
        CustomStyle.setProp('transform', element,
          'matrix(' + viewport.transform.join(',') + ')');
      }
    }
    div.removeAttribute('hidden');
  }

  return {
    render: render,
    update: update
  };
})();

PDFJS.AnnotationLayer = AnnotationLayer;


/**
 * Text layer render parameters.
 *
 * @typedef {Object} TextLayerRenderParameters
 * @property {TextContent} textContent - Text content to render (the object is
 *   returned by the page's getTextContent() method).
 * @property {HTMLElement} container - HTML element that will contain text runs.
 * @property {PDFJS.PageViewport} viewport - The target viewport to properly
 *   layout the text runs.
 * @property {Array} textDivs - (optional) HTML elements that are correspond
 *   the text items of the textContent input. This is output and shall be
 *   initially be set to empty array.
 * @property {number} timeout - (optional) Delay in milliseconds before
 *   rendering of the text  runs occurs.
 */
var renderTextLayer = (function renderTextLayerClosure() {

  var MAX_TEXT_DIVS_TO_RENDER = 100000;

  var NonWhitespaceRegexp = /\S/;

  function isAllWhitespace(str) {

    return !NonWhitespaceRegexp.test(str);
  }

  function appendText(textDivs, viewport, geom, styles) {

    var style = styles[geom.fontName];
    var textDiv = document.createElement('div');
    textDivs.push(textDiv);
    if (isAllWhitespace(geom.str)) {
      textDiv.dataset.isWhitespace = true;
      return;
    }
trace_stack.push({location:94,context:{'style':style}});
    var tx = PDFJS.Util.transform(viewport.transform, geom.transform);
    var angle = Math.atan2(tx[1], tx[0]);
    if (style.vertical) {
      angle += Math.PI / 2;
    }
    var fontHeight = Math.sqrt((tx[2] * tx[2]) + (tx[3] * tx[3]));
    var fontAscent = fontHeight;
    if (style.ascent) {
      fontAscent = style.ascent * fontAscent;
    } else if (style.descent) {
      fontAscent = (1 + style.descent) * fontAscent;
    }

    var left;
    var top;
    if (angle === 0) {
      left = tx[4];
      top = tx[5] - fontAscent;
    } else {
      left = tx[4] + (fontAscent * Math.sin(angle));
      top = tx[5] - (fontAscent * Math.cos(angle));
    }
    textDiv.style.left = left + 'px';
    textDiv.style.top = top + 'px';
    textDiv.style.fontSize = fontHeight + 'px';
    textDiv.style.fontFamily = style.fontFamily;

    textDiv.textContent = geom.str;
    // |fontName| is only used by the Font Inspector. This test will succeed
    // when e.g. the Font Inspector is off but the Stepper is on, but it's
    // not worth the effort to do a more accurate test.
    if (PDFJS.pdfBug) {
      textDiv.dataset.fontName = geom.fontName;
    }
    // Storing into dataset will convert number into string.
    if (angle !== 0) {
      textDiv.dataset.angle = angle * (180 / Math.PI);
    }
    // We don't bother scaling single-char text divs, because it has very
    // little effect on text highlighting. This makes scrolling on docs with
    // lots of such divs a lot faster.
    if (geom.str.length > 1) {
      if (style.vertical) {
        textDiv.dataset.canvasWidth = geom.height * viewport.scale;
      } else {
        textDiv.dataset.canvasWidth = geom.width * viewport.scale;
      }
    }
  }

  function render(task) {

    if (task._canceled) {
      return;
    }
    var textLayerFrag = task._container;
    var textDivs = task._textDivs;
    var capability = task._capability;
    var textDivsLength = textDivs.length;

    // No point in rendering many divs as it would make the browser
    // unusable even after the divs are rendered.
    if (textDivsLength > MAX_TEXT_DIVS_TO_RENDER) {
      capability.resolve();
      return;
    }

    var canvas = document.createElement('canvas');
    canvas.mozOpaque = true;
    var ctx = canvas.getContext('2d', {alpha: false});
trace_stack.push({location:95,context:{'ctx':ctx}});

    var lastFontSize;
    var lastFontFamily;
    for (var i = 0; i < textDivsLength; i++) {
      var textDiv = textDivs[i];
      if (textDiv.dataset.isWhitespace !== undefined) {
        continue;
      }

      var fontSize = textDiv.style.fontSize;
      var fontFamily = textDiv.style.fontFamily;

      // Only build font string and set to context if different from last.
      if (fontSize !== lastFontSize || fontFamily !== lastFontFamily) {
        ctx.font = fontSize + ' ' + fontFamily;
        lastFontSize = fontSize;
        lastFontFamily = fontFamily;
      }

      var width = ctx.measureText(textDiv.textContent).width;
      if (width > 0) {
        textLayerFrag.appendChild(textDiv);
        var transform;
        if (textDiv.dataset.canvasWidth !== undefined) {
          // Dataset values come of type string.
          var textScale = textDiv.dataset.canvasWidth / width;
          transform = 'scaleX(' + textScale + ')';
        } else {
          transform = '';
        }
        var rotation = textDiv.dataset.angle;
        if (rotation) {
          transform = 'rotate(' + rotation + 'deg) ' + transform;
        }
        if (transform) {
          PDFJS.CustomStyle.setProp('transform' , textDiv, transform);
        }
      }
    }
    capability.resolve();
  }

  /**
   * Text layer rendering task.
   *
   * @param {TextContent} textContent
   * @param {HTMLElement} container
   * @param {PDFJS.PageViewport} viewport
   * @param {Array} textDivs
   * @private
   */
  function TextLayerRenderTask(textContent, container, viewport, textDivs) {

    this._textContent = textContent;
    this._container = container;
    this._viewport = viewport;
    textDivs = textDivs || [];
    this._textDivs = textDivs;
trace_stack.push({location:96,context:{'this':this}});
    this._canceled = false;
    this._capability = createPromiseCapability();
    this._renderTimer = null;
  }
  TextLayerRenderTask.prototype = {
    get promise() {
      return this._capability.promise;
    },

    cancel: function TextLayer_cancel() {

      this._canceled = true;
      if (this._renderTimer !== null) {
        clearTimeout(this._renderTimer);
        this._renderTimer = null;
      }
      this._capability.reject('canceled');
    },

    _render: function TextLayer_render(timeout) {

      var textItems = this._textContent.items;
      var styles = this._textContent.styles;
      var textDivs = this._textDivs;
      var viewport = this._viewport;
trace_stack.push({location:97,context:{'this':this}});

      for (var i = 0, len = textItems.length; i < len; i++) {
        appendText(textDivs, viewport, textItems[i], styles);
      }

      if (!timeout) { // Render right away
        render(this);
      } else { // Schedule
        var self = this;
        this._renderTimer = setTimeout(function() {

          render(self);
          self._renderTimer = null;
        }, timeout);
      }
    }
  };


  /**
   * Starts rendering of the text layer.
   *
   * @param {TextLayerRenderParameters} renderParameters
   * @returns {TextLayerRenderTask}
   */
  function renderTextLayer(renderParameters) {

    var task = new TextLayerRenderTask(renderParameters.textContent,
                                       renderParameters.container,
                                       renderParameters.viewport,
                                       renderParameters.textDivs);
    task._render(renderParameters.timeout);
    return task;
  }

  return renderTextLayer;
})();

PDFJS.renderTextLayer = renderTextLayer;


var SVG_DEFAULTS = {
  fontStyle: 'normal',
  fontWeight: 'normal',
  fillColor: '#000000'
};

var convertImgDataToPng = (function convertImgDataToPngClosure() {
trace_stack.push({location:98,context:{}});

  var PNG_HEADER =
    new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  var CHUNK_WRAPPER_SIZE = 12;

  var crcTable = new Int32Array(256);
  for (var i = 0; i < 256; i++) {
    var c = i;
    for (var h = 0; h < 8; h++) {
      if (c & 1) {
        c = 0xedB88320 ^ ((c >> 1) & 0x7fffffff);
      } else {
        c = (c >> 1) & 0x7fffffff;
      }
    }
    crcTable[i] = c;
  }

  function crc32(data, start, end) {

    var crc = -1;
    for (var i = start; i < end; i++) {
      var a = (crc ^ data[i]) & 0xff;
      var b = crcTable[a];
      crc = (crc >>> 8) ^ b;
    }
    return crc ^ -1;
  }

  function writePngChunk(type, body, data, offset) {

    var p = offset;
    var len = body.length;

    data[p] = len >> 24 & 0xff;
    data[p + 1] = len >> 16 & 0xff;
    data[p + 2] = len >> 8 & 0xff;
    data[p + 3] = len & 0xff;
    p += 4;

    data[p] = type.charCodeAt(0) & 0xff;
    data[p + 1] = type.charCodeAt(1) & 0xff;
    data[p + 2] = type.charCodeAt(2) & 0xff;
    data[p + 3] = type.charCodeAt(3) & 0xff;
    p += 4;

    data.set(body, p);
    p += body.length;

    var crc = crc32(data, offset + 4, p);

    data[p] = crc >> 24 & 0xff;
    data[p + 1] = crc >> 16 & 0xff;
    data[p + 2] = crc >> 8 & 0xff;
    data[p + 3] = crc & 0xff;
  }

  function adler32(data, start, end) {

    var a = 1;
    var b = 0;
    for (var i = start; i < end; ++i) {
      a = (a + (data[i] & 0xff)) % 65521;
      b = (b + a) % 65521;
    }
    return (b << 16) | a;
  }

  function encode(imgData, kind) {

    var width = imgData.width;
    var height = imgData.height;
    var bitDepth, colorType, lineSize;
    var bytes = imgData.data;

    switch (kind) {
      case ImageKind.GRAYSCALE_1BPP:
        colorType = 0;
        bitDepth = 1;
        lineSize = (width + 7) >> 3;
        break;
      case ImageKind.RGB_24BPP:
        colorType = 2;
        bitDepth = 8;
        lineSize = width * 3;
        break;
      case ImageKind.RGBA_32BPP:
        colorType = 6;
        bitDepth = 8;
        lineSize = width * 4;
        break;
      default:
        throw new Error('invalid format');
    }

    // prefix every row with predictor 0
    var literals = new Uint8Array((1 + lineSize) * height);
    var offsetLiterals = 0, offsetBytes = 0;
    var y, i;
    for (y = 0; y < height; ++y) {
      literals[offsetLiterals++] = 0; // no prediction
      literals.set(bytes.subarray(offsetBytes, offsetBytes + lineSize),
                   offsetLiterals);
      offsetBytes += lineSize;
      offsetLiterals += lineSize;
    }

    if (kind === ImageKind.GRAYSCALE_1BPP) {
      // inverting for B/W
      offsetLiterals = 0;
      for (y = 0; y < height; y++) {
        offsetLiterals++; // skipping predictor
        for (i = 0; i < lineSize; i++) {
          literals[offsetLiterals++] ^= 0xFF;
        }
      }
    }

    var ihdr = new Uint8Array([
      width >> 24 & 0xff,
      width >> 16 & 0xff,
      width >> 8 & 0xff,
      width & 0xff,
      height >> 24 & 0xff,
      height >> 16 & 0xff,
      height >> 8 & 0xff,
      height & 0xff,
      bitDepth, // bit depth
      colorType, // color type
      0x00, // compression method
      0x00, // filter method
      0x00 // interlace method
    ]);

    var len = literals.length;
    var maxBlockLength = 0xFFFF;

    var deflateBlocks = Math.ceil(len / maxBlockLength);
    var idat = new Uint8Array(2 + len + deflateBlocks * 5 + 4);
    var pi = 0;
    idat[pi++] = 0x78; // compression method and flags
    idat[pi++] = 0x9c; // flags

    var pos = 0;
    while (len > maxBlockLength) {
      // writing non-final DEFLATE blocks type 0 and length of 65535
      idat[pi++] = 0x00;
      idat[pi++] = 0xff;
      idat[pi++] = 0xff;
      idat[pi++] = 0x00;
      idat[pi++] = 0x00;
      idat.set(literals.subarray(pos, pos + maxBlockLength), pi);
      pi += maxBlockLength;
      pos += maxBlockLength;
      len -= maxBlockLength;
    }

    // writing non-final DEFLATE blocks type 0
    idat[pi++] = 0x01;
    idat[pi++] = len & 0xff;
    idat[pi++] = len >> 8 & 0xff;
    idat[pi++] = (~len & 0xffff) & 0xff;
    idat[pi++] = (~len & 0xffff) >> 8 & 0xff;
    idat.set(literals.subarray(pos), pi);
    pi += literals.length - pos;

    var adler = adler32(literals, 0, literals.length); // checksum
    idat[pi++] = adler >> 24 & 0xff;
    idat[pi++] = adler >> 16 & 0xff;
    idat[pi++] = adler >> 8 & 0xff;
    idat[pi++] = adler & 0xff;

    // PNG will consists: header, IHDR+data, IDAT+data, and IEND.
    var pngLength = PNG_HEADER.length + (CHUNK_WRAPPER_SIZE * 3) +
                    ihdr.length + idat.length;
    var data = new Uint8Array(pngLength);
    var offset = 0;
    data.set(PNG_HEADER, offset);
    offset += PNG_HEADER.length;
    writePngChunk('IHDR', ihdr, data, offset);
    offset += CHUNK_WRAPPER_SIZE + ihdr.length;
    writePngChunk('IDATA', idat, data, offset);
    offset += CHUNK_WRAPPER_SIZE + idat.length;
    writePngChunk('IEND', new Uint8Array(0), data, offset);

    return PDFJS.createObjectURL(data, 'image/png');
  }

  return function convertImgDataToPng(imgData) {

    var kind = (imgData.kind === undefined ?
                ImageKind.GRAYSCALE_1BPP : imgData.kind);
    return encode(imgData, kind);
  };
})();

var SVGExtraState = (function SVGExtraStateClosure() {

  function SVGExtraState() {

    this.fontSizeScale = 1;
    this.fontWeight = SVG_DEFAULTS.fontWeight;
    this.fontSize = 0;

    this.textMatrix = IDENTITY_MATRIX;
    this.fontMatrix = FONT_IDENTITY_MATRIX;
    this.leading = 0;

    // Current point (in user coordinates)
    this.x = 0;
    this.y = 0;

    // Start of text line (in text coordinates)
    this.lineX = 0;
    this.lineY = 0;

    // Character and word spacing
    this.charSpacing = 0;
    this.wordSpacing = 0;
    this.textHScale = 1;
    this.textRise = 0;

    // Default foreground and background colors
    this.fillColor = SVG_DEFAULTS.fillColor;
    this.strokeColor = '#000000';

    this.fillAlpha = 1;
    this.strokeAlpha = 1;
    this.lineWidth = 1;
    this.lineJoin = '';
    this.lineCap = '';
    this.miterLimit = 0;

    this.dashArray = [];
    this.dashPhase = 0;

    this.dependencies = [];

    // Clipping
    this.clipId = '';
    this.pendingClip = false;

    this.maskId = '';
  }

  SVGExtraState.prototype = {
    clone: function SVGExtraState_clone() {

      return Object.create(this);
    },
    setCurrentPoint: function SVGExtraState_setCurrentPoint(x, y) {

      this.x = x;
      this.y = y;
    }
  };
  return SVGExtraState;
})();

var SVGGraphics = (function SVGGraphicsClosure() {

  function createScratchSVG(width, height) {

    var NS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(NS, 'svg:svg');
    svg.setAttributeNS(null, 'version', '1.1');
    svg.setAttributeNS(null, 'width', width + 'px');
    svg.setAttributeNS(null, 'height', height + 'px');
    svg.setAttributeNS(null, 'viewBox', '0 0 ' + width + ' ' + height);
    return svg;
  }

  function opListToTree(opList) {

    var opTree = [];
    var tmp = [];
    var opListLen = opList.length;

    for (var x = 0; x < opListLen; x++) {
      if (opList[x].fn === 'save') {
        opTree.push({'fnId': 92, 'fn': 'group', 'items': []});
        tmp.push(opTree);
        opTree = opTree[opTree.length - 1].items;
        continue;
      }

      if(opList[x].fn === 'restore') {
        opTree = tmp.pop();
      } else {
        opTree.push(opList[x]);
      }
    }
    return opTree;
  }

  /**
   * Formats float number.
   * @param value {number} number to format.
   * @returns {string}
   */
  function pf(value) {

    if (value === (value | 0)) { // integer number
      return value.toString();
    }
    var s = value.toFixed(10);
    var i = s.length - 1;
    if (s[i] !== '0') {
      return s;
    }
    // removing trailing zeros
    do {
      i--;
    } while (s[i] === '0');
    return s.substr(0, s[i] === '.' ? i : i + 1);
  }

  /**
   * Formats transform matrix. The standard rotation, scale and translate
   * matrices are replaced by their shorter forms, and for identity matrix
   * returns empty string to save the memory.
   * @param m {Array} matrix to format.
   * @returns {string}
   */
  function pm(m) {

    if (m[4] === 0 && m[5] === 0) {
      if (m[1] === 0 && m[2] === 0) {
        if (m[0] === 1 && m[3] === 1) {
          return '';
        }
        return 'scale(' + pf(m[0]) + ' ' + pf(m[3]) + ')';
      }
      if (m[0] === m[3] && m[1] === -m[2]) {
        var a = Math.acos(m[0]) * 180 / Math.PI;
        return 'rotate(' + pf(a) + ')';
      }
    } else {
      if (m[0] === 1 && m[1] === 0 && m[2] === 0 && m[3] === 1) {
        return 'translate(' + pf(m[4]) + ' ' + pf(m[5]) + ')';
      }
    }
    return 'matrix(' + pf(m[0]) + ' ' + pf(m[1]) + ' ' + pf(m[2]) + ' ' +
      pf(m[3]) + ' ' + pf(m[4]) + ' ' + pf(m[5]) + ')';
  }

  function SVGGraphics(commonObjs, objs) {
trace_stack.push({location:99,context:{}});

    this.current = new SVGExtraState();
    this.transformMatrix = IDENTITY_MATRIX; // Graphics state matrix
    this.transformStack = [];
    this.extraStack = [];
    this.commonObjs = commonObjs;
trace_stack.push({location:100,context:{'this':this}});
    this.objs = objs;
    this.pendingEOFill = false;

    this.embedFonts = false;
    this.embeddedFonts = {};
    this.cssStyle = null;
  }

  var NS = 'http://www.w3.org/2000/svg';
  var XML_NS = 'http://www.w3.org/XML/1998/namespace';
  var XLINK_NS = 'http://www.w3.org/1999/xlink';
  var LINE_CAP_STYLES = ['butt', 'round', 'square'];
  var LINE_JOIN_STYLES = ['miter', 'round', 'bevel'];
  var clipCount = 0;
  var maskCount = 0;

  SVGGraphics.prototype = {
    save: function SVGGraphics_save() {

      this.transformStack.push(this.transformMatrix);
      var old = this.current;
trace_stack.push({location:101,context:{'this':this}});
      this.extraStack.push(old);
      this.current = old.clone();
    },

    restore: function SVGGraphics_restore() {

      this.transformMatrix = this.transformStack.pop();
      this.current = this.extraStack.pop();
trace_stack.push({location:102,context:{'this':this}});

      this.tgrp = document.createElementNS(NS, 'svg:g');
      this.tgrp.setAttributeNS(null, 'transform', pm(this.transformMatrix));
      this.pgrp.appendChild(this.tgrp);
    },

    group: function SVGGraphics_group(items) {

      this.save();
trace_stack.push({location:103,context:{'this':this}});
      this.executeOpTree(items);
      this.restore();
    },

    loadDependencies: function SVGGraphics_loadDependencies(operatorList) {

      var fnArray = operatorList.fnArray;
      var fnArrayLen = fnArray.length;
      var argsArray = operatorList.argsArray;

      var self = this;
trace_stack.push({location:104,context:{'this':this}});
      for (var i = 0; i < fnArrayLen; i++) {
        if (OPS.dependency === fnArray[i]) {
          var deps = argsArray[i];
          for (var n = 0, nn = deps.length; n < nn; n++) {
            var obj = deps[n];
            var common = obj.substring(0, 2) === 'g_';
            var promise;
            if (common) {
              promise = new Promise(function(resolve) {

                self.commonObjs.get(obj, resolve);
              });
            } else {
              promise = new Promise(function(resolve) {

                self.objs.get(obj, resolve);
              });
            }
            this.current.dependencies.push(promise);
          }
        }
      }
      return Promise.all(this.current.dependencies);
    },

    transform: function SVGGraphics_transform(a, b, c, d, e, f) {

      var transformMatrix = [a, b, c, d, e, f];
      this.transformMatrix = PDFJS.Util.transform(this.transformMatrix,
                                                  transformMatrix);

      this.tgrp = document.createElementNS(NS, 'svg:g');
trace_stack.push({location:105,context:{'this':this}});
      this.tgrp.setAttributeNS(null, 'transform', pm(this.transformMatrix));
    },

    getSVG: function SVGGraphics_getSVG(operatorList, viewport) {

      this.svg = createScratchSVG(viewport.width, viewport.height);
      this.viewport = viewport;

      return this.loadDependencies(operatorList).then(function () {

        this.transformMatrix = IDENTITY_MATRIX;
        this.pgrp = document.createElementNS(NS, 'svg:g'); // Parent group
        this.pgrp.setAttributeNS(null, 'transform', pm(viewport.transform));
        this.tgrp = document.createElementNS(NS, 'svg:g'); // Transform group
        this.tgrp.setAttributeNS(null, 'transform', pm(this.transformMatrix));
        this.defs = document.createElementNS(NS, 'svg:defs');
        this.pgrp.appendChild(this.defs);
        this.pgrp.appendChild(this.tgrp);
        this.svg.appendChild(this.pgrp);
trace_stack.push({location:106,context:{'this':this}});
        var opTree = this.convertOpList(operatorList);
        this.executeOpTree(opTree);
        return this.svg;
      }.bind(this));
    },

    convertOpList: function SVGGraphics_convertOpList(operatorList) {

      var argsArray = operatorList.argsArray;
      var fnArray = operatorList.fnArray;
      var fnArrayLen  = fnArray.length;
      var REVOPS = [];
      var opList = [];

      for (var op in OPS) {
        REVOPS[OPS[op]] = op;
      }

      for (var x = 0; x < fnArrayLen; x++) {
        var fnId = fnArray[x];
        opList.push({'fnId' : fnId, 'fn': REVOPS[fnId], 'args': argsArray[x]});
      }
      return opListToTree(opList);
    },

    executeOpTree: function SVGGraphics_executeOpTree(opTree) {

      var opTreeLen = opTree.length;
      for(var x = 0; x < opTreeLen; x++) {
        var fn = opTree[x].fn;
        var fnId = opTree[x].fnId;
        var args = opTree[x].args;

        switch (fnId | 0) {
          case OPS.beginText:
            this.beginText();
            break;
          case OPS.setLeading:
            this.setLeading(args);
            break;
          case OPS.setLeadingMoveText:
            this.setLeadingMoveText(args[0], args[1]);
            break;
          case OPS.setFont:
            this.setFont(args);
            break;
          case OPS.showText:
            this.showText(args[0]);
            break;
          case OPS.showSpacedText:
            this.showText(args[0]);
            break;
          case OPS.endText:
            this.endText();
            break;
          case OPS.moveText:
            this.moveText(args[0], args[1]);
            break;
          case OPS.setCharSpacing:
            this.setCharSpacing(args[0]);
            break;
          case OPS.setWordSpacing:
            this.setWordSpacing(args[0]);
            break;
          case OPS.setHScale:
            this.setHScale(args[0]);
            break;
          case OPS.setTextMatrix:
            this.setTextMatrix(args[0], args[1], args[2],
                               args[3], args[4], args[5]);
            break;
          case OPS.setLineWidth:
            this.setLineWidth(args[0]);
            break;
          case OPS.setLineJoin:
            this.setLineJoin(args[0]);
            break;
          case OPS.setLineCap:
            this.setLineCap(args[0]);
            break;
          case OPS.setMiterLimit:
            this.setMiterLimit(args[0]);
            break;
          case OPS.setFillRGBColor:
            this.setFillRGBColor(args[0], args[1], args[2]);
            break;
          case OPS.setStrokeRGBColor:
            this.setStrokeRGBColor(args[0], args[1], args[2]);
            break;
          case OPS.setDash:
            this.setDash(args[0], args[1]);
            break;
          case OPS.setGState:
            this.setGState(args[0]);
            break;
          case OPS.fill:
            this.fill();
            break;
          case OPS.eoFill:
            this.eoFill();
            break;
          case OPS.stroke:
            this.stroke();
            break;
          case OPS.fillStroke:
            this.fillStroke();
            break;
          case OPS.eoFillStroke:
            this.eoFillStroke();
            break;
          case OPS.clip:
            this.clip('nonzero');
            break;
          case OPS.eoClip:
            this.clip('evenodd');
            break;
          case OPS.paintSolidColorImageMask:
            this.paintSolidColorImageMask();
            break;
          case OPS.paintJpegXObject:
            this.paintJpegXObject(args[0], args[1], args[2]);
            break;
          case OPS.paintImageXObject:
            this.paintImageXObject(args[0]);
            break;
          case OPS.paintInlineImageXObject:
            this.paintInlineImageXObject(args[0]);
            break;
          case OPS.paintImageMaskXObject:
            this.paintImageMaskXObject(args[0]);
            break;
          case OPS.paintFormXObjectBegin:
            this.paintFormXObjectBegin(args[0], args[1]);
            break;
          case OPS.paintFormXObjectEnd:
            this.paintFormXObjectEnd();
            break;
          case OPS.closePath:
            this.closePath();
            break;
          case OPS.closeStroke:
            this.closeStroke();
            break;
          case OPS.closeFillStroke:
            this.closeFillStroke();
            break;
          case OPS.nextLine:
            this.nextLine();
            break;
          case OPS.transform:
            this.transform(args[0], args[1], args[2], args[3],
                           args[4], args[5]);
            break;
          case OPS.constructPath:
            this.constructPath(args[0], args[1]);
            break;
          case OPS.endPath:
            this.endPath();
            break;
          case 92:
            this.group(opTree[x].items);
            break;
          default:
            warn('Unimplemented method '+ fn);
            break;
        }
      }
    },

    setWordSpacing: function SVGGraphics_setWordSpacing(wordSpacing) {

      this.current.wordSpacing = wordSpacing;
    },

    setCharSpacing: function SVGGraphics_setCharSpacing(charSpacing) {

      this.current.charSpacing = charSpacing;
    },

    nextLine: function SVGGraphics_nextLine() {

      this.moveText(0, this.current.leading);
    },

    setTextMatrix: function SVGGraphics_setTextMatrix(a, b, c, d, e, f) {

      var current = this.current;
      this.current.textMatrix = this.current.lineMatrix = [a, b, c, d, e, f];

      this.current.x = this.current.lineX = 0;
      this.current.y = this.current.lineY = 0;
trace_stack.push({location:107,context:{'this':this}});

      current.xcoords = [];
      current.tspan = document.createElementNS(NS, 'svg:tspan');
      current.tspan.setAttributeNS(null, 'font-family', current.fontFamily);
      current.tspan.setAttributeNS(null, 'font-size',
                                   pf(current.fontSize) + 'px');
      current.tspan.setAttributeNS(null, 'y', pf(-current.y));

      current.txtElement = document.createElementNS(NS, 'svg:text');
      current.txtElement.appendChild(current.tspan);
    },

    beginText: function SVGGraphics_beginText() {

      this.current.x = this.current.lineX = 0;
      this.current.y = this.current.lineY = 0;
      this.current.textMatrix = IDENTITY_MATRIX;
      this.current.lineMatrix = IDENTITY_MATRIX;
      this.current.tspan = document.createElementNS(NS, 'svg:tspan');
      this.current.txtElement = document.createElementNS(NS, 'svg:text');
      this.current.txtgrp = document.createElementNS(NS, 'svg:g');
trace_stack.push({location:108,context:{'this':this}});
      this.current.xcoords = [];
    },

    moveText: function SVGGraphics_moveText(x, y) {

      var current = this.current;
      this.current.x = this.current.lineX += x;
      this.current.y = this.current.lineY += y;

      current.xcoords = [];
trace_stack.push({location:109,context:{'this':this}});
      current.tspan = document.createElementNS(NS, 'svg:tspan');
      current.tspan.setAttributeNS(null, 'font-family', current.fontFamily);
      current.tspan.setAttributeNS(null, 'font-size',
                                   pf(current.fontSize) + 'px');
      current.tspan.setAttributeNS(null, 'y', pf(-current.y));
    },

    showText: function SVGGraphics_showText(glyphs) {

      var current = this.current;
      var font = current.font;
      var fontSize = current.fontSize;

      if (fontSize === 0) {
        return;
      }

      var charSpacing = current.charSpacing;
      var wordSpacing = current.wordSpacing;
      var fontDirection = current.fontDirection;
      var textHScale = current.textHScale * fontDirection;
      var glyphsLength = glyphs.length;
      var vertical = font.vertical;
      var widthAdvanceScale = fontSize * current.fontMatrix[0];

      var x = 0, i;
      for (i = 0; i < glyphsLength; ++i) {
        var glyph = glyphs[i];
        if (glyph === null) {
          // word break
          x += fontDirection * wordSpacing;
          continue;
        } else if (isNum(glyph)) {
          x += -glyph * fontSize * 0.001;
          continue;
        }
        current.xcoords.push(current.x + x * textHScale);

        var width = glyph.width;
        var character = glyph.fontChar;
        var charWidth = width * widthAdvanceScale + charSpacing * fontDirection;
        x += charWidth;

        current.tspan.textContent += character;
      }
      if (vertical) {
        current.y -= x * textHScale;
      } else {
        current.x += x * textHScale;
      }

      current.tspan.setAttributeNS(null, 'x',
                                   current.xcoords.map(pf).join(' '));
      current.tspan.setAttributeNS(null, 'y', pf(-current.y));
      current.tspan.setAttributeNS(null, 'font-family', current.fontFamily);
      current.tspan.setAttributeNS(null, 'font-size',
                                   pf(current.fontSize) + 'px');
      if (current.fontStyle !== SVG_DEFAULTS.fontStyle) {
        current.tspan.setAttributeNS(null, 'font-style', current.fontStyle);
      }
      if (current.fontWeight !== SVG_DEFAULTS.fontWeight) {
        current.tspan.setAttributeNS(null, 'font-weight', current.fontWeight);
      }
      if (current.fillColor !== SVG_DEFAULTS.fillColor) {
        current.tspan.setAttributeNS(null, 'fill', current.fillColor);
      }

      current.txtElement.setAttributeNS(null, 'transform',
                                        pm(current.textMatrix) +
                                        ' scale(1, -1)' );
      current.txtElement.setAttributeNS(XML_NS, 'xml:space', 'preserve');
      current.txtElement.appendChild(current.tspan);
      current.txtgrp.appendChild(current.txtElement);
trace_stack.push({location:110,context:{'this':this}});

      this.tgrp.appendChild(current.txtElement);

    },

    setLeadingMoveText: function SVGGraphics_setLeadingMoveText(x, y) {

      this.setLeading(-y);
      this.moveText(x, y);
    },

    addFontStyle: function SVGGraphics_addFontStyle(fontObj) {

      if (!this.cssStyle) {
        this.cssStyle = document.createElementNS(NS, 'svg:style');
        this.cssStyle.setAttributeNS(null, 'type', 'text/css');
        this.defs.appendChild(this.cssStyle);
trace_stack.push({location:111,context:{'this':this}});

      }

      var url = PDFJS.createObjectURL(fontObj.data, fontObj.mimetype);
      this.cssStyle.textContent +=
        '@font-face { font-family: "' + fontObj.loadedName + '";' +
        ' src: url(' + url + '); }\n';
    },

    setFont: function SVGGraphics_setFont(details) {

      var current = this.current;
      var fontObj = this.commonObjs.get(details[0]);
      var size = details[1];
      this.current.font = fontObj;

      if (this.embedFonts && fontObj.data &&
          !this.embeddedFonts[fontObj.loadedName]) {
        this.addFontStyle(fontObj);
        this.embeddedFonts[fontObj.loadedName] = fontObj;
      }

      current.fontMatrix = (fontObj.fontMatrix ?
                            fontObj.fontMatrix : FONT_IDENTITY_MATRIX);

      var bold = fontObj.black ? (fontObj.bold ? 'bolder' : 'bold') :
                                 (fontObj.bold ? 'bold' : 'normal');
      var italic = fontObj.italic ? 'italic' : 'normal';

      if (size < 0) {
        size = -size;
        current.fontDirection = -1;
      } else {
        current.fontDirection = 1;
      }
      current.fontSize = size;
      current.fontFamily = fontObj.loadedName;
      current.fontWeight = bold;
      current.fontStyle = italic;

      current.tspan = document.createElementNS(NS, 'svg:tspan');
      current.tspan.setAttributeNS(null, 'y', pf(-current.y));
      current.xcoords = [];
    },

    endText: function SVGGraphics_endText() {

      if (this.current.pendingClip) {
        this.cgrp.appendChild(this.tgrp);
        this.pgrp.appendChild(this.cgrp);
      } else {
        this.pgrp.appendChild(this.tgrp);
      }
      this.tgrp = document.createElementNS(NS, 'svg:g');
      this.tgrp.setAttributeNS(null, 'transform', pm(this.transformMatrix));
    },

    // Path properties
    setLineWidth: function SVGGraphics_setLineWidth(width) {

      this.current.lineWidth = width;
    },
    setLineCap: function SVGGraphics_setLineCap(style) {

      this.current.lineCap = LINE_CAP_STYLES[style];
    },
    setLineJoin: function SVGGraphics_setLineJoin(style) {

      this.current.lineJoin = LINE_JOIN_STYLES[style];
    },
    setMiterLimit: function SVGGraphics_setMiterLimit(limit) {

      this.current.miterLimit = limit;
    },
    setStrokeRGBColor: function SVGGraphics_setStrokeRGBColor(r, g, b) {

      var color = Util.makeCssRgb(r, g, b);
      this.current.strokeColor = color;
    },
    setFillRGBColor: function SVGGraphics_setFillRGBColor(r, g, b) {

      var color = Util.makeCssRgb(r, g, b);
      this.current.fillColor = color;
      this.current.tspan = document.createElementNS(NS, 'svg:tspan');
      this.current.xcoords = [];
    },
    setDash: function SVGGraphics_setDash(dashArray, dashPhase) {

      this.current.dashArray = dashArray;
      this.current.dashPhase = dashPhase;
    },

    constructPath: function SVGGraphics_constructPath(ops, args) {

      var current = this.current;
      var x = current.x, y = current.y;
      current.path = document.createElementNS(NS, 'svg:path');
      var d = [];
      var opLength = ops.length;

      for (var i = 0, j = 0; i < opLength; i++) {
        switch (ops[i] | 0) {
          case OPS.rectangle:
            x = args[j++];
            y = args[j++];
            var width = args[j++];
            var height = args[j++];
            var xw = x + width;
            var yh = y + height;
            d.push('M', pf(x), pf(y), 'L', pf(xw) , pf(y), 'L', pf(xw), pf(yh),
                   'L', pf(x), pf(yh), 'Z');
            break;
          case OPS.moveTo:
            x = args[j++];
            y = args[j++];
            d.push('M', pf(x), pf(y));
            break;
          case OPS.lineTo:
            x = args[j++];
            y = args[j++];
            d.push('L', pf(x) , pf(y));
            break;
          case OPS.curveTo:
            x = args[j + 4];
            y = args[j + 5];
            d.push('C', pf(args[j]), pf(args[j + 1]), pf(args[j + 2]),
                   pf(args[j + 3]), pf(x), pf(y));
            j += 6;
            break;
          case OPS.curveTo2:
            x = args[j + 2];
            y = args[j + 3];
            d.push('C', pf(x), pf(y), pf(args[j]), pf(args[j + 1]),
                   pf(args[j + 2]), pf(args[j + 3]));
            j += 4;
            break;
          case OPS.curveTo3:
            x = args[j + 2];
            y = args[j + 3];
            d.push('C', pf(args[j]), pf(args[j + 1]), pf(x), pf(y),
                   pf(x), pf(y));
            j += 4;
            break;
          case OPS.closePath:
            d.push('Z');
            break;
        }
      }
      current.path.setAttributeNS(null, 'd', d.join(' '));
      current.path.setAttributeNS(null, 'stroke-miterlimit',
                                  pf(current.miterLimit));
      current.path.setAttributeNS(null, 'stroke-linecap', current.lineCap);
      current.path.setAttributeNS(null, 'stroke-linejoin', current.lineJoin);
      current.path.setAttributeNS(null, 'stroke-width',
                                  pf(current.lineWidth) + 'px');
      current.path.setAttributeNS(null, 'stroke-dasharray',
                                  current.dashArray.map(pf).join(' '));
      current.path.setAttributeNS(null, 'stroke-dashoffset',
                                  pf(current.dashPhase) + 'px');
      current.path.setAttributeNS(null, 'fill', 'none');
trace_stack.push({location:112,context:{'this':this}});

      this.tgrp.appendChild(current.path);
      if (current.pendingClip) {
        this.cgrp.appendChild(this.tgrp);
        this.pgrp.appendChild(this.cgrp);
      } else {
        this.pgrp.appendChild(this.tgrp);
      }
      // Saving a reference in current.element so that it can be addressed
      // in 'fill' and 'stroke'
      current.element = current.path;
      current.setCurrentPoint(x, y);
    },

    endPath: function SVGGraphics_endPath() {

      var current = this.current;
      if (current.pendingClip) {
        this.cgrp.appendChild(this.tgrp);
        this.pgrp.appendChild(this.cgrp);
      } else {
        this.pgrp.appendChild(this.tgrp);
      }
trace_stack.push({location:113,context:{'this':this}});
      this.tgrp = document.createElementNS(NS, 'svg:g');
      this.tgrp.setAttributeNS(null, 'transform', pm(this.transformMatrix));
    },

    clip: function SVGGraphics_clip(type) {

      var current = this.current;
      // Add current path to clipping path
      current.clipId = 'clippath' + clipCount;
      clipCount++;
      this.clippath = document.createElementNS(NS, 'svg:clipPath');
      this.clippath.setAttributeNS(null, 'id', current.clipId);
      var clipElement = current.element.cloneNode();
      if (type === 'evenodd') {
        clipElement.setAttributeNS(null, 'clip-rule', 'evenodd');
      } else {
        clipElement.setAttributeNS(null, 'clip-rule', 'nonzero');
      }
      this.clippath.setAttributeNS(null, 'transform', pm(this.transformMatrix));
      this.clippath.appendChild(clipElement);
      this.defs.appendChild(this.clippath);
trace_stack.push({location:114,context:{'this':this}});

      // Create a new group with that attribute
      current.pendingClip = true;
      this.cgrp = document.createElementNS(NS, 'svg:g');
      this.cgrp.setAttributeNS(null, 'clip-path',
                               'url(#' + current.clipId + ')');
      this.pgrp.appendChild(this.cgrp);
    },

    closePath: function SVGGraphics_closePath() {

      var current = this.current;
      var d = current.path.getAttributeNS(null, 'd');
      d += 'Z';
      current.path.setAttributeNS(null, 'd', d);
    },

    setLeading: function SVGGraphics_setLeading(leading) {

      this.current.leading = -leading;
    },

    setTextRise: function SVGGraphics_setTextRise(textRise) {

      this.current.textRise = textRise;
    },

    setHScale: function SVGGraphics_setHScale(scale) {

      this.current.textHScale = scale / 100;
    },

    setGState: function SVGGraphics_setGState(states) {

      for (var i = 0, ii = states.length; i < ii; i++) {
        var state = states[i];
        var key = state[0];
        var value = state[1];

        switch (key) {
          case 'LW':
            this.setLineWidth(value);
            break;
          case 'LC':
            this.setLineCap(value);
            break;
          case 'LJ':
            this.setLineJoin(value);
            break;
          case 'ML':
            this.setMiterLimit(value);
            break;
          case 'D':
            this.setDash(value[0], value[1]);
            break;
          case 'RI':
            break;
          case 'FL':
            break;
          case 'Font':
            this.setFont(value);
            break;
          case 'CA':
            break;
          case 'ca':
            break;
          case 'BM':
            break;
          case 'SMask':
            break;
        }
      }
    },

    fill: function SVGGraphics_fill() {

      var current = this.current;
      current.element.setAttributeNS(null, 'fill', current.fillColor);
    },

    stroke: function SVGGraphics_stroke() {

      var current = this.current;
      current.element.setAttributeNS(null, 'stroke', current.strokeColor);
      current.element.setAttributeNS(null, 'fill', 'none');
    },

    eoFill: function SVGGraphics_eoFill() {

      var current = this.current;
      current.element.setAttributeNS(null, 'fill', current.fillColor);
      current.element.setAttributeNS(null, 'fill-rule', 'evenodd');
    },

    fillStroke: function SVGGraphics_fillStroke() {

      // Order is important since stroke wants fill to be none.
      // First stroke, then if fill needed, it will be overwritten.
      this.stroke();
      this.fill();
    },

    eoFillStroke: function SVGGraphics_eoFillStroke() {

      this.current.element.setAttributeNS(null, 'fill-rule', 'evenodd');
      this.fillStroke();
    },

    closeStroke: function SVGGraphics_closeStroke() {

      this.closePath();
      this.stroke();
    },

    closeFillStroke: function SVGGraphics_closeFillStroke() {

      this.closePath();
      this.fillStroke();
    },

    paintSolidColorImageMask:
        function SVGGraphics_paintSolidColorImageMask() {

      var current = this.current;
      var rect = document.createElementNS(NS, 'svg:rect');
      rect.setAttributeNS(null, 'x', '0');
      rect.setAttributeNS(null, 'y', '0');
      rect.setAttributeNS(null, 'width', '1px');
      rect.setAttributeNS(null, 'height', '1px');
      rect.setAttributeNS(null, 'fill', current.fillColor);
      this.tgrp.appendChild(rect);
    },

    paintJpegXObject: function SVGGraphics_paintJpegXObject(objId, w, h) {

      var current = this.current;
      var imgObj = this.objs.get(objId);
      var imgEl = document.createElementNS(NS, 'svg:image');
      imgEl.setAttributeNS(XLINK_NS, 'xlink:href', imgObj.src);
      imgEl.setAttributeNS(null, 'width', imgObj.width + 'px');
      imgEl.setAttributeNS(null, 'height', imgObj.height + 'px');
      imgEl.setAttributeNS(null, 'x', '0');
      imgEl.setAttributeNS(null, 'y', pf(-h));
      imgEl.setAttributeNS(null, 'transform',
                           'scale(' + pf(1 / w) + ' ' + pf(-1 / h) + ')');

      this.tgrp.appendChild(imgEl);
      if (current.pendingClip) {
        this.cgrp.appendChild(this.tgrp);
        this.pgrp.appendChild(this.cgrp);
      } else {
        this.pgrp.appendChild(this.tgrp);
      }
    },

    paintImageXObject: function SVGGraphics_paintImageXObject(objId) {

      var imgData = this.objs.get(objId);
      if (!imgData) {
        warn('Dependent image isn\'t ready yet');
        return;
      }
      this.paintInlineImageXObject(imgData);
    },

    paintInlineImageXObject:
        function SVGGraphics_paintInlineImageXObject(imgData, mask) {

      var current = this.current;
      var width = imgData.width;
      var height = imgData.height;

      var imgSrc = convertImgDataToPng(imgData);
      var cliprect = document.createElementNS(NS, 'svg:rect');
      cliprect.setAttributeNS(null, 'x', '0');
      cliprect.setAttributeNS(null, 'y', '0');
      cliprect.setAttributeNS(null, 'width', pf(width));
      cliprect.setAttributeNS(null, 'height', pf(height));
      current.element = cliprect;
      this.clip('nonzero');
      var imgEl = document.createElementNS(NS, 'svg:image');
      imgEl.setAttributeNS(XLINK_NS, 'xlink:href', imgSrc);
      imgEl.setAttributeNS(null, 'x', '0');
      imgEl.setAttributeNS(null, 'y', pf(-height));
      imgEl.setAttributeNS(null, 'width', pf(width) + 'px');
      imgEl.setAttributeNS(null, 'height', pf(height) + 'px');
      imgEl.setAttributeNS(null, 'transform',
                           'scale(' + pf(1 / width) + ' ' +
                           pf(-1 / height) + ')');
      if (mask) {
        mask.appendChild(imgEl);
      } else {
        this.tgrp.appendChild(imgEl);
      }
      if (current.pendingClip) {
        this.cgrp.appendChild(this.tgrp);
        this.pgrp.appendChild(this.cgrp);
      } else {
        this.pgrp.appendChild(this.tgrp);
      }
    },

    paintImageMaskXObject:
        function SVGGraphics_paintImageMaskXObject(imgData) {

      var current = this.current;
      var width = imgData.width;
      var height = imgData.height;
      var fillColor = current.fillColor;

      current.maskId = 'mask' + maskCount++;
      var mask = document.createElementNS(NS, 'svg:mask');
      mask.setAttributeNS(null, 'id', current.maskId);

      var rect = document.createElementNS(NS, 'svg:rect');
      rect.setAttributeNS(null, 'x', '0');
      rect.setAttributeNS(null, 'y', '0');
      rect.setAttributeNS(null, 'width', pf(width));
      rect.setAttributeNS(null, 'height', pf(height));
      rect.setAttributeNS(null, 'fill', fillColor);
      rect.setAttributeNS(null, 'mask', 'url(#' + current.maskId +')');
      this.defs.appendChild(mask);
      this.tgrp.appendChild(rect);
trace_stack.push({location:115,context:{'this':this}});

      this.paintInlineImageXObject(imgData, mask);
    },

    paintFormXObjectBegin:
        function SVGGraphics_paintFormXObjectBegin(matrix, bbox) {

      this.save();

      if (isArray(matrix) && matrix.length === 6) {
        this.transform(matrix[0], matrix[1], matrix[2],
                       matrix[3], matrix[4], matrix[5]);
      }

      if (isArray(bbox) && bbox.length === 4) {
        var width = bbox[2] - bbox[0];
        var height = bbox[3] - bbox[1];

        var cliprect = document.createElementNS(NS, 'svg:rect');
        cliprect.setAttributeNS(null, 'x', bbox[0]);
        cliprect.setAttributeNS(null, 'y', bbox[1]);
        cliprect.setAttributeNS(null, 'width', pf(width));
        cliprect.setAttributeNS(null, 'height', pf(height));
        this.current.element = cliprect;
        this.clip('nonzero');
        this.endPath();
trace_stack.push({location:116,context:{'this':this}});
      }
    },

    paintFormXObjectEnd:
        function SVGGraphics_paintFormXObjectEnd() {

      this.restore();
    }
  };
  return SVGGraphics;
})();

PDFJS.SVGGraphics = SVGGraphics;


}).call((typeof window === 'undefined') ? this : window);

if (!PDFJS.workerSrc && typeof document !== 'undefined') {
  // workerSrc is not set -- using last script url to define default location
  PDFJS.workerSrc = (function () {

    'use strict';
    var pdfJsSrc = document.currentScript.src;
    return pdfJsSrc && pdfJsSrc.replace(/\.js$/i, '.worker.js');
  })();
}

trace_stack.global_context = {'PDFJS':PDFJS};

