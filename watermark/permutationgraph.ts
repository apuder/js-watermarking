
/// <reference path="set_map.d.ts" />
/// <reference path="./cyclicgraph.d.ts" />

interface tarjanNode {
  id: number;
  component_id: number;
  on_stack: boolean;
}

interface johnsonNode {
  blocked: boolean;
  next_blocked: Set<johnsonNode>;
}

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

    private static count_id: number;
    private static begin_digit = /^\d/;
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

    private static make_tarjanNode(obj: Object, stk: Object[], map: Map<Object, tarjanNode>): tarjanNode {
      var obj_node = map.get(obj);
      if (!obj_node) {
        // new node
        obj_node = {
          id: permutationgraph.count_id,
          component_id: permutationgraph.count_id,
          on_stack: true
        };
        permutationgraph.count_id++;
        stk.push(obj);
        map.set(obj, obj_node);
      }
      return obj_node;
    }

    private static tarjan_recurse(obj: Object, stk: Object[], map: Map<Object, tarjanNode>, components: Object[][]) {

      var obj_node = permutationgraph.make_tarjanNode(obj, stk, map);

      for (var k in obj) {
      // skip non objects, numeric keys, and null
      // (numeric keys are not allowed in the backbone)
      var v: Object = obj[k];
      if (!v
        || permutationgraph.begin_digit.test(k)
        || typeof (v) !== 'object') continue;

        var v_node = map.get(v);
        if (!v_node) {
          // visit v
          permutationgraph.tarjan_recurse(v, stk, map, components);
          // v_node will be in the map now
          v_node = map.get(v);
          obj_node.component_id = (obj_node.component_id > v_node.component_id) ? v_node.component_id : obj_node.component_id;
        } 
        else if (v_node.on_stack) {
          obj_node.component_id = (obj_node.component_id > v_node.component_id) ? v_node.component_id : obj_node.component_id;
        }
      }

      if (obj_node.id == obj_node.component_id) {
        // found an entire strongly connected component, remove it from the stack
        var component: Object[] = stk.splice(stk.indexOf(obj));
        for (var i = 0; i < component.length; i++) {
          var v: Object = component[i];

          var v_node = map.get(v);

          v_node.on_stack = false;
        }
        components.push(component);
        console.log('found strongly connected component');
      }
    }

    private static tarjan(root: Object, blacklist: string[]): Object[][] {
      // finds strongly connected components of the graph starting from root
      var stk: Object[] = [];
      var map = new Map<Object, tarjanNode>();
      var components: Object[][] = [];
      permutationgraph.count_id = 0;
      
      for (var k in root) {
      // skip non objects, numeric keys, null and blacklisted keys
      // (numeric keys are not allowed in the backbone)
      var v: Object = root[k];
      if (!v 
        || permutationgraph.begin_digit.test(k)
        || typeof (v) !== 'object'
        || blacklist.indexOf(k) >= 0) continue;

        if (!map.get(v)) {
          // visit v
          permutationgraph.tarjan_recurse(v, stk, map, components);
        }
      }

      return components;
    }

    private static johnson_unblock(obj_info: johnsonNode) {
      // unblocks the node and all of its next_blocked
      obj_info.blocked = false;
      var v_info: any;
      for (v_info in obj_info.next_blocked.keys()) {
        v_info = <johnsonNode>v_info;
        if (v_info.blocked) permutationgraph.johnson_unblock(v_info);
      }
      obj_info.next_blocked.clear();
    }

    private static johnson_circuit(obj: Object, stk: Object[], map: Map<Object, johnsonNode>, circuits: Object[][]): boolean {
      // finds circuits starting and ending at stk[0]
      var found_circuit = false;

      stk.push(obj);
      var obj_info = map.get(obj);
      obj_info.blocked = true;

      for (var k in obj) {
        var v: Object = obj[k];
        var v_info = map.get(v);
        // skip edges not part of this connected component
        if (!v_info) continue;
        if (v == stk[0]) {
          // found a circuit
          circuits.push(stk.slice());
          console.log('found circuit');
          found_circuit = true;
        }
        else if (!v_info.blocked) {
          // recurse using v
          if (permutationgraph.johnson_circuit(v, stk, map, circuits)) {
            found_circuit = true;
          }
        }
      }

      if (found_circuit) {
        permutationgraph.johnson_unblock(obj_info);
      }
      else {
        for (var k in obj) {
          var v: Object = obj[k];
          var v_info = map.get(v);
          // skip edges not part of this connected component
          if (!v_info) continue;

          if (!v_info.next_blocked.has(obj_info)) {
            v_info.next_blocked.add(obj_info);
          }
        }
      }

      stk.pop();

      return found_circuit;
    }

    private static johnson(components: Object[][], size: number): Object[][] {
      // find all circuits in the graph
      var circuits: Object[][] = [];
      var stk: Object[] = [];
      var map = new Map<Object, johnsonNode>();

      for (var i = 0; i < components.length; i++) {
        var component = components[i];
        // skip components smaller than size
        if (component.length < size) continue; 

        // set-up map for this component
        for (var j = 0; j < component.length; j++) {
          var obj = component[j];
          map.set(obj, {
            blocked: false,
            next_blocked: new Set()
          });
        }

        // find circuits in this component
        for (var j = 0; j < component.length; j++) {
          var obj = component[j];
          // only examine sub-components at least as big as size
          if (component.length - j < size) break;
          // reset map
          for (var k = j; k < component.length; k++) {
            var v = component[k];
            var v_info = map.get(v);
            v_info.blocked = false;
            v_info.next_blocked.clear();
          }
          // find circuits
          permutationgraph.johnson_circuit(obj, stk, map, circuits);
          // remove finished node
          map.delete(obj);
        }
        // remove component from map
        map.clear();
      }
      return circuits;
    }

    private static findbackbones(root: Object, size: number, blacklist: string[]): Object[][] {
      // find circular paths of length >= size via depth first search

      var found: Object[][];
      // find strongly connected components
      found = permutationgraph.tarjan(root, blacklist);
      // find circuits in strongly connected components
      found = permutationgraph.johnson(found, size);

      return found;
    }

    static findnums(root: Object, size: number, blacklist: string[]): number[] {
      // find all numbers represented by permutation graphs reachable from root
      // done if root null or not an object
      if (!root || typeof (root) !== 'object') return [];

      blacklist = blacklist || [];

      var backbones: Object[][] = permutationgraph.findbackbones(root, size, blacklist);
      
      var nums: number[] = [];

      for (var i = 0; i < backbones.length; i++) {
        var backbone = backbones[i];
        var perm = permutationgraph.backbone_to_perm(backbone);
        if (perm) {
          nums.push(permutationgraph.fact_to_num(permutationgraph.perm_to_fact(perm)));
          console.log('found number: ' + nums[nums.length-1]);
        }
      }

      return nums;
    }

    private static backbone_to_perm(backbone: Object[]): number[] {
      // check backbone valid if so return permutation represented
      // else null
      var size = backbone.length;
      var perm = [];
      var i;
      var i_zero = -1;
      for (i = 0; i < size; i++) {
        var obj = backbone[i];
        var found_backbone_link = false;
        var val = 0;
        for (var k in obj) {
          var other = obj[k];
          var j = backbone.indexOf(other);
          if (j >= 0) {
            // other in backbone
            if (j == i) {
              // invalid graph, no nodes link to themselves
              console.log("self link, discarding backbone");
              return null;
            }
            else if (!found_backbone_link && j == ((i + 1) % size)) {
              found_backbone_link = true;
            }
            else if (j > i) {
              val = j - i;
            }
            else if (j < i) {
              val = size + j - i;
            }
          }
        }
        if (val == 0) {
            i_zero = i;
        }
        if (perm.indexOf(val) >= 0) {
          // already found this edge, invalid permutation graph
          console.log("invalid permutation, number repeated");
          return null;
        }
        perm.push(val);
      }
      if (i_zero < 0) {
        console.log("invalid permutation, no zero node");
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
