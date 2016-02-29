/// <reference path="set_map.d.ts" />
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
        static make_tarjanNode(obj, stk, map) {
            var obj_node = map.get(obj);
            if (!obj_node) {
                // new node
                obj_node = {
                    id: permutationgraph.count_id,
                    component_id: permutationgraph.count_id,
                    on_stack: true
                };
                permutationgraph.count_id++;
                stk.push(obj);
                map.set(obj, obj_node);
            }
            return obj_node;
        }
        static tarjan_recurse(obj, stk, map, components) {
            var obj_node = permutationgraph.make_tarjanNode(obj, stk, map);
            for (var k in obj) {
                // skip non objects, numeric keys, and null
                // (numeric keys are not allowed in the backbone)
                var v = obj[k];
                if (!v
                    || permutationgraph.begin_digit.test(k)
                    || typeof (v) !== 'object')
                    continue;
                var v_node = map.get(v);
                if (!v_node) {
                    // visit v
                    permutationgraph.tarjan_recurse(v, stk, map, components);
                    // v_node will be in the map now
                    v_node = map.get(v);
                    obj_node.component_id = (obj_node.component_id > v_node.component_id) ? v_node.component_id : obj_node.component_id;
                }
                else if (v_node.on_stack) {
                    obj_node.component_id = (obj_node.component_id > v_node.component_id) ? v_node.component_id : obj_node.component_id;
                }
            }
            if (obj_node.id == obj_node.component_id) {
                // found an entire strongly connected component, remove it from the stack
                var component = stk.splice(stk.indexOf(obj));
                for (var i = 0; i < component.length; i++) {
                    var v = component[i];
                    var v_node = map.get(v);
                    v_node.on_stack = false;
                }
                components.push(component);
                console.log('found strongly connected component');
            }
        }
        static tarjan(root, blacklist) {
            // finds strongly connected components of the graph starting from root
            var stk = [];
            var map = new Map();
            var components = [];
            permutationgraph.count_id = 0;
            for (var k in root) {
                // skip non objects, numeric keys, null and blacklisted keys
                // (numeric keys are not allowed in the backbone)
                var v = root[k];
                if (!v
                    || permutationgraph.begin_digit.test(k)
                    || typeof (v) !== 'object'
                    || blacklist.indexOf(k) >= 0)
                    continue;
                if (!map.get(v)) {
                    // visit v
                    permutationgraph.tarjan_recurse(v, stk, map, components);
                }
            }
            return components;
        }
        static johnson_unblock(obj_info) {
            // unblocks the node and all of its next_blocked
            obj_info.blocked = false;
            var v_info;
            for (v_info in obj_info.next_blocked.keys()) {
                v_info = v_info;
                if (v_info.blocked)
                    permutationgraph.johnson_unblock(v_info);
            }
            obj_info.next_blocked.clear();
        }
        static johnson_circuit(obj, stk, map, circuits) {
            // finds circuits starting and ending at stk[0]
            var found_circuit = false;
            stk.push(obj);
            var obj_info = map.get(obj);
            obj_info.blocked = true;
            for (var k in obj) {
                var v = obj[k];
                var v_info = map.get(v);
                // skip edges not part of this connected component
                if (!v_info)
                    continue;
                if (v == stk[0]) {
                    // found a circuit
                    circuits.push(stk.slice());
                    console.log('found circuit');
                    found_circuit = true;
                }
                else if (!v_info.blocked) {
                    // recurse using v
                    if (permutationgraph.johnson_circuit(v, stk, map, circuits)) {
                        found_circuit = true;
                    }
                }
            }
            if (found_circuit) {
                permutationgraph.johnson_unblock(obj_info);
            }
            else {
                for (var k in obj) {
                    var v = obj[k];
                    var v_info = map.get(v);
                    // skip edges not part of this connected component
                    if (!v_info)
                        continue;
                    if (!v_info.next_blocked.has(obj_info)) {
                        v_info.next_blocked.add(obj_info);
                    }
                }
            }
            stk.pop();
            return found_circuit;
        }
        static johnson(components, size) {
            // find all circuits in the graph
            var circuits = [];
            var stk = [];
            var map = new Map();
            for (var i = 0; i < components.length; i++) {
                var component = components[i];
                // skip components smaller than size
                if (component.length < size)
                    continue;
                // set-up map for this component
                for (var j = 0; j < component.length; j++) {
                    var obj = component[j];
                    map.set(obj, {
                        blocked: false,
                        next_blocked: new Set()
                    });
                }
                // find circuits in this component
                for (var j = 0; j < component.length; j++) {
                    var obj = component[j];
                    // only examine sub-components at least as big as size
                    if (component.length - j < size)
                        break;
                    // reset map
                    for (var k = j; k < component.length; k++) {
                        var v = component[k];
                        var v_info = map.get(v);
                        v_info.blocked = false;
                        v_info.next_blocked.clear();
                    }
                    // find circuits
                    permutationgraph.johnson_circuit(obj, stk, map, circuits);
                    // remove finished node
                    map.delete(obj);
                }
                // remove component from map
                map.clear();
            }
            return circuits;
        }
        static findbackbones(root, size, blacklist) {
            // find circular paths of length >= size via depth first search
            var found;
            // find strongly connected components
            found = permutationgraph.tarjan(root, blacklist);
            // find circuits in strongly connected components
            found = permutationgraph.johnson(found, size);
            return found;
        }
        static findnums(root, size, blacklist) {
            // find all numbers represented by permutation graphs reachable from root
            // done if root null or not an object
            if (!root || typeof (root) !== 'object')
                return [];
            blacklist = blacklist || [];
            var backbones = permutationgraph.findbackbones(root, size, blacklist);
            var nums = [];
            for (var i = 0; i < backbones.length; i++) {
                var backbone = backbones[i];
                var perm = permutationgraph.backbone_to_perm(backbone);
                if (perm) {
                    nums.push(permutationgraph.fact_to_num(permutationgraph.perm_to_fact(perm)));
                    console.log('found number: ' + nums[nums.length - 1]);
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
    permutationgraph.begin_digit = /^\d/;
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
        var window_black_list = ['external', 'chrome', 'document', 'speechSynthesis', 'caches', 'localStorage', 'sessionStorage', 'webkitStorageInfo', 'indexedDB', 'webkitIndexedDB', 'ondeviceorientation', 'ondevicemotion', 'crypto', 'postMessage', 'blur', 'focus', 'close', 'onautocompleteerror', 'onautocomplete', 'applicationCache', 'performance', 'onunload', 'onstorage', 'onpopstate', 'onpageshow', 'onpagehide', 'ononline', 'onoffline', 'onmessage', 'onlanguagechange', 'onhashchange', 'onbeforeunload', 'onwaiting', 'onvolumechange', 'ontoggle', 'ontimeupdate', 'onsuspend', 'onsubmit', 'onstalled', 'onshow', 'onselect', 'onseeking', 'onseeked', 'onscroll', 'onresize', 'onreset', 'onratechange', 'onprogress', 'onplaying', 'onplay', 'onpause', 'onmousewheel', 'onmouseup', 'onmouseover', 'onmouseout', 'onmousemove', 'onmouseleave', 'onmouseenter', 'onmousedown', 'onloadstart', 'onloadedmetadata', 'onloadeddata', 'onload', 'onkeyup', 'onkeypress', 'onkeydown', 'oninvalid', 'oninput', 'onfocus', 'onerror', 'onended', 'onemptied', 'ondurationchange', 'ondrop', 'ondragstart', 'ondragover', 'ondragleave', 'ondragenter', 'ondragend', 'ondrag', 'ondblclick', 'oncuechange', 'oncontextmenu', 'onclose', 'onclick', 'onchange', 'oncanplaythrough', 'oncanplay', 'oncancel', 'onblur', 'onabort', 'isSecureContext', 'onwheel', 'onwebkittransitionend', 'onwebkitanimationstart', 'onwebkitanimationiteration', 'onwebkitanimationend', 'ontransitionend', 'onsearch', 'onanimationstart', 'onanimationiteration', 'onanimationend', 'styleMedia', 'defaultstatus', 'defaultStatus', 'screenTop', 'screenLeft', 'clientInformation', 'console', 'devicePixelRatio', 'outerHeight', 'outerWidth', 'screenY', 'screenX', 'pageYOffset', 'scrollY', 'pageXOffset', 'scrollX', 'innerHeight', 'innerWidth', 'screen', 'navigator', 'frameElement', 'parent', 'opener', 'top', 'length', 'frames', 'closed', 'status', 'toolbar', 'statusbar', 'scrollbars', 'personalbar', 'menubar', 'locationbar', 'history', 'location', 'name', 'self', 'window', 'stop', 'open', 'alert', 'confirm', 'prompt', 'print', 'requestAnimationFrame', 'cancelAnimationFrame', 'captureEvents', 'releaseEvents', 'getComputedStyle', 'matchMedia', 'moveTo', 'moveBy', 'resizeTo', 'resizeBy', 'getSelection', 'find', 'getMatchedCSSRules', 'webkitRequestAnimationFrame', 'webkitCancelAnimationFrame', 'webkitCancelRequestAnimationFrame', 'btoa', 'atob', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'requestIdleCallback', 'cancelIdleCallback', 'scroll', 'scrollTo', 'scrollBy', 'fetch', 'webkitRequestFileSystem', 'webkitResolveLocalFileSystemURL', 'openDatabase'];
        var code = inserter.insert(trace);
        console.log(code);
        var mime = "application/javascript";
        var bb = new Blob([code], { type: mime });
        var url = window.URL.createObjectURL(bb);
        // use any to avoid compile time errors over HTML5
        var a = document.createElement('a');
        a.download = trace.file_name;
        a.href = url;
        a.textContent = 'Watermark ready';
        a.dataset.downloadurl = [mime, a.download, a.href].join(':');
        a.draggable = true; // Don't really need, but good practice.
        a.style.position = 'fixed';
        a.style.left = '0px';
        a.style.top = '0px';
        document.body.appendChild(a);
    }
    watermarkapplier.apply_watermark = apply_watermark;
})(watermarkapplier || (watermarkapplier = {}));
