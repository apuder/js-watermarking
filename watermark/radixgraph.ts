
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
    private length: number;

    private nodes: radixgraphnode[];
    private edges: radixgraphedge[];

    private static fact: number[];

    // calculates factorial and stores intermediate results in fact
    private static factorial(n: number): number {
      if (!radixgraph.fact) {
        radixgraph.fact = [1];
      }

      for (var i = radixgraph.fact.length; i <= n; i++) {
        radixgraph.fact[i] = i * radixgraph.fact[i - 1];
      }

      return radixgraph.fact[n];
    }

    // returns true if it finds the backlink to the second item
    // or a recursive call returned true
    // false otherwise
    private static fbbhelper(stack: Object[]): Object[] {
      var root = stack[stack.length - 1];
      var beststack: Object[] = [];
      for (var key in root) {
        var val = root[key];

        if (typeof (val) !== 'object' || !val) continue;

        var index = stack.indexOf(val);
        if (index == 1) {
          // found a backlink, update beststack with copy of stack
          if (beststack.length < stack.length) {
            beststack = stack.slice();
          }
        } else if (index == -1){
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
    }

    private static findbackbone(root: Object): Object[] {
      // find the longest path that connects back to the node directly after the root

      // multiple backbones are possible for an arbitrary radixgraph

      var stack: Object[] = [];
      var beststack: Object[] = [];

      stack.push(root);

      for (var key in root) {
        var val = root[key];

        stack.push(val);

        var retstack = radixgraph.fbbhelper(stack)
        if (beststack.length < retstack.length) {
          // found a longer radixgraph
          beststack = retstack;
        }
        
        stack.pop();
      }

      // console.log(beststack);

      return beststack.length > 0 ? beststack : null;
    }

    private static findcoef(i: number, backbone: Object[]): number {
      // should find at least one link to the next item in backbone
      var foundforwardlink: boolean = false;
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
          } else {
            return ind - 1;
          }
        }
      }
      // a node that does not link to any other nodes except as a backbone link
      // represents a number not moved in the permutation
      return i - 1;
    }

    static findnum(root: any): number {
      if (typeof (root) !== 'object') return null;

      var backbone: Object[] = radixgraph.findbackbone(root);
      if (!backbone) return null;

      var perm: number[] = [];
      for (var i: number = 1; i < backbone.length; i++) {
        var coef = radixgraph.findcoef(i, backbone);
        perm[i-1] = coef;
      }
      
      return radixgraph.radix_to_num(radixgraph.perm_to_radix(perm));
    }

    private static num_length(num: number): number {
      var length: number = 1;
      while (num >= radixgraph.factorial(length)) {
        length += 1;
      }
      return length;
    }

    private static num_to_radix(num: number, length?: number): number[] {
      var radix: number[] = [];
      for (var i: number = (length || radixgraph.num_length(num)) - 1; i >= 0; i--) {
        radix[i] = Math.floor(num / radixgraph.factorial(i));
        num -= radix[i] * radixgraph.factorial(i);
      }
      return radix;
    }

    private static radix_to_num(radix: number[]): number {
      var num: number = 0;
      for (var i: number = 0; i < radix.length; i++) {
        num += radix[i] * radixgraph.factorial(i);
      }
      return num;
    }

    // takes an array representing a permutation and turns it into the
    // radix representation of the permutation
    private static radix_to_perm(radix: number[]): number[] {
      var perm: number[] = radix.slice();
      for (var i: number = 1; i < perm.length; i++) {
        for (var j: number = 0; j < i; j++) {
          if (perm[j] >= perm[i]) {
            perm[j]++;
          }
        }
      }
      return perm;
    }

    // takes an array representing a permutation and turns it into the
    // radix representation of the permutation
    private static perm_to_radix(perm: number[]): number[] {
      var radix: number[] = perm.slice();
      for (var i: number = radix.length - 1; i > 0 ; i--) {
        for (var j: number = 0; j < i; j++) {
          if (radix[j] > radix[i]) {
            radix[j]--;
          }
        }
      }
      return radix;
    }


    num: number;
    size: number;
    root: radixgraphnode;

    constructor(num: number, length?: number) {
      if (num < 0) throw ("Invalid number");
      this.num = num;
      // find minimal length to fit number
      this.length = length || radixgraph.num_length(num);
      // console.log(this.length);
      this.makenodes();
      // make nodes before edges
      this.makeedges();
      this.size = this.nodes.length + this.edges.length;
      // console.log(this);
    }

    private makenodes(): void {
      this.nodes = [];
      this.root = new radixgraphnode(0);
      // console.log(this.root);
      this.nodes.push(this.root);
      // make nodes after root
      for(var i = 1; i <= this.length; ++i) {
        this.nodes.push(new radixgraphnode(i));
        // console.log(this.nodes[this.nodes.length - 1]);
      }
    }

    private makeedges(): void {
      this.edges = [];
      var length = this.length;
      var nodes = this.nodes;
      var edges = this.edges;
      var perm: number[] = radixgraph.radix_to_perm(radixgraph.num_to_radix(this.num, this.length));
      
      // make first backbone edge, root to edge 1
      var edge = new radixgraphedge(nodes.length + edges.length);
      edge.origin = nodes[0];
      edge.destination = nodes[1];
      edge.origin_edge = edge.origin.outbound_edges.push(edge) - 1;
      edge.destination.inbound_edges.push(edge);
      edges.push(edge);

      for(var i = 1; i <= length; i++) {
        // make backbone edge
        var edge = new radixgraphedge(nodes.length + edges.length);
        edge.origin = nodes[i];
        edge.destination = nodes[(i % length) + 1];
        edge.origin_edge = edge.origin.outbound_edges.push(edge) - 1;
        edge.destination.inbound_edges.push(edge);
        edges.push(edge);
        // console.log(edges[edges.length - 1]);

        if (perm[i - 1] + 1 != i) {
          // edge does not point back to this node
          edge = new radixgraphedge(nodes.length + edges.length);
          edge.origin = nodes[i];
          edge.destination = nodes[perm[i - 1] + 1];
          edge.origin_edge = edge.origin.outbound_edges.push(edge) - 1;
          edge.destination.inbound_edges.push(edge);
          edges.push(edge);
          // console.log(edges[edges.length - 1]);
        }
      }
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
