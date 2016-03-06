
// declare module cyclicgraph {

  interface cyclicgraphnode {
    id: number;
    alias: string[]; // local identifiers of alias_obj concatenated with alias is this node (name of reference)
    // ex "PDFJS", "this", "myobj.prop", "mylist[3]"
    alias_obj: Object[]; // objects that contains a reference to this node
    dist: number;
    built: boolean;
    outbound_edges: cyclicgraphedge[];
    inbound_edges: cyclicgraphedge[];
    alias_index(context: Object[]): number;
    alias_object(context: Object[]): Object
    alias_string(context: Object[]): string;
  }

  interface cyclicgraphedge {
    alias: string; // ex ".next", "[2]" ...
    built: boolean;
    backbone: boolean;
    destination: cyclicgraphnode;
    origin: cyclicgraphnode;
  }

  interface get_node_function {
    (id: number): cyclicgraphnode;
  }

  declare class cyclicgraph {
    static findnums(cycles: Object[][]): number[];
    nodes: cyclicgraphnode[];
    num: number;
    size: number;
    num_edges: number;
    constructor(num: number, size?: number);
    get_node: get_node_function;
  }

// }
