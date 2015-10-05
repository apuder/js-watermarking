function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
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
            this.root = new radixgraphnode(0);
            this.makenodes();
            this.makeedges();
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
                }
            }
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
            this.graph = graph;
            this.instructions = [];
            this.node_stack = [];
        }
        radixgraphinstructions.prototype.last_node = function () {
            var inst = this.node_stack[this.node_stack.length - 1];
            if (!inst.component.is_node) {
                throw ("Component in node_stack not node");
            }
            return inst;
        };
        radixgraphinstructions.prototype.next_inbound = function (inst) {
            // ensure all buildable inbound edges made
            var inbnd = inst.component.inbound_edges;
            for (var edge in inbnd) {
                // check if edge can be made
                if (!this.instructions[edge.id] && this.instructions[edge.origin.id]) {
                    var path = this.instructions[edge.origin.id].path_from_root.slice();
                    path.push(edge);
                    var newinst = new radixgraphinstruction(path);
                    this.instructions[edge.id] = newinst;
                    return newinst;
                }
            }
            return null;
        };
        radixgraphinstructions.prototype.next_outbound = function (inst) {
            // ensure all buildable outbound edges made
            var outbnd = inst.component.outbound_edges;
            for (var edge in outbnd) {
                // check if edge can be made
                if (!this.instructions[edge.id] && this.instructions[edge.destination.id]) {
                    var path = inst.path_from_root.slice();
                    path.push(edge);
                    var newinst = new radixgraphinstruction(path);
                    this.instructions[edge.id] = newinst;
                    return newinst;
                }
            }
            return null;
        };
        radixgraphinstructions.prototype.next_node = function () {
            while (this.node_stack.length > 0) {
                // get a previous node and it's outbound edges
                var inst = this.last_node();
                var outbnd = inst.component.outbound_edges;
                // build node through outbound link
                for (var edge in outbnd) {
                    // check if edge can be made
                    if (!this.instructions[edge.destination.id]) {
                        var path = inst.path_from_root.slice();
                        path.push(edge);
                        path.push(edge.destination);
                        var newinst = new radixgraphinstruction(path);
                        this.instructions[edge.destination.id] = newinst;
                        this.node_stack.push(newinst);
                        return newinst;
                    }
                }
                // backtrack through done_stack
                this.node_stack.pop();
            }
            return null;
        };
        // depth first
        radixgraphinstructions.prototype.next = function () {
            if (this.all_done)
                return null;
            var inst;
            // build root
            if (this.node_stack.length == 0) {
                inst = new radixgraphinstruction([this.graph.root]);
                this.instructions[inst.component.id] = inst;
                this.node_stack.push(inst);
                return inst;
            }
            inst = this.last_node();
            var newinst;
            // ensure all buildable inbound edges made
            if (newinst = this.next_inbound(inst))
                return newinst;
            // ensure all buildable outbound edges made
            if (newinst = this.next_outbound(inst))
                return newinst;
            // ensure all nodes built
            if (newinst = this.next_node())
                return newinst;
            // made all possible edges and nodes
            this.all_done = true;
            return null;
        };
        return radixgraphinstructions;
    })();
})(radixgraph || (radixgraph = {}));
__export(require());
