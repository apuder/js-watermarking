
/// <reference path="./set_map.d.ts" />
/// <reference path="./cyclicgraph.d.ts" />



interface path_type extends Array<cyclicgraphedge> {
  first?: cyclicgraphnode;
  first_obj?: Object;
}

class cyclicgraphinstructions {

  size: number;
  graph: cyclicgraph;
  fringe_edge: Set<cyclicgraphedge>;

  constructor(graph: cyclicgraph) {
    this.graph = graph;
    this.size = graph.num_edges + 1;
    this.fringe_edge = new Set<cyclicgraphedge>();
  }

  // breadth randomely
  possible(nodes: cyclicgraphnode[]): cyclicgraphedge[] {
    var fringe: cyclicgraphedge[] = [];
    for (var i in nodes) {
      var edges = nodes[i].outbound_edges;
      for (var j in edges) {
        var e = edges[j];
        if (!e.built) {
          fringe.push(e);
        }
      }
    }
    return fringe;
  }

  private reset_dist() {
    for(var i in this.graph.nodes) {
      this.graph.nodes[i].dist = 999999999;
    }
  }

  private fringe_add_all(fringe: Set<cyclicgraphnode>) {
    for (var i in this.graph.nodes) {
      fringe.add(this.graph.nodes[i]);
    }
  }

  private fringe_min(fringe: Set<cyclicgraphnode>): any {
    var obj: any = undefined;
    var d: number = 9999999999;
    for(var v of fringe.values()) {
      if (v.dist < d) {
        d = v.dist;
        obj = v;
      }
    }
    return obj;
  }

  shortest_path(node: cyclicgraphnode, context: Object[]): path_type {
    if (context.length == 0) {
      return [];
    }

    this.reset_dist();

    var fringe: Set<cyclicgraphnode> = new Set<cyclicgraphnode>();

    fringe.add(node);
    node.dist = 0;

    var path: path_type = [];

    while (fringe.size > 0) {
      // find min, remove from fringe
      var n: cyclicgraphnode = this.fringe_min(fringe);
      fringe.delete(n);

      var obj = n.alias_object(context);
      if (obj) {
        path.first = n;
        path.first_obj = obj;
        break; // found
      }

      // update
      for (var j in n.inbound_edges) {
        var e = n.inbound_edges[j]
        if (e.built && e.origin.built && e.origin.dist > n.dist + 1) {
          // add on first encounter
          if (!fringe.has(e.origin)) fringe.add(e.origin);
          e.origin.dist = n.dist + 1;
        }
      }
    }

    if (!path.first) return path;

    var closest: cyclicgraphnode = path.first;

    while (closest.dist > 0) {
      for(var i in closest.outbound_edges) {
        var e = closest.outbound_edges[i];
        if (e.destination.dist == closest.dist - 1) {
          closest = e.destination;
          path.push(e);
          break;
        }
      }
    }

    return path;
  }

  path_to_alias(path: path_type): string {
    var alias: string = '';
    if (path.first_obj) {
      alias += path.first.alias_string([path.first_obj]);
    }
    for (var i = 0; i < path.length; i++) {
      alias += path[i].alias;
    }
    return alias;
  }

  get_alias(node: cyclicgraphnode, context: Object[]): string {
    var ali = node.alias_string(context);
    if (ali) {
      return ali;
    } else {
      return this.path_to_alias(this.shortest_path(node, context));
    }
  }

  private add_edges_fringe(node: cyclicgraphnode) {
    for(var k in node.outbound_edges) {
      var edge = node.outbound_edges[k];
      if (!edge.built) this.fringe_edge.add(edge);
    }
  }

  private remove_edge_fringe(edge: cyclicgraphedge) {
    if (this.fringe_edge.has(edge)) this.fringe_edge.delete(edge);
  }

  add_node_alias(node: cyclicgraphnode, obj: Object, alias: string) {
    node.alias.push(alias);
    node.alias_obj.push(obj);
  }

  remove_node_alias(node: cyclicgraphnode, obj: Object) {
    var i: number = node.alias_obj.indexOf(obj);
    while (i >= 0) {
      node.alias_obj.splice(i, 1);
      node.alias.splice(i, 1);
      i = node.alias_obj.indexOf(obj);
    }
  }

  consume_node(node: cyclicgraphnode) {
    if (!node.built) {
      node.built = true;
      this.add_edges_fringe(node);
    }
  }

  consume_edge(edge: cyclicgraphedge, alias: string) {
    edge.built = true;
    edge.alias = alias;
    this.remove_edge_fringe(edge);
  }
}

