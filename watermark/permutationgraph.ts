
/// <reference path="./cyclicgraph.d.ts" />

class permutationgraphnode implements cyclicgraphnode {
  id: number;
  alias: string[];
  alias_obj: Object[];
  dist: number;
  built: boolean;
  outbound_edges: permutationgraphedge[];
  inbound_edges: permutationgraphedge[];

  constructor(id: number) {
    this.id = id;
    this.alias = [];
    this.alias_obj = [];
    this.dist = 999999999;
    this.built = false;
    this.outbound_edges = [];
    this.inbound_edges = [];
  }

  alias_index(context: Object[]): number {
    var index: number = -1;

    for (var k in context) {
      var v = context[k];
      index = this.alias_obj.indexOf(v);
      if (index >= 0) {
        break;
      }
    }

    return index;
  }

  alias_object(context: Object[]): Object {
    var i = this.alias_index(context);
    if (i >= 0) return this.alias_obj[i];
    else return null;
  }

  alias_string(context: Object[]): string {
    var i = this.alias_index(context);
    if (i >= 0) return this.alias[i];
    else return '';
  }
}

class permutationgraphedge implements cyclicgraphedge {
  alias: string;
  built: boolean;
  destination: permutationgraphnode;
  origin: permutationgraphnode;

  constructor(origin: permutationgraphnode, destination: permutationgraphnode) {
    this.alias = '';
    this.built = false;
    this.destination = destination;
    this.origin = origin;
  }
}

class permutationgraph implements cyclicgraph {

  nodes: permutationgraphnode[];

  private static fact: number[];

  // calculates factorial and stores intermediate results in fact
  private static factorial(n: number): number {
    if (!permutationgraph.fact) {
      permutationgraph.fact = [1];
    }

    for (var i = permutationgraph.fact.length; i <= n; i++) {
      permutationgraph.fact[i] = i * permutationgraph.fact[i - 1];
    }

    return permutationgraph.fact[n];
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
        var retstack = permutationgraph.fbbhelper(stack);
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

    // multiple backbones are possible for an arbitrary permutationgraph

    var stack: Object[] = [];
    var beststack: Object[] = [];

    stack.push(root);

    for (var key in root) {
      var val = root[key];

      stack.push(val);

      var retstack = permutationgraph.fbbhelper(stack)
      if (beststack.length < retstack.length) {
        // found a longer permutationgraph
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

    var backbone: Object[] = permutationgraph.findbackbone(root);
    if (!backbone) return null;

    var perm: number[] = [];
    for (var i: number = 1; i < backbone.length; i++) {
      var coef = permutationgraph.findcoef(i, backbone);
      perm[i-1] = coef;
    }
    
    return permutationgraph.fact_to_num(permutationgraph.perm_to_fact(perm));
  }

  private static num_size(num: number): number {
    var size: number = 1;
    while (num >= permutationgraph.factorial(size)) {
      size += 1;
    }
    return size;
  }

  private static num_to_fact(num: number, size?: number): number[] {
    var fact: number[] = [];
    for (var i: number = (size || permutationgraph.num_size(num)) - 1; i >= 0; i--) {
      fact[i] = Math.floor(num / permutationgraph.factorial(i));
      num -= fact[i] * permutationgraph.factorial(i);
    }
    return fact;
  }

  private static fact_to_num(fact: number[]): number {
    var num: number = 0;
    for (var i: number = 0; i < fact.length; i++) {
      num += fact[i] * permutationgraph.factorial(i);
    }
    return num;
  }

  // takes an array representing a fact and turns it into the
  // permutation representation of the factorial number
  private static fact_to_perm(fact: number[]): number[] {
    var perm: number[] = fact.slice();
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
  // factorial representation of the permutation
  private static perm_to_fact(perm: number[]): number[] {
    var fact: number[] = perm.slice();
    for (var i: number = fact.length - 1; i > 0; i--) {
      for (var j: number = 0; j < i; j++) {
        if (fact[j] > fact[i]) {
          fact[j]--;
        }
      }
    }
    return fact;
  }


  num: number;
  size: number;
  num_edges: number;
  root: permutationgraphnode;

  constructor(num: number, size?: number) {
    if (num < 0) throw ("Invalid number");
    this.num = num;
    // find minimal size to fit number
    var min_size = permutationgraph.num_size(num) + 1;
    this.size = size || min_size;
    // must have at least size one greater than necessary, to ensure permutation begins with 0
    if (this.size < min_size) throw "Size " + this.size + " Too small for number " + this.num;
    this.makenodes();
    // make nodes before edges
    this.makeedges();
  }

  private makenodes(): void {
    this.nodes = [];
    // make nodes
    for(var i = 0; i < this.size; ++i) {
      this.nodes.push(new permutationgraphnode(i));
    }
  }

  private add_edge(source: permutationgraphnode, destination: permutationgraphnode): void {
    var edge = new permutationgraphedge(source, destination);

    source.outbound_edges.push(edge);
    destination.inbound_edges.push(edge);

    this.num_edges++;
  }

  private makeedges(): void {
    var size = this.size;
    var nodes = this.nodes;
    var perm: number[] = permutationgraph.fact_to_perm(permutationgraph.num_to_fact(this.num, this.size));

    for(var i = 0; i < size; i++) {
      // make backbone edges
      this.add_edge(nodes[i], nodes[(i + 1) % size]);

      var dest: number = (i + perm[i]) % size;
      if (dest != i) {
        // edge does not point back to this node
        this.add_edge(nodes[i], nodes[dest]);
      }
    }
  }

  get_node(id: number): permutationgraphnode {
      return this.nodes[id];
  }
}
