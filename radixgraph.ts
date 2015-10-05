
module radixgraph {

  class radixgraphnode {
    id: number;
    is_node: boolean;
    is_edge: boolean;
    outbound_edges: radixgraphedge[];
    inbound_edges: radixgraphedge[];

    constructor(id: number) {
      this.id = id;
      this.is_node = true;
      this.is_edge = false;
      this.outbound_edges = [];
      this.inbound_edges = [];
    }
  }

  class radixgraphedge {
    id: number;
    is_node: boolean;
    is_edge: boolean;
    origin: radixgraphnode;
    origin_edge: number;
    destination: radixgraphnode;

    constructor(id: number) {
      this.id = id;
      this.is_node = false;
      this.is_edge = true;
      this.origin = null;
      this.origin_edge = null;
      this.destination = null;
    }
  }

  class radixgraph {
    private base: number;

    private nodes: radixgraphnode[];
    private edges: radixgraphedge[];

    num: number;
    size: number;
    root: radixgraphnode;

    constructor(num: number) {
      this.num = num;
      this.base = 2;
      // find minimal base to fit number
      while (num >= Math.pow(this.base, this.base-1)) {
        this.base += 1;
      }
      this.root = new radixgraphnode(0);
      this.makenodes();
      this.makeedges();
    }

    private makenodes = function (): void {
      this.nodes = [];
      this.nodes.push(this.root);
      // make nodes after root
      for(var i = 1; i < this.base; ++i) {
        this.nodes.push(new radixgraphnode(i));
      }
    }

    private makeedges = function (): void {
      this.edges = [];
      var tmpnum = this.num;
      var base = this.base;
      var nodes = this.nodes;
      var edges = this.edges;
      // make connections based on num
      for(var i = base - 2, j = 0; i >= 0; --i, ++j) {
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
          edge.origin = nodes[j+1];
          edge.origin_edge = 1;
          // move forward coef - 1, as 0 is a null reference
          // starting from j, the last node (ignore the root node)
          // mod by base - 1 as there are base - 1 nodes on the main sequence
          // add 1 to move past the root
          edge.destination = nodes[((coef - 1 + j) % (base - 1)) + 1];
          edges.push(edge);
          edge.origin.outbound_edges.push(edge);
          edge.destination.inbound_edges.push(edge);
        } else {
          // null edge, add null reference where this outbound edge should be
          nodes[j+1].outbound_edges.push(null);
        }
      }
    }

    get_component = function (id: number): radixgraphnode | radixgraphedge {
      if (id < this.nodes.length) {
        return this.nodes[id];
      } else {
        return this.edges[id - this.nodes.length];
      }
    }
  }

  class radixgraphinstruction {
      component: radixgraphcomponent;
      path_from_root: radixgraphcomponent[];

      constructor(path_from_root: radixgraphcomponent[]) {
        this.component = path_from_root[path_from_root.length - 1];
        this.path_from_root = path_from_root;
      }
    }

  class radixgraphinstructions {
    private all_done: boolean = false;
    private done_ids: boolean[];
    private last_instruction: radixgraphinstruction;

    graph: radixgraph;

    constructor(graph: radixgraph) {
      this.graph = graph;
      this.done_ids = [];
      this.last_instruction = null;
    }

    next = function (): radixgraphinstruction {
      if (this.all_done) return null;

      var path_from_root: radixgraphcomponent[] = [];

      // encounter each edge twice, at origin and destination
      // both guaranteed to exist the second time visiting the edge
      // always follow forward link to keep nodes from being garbage collected
      // check backwards links to fill in missing links

      // todo

    }
  }
}

declare module "radixgraph" {
  export = radixgraph;
}
