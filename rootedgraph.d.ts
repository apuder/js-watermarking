
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

  export class rootedgraph {
    num: number;
    root: rootedgraphnode;
    size: number;
    constructor(num: number);
    get_component: get_component_function;
  }

}
