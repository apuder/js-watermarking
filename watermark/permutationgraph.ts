
/// <reference path="set_map.d.ts" />
/// <reference path="./cyclicgraph.d.ts" />

module permutationgraph {
  "use strict";

  export class permutationgraphnode implements cyclicgraphnode {
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

  export class permutationgraphedge implements cyclicgraphedge {
    alias: string;
    built: boolean;
    backbone: boolean;
    destination: permutationgraphnode;
    origin: permutationgraphnode;

    constructor(origin: permutationgraphnode, destination: permutationgraphnode) {
      this.alias = '';
      this.built = false;
      this.backbone = false;
      this.destination = destination;
      this.origin = origin;
    }
  }

  export class permutationgraph implements cyclicgraph {

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

    static findnums(cycles: Object[][]): number[] {
      // find all numbers represented by permutation graphs in cycles
      
      var nums: number[] = [];

      for (var i = 0; i < cycles.length; i++) {
        var backbone = cycles[i];
        var perm = permutationgraph.backbone_to_perm(backbone);
        if (perm) {
          nums.push(permutationgraph.fact_to_num(permutationgraph.perm_to_fact(perm)));
          console.log('found watermark number: ' + nums[nums.length-1] + ' (size: ' + perm.length + ')');
        }
      }

      return nums;
    }

    private static backbone_to_perm(backbone: Object[]): number[] {
      // check backbone valid if so return permutation represented
      // else null
      var begin_digit = /^\d/;
      var size = backbone.length;
      var perm = [];
      var i;
      var i_zero = -1;
      // console.log(backbone.length, backbone)
      for (i = 0; i < size; i++) {
        var obj = backbone[i];
        var val = 0;
        for (var k in obj) {
          var other = obj[k];
          var j = backbone.indexOf(other);
          if (j >= 0) {
            // other in backbone
            if (j == i) {
              // invalid graph, no nodes link to themselves
              // console.log("self link, discarding backbone");
              return null;
            }
            if (begin_digit.test(k)) {
              // data link, record value
              if (j > i) {
                val = j - i;
              }
              else if (j < i) {
                val = size + j - i;
              }
            }
          }
        }
        if (val == 0) {
            i_zero = i;
        }
        if (perm.indexOf(val) >= 0) {
          // already found this edge, invalid permutation graph
          // console.log("invalid permutation, number repeated", perm);
          return null;
        }
        perm.push(val);
      }
      if (i_zero < 0) {
        // console.log("invalid permutation, no zero node");
        return null; // should never happen
      }

      var perm_reordered = [];
      for (i = 1; i <= size; ++i) {
        perm_reordered.push(perm[(i + i_zero) % size]);
      }

      return perm_reordered;
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
      for (var i = 0; i < this.size; ++i) {
        this.nodes.push(new permutationgraphnode(i));
      }
    }

    private add_edge(source: permutationgraphnode, destination: permutationgraphnode, backbone: boolean): void {
      var edge = new permutationgraphedge(source, destination);
      edge.backbone = backbone;

      source.outbound_edges.push(edge);
      destination.inbound_edges.push(edge);

      this.num_edges++;
    }

    private makeedges(): void {
      this.num_edges = 0;
      var size = this.size;
      var nodes = this.nodes;
      var perm: number[] = permutationgraph.fact_to_perm(permutationgraph.num_to_fact(this.num, this.size));

      for (var i = 0; i < size; i++) {
        // make backbone edges
        this.add_edge(nodes[i], nodes[(i + 1) % size], true);

        var dest: number = (i + perm[i]) % size;
        if (i != dest) {
          // edge is not representing zero
          this.add_edge(nodes[i], nodes[dest], false);
        }
      }
    }

    get_node(id: number): permutationgraphnode {
      return this.nodes[id];
    }
  }
}
