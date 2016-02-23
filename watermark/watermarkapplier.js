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
            this.checked = false;
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
        // returns true if it finds the backlink to the second item
        // or a recursive call returned true
        // false otherwise
        static fbbhelper(stack) {
            var root = stack[stack.length - 1];
            var beststack = [];
            for (var key in root) {
                var val = root[key];
                if (typeof (val) !== 'object' || !val)
                    continue;
                var index = stack.indexOf(val);
                if (index == 1) {
                    // found a backlink, update beststack with copy of stack
                    if (beststack.length < stack.length) {
                        beststack = stack.slice();
                    }
                }
                else if (index == -1) {
                    // the backbone does not repeat elements
                    // add the item
                    stack.push(val);
                    // search further
                    var retstack = permutationgraph.fbbhelper(stack);
                    if (beststack.length < retstack.length) {
                        beststack = retstack;
                    }
                    // not found, pop and keep searching
                    stack.pop();
                }
            }
            return beststack;
        }
        static findbackbone(root) {
            // find the longest path that connects back to the node directly after the root
            // multiple backbones are possible for an arbitrary permutationgraph
            var stack = [];
            var beststack = [];
            stack.push(root);
            for (var key in root) {
                var val = root[key];
                stack.push(val);
                var retstack = permutationgraph.fbbhelper(stack);
                if (beststack.length < retstack.length) {
                    // found a longer permutationgraph
                    beststack = retstack;
                }
                stack.pop();
            }
            // console.log(beststack);
            return beststack.length > 0 ? beststack : null;
        }
        static findcoef(i, backbone) {
            // should find at least one link to the next item in backbone
            var foundforwardlink = false;
            var forwardlink_ind = (i % (backbone.length - 1)) + 1;
            var node = backbone[i];
            for (var inkey in node) {
                var innode = node[inkey];
                // find where and if this link goes in the backbone
                var ind = backbone.indexOf(innode);
                if (ind > 0) {
                    // points into body of array
                    // check if this is the forward link in the backbone
                    if (ind == forwardlink_ind && !foundforwardlink) {
                        foundforwardlink = true;
                    }
                    else {
                        return ind - 1;
                    }
                }
            }
            // a node that does not link to any other nodes except as a backbone link
            // represents a number not moved in the permutation
            return i - 1;
        }
        static findnum(root) {
            if (typeof (root) !== 'object')
                return null;
            var backbone = permutationgraph.findbackbone(root);
            if (!backbone)
                return null;
            var perm = [];
            for (var i = 1; i < backbone.length; i++) {
                var coef = permutationgraph.findcoef(i, backbone);
                perm[i - 1] = coef;
            }
            return permutationgraph.fact_to_num(permutationgraph.perm_to_fact(perm));
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
                if (dest != 0 || i != 0) {
                    // edge is not from 0 node to zero node
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
                code += "\t" + set + ";\n";
                code += "}\n";
            }
            else {
                code += set + "\n";
            }
            return code;
        }
        static path_get_check(path) {
            if (!path.first)
                return '';
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
        static path_set_check(path) {
            if (!path.first)
                return '';
            else if (path.length == 0)
                return "!" + path.first.alias_string([path.first_obj]);
            var code = '';
            var part = '';
            code += path.first.alias_string([path.first_obj]);
            part += code;
            for (var i = 0; i < path.length - 1; i++) {
                var edge = path[i];
                part += edge.alias;
                code += ' && ' + part;
            }
            var edge = path[i];
            part += edge.alias;
            code += ' && !' + part;
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
        static code_new_node(path_set) {
            var code = '';
            var check = cyclicgraphinserter.path_set_check(path_set);
            var set = cyclicgraphinserter.path_code(path_set);
            set += ' = {}';
            return cyclicgraphinserter.code_from_idiom(check, set);
        }
        // must be called after appropriate aliases are added
        static code_new_edge(path_get, path_set) {
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
        add_first_node(trace, inst) {
            var location = trace[inst.instance].location;
            var context = inst.context;
            // place reference in global variable
            var glob = cyclicgraphinserter.rand_from_obj(trace.global_context);
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
        add_another_node(edge, trace, inst) {
            var location = trace[inst.instance].location;
            var context = inst.context;
            var glob = cyclicgraphinserter.rand_from_obj(trace.global_context);
            var node = edge.destination;
            var alias = cyclicgraphinserter.get_edge_alias(edge);
            // consume and alias edge and node, forcing edge to be used (only valid path to node)
            this.instructions.consume_edge(edge, alias);
            this.instructions.consume_node(node);
            // find path to node
            var path_set = this.instructions.shortest_path(node, [context]);
            if (!path_set.first)
                path_set = this.instructions.shortest_path(node, [glob.value]);
            var code = cyclicgraphinserter.code_new_node(path_set);
            this.loc_code[location] = (this.loc_code[location] || '') + code;
            // TODO add context alias
        }
        add_another_edge(edge, trace, inst) {
            var location = trace[inst.instance].location;
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
            var code = cyclicgraphinserter.code_new_edge(path_get, path_set);
            this.loc_code[location] = (this.loc_code[location] || '') + code;
            // TODO add context alias
        }
        add_another_instruction(trace, inst) {
            var edge = cyclicgraphinserter.rand_from_set(this.instructions.fringe_edge);
            if (edge.destination.built) {
                // make edge only
                this.add_another_edge(edge, trace, inst);
            }
            else {
                // make edge to new node
                this.add_another_node(edge, trace, inst);
            }
        }
        handle_instance(trace, inst, i) {
            var num_instruct = cyclicgraphinserter.num_instruct(i, this.instructions.size, this.chosen_contexts.size);
            if (num_instruct <= 0)
                return;
            var num_done = 0;
            for (var num_done = 0; num_done < num_instruct; num_done++) {
                if (i == 0 && num_done == 0) {
                    this.add_first_node(trace, inst);
                }
                else {
                    this.add_another_instruction(trace, inst);
                }
            }
            // add or move alias
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
