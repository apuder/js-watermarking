

declare module RootedGraph {

  interface RootedGraphComponent {
    id: number;
    is_node: boolean;
    is_edge: boolean;
  }

  interface RootedGraphNode extends RootedGraphComponent {
    outbound_edges: [index: number]: RootedGraphEdge;
    inbound_edges: [index: number]: RootedGraphEdge;
  }
  interface RootedGraphEdge extends RootedGraphComponent {
    origin: RootedGraphNode;
    origin_edge: number;
    destination: RootedGraphNode;
  }

  interface RootedGraph {
    root: RootedGraphNode;
    size: number;
    function get_component(id: number): RootedGraphNode | RootedGraphEdge;
  }

  function makeGraph(num: number): RootedGraph;

  interface RootedGraphInstruction {
    component: RootedGraphNode | RootedGraphEdge;
    path_from_root: [index: number]: RootedGraphNode | RootedGraphEdge;
    alias?: string;
  }

  interface RootedGraphInstructions {
    function next(): RootedGraphInstruction;
    graph: RootedGraph;
  }

  function makeInstructions(graph: RootedGraph): RootedGraphInstructions;

}
