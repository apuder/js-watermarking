
/// <reference path="./rootedgraph.d.ts" />

declare module rootedgraphinstructions {

  interface rootedgraphinstruction {
    component: rootedgraph.rootedgraphcomponent;
    path_from_root: rootedgraph.rootedgraphcomponent[];
    alias?: string;
  }

  interface next_function {
    (): rootedgraphinstruction;
  }

  export class rootedgraphinstructions {
    graph: rootedgraph.rootedgraph;
    constructor(graph: rootedgraph.rootedgraph);
    next: next_function;
  }

}
