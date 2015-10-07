
export module radixgraph {

  interface radixgraphcomponent {
    id: number;
    is_node: boolean;
    is_edge: boolean;
  }

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

  export class radixgraph {
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
      // console.log(this.base);
      this.root = new radixgraphnode(0);
      // console.log(this.root);
      this.makenodes();
      // make nodes before edges
      this.makeedges();
      this.size = this.nodes.length + this.edges.length;
      // console.log(this);
    }

    private makenodes(): void {
      this.nodes = [];
      this.nodes.push(this.root);
      // make nodes after root
      for(var i = 1; i < this.base; ++i) {
        this.nodes.push(new radixgraphnode(i));
        // console.log(this.nodes[this.nodes.length - 1]);
      }
    }

    private makeedges(): void {
      this.edges = [];
      var tmpnum = this.num;
      var base = this.base;
      var nodes = this.nodes;
      var edges = this.edges;
      // make connections based on num, i is the power, j is the previous node in nodes
      for(var i = base - 2, j = 0; i >= 0; --i, ++j) {
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
          edge.origin = nodes[j+1];
          // move forward coef - 1, as 0 is a null reference
          // starting from j, the last node (ignore the root node)
          // mod by base - 1 as there are base - 1 nodes on the main sequence
          // add 1 to move past the root
          edge.destination = nodes[((coef - 1 + j) % (base - 1)) + 1];
          edge.origin_edge = edge.origin.outbound_edges.push(edge) - 1;
          edge.destination.inbound_edges.push(edge);
          edges.push(edge);
          // console.log(edges[edges.length - 1]);
        } else {
          // zero edge, add null reference where this outbound edge should be
          // nodes[j+1].outbound_edges.push(null);
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
    }

    get_component(id: number): radixgraphnode | radixgraphedge {
      if (id < this.nodes.length) {
        return this.nodes[id];
      } else {
        return this.edges[id - this.nodes.length];
      }
    }
  }
}
