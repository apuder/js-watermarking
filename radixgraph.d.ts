
/// <reference path="./rootedgraph.d.ts" />

declare module radixgraph {

  interface radixgraphcomponent extends rootedgraph.rootedgraphcomponent { }

  interface radixgraphnode extends rootedgraph.rootedgraphnode { }

  interface radixgraphedge extends rootedgraph.rootedgraphedge { }

  class radixgraph implements rootedgraph.rootedgraph {
    num: number;
    size: number;
    root: radixgraphnode;
    constructor(num: number);
    get_component(id: number): radixgraphnode | radixgraphedge;
  }

  interface radixgraphinstruction extends rootedgraph.rootedgraphinstruction { }

  class radixgraphinstructions implements rootedgraph.rootedgraphinstructions {
    graph: radixgraph;
    constructor(graph: radixgraph);
    next(): radixgraphinstruction;
  }

}
