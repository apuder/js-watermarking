
/// <reference path="./set_map.d.ts" />

// declare module cyclicgraph {

  interface num_size {
    num: number;
    size: number;
  }

  interface node_alias_obj {
    name: string;
    obj: Object;
    instruction_added: number;
    instruction_removed: number;
  }

  interface cyclicgraphnode {
    id: number;
    aliases: Map<string, node_alias_obj[]>;
    alias_obj: Map<Object, node_alias_obj[]>;
    dist: number;
    built: number; // instruction number when this was built
    outbound_edges: cyclicgraphedge[];
    inbound_edges: cyclicgraphedge[];
    alias_object(context: Object, instruction: number, building_now: boolean): node_alias_obj;
    // alias_string(str: string, instruction: number): node_alias_obj;
  }

  interface cyclicgraphedge {
    alias: string; // ex ".next", "[2]" ...
    built: number; // instruction number when this was built
    backbone: boolean;
    destination: cyclicgraphnode;
    origin: cyclicgraphnode;
  }

  interface get_node_function {
    (id: number): cyclicgraphnode;
  }

  declare class cyclicgraph {
    static findnums(cycles: Object[][]): num_size[];
    nodes: cyclicgraphnode[];
    num: number;
    size: number;
    num_edges: number;
    constructor(num: number, size?: number);
    get_node: get_node_function;
  }

// }
