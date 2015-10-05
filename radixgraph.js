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
            this.makenodes = function () {
                this.nodes = [];
                this.nodes.push(this.root);
                // make nodes after root
                for (var i = 1; i < this.base; ++i) {
                    this.nodes.push(new radixgraphnode(i));
                }
            };
            this.makeedges = function () {
                this.edges = [];
                var tmpnum = this.num;
                var base = this.base;
                var nodes = this.nodes;
                var edges = this.edges;
                // make connections based on num
                for (var i = base - 2, j = 0; i >= 0; --i, ++j) {
                    var term = Math.pow(base, i);
                    var coef = Math.floor(tmpnum / term);
                    tmpnum -= coef * term;
                    var edge = new radixgraphedge(nodes.length + edges.length);
                    edge.origin = nodes[j];
                    edge.origin_edge = 0;
                    edge.destination = nodes[j % base];
                    edges.push(edge);
                    if (coef != 0) {
                        edge = new radixgraphedge(nodes.length + edges.length);
                        edge.origin = nodes[j + 1];
                        edge.origin_edge = 1;
                        // move forward coef - 1, as 0 is a null reference
                        // starting from j, the last node (ignore the root node)
                        // mod by base - 1 as there are base - 1 nodes on the main sequence
                        // add 1 to move past the root
                        edge.destination = nodes[((coef - 1 + j) % (base - 1)) + 1];
                        edges.push(edge);
                        edge.origin.outbound_edges.push(edge);
                        edge.destination.inbound_edges.push(edge);
                    }
                    else {
                        // null edge, add null reference where this outbound edge should be
                        nodes[j + 1].outbound_edges.push(null);
                    }
                }
            };
            this.get_component = function (id) {
                if (id < this.nodes.length) {
                    return this.nodes[id];
                }
                else {
                    return this.edges[id - this.nodes.length];
                }
            };
            this.num = num;
            this.base = 2;
            // find minimal base to fit number
            while (num >= Math.pow(this.base, this.base - 1)) {
                this.base += 1;
            }
            this.root = new radixgraphnode(0);
            this.makenodes();
            this.makeedges();
        }
        return radixgraph;
    })();
    var radixgraphinstruction = (function () {
        function radixgraphinstruction(path_from_root) {
            this.component = path_from_root[path_from_root.length - 1];
            this.path_from_root = path_from_root;
        }
        return radixgraphinstruction;
    })();
    var radixgraphinstructions = (function () {
        function radixgraphinstructions(graph) {
            this.all_done = false;
            this.next = function () {
                if (this.all_done)
                    return null;
                var path_from_root = [];
                // encounter each edge twice, at origin and destination
                // both guaranteed to exist the second time visiting the edge
                // always follow forward link to keep nodes from being garbage collected
                // check backwards links to fill in missing links
                // todo
            };
            this.graph = graph;
            this.done_ids = [];
            this.last_instruction = null;
        }
        return radixgraphinstructions;
    })();
})(radixgraph || (radixgraph = {}));
