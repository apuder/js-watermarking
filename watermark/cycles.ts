
/// <reference path="set_map.d.ts" />

module cycles {
    "use strict";

    interface tarjanNode {
        id: number;
        component_id: number;
        on_stack: boolean;
    }

    var count_id: number;
    var begin_digit = /^\d/;

    function make_tarjanNode(obj: Object, stk: Object[], map: Map<Object, tarjanNode>): tarjanNode {
        var obj_node = map.get(obj);
        if (!obj_node) {
            // new node
            obj_node = {
                id: count_id,
                component_id: count_id,
                on_stack: true
            };
            count_id++;
            stk.push(obj);
            map.set(obj, obj_node);
        }
        return obj_node;
    }

    function tarjan_recurse(obj: Object, stk: Object[], map: Map<Object, tarjanNode>, components: Object[][]) {

        var obj_node = make_tarjanNode(obj, stk, map);

        for (var k in obj) {
            // skip non objects, numeric keys, and null
            // (numeric keys are not allowed in the backbone)
            var v: Object = obj[k];
            if (!v
                || begin_digit.test(k)
                || typeof (v) !== 'object') continue;

            var v_node = map.get(v);
            if (!v_node) {
                // visit v
                tarjan_recurse(v, stk, map, components);
                // v_node will be in the map now
                v_node = map.get(v);
                obj_node.component_id = (obj_node.component_id > v_node.component_id) ? v_node.component_id : obj_node.component_id;
            }
            else if (v_node.on_stack) {
                obj_node.component_id = (obj_node.component_id > v_node.component_id) ? v_node.component_id : obj_node.component_id;
            }
        }

        if (obj_node.id == obj_node.component_id) {
            // found an entire strongly connected component, remove it from the stack
            var component: Object[] = stk.splice(stk.indexOf(obj));
            for (var i = 0; i < component.length; i++) {
                var v: Object = component[i];

                var v_node = map.get(v);

                v_node.on_stack = false;
            }
            components.push(component);
            // console.log('found strongly connected component');
        }
    }

    function tarjan(root: Object, blacklist: string[]): Object[][] {
        // finds strongly connected components of the graph starting from root
        var stk: Object[] = [];
        var map = new Map<Object, tarjanNode>();
        var components: Object[][] = [];
        count_id = 0;

        for (var k in root) {
            // skip non objects, numeric keys, null and blacklisted keys
            // (numeric keys are not allowed in the backbone)
            var v: Object = root[k];
            if (!v
                || begin_digit.test(k)
                || typeof (v) !== 'object'
                || blacklist.indexOf(k) >= 0) continue;

            if (!map.get(v)) {
                // visit v
                tarjan_recurse(v, stk, map, components);
            }
        }

        return components;
    }

    interface johnsonNode {
        blocked: boolean;
        next_blocked: Set<johnsonNode>;
    }

    function johnson_unblock(obj_info: johnsonNode) {
        // unblocks the node and all of its next_blocked
        obj_info.blocked = false;
        var v_info: any;
        for (v_info in obj_info.next_blocked.keys()) {
            v_info = <johnsonNode>v_info;
            if (v_info.blocked) johnson_unblock(v_info);
        }
        obj_info.next_blocked.clear();
    }

    function johnson_circuit(obj: Object, stk: Object[], map: Map<Object, johnsonNode>, circuits: Object[][]): boolean {
        // finds circuits starting and ending at stk[0]
        var found_circuit = false;

        stk.push(obj);
        var obj_info = map.get(obj);
        obj_info.blocked = true;

        for (var k in obj) {
            // ignore edges whose keys start with digits
            if (begin_digit.test(k)) continue;
            var v: Object = obj[k];
            var v_info = map.get(v);
            // skip edges not part of this connected component
            if (!v_info) continue;
            if (v == stk[0]) {
                // found a circuit
                circuits.push(stk.slice());
                // console.log('found circuit');
                found_circuit = true;
            }
            else if (!v_info.blocked) {
                // recurse using v
                if (johnson_circuit(v, stk, map, circuits)) {
                    found_circuit = true;
                }
            }
        }

        if (found_circuit) {
            johnson_unblock(obj_info);
        }
        else {
            for (var k in obj) {
                // ignore edges whose keys start with digits
                if (begin_digit.test(k)) continue;
                var v: Object = obj[k];
                var v_info = map.get(v);
                // skip edges not part of this connected component
                if (!v_info) continue;

                if (!v_info.next_blocked.has(obj_info)) {
                    v_info.next_blocked.add(obj_info);
                }
            }
        }

        stk.pop();

        return found_circuit;
    }

    function johnson(components: Object[][], size: number): Object[][] {
        // find all circuits in the graph
        var circuits: Object[][] = [];
        var stk: Object[] = [];
        var map = new Map<Object, johnsonNode>();

        for (var i = 0; i < components.length; i++) {
            var component = components[i];
            // skip components smaller than size
            if (component.length < size) continue;

            // set-up map for this component
            for (var j = 0; j < component.length; j++) {
                var obj = component[j];
                map.set(obj, {
                    blocked: false,
                    next_blocked: new Set()
                });
            }

            // find circuits in this component
            for (var j = 0; j < component.length; j++) {
                var obj = component[j];
                // only examine sub-components at least as big as size
                if (component.length - j < size) break;
                // reset map
                for (var k = j; k < component.length; k++) {
                    var v = component[k];
                    var v_info = map.get(v);
                    v_info.blocked = false;
                    v_info.next_blocked.clear();
                }
                // find circuits
                johnson_circuit(obj, stk, map, circuits);
                // remove finished node
                map.delete(obj);
            }
            // remove component from map
            map.clear();
        }
        return circuits;
    }

    export function find_cycles(root: Object, size: number, blacklist: string[]): Object[][] {
        // find circular paths of length >= size via depth first search

        // ensure the blacklist exists
        blacklist = blacklist || [];

        var found: Object[][];
        // find strongly connected components
        found = tarjan(root, blacklist);
        // find circuits in strongly connected components
        found = johnson(found, size);

        return found;
    }

}
