
/// <reference path="./rootedgraph.d.ts" />

declare module powergraph {

  interface powergraphcomponent extends rootedgraph.rootedgraphcomponent { }

  interface powergraphnode extends rootedgraph.rootedgraphnode { }

  interface powergraphedge extends rootedgraph.rootedgraphedge { }

  export class powergraph implements rootedgraph.rootedgraph {
    static findnum(root: Object): number;
    num: number;
    size: number;
    root: powergraphnode;
    constructor(num: number, length?: number);
    get_component(id: number): powergraphnode | powergraphedge;
  }

}
