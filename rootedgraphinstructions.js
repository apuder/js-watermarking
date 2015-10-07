/// <reference path="./rootedgraph.d.ts" />
/// <reference path="./rootedgraphinstructions.d.ts" />
var rootedgraphinstructions;
(function (rootedgraphinstructions_1) {
    var rootedgraphinstruction = (function () {
        function rootedgraphinstruction(path_from_root) {
            this.component = path_from_root[path_from_root.length - 1];
            this.path_from_root = path_from_root;
        }
        return rootedgraphinstruction;
    })();
    var rootedgraphinstructions = (function () {
        function rootedgraphinstructions(graph) {
            this.all_done = false;
            this.graph = graph;
            this.instructions = [];
            this.node_stack = [];
        }
        rootedgraphinstructions.prototype.last_node = function () {
            var inst = this.node_stack[this.node_stack.length - 1];
            if (!inst.component.is_node) {
                throw ("Component in node_stack not node");
            }
            return inst;
        };
        rootedgraphinstructions.prototype.next_inbound = function (inst) {
            // ensure all buildable inbound edges made
            var inbnd = inst.component.inbound_edges;
            for (var i in inbnd) {
                var edge = inbnd[i];
                // console.log(i);
                // check if edge can be made
                if (!this.instructions[edge.id] && this.instructions[edge.origin.id]) {
                    var path = this.instructions[edge.origin.id].path_from_root.slice();
                    path.push(edge);
                    var newinst = new rootedgraphinstruction(path);
                    this.instructions[edge.id] = newinst;
                    return newinst;
                }
            }
            return null;
        };
        rootedgraphinstructions.prototype.next_outbound = function (inst) {
            // ensure all buildable outbound edges made
            var outbnd = inst.component.outbound_edges;
            for (var i in outbnd) {
                var edge = outbnd[i];
                // console.log(i);
                // check if edge can be made
                if (!this.instructions[edge.id] && this.instructions[edge.destination.id]) {
                    var path = inst.path_from_root.slice();
                    path.push(edge);
                    var newinst = new rootedgraphinstruction(path);
                    this.instructions[edge.id] = newinst;
                    return newinst;
                }
            }
            return null;
        };
        rootedgraphinstructions.prototype.next_node = function () {
            while (this.node_stack.length > 0) {
                // get a previous node and it's outbound edges
                var inst = this.last_node();
                var outbnd = inst.component.outbound_edges;
                // build node through outbound link
                for (var i in outbnd) {
                    var edge = outbnd[i];
                    // console.log(i);
                    // check if edge can be made
                    if (!this.instructions[edge.destination.id]) {
                        var path = inst.path_from_root.slice();
                        path.push(edge);
                        path.push(edge.destination);
                        var newinst = new rootedgraphinstruction(path);
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
        rootedgraphinstructions.prototype.next = function () {
            if (this.all_done)
                return null;
            var inst;
            // build root
            if (this.node_stack.length == 0) {
                inst = new rootedgraphinstruction([this.graph.root]);
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
        return rootedgraphinstructions;
    })();
    rootedgraphinstructions_1.rootedgraphinstructions = rootedgraphinstructions;
})(rootedgraphinstructions = exports.rootedgraphinstructions || (exports.rootedgraphinstructions = {}));
