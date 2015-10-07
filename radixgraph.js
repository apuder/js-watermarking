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
