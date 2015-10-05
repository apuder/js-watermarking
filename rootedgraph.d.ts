
declare module rootedgraph {

  interface rootedgraphcomponent {
    id: number;
    is_node: boolean;
    is_edge: boolean;
  }

  interface rootedgraphnode extends rootedgraphcomponent {
    outbound_edges: rootedgraphedge[];
    inbound_edges: rootedgraphedge[];
  }
  interface rootedgraphedge extends rootedgraphcomponent {
    origin: rootedgraphnode;
    origin_edge: number;
    destination: rootedgraphnode;
  }

  interface get_component_function {
    (id: number): rootedgraph.rootedgraphcomponent;
  }

  interface rootedgraph {
    // new(num: number);
    num: number;
    root: rootedgraphnode;
    size: number;
    get_component: get_component_function;
  }

  interface rootedgraphinstruction {
    component: rootedgraph.rootedgraphcomponent;
    path_from_root: rootedgraph.rootedgraphcomponent[];
    alias?: string;
  }

  interface next_function {
    (): rootedgraph.rootedgraphinstruction;
  }

  interface rootedgraphinstructions {
    // new(graph: rootedgraph.rootedgraph);
    next: next_function;
    graph: rootedgraph.rootedgraph;
  }

}
