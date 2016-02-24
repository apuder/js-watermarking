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
