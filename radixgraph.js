var radixgraph;
(function (radixgraph_1) {
    var radixgraphnode = (function () {
        function radixgraphnode(id) {
            this.id = id;
            this.is_node = true;
            this.is_edge = false;
            this.outbound_edges = [];
            this.inbound_edges = [];
        }
        return radixgraphnode;
    })();
    var radixgraphedge = (function () {
        function radixgraphedge(id) {
            this.id = id;
            this.is_node = false;
            this.is_edge = true;
            this.origin = null;
            this.origin_edge = null;
            this.destination = null;
        }
        return radixgraphedge;
    })();
    var radixgraph = (function () {
        function radixgraph(num) {
            if (num < 0)
                throw ("Invalid number");
            this.num = num;
            this.base = 2;
            // find minimal base to fit number
            while (num >= Math.pow(this.base, this.base - 1)) {
                this.base += 1;
            }
            // console.log(this.base);
            this.root = new radixgraphnode(0);
            // console.log(this.root);
            this.makenodes();
            // make nodes before edges
            this.makeedges();
            this.size = this.nodes.length + this.edges.length;
            // console.log(this);
        }
        // returns true if it finds the backlink to the second item
        // or a recursive call returned true
        // false otherwise
        radixgraph.fbbhelper = function (stack) {
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
                    var retstack = radixgraph.fbbhelper(stack);
                    if (beststack.length < retstack.length) {
                        beststack = retstack;
                    }
                    // not found, pop and keep searching
                    stack.pop();
                }
            }
            return beststack;
        };
        radixgraph.findbackbone = function (root) {
            // find the longest path that connects back to the node directly after the root
            // multiple backbones are possible for an arbitrary radixgraph
            // this may not recover the desired number
            var stack = [];
            var beststack = [];
            stack.push(root);
            for (var key in root) {
                var val = root[key];
                stack.push(val);
                var retstack = radixgraph.fbbhelper(stack);
                if (beststack.length < retstack.length) {
                    // found a longer radixgraph
                    beststack = retstack;
                }
                stack.pop();
            }
            // console.log(beststack);
            return beststack.length > 0 ? beststack : null;
        };
        radixgraph.calccoef = function (key, ind, numitems) {
            // deal with the case that the link goes backwards in the chain
            ind = ind < key ? ind + numitems - 1 : ind;
            // links to self have a value of 1
            return ind - key + 1;
        };
        radixgraph.findcoef = function (key, backbone) {
            // should find at least one link to the next item in backbone
            var foundforwardlink = false;
            var node = backbone[key];
            for (var inkey in node) {
                var innode = node[inkey];
                // find where and if this link goes in the backbone
                var ind = backbone.indexOf(innode);
                if (ind >= 0) {
                    // array points into array
                    var coef = radixgraph.calccoef(key, ind, backbone.length);
                    // check if this is the forward link in the backbone
                    // a forward link always wold represent a coefficient of 2
                    if (coef == 2 && !foundforwardlink) {
                        foundforwardlink = true;
                    }
                    else {
                        return coef;
                    }
                }
            }
            // a node that does not link to any other nodes except as a backbone link
            // represents a coefficient of 0
            return 0;
        };
        radixgraph.findnum = function (root) {
            if (typeof (root) !== 'object')
                return null;
            var backbone = radixgraph.findbackbone(root);
            if (!backbone)
                return null;
            var num = 0;
            var base = backbone.length;
            var powers = [];
            powers.unshift(1);
            for (var i = 1; i < base; ++i) {
                powers.unshift(powers[0] * base);
            }
            for (var key in backbone) {
                var coef = radixgraph.findcoef(key, backbone);
                num += coef * powers[key];
            }
            return num;
        };
        radixgraph.prototype.makenodes = function () {
            this.nodes = [];
            this.nodes.push(this.root);
            // make nodes after root
            for (var i = 1; i < this.base; ++i) {
                this.nodes.push(new radixgraphnode(i));
            }
        };
        radixgraph.prototype.makeedges = function () {
            this.edges = [];
            var tmpnum = this.num;
            var base = this.base;
            var nodes = this.nodes;
            var edges = this.edges;
            // make connections based on num, i is the power, j is the previous node in nodes
            for (var i = base - 2, j = 0; i >= 0; --i, ++j) {
                var term = Math.pow(base, i);
                var coef = Math.floor(tmpnum / term);
                tmpnum -= coef * term;
                var edge = new radixgraphedge(nodes.length + edges.length);
                edge.origin = nodes[j];
                edge.destination = nodes[(j + 1) % base];
                edge.origin_edge = edge.origin.outbound_edges.push(edge) - 1;
                edge.destination.inbound_edges.push(edge);
                edges.push(edge);
                // console.log(edges[edges.length - 1]);
                // console.log(coef);
                if (coef != 0) {
                    // represent non-zero edges with a reference
                    edge = new radixgraphedge(nodes.length + edges.length);
                    edge.origin = nodes[j + 1];
                    // move forward coef - 1, as 0 is a null reference
                    // starting from j, the last node (ignore the root node)
                    // mod by base - 1 as there are base - 1 nodes on the main sequence
                    // add 1 to move past the root
                    edge.destination = nodes[((coef - 1 + j) % (base - 1)) + 1];
                    edge.origin_edge = edge.origin.outbound_edges.push(edge) - 1;
                    edge.destination.inbound_edges.push(edge);
                    edges.push(edge);
                }
                else {
                }
            }
            // last node wraps back to connect with the first node after the root
            var edge = new radixgraphedge(nodes.length + edges.length);
            edge.origin = nodes[base - 1];
            edge.destination = nodes[1];
            edge.origin_edge = edge.origin.outbound_edges.push(edge) - 1;
            edge.destination.inbound_edges.push(edge);
            edges.push(edge);
            // console.log(edges[edges.length - 1]);
        };
        radixgraph.prototype.get_component = function (id) {
            if (id < this.nodes.length) {
                return this.nodes[id];
            }
            else {
                return this.edges[id - this.nodes.length];
            }
        };
        return radixgraph;
    })();
    radixgraph_1.radixgraph = radixgraph;
})(radixgraph = exports.radixgraph || (exports.radixgraph = {}));
