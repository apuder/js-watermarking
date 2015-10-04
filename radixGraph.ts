

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
  num: number;
	root: RootedGraphNode;
	size: number;
	function get_component(id: number): RootedGraphNode | RootedGraphEdge;
}

class RadixGraph implements RootedGraph {
  private base: number;

  private class RadixGraphNode implements RootedGraphNode {
    public id: number;
    public is_node: boolean;
    public is_edge: boolean;
    public outbound_edges: [index: number]: RadixGraphEdge;
    public inbound_edges: [index: number]: RadixGraphEdge;

    constructor(id: number) {
      this.id = id;
      is_node = true;
      is_edge = false;
      outbound_edges = [];
      inbound_edges = [];
    }
  }

  private class RadixGraphEdge implements RootedGraphEdge {
    public id: number;
    public is_node: boolean;
    public is_edge: boolean;
    public origin: RootedGraphNode;
    public origin_edge: number;
    public destination: RootedGraphNode;

    constructor(id: number) {
      this.id = id;
      is_node = false;
      is_edge = true;
    }
  }

  private nodes: [index: number]: RadixGraphNode;
  private edges: [index: number]: RadixGraphEdge;

  public num: number;
  public size: number;
  public root: RadixGraphNode;

  constructor(num: number) {
    this.num = num;
    base = 2;
    // find minimal base to fit number
    while (num >= Math.pow(base, base-1)) {
      base += 1;
    }
    root = new RadixGraphNode(0);
    makeNodes();
    makeEdges();
  }

  private function makeNodes(): void {
    nodes = [];
    nodes.push(root);
    // make nodes after root
    for(var i = 1; i < base; ++i) {
      nodes.push(new RadixGraphNode(i));
    }
  }

  private function makeEdges(): void {
    edges = [];
    var tmpnum = num;
    // make connections based on num
    for(var i = base - 2, var j = 0; i >= 0; --i, ++j) {
      var term = Math.pow(base, i);
      var coef = Math.floor(tmpnum / term);
      tmpnum -= coef * term;

      var edge = new RadixGraphEdge(nodes.length + edges.length);
      edge.origin = nodes[j];
      edge.origin_edge = 0;
      edge.destination = nodes[j % base];
      edges.push(edge);

      if (coef != 0) {
        edge = new RadixGraphEdge(nodes.length + edges.length);
        edge.origin = nodes[j+1];
        edge.origin_edge = 1;
        // move forward coef - 1, as 0 is a null reference
        // starting from j, the last node (ignore the root node)
        // mod by base - 1 as there are base - 1 nodes on the main sequence
        // add 1 to move past the root
        edge.destination = nodes[((coef - 1 + j) % (base - 1)) + 1];
        edges.push(edge);
        edge.origin.outbound_edges.push(edge);
        edge.destination.inbound_edges.push(edge);
      } else {
        // null edge, add null reference where this outbound edge should be
        nodes[j+1].outbound_edges.push(null);
      }
    }
  }

  public function get_component(id: number): RadixGraphNode | RadixGraphEdge {
    if (id < nodes.length) {
      return nodes[id];
    } else {
      return edges[id - nodes.length];
    }
  }
}

function makeGraph(num: number): RadixGraph {
  return new RadixGraph(num);
}



interface RootedGraphInstruction {
  component: RootedGraphNode | RootedGraphEdge;
  path_from_root: [index: number]: RootedGraphNode | RootedGraphEdge;
  alias?: string;
}

interface RootedGraphInstructions {
  function next(): RootedGraphInstruction;
  graph: RootedGraph;
}


class RadixGraphInstructions implements RootedGraphInstructions {

  private class RadixGraphInstruction implements RootedGraphInstruction {
    public component: RadixGraphNode | RadixGraphEdge;
    public path_from_root: [index: number]: RadixGraphNode | RadixGraphEdge;

    constructor(path_from_root: [index: number]: RadixGraphNode | RadixGraphEdge) {
      this.component = path_from_root[path_from_root.length - 1];
      this.path_from_root = path_from_root;
    }
  }

  private all_done: boolean = false;
  private done_ids: [index: number]: boolean;
  private last_instruction: RadixGraphInstruction;

  public graph: RadixGraph;

  constructor(graph: RadixGraph) {
    this.graph = graph;
    done_ids = [];
    last_instruction = null;
  }

  public function next(): RadixGraphInstruction {
    if (all_done) return null;

    var path_from_root:  [index: number]: RadixGraphNode | RadixGraphEdge = [];

    // TODO

  }
}

function makeInstructions(graph: RootedGraph): RadixGraphInstructions {
  return new RadixGraphInstructions(graph);
}
