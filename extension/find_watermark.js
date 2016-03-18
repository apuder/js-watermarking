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
/// <reference path="set_map.d.ts" />
var cycles;
(function (cycles) {
    "use strict";
    var count_id;
    var begin_digit = /^\d/;
    function make_tarjanNode(obj, stk, map) {
        var obj_node = map.get(obj);
        if (!obj_node) {
            // new node
            obj_node = {
                id: count_id,
                component_id: count_id,
                on_stack: true
            };
            count_id++;
            stk.push(obj);
            map.set(obj, obj_node);
        }
        return obj_node;
    }
    function tarjan_recurse(obj, stk, map, components, size) {
        var obj_node = make_tarjanNode(obj, stk, map);
        for (var k in obj) {
            // skip non objects, numeric keys, and null
            // (numeric keys are not allowed in the backbone)
            var v;
            try {
                v = obj[k];
            }
            catch (e) {
                v = undefined;
            }
            if (!v
                || begin_digit.test(k)
                || typeof (v) !== 'object')
                continue;
            var v_node = map.get(v);
            if (!v_node) {
                // visit v
                tarjan_recurse(v, stk, map, components, size);
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
            if (component.length >= size) {
                components.push(component);
            }
        }
    }
    function tarjan(root, blacklist, size) {
        // finds strongly connected components of the graph starting from root
        var stk = [];
        var map = new Map();
        var components = [];
        count_id = 0;
        for (var k in root) {
            // skip non objects, numeric keys, null and blacklisted keys
            // (numeric keys are not allowed in the backbone)
            var v;
            try {
                v = root[k];
            }
            catch (e) {
                v = undefined;
            }
            if (!v
                || begin_digit.test(k)
                || typeof (v) !== 'object'
                || blacklist.indexOf(k) >= 0)
                continue;
            if (!map.get(v)) {
                // visit v
                tarjan_recurse(v, stk, map, components, size);
            }
        }
        return components;
    }
    function johnson_unblock(obj_info) {
        // unblocks the node and all of its next_blocked
        obj_info.blocked = false;
        var v_info;
        for (v_info in obj_info.next_blocked.keys()) {
            v_info = v_info;
            if (v_info.blocked)
                johnson_unblock(v_info);
        }
        obj_info.next_blocked.clear();
    }
    function johnson_circuit(obj, stk, map, circuits) {
        // finds circuits starting and ending at stk[0]
        var found_circuit = false;
        stk.push(obj);
        var obj_info = map.get(obj);
        obj_info.blocked = true;
        for (var k in obj) {
            // ignore edges whose keys start with digits
            if (begin_digit.test(k))
                continue;
            var v;
            try {
                v = obj[k];
            }
            catch (e) {
                v = undefined;
            }
            var v_info = map.get(v);
            // skip edges not part of this connected component
            if (!v_info)
                continue;
            if (v == stk[0]) {
                // found a circuit
                circuits.push(stk.slice());
                // console.log('found circuit');
                found_circuit = true;
            }
            else if (!v_info.blocked) {
                // recurse using v
                if (johnson_circuit(v, stk, map, circuits)) {
                    found_circuit = true;
                }
            }
        }
        if (found_circuit) {
            johnson_unblock(obj_info);
        }
        else {
            for (var k in obj) {
                // ignore edges whose keys start with digits
                if (begin_digit.test(k))
                    continue;
                var v;
                try {
                    v = obj[k];
                }
                catch (e) {
                    v = undefined;
                }
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
    function johnson(components, size) {
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
                johnson_circuit(obj, stk, map, circuits);
                // remove finished node
                map.delete(obj);
            }
            // remove component from map
            map.clear();
        }
        return circuits;
    }
    function find_cycles(root, size, blacklist) {
        // find circular paths of length >= size via depth first search
        // ensure the blacklist exists
        blacklist = blacklist || [];
        var found;
        // find strongly connected components
        found = tarjan(root, blacklist, size);
        // find circuits in strongly connected components
        // takes size of graph * number of simple cycles time, potentially exponential
        // found = johnson(found, size);
        return found;
    }
    cycles.find_cycles = find_cycles;
})(cycles || (cycles = {}));
/// <reference path="./permutationgraph.ts" />
/// <reference path="./cycles.ts" />
function find_watermark(root, size, blacklist) {
    var cy = cycles.find_cycles(root, size, blacklist);
    var nums = permutationgraph.permutationgraph.findnums(cy);
    console.log("Found " + nums.length + " watermarks");
    var json_nums = JSON.stringify(nums);
    // sending trace complete message until acknowledged
    var tint = setInterval(function () { signal_found_complete(); }, 200);
    window.addEventListener('message', function (event) {
        // We only accept messages from ourselves
        if (event.source != window)
            return;
        if (event.data.type && (event.data.type == 'jsw_found_watermark_acknowledgement')) {
            if (tint) {
                clearInterval(tint);
                tint = null;
            }
        }
    }, false);
    function signal_found_complete() { window.postMessage({ type: "jsw_found_watermark", text: json_nums }, "*"); }
    ;
    signal_found_complete();
}
