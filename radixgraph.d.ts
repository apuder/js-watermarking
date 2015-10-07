
/// <reference path="./rootedgraph.d.ts" />

declare module radixgraph {

  interface radixgraphcomponent extends rootedgraph.rootedgraphcomponent { }

  interface radixgraphnode extends rootedgraph.rootedgraphnode { }

  interface radixgraphedge extends rootedgraph.rootedgraphedge { }

  export class radixgraph implements rootedgraph.rootedgraph {
    num: number;
    size: number;
    root: radixgraphnode;
    constructor(num: number);
    get_component(id: number): radixgraphnode | radixgraphedge;
  }

}
