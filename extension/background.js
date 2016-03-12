var applier = 
"/// <reference path=\"set_map.d.ts\" />\n/// <reference path=\"./cyclicgraph.d.ts\" />\nvar permutationgraph;\n(function (permutationgraph_1) {\n    \"use strict\";\n    class permutationgraphnode {\n        constructor(id) {\n            this.id = id;\n            this.alias = [];\n            this.alias_obj = [];\n            this.dist = Infinity;\n            this.built = Infinity;\n            this.outbound_edges = [];\n            this.inbound_edges = [];\n        }\n        alias_index(context) {\n            var index = -1;\n            for (var k in context) {\n                var v = context[k];\n                index = this.alias_obj.indexOf(v);\n                if (index >= 0) {\n                    break;\n                }\n            }\n            return index;\n        }\n        alias_object(context) {\n            var i = this.alias_index(context);\n            if (i >= 0)\n                return this.alias_obj[i];\n            else\n                return null;\n        }\n        alias_string(context) {\n            var i = this.alias_index(context);\n            if (i >= 0)\n                return this.alias[i];\n            else\n                return '';\n        }\n    }\n    permutationgraph_1.permutationgraphnode = permutationgraphnode;\n    class permutationgraphedge {\n        constructor(origin, destination) {\n            this.alias = '';\n            this.built = Infinity;\n            this.backbone = false;\n            this.destination = destination;\n            this.origin = origin;\n        }\n    }\n    permutationgraph_1.permutationgraphedge = permutationgraphedge;\n    class permutationgraph {\n        constructor(num, size) {\n            if (num < 0)\n                throw (\"Invalid number\");\n            this.num = num;\n            // find minimal size to fit number\n            var min_size = permutationgraph.num_size(num) + 1;\n            this.size = size || min_size;\n            // must have at least size one greater than necessary, to ensure permutation begins with 0\n            if (this.size < min_size)\n                throw \"Size \" + this.size + \" Too small for number \" + this.num;\n            this.makenodes();\n            // make nodes before edges\n            this.makeedges();\n        }\n        // calculates factorial and stores intermediate results in fact\n        static factorial(n) {\n            if (!permutationgraph.fact) {\n                permutationgraph.fact = [1];\n            }\n            for (var i = permutationgraph.fact.length; i <= n; i++) {\n                permutationgraph.fact[i] = i * permutationgraph.fact[i - 1];\n            }\n            return permutationgraph.fact[n];\n        }\n        static findnums(cycles) {\n            // find all numbers represented by permutation graphs in cycles\n            var nums = [];\n            for (var i = 0; i < cycles.length; i++) {\n                var backbone = cycles[i];\n                var perm = permutationgraph.backbone_to_perm(backbone);\n                if (perm) {\n                    nums.push(permutationgraph.fact_to_num(permutationgraph.perm_to_fact(perm)));\n                    console.log('found watermark number: ' + nums[nums.length - 1] + ' (size: ' + perm.length + ')');\n                }\n            }\n            return nums;\n        }\n        static backbone_to_perm(backbone) {\n            // check backbone valid if so return permutation represented\n            // else null\n            var begin_digit = /^\\d/;\n            var size = backbone.length;\n            var perm = [];\n            var i;\n            var i_zero = -1;\n            // console.log(backbone.length, backbone)\n            for (i = 0; i < size; i++) {\n                var obj = backbone[i];\n                var val = 0;\n                for (var k in obj) {\n                    var other = obj[k];\n                    var j = backbone.indexOf(other);\n                    if (j >= 0) {\n                        // other in backbone\n                        if (j == i) {\n                            // invalid graph, no nodes link to themselves\n                            // console.log(\"self link, discarding backbone\");\n                            return null;\n                        }\n                        if (begin_digit.test(k)) {\n                            // data link, record value\n                            if (j > i) {\n                                val = j - i;\n                            }\n                            else if (j < i) {\n                                val = size + j - i;\n                            }\n                        }\n                    }\n                }\n                if (val == 0) {\n                    i_zero = i;\n                }\n                if (perm.indexOf(val) >= 0) {\n                    // already found this edge, invalid permutation graph\n                    // console.log(\"invalid permutation, number repeated\", perm);\n                    return null;\n                }\n                perm.push(val);\n            }\n            if (i_zero < 0) {\n                // console.log(\"invalid permutation, no zero node\");\n                return null; // should never happen\n            }\n            var perm_reordered = [];\n            for (i = 1; i <= size; ++i) {\n                perm_reordered.push(perm[(i + i_zero) % size]);\n            }\n            return perm_reordered;\n        }\n        static num_size(num) {\n            var size = 1;\n            while (num >= permutationgraph.factorial(size)) {\n                size += 1;\n            }\n            return size;\n        }\n        static num_to_fact(num, size) {\n            var fact = [];\n            for (var i = (size || permutationgraph.num_size(num)) - 1; i >= 0; i--) {\n                fact[i] = Math.floor(num / permutationgraph.factorial(i));\n                num -= fact[i] * permutationgraph.factorial(i);\n            }\n            return fact;\n        }\n        static fact_to_num(fact) {\n            var num = 0;\n            for (var i = 0; i < fact.length; i++) {\n                num += fact[i] * permutationgraph.factorial(i);\n            }\n            return num;\n        }\n        // takes an array representing a fact and turns it into the\n        // permutation representation of the factorial number\n        static fact_to_perm(fact) {\n            var perm = fact.slice();\n            for (var i = 1; i < perm.length; i++) {\n                for (var j = 0; j < i; j++) {\n                    if (perm[j] >= perm[i]) {\n                        perm[j]++;\n                    }\n                }\n            }\n            return perm;\n        }\n        // takes an array representing a permutation and turns it into the\n        // factorial representation of the permutation\n        static perm_to_fact(perm) {\n            var fact = perm.slice();\n            for (var i = fact.length - 1; i > 0; i--) {\n                for (var j = 0; j < i; j++) {\n                    if (fact[j] > fact[i]) {\n                        fact[j]--;\n                    }\n                }\n            }\n            return fact;\n        }\n        makenodes() {\n            this.nodes = [];\n            // make nodes\n            for (var i = 0; i < this.size; ++i) {\n                this.nodes.push(new permutationgraphnode(i));\n            }\n        }\n        add_edge(source, destination, backbone) {\n            var edge = new permutationgraphedge(source, destination);\n            edge.backbone = backbone;\n            source.outbound_edges.push(edge);\n            destination.inbound_edges.push(edge);\n            this.num_edges++;\n        }\n        makeedges() {\n            this.num_edges = 0;\n            var size = this.size;\n            var nodes = this.nodes;\n            var perm = permutationgraph.fact_to_perm(permutationgraph.num_to_fact(this.num, this.size));\n            for (var i = 0; i < size; i++) {\n                // make backbone edges\n                this.add_edge(nodes[i], nodes[(i + 1) % size], true);\n                var dest = (i + perm[i]) % size;\n                if (i != dest) {\n                    // edge is not representing zero\n                    this.add_edge(nodes[i], nodes[dest], false);\n                }\n            }\n        }\n        get_node(id) {\n            return this.nodes[id];\n        }\n    }\n    permutationgraph_1.permutationgraph = permutationgraph;\n})(permutationgraph || (permutationgraph = {}));\n/// <reference path=\"./set_map.d.ts\" />\n/// <reference path=\"./cyclicgraph.d.ts\" />\nvar cyclicgraphinstructions;\n(function (cyclicgraphinstructions_1) {\n    \"use strict\";\n    class cyclicgraphinstructions {\n        constructor(graph) {\n            this.graph = graph;\n            this.size = graph.num_edges + 1;\n            this.fringe_edge = new Set();\n        }\n        // breadth randomely\n        possible(nodes) {\n            var fringe = [];\n            for (var i in nodes) {\n                var edges = nodes[i].outbound_edges;\n                for (var j in edges) {\n                    var e = edges[j];\n                    if (e.built >= Infinity) {\n                        fringe.push(e);\n                    }\n                }\n            }\n            return fringe;\n        }\n        reset_dist() {\n            for (var i in this.graph.nodes) {\n                this.graph.nodes[i].dist = Infinity;\n            }\n        }\n        fringe_add_all(fringe) {\n            for (var i in this.graph.nodes) {\n                fringe.add(this.graph.nodes[i]);\n            }\n        }\n        fringe_min(fringe) {\n            var obj = undefined;\n            var d = Infinity;\n            for (var v of fringe.values()) {\n                if (v.dist < d) {\n                    d = v.dist;\n                    obj = v;\n                }\n            }\n            return obj;\n        }\n        shortest_path(node, context, instruction) {\n            if (context.length == 0) {\n                return [];\n            }\n            this.reset_dist();\n            var fringe = new Set();\n            fringe.add(node);\n            node.dist = 0;\n            var path = [];\n            while (fringe.size > 0) {\n                // find min, remove from fringe\n                var n = this.fringe_min(fringe);\n                fringe.delete(n);\n                var obj = n.alias_object(context);\n                if (obj) {\n                    path.first = n;\n                    path.first_obj = obj;\n                    break; // found\n                }\n                // update\n                for (var j in n.inbound_edges) {\n                    var e = n.inbound_edges[j];\n                    if (e.built < instruction && e.origin.built < instruction && e.origin.dist > n.dist + 1) {\n                        // add on first encounter\n                        if (!fringe.has(e.origin))\n                            fringe.add(e.origin);\n                        e.origin.dist = n.dist + 1;\n                    }\n                }\n            }\n            if (!path.first)\n                return path;\n            var closest = path.first;\n            while (closest.dist > 0) {\n                for (var i in closest.outbound_edges) {\n                    var e = closest.outbound_edges[i];\n                    if (e.destination.dist == closest.dist - 1) {\n                        closest = e.destination;\n                        path.push(e);\n                        break;\n                    }\n                }\n            }\n            return path;\n        }\n        path_to_alias(path) {\n            var alias = '';\n            if (path.first_obj) {\n                alias += path.first.alias_string([path.first_obj]);\n            }\n            for (var i = 0; i < path.length; i++) {\n                alias += path[i].alias;\n            }\n            return alias;\n        }\n        get_alias(node, context, instruction) {\n            var ali = node.alias_string(context);\n            if (ali) {\n                return ali;\n            }\n            else {\n                return this.path_to_alias(this.shortest_path(node, context, instruction));\n            }\n        }\n        add_edges_fringe(node) {\n            for (var k in node.outbound_edges) {\n                var edge = node.outbound_edges[k];\n                if (edge.built >= Infinity)\n                    this.fringe_edge.add(edge);\n            }\n        }\n        remove_edge_fringe(edge) {\n            if (this.fringe_edge.has(edge))\n                this.fringe_edge.delete(edge);\n        }\n        add_node_alias(node, obj, alias) {\n            node.alias.push(alias);\n            node.alias_obj.push(obj);\n        }\n        remove_node_alias(node, obj) {\n            var i = node.alias_obj.indexOf(obj);\n            while (i >= 0) {\n                node.alias_obj.splice(i, 1);\n                node.alias.splice(i, 1);\n                i = node.alias_obj.indexOf(obj);\n            }\n        }\n        consume_node(node, instruction) {\n            if (node.built >= Infinity) {\n                node.built = instruction;\n                this.add_edges_fringe(node);\n            }\n        }\n        consume_edge(edge, alias, instruction) {\n            edge.built = instruction;\n            edge.alias = alias;\n            this.remove_edge_fringe(edge);\n        }\n    }\n    cyclicgraphinstructions_1.cyclicgraphinstructions = cyclicgraphinstructions;\n})(cyclicgraphinstructions || (cyclicgraphinstructions = {}));\n/// <reference path=\"./set_map.d.ts\" />\n/// <reference path=\"./cyclicgraphinstructions.ts\" />\nvar cyclicgraphinserter;\n(function (cyclicgraphinserter_1) {\n    \"use strict\";\n    class cyclicgraphinserter {\n        constructor(instructions) {\n            this.instructions = instructions;\n        }\n        static rand_from_array(col) {\n            var i = Math.floor(Math.random() * col.length);\n            return col[i];\n        }\n        static rand_from_obj(obj) {\n            var keys = Object.keys(obj);\n            var key = cyclicgraphinserter.rand_from_array(keys);\n            var value = obj[key];\n            return { 'key': key, 'value': value };\n        }\n        static rand_from_set(set) {\n            var m = Math.floor(Math.random() * set.size);\n            var i = 0;\n            var thing;\n            for (let item of set) {\n                if (i == m) {\n                    thing = item;\n                    break;\n                }\n                i++;\n            }\n            return thing;\n        }\n        add_inst_to_common_context(inst, obj) {\n            var context = this.common_context.get(obj);\n            if (context) {\n                context.push(inst);\n            }\n            else {\n                context = [inst];\n                context.obj = obj;\n                this.common_context.set(obj, context);\n            }\n        }\n        construct_common_contexts(trace) {\n            this.common_context = new Map();\n            for (var inst = 0; inst < trace.length; inst++) {\n                var context = trace[inst].context;\n                var keys = Object.keys(context);\n                if (keys.length == 0) {\n                    this.add_inst_to_common_context(inst, null);\n                }\n                for (var key in keys) {\n                    this.add_inst_to_common_context(inst, context[key]);\n                }\n            }\n        }\n        assign_code_sites(trace) {\n            var ordered_contexts = [];\n            for (var val of this.common_context.values()) {\n                ordered_contexts.push(val);\n            }\n            // sort decreasing order by length\n            // with lonely contexts at the end (contexts without any objects ///jsw (blank))\n            ordered_contexts.sort(function (a, b) {\n                return (b.obj ? b.length : 0) - (a.obj ? a.length : 0);\n            });\n            this.chosen_contexts = [];\n            this.chosen_contexts.size = 0;\n            var num_instruct = this.instructions.size;\n            var used_instances = new Set();\n            for (var c = 0; c < ordered_contexts.length; c++) {\n                var used_locations = new Set();\n                var common_context = ordered_contexts[c];\n                var chosen_context = [];\n                chosen_context.obj = common_context.obj;\n                this.chosen_contexts.push(chosen_context);\n                for (var j = 0; j < common_context.length; j++) {\n                    var inst = common_context[j];\n                    // check if instance already used\n                    if (used_instances.has(inst))\n                        continue;\n                    else\n                        used_instances.add(inst);\n                    var loc = trace[inst].location;\n                    // check if location used already\n                    if (used_locations.has(loc))\n                        continue;\n                    else\n                        used_locations.add(loc);\n                    // new location to add code\n                    chosen_context.push(inst);\n                    if (++this.chosen_contexts.size >= num_instruct) {\n                        break; // more sites than instructions, stop\n                    }\n                }\n            }\n        }\n        static num_instruct(i, n, p) {\n            var m = Math.floor(n / p);\n            if (i < n - m * p)\n                m++;\n            return m;\n        }\n        static get_obj_alias(obj) {\n            var alias = '';\n            var keys = Object.keys(obj);\n            while (!alias) {\n                alias = cyclicgraphinserter.rand_from_array(cyclicgraphinserter.dictionary);\n                if (keys.indexOf(alias) >= 0)\n                    alias = '';\n            }\n            return '.' + alias;\n        }\n        static get_edge_alias(edge) {\n            var alias = '';\n            if (edge.backbone) {\n                // find name\n                while (!alias) {\n                    alias = cyclicgraphinserter.rand_from_array(cyclicgraphinserter.dictionary);\n                    for (var k in edge.origin.outbound_edges) {\n                        var e = edge.origin.outbound_edges[k];\n                        if (e.alias === alias) {\n                            alias = '';\n                            break;\n                        }\n                    }\n                }\n                alias = '.' + alias;\n            }\n            else {\n                // give number\n                var n = 0;\n                while (!alias) {\n                    alias = \"[\" + n + \"]\";\n                    for (var k in edge.origin.outbound_edges) {\n                        var e = edge.origin.outbound_edges[k];\n                        if (e.alias === alias) {\n                            alias = '';\n                            n++;\n                            break;\n                        }\n                    }\n                }\n            }\n            return alias;\n        }\n        static code_from_idiom(check, set) {\n            var code = '';\n            if (check) {\n                code += \"if (\" + check + \") {\\n\";\n                code += \"\\t\" + set + \"\\n\";\n                code += \"}\\n\";\n            }\n            else {\n                code += set + \"\\n\";\n            }\n            return code;\n        }\n        static path_get_check(path, checked) {\n            if (!path.first)\n                return '';\n            var code = '';\n            var part = '';\n            part += path.first.alias_string([path.first_obj]);\n            if (checked.get(path.first_obj) != path.first) {\n                code += part;\n                checked.set(path.first_obj, path.first); // checking external alias node now\n            }\n            for (var i = 0; i < path.length; i++) {\n                var edge = path[i];\n                part += edge.alias;\n                if (!checked.get(edge)) {\n                    code += (code ? ' && ' : '') + part;\n                    checked.set(edge, true); // checking edge now\n                }\n            }\n            return code;\n        }\n        static path_set_check(path, checked) {\n            if (!path.first)\n                return '';\n            var code = '';\n            var part = '';\n            part += path.first.alias_string([path.first_obj]);\n            if (checked.get(path.first_obj) != path.first) {\n                code += part;\n                checked.set(path.first_obj, path.first); // checking external alias node now\n            }\n            for (var i = 0; i < path.length - 1; i++) {\n                var edge = path[i];\n                part += edge.alias;\n                if (!checked.get(edge)) {\n                    code += (code ? ' && ' : '') + part;\n                    checked.set(edge, true); // checking edge now\n                }\n            }\n            if (path.length == 0) {\n                // making edge from external object to a node, always check\n                checked.set(path.first, true); // making node now\n                code = '!' + part;\n            }\n            else {\n                // making edge from node to node\n                var edge = path[i];\n                part += edge.alias;\n                if (!checked.get(edge.origin)) {\n                    // no need to check edges of nodes made during these instructions\n                    code += (code ? ' && ' : '') + '!' + part;\n                }\n                checked.set(edge, true); // making edge now\n                checked.set(edge.destination, true); // making node now\n            }\n            return code;\n        }\n        static path_code(path) {\n            if (!path.first)\n                return '';\n            var code = '';\n            code += path.first.alias_string([path.first_obj]);\n            for (var i = 0; i < path.length; i++) {\n                var edge = path[i];\n                code += edge.alias;\n            }\n            return code;\n        }\n        // must be called after appropriate aliases are added\n        static code_new_node(path_set, checked) {\n            var code = '';\n            var check = cyclicgraphinserter.path_set_check(path_set, checked);\n            var set = cyclicgraphinserter.path_code(path_set);\n            set += ' = {};\\n';\n            return { 'check': check, 'set': set };\n        }\n        // must be called after appropriate aliases are added\n        static code_new_edge(path_get, path_set, checked) {\n            var code = '';\n            // TODO combine paths and checks\n            var set_check = cyclicgraphinserter.path_set_check(path_set, checked);\n            var get_check = cyclicgraphinserter.path_get_check(path_get, checked);\n            var set = cyclicgraphinserter.path_code(path_set);\n            var get = cyclicgraphinserter.path_code(path_get);\n            var check = set_check + (set_check && get_check ? ' && ' : '') + get_check;\n            set += ' = ' + get + ';\\n';\n            return { 'check': check, 'set': set };\n        }\n        code_instructions(instructions, location) {\n            var code = (this.loc_code[location] || '');\n            var check = '';\n            var set = '';\n            var checked = new Map();\n            for (var i = 0; i < instructions.length; i++) {\n                var instruct = instructions[i];\n                var cs;\n                if (instruct.path_get) {\n                    cs = cyclicgraphinserter.code_new_edge(instruct.path_get, instruct.path_set, checked);\n                }\n                else {\n                    cs = cyclicgraphinserter.code_new_node(instruct.path_set, checked);\n                }\n                if (cs.check)\n                    check += (check ? ' && ' : '') + cs.check;\n                set += cs.set;\n            }\n            code += cyclicgraphinserter.code_from_idiom(check, set);\n            this.loc_code[location] = code;\n            // TODO add context alias\n        }\n        add_node(edge, trace, inst, instruction) {\n            var context = inst.context;\n            var glob = cyclicgraphinserter.rand_from_obj(trace.global_context);\n            var path_set;\n            if (edge) {\n                var node = edge.destination;\n                var alias = cyclicgraphinserter.get_edge_alias(edge);\n                // consume and alias edge and node, forcing edge to be used (only valid path to node)\n                this.instructions.consume_edge(edge, alias, instruction);\n                this.instructions.consume_node(node, instruction);\n                // find path to node\n                path_set = this.instructions.shortest_path(node, [context], instruction);\n                if (!path_set.first)\n                    path_set = this.instructions.shortest_path(node, [glob.value], instruction);\n            }\n            else {\n                var node = this.instructions.graph.nodes[0];\n                var node = this.instructions.graph.nodes[0];\n                // generate alias for node\n                var alias = cyclicgraphinserter.get_obj_alias(glob.value);\n                // add alias before finding path\n                this.instructions.add_node_alias(node, glob.value, glob.key + alias);\n                this.instructions.consume_node(node, instruction);\n                // find path to node\n                path_set = this.instructions.shortest_path(node, [glob.value], instruction);\n            }\n            return {\n                path_get: null,\n                path_set: path_set\n            };\n        }\n        add_edge(edge, trace, inst, instruction) {\n            var context = inst.context;\n            var glob = cyclicgraphinserter.rand_from_obj(trace.global_context);\n            var origin = edge.origin;\n            var destination = edge.destination;\n            var path_get = this.instructions.shortest_path(destination, [inst.context], instruction);\n            if (!path_get.first)\n                path_get = this.instructions.shortest_path(destination, [glob.value], instruction);\n            var path_set = this.instructions.shortest_path(origin, [inst.context], instruction);\n            if (!path_set.first)\n                path_set = this.instructions.shortest_path(origin, [glob.value], instruction);\n            // add edge to end of set path\n            path_set.push(edge);\n            // alias and consume after finding a path, path will never use edge\n            var alias = cyclicgraphinserter.get_edge_alias(edge);\n            // consume and alias edge\n            this.instructions.consume_edge(edge, alias, instruction);\n            return {\n                path_get: path_get,\n                path_set: path_set\n            };\n        }\n        handle_instance(trace, inst, instruction) {\n            var num_instruct = cyclicgraphinserter.num_instruct(instruction, this.instructions.size, this.chosen_contexts.size);\n            if (num_instruct <= 0)\n                return;\n            var instructions = [];\n            for (var num_done = 0; num_done < num_instruct; num_done++) {\n                if (instruction == 0 && num_done == 0) {\n                    // make first node\n                    instructions.push(this.add_node(null, trace, inst, instruction));\n                }\n                else {\n                    var edge = cyclicgraphinserter.rand_from_set(this.instructions.fringe_edge);\n                    if (edge.destination.built < instruction) {\n                        // make edge only\n                        instructions.push(this.add_edge(edge, trace, inst, instruction));\n                    }\n                    else {\n                        // make edge to new node\n                        instructions.push(this.add_node(edge, trace, inst, instruction));\n                    }\n                }\n            }\n            this.code_instructions(instructions, trace[inst.instance].location);\n        }\n        construct_site_code(trace) {\n            this.construct_common_contexts(trace);\n            this.assign_code_sites(trace);\n            this.chosen_instances = [];\n            for (var i = 0; i < this.chosen_contexts.length; i++) {\n                var context = this.chosen_contexts[i];\n                for (var j = 0; j < context.length; j++) {\n                    this.chosen_instances.push({ 'instance': context[j], 'context': context.obj });\n                }\n            }\n            // sort in increasing order\n            this.chosen_instances.sort(function (a, b) {\n                return a.instance - b.instance;\n            });\n            this.loc_code = [];\n            // handle instances in order\n            for (var instruction = 0; instruction < this.chosen_instances.length; instruction++) {\n                var inst = this.chosen_instances[instruction];\n                this.handle_instance(trace, inst, instruction);\n            }\n        }\n        insert(trace) {\n            var this_ = this;\n            this.construct_site_code(trace);\n            this.count = 0;\n            return trace.orig_code.replace(/\\/\\/\\/jsw.*/g, function replace(code) {\n                if (code.indexOf(\"///jsw_end\") == 0) {\n                    return '';\n                }\n                else if (code.indexOf(\"///jsw_global\") == 0) {\n                    return '';\n                }\n                else {\n                    return this_.loc_code[this_.count++] || '';\n                }\n            });\n        }\n        ;\n    }\n    cyclicgraphinserter.dictionary = [\n        'next',\n        'prev',\n        'previous',\n        'self',\n        'mpx',\n        'stack',\n        'tree',\n        'heap',\n        'other',\n        'tmp',\n        'value',\n        'check',\n        'result',\n        'status',\n        'current',\n        'last',\n        'pos',\n        'rest',\n        'before',\n        'after',\n        'gry',\n        'car',\n        'cdr',\n        'head',\n        'aware',\n        'miyabi',\n        'yugen',\n        'wabi',\n        'sabi',\n        'tsukimi'\n    ];\n    cyclicgraphinserter_1.cyclicgraphinserter = cyclicgraphinserter;\n})(cyclicgraphinserter || (cyclicgraphinserter = {}));\n/// <reference path=\"./permutationgraph.ts\" />\n/// <reference path=\"./cyclicgraphinstructions.ts\" />\n/// <reference path=\"./cyclicgraphinserter.ts\" />\nvar watermarkapplier;\n(function (watermarkapplier) {\n    \"use strict\";\n    function apply_watermark(trace) {\n        var graph = new permutationgraph.permutationgraph(trace.watermark_num, trace.watermark_size);\n        var inst = new cyclicgraphinstructions.cyclicgraphinstructions(graph);\n        var inserter = new cyclicgraphinserter.cyclicgraphinserter(inst);\n        var code = inserter.insert(trace);\n        console.log(code);\n        var mime = \"application/javascript\";\n        var bb = new Blob([code], { type: mime });\n        var url = window.URL.createObjectURL(bb);\n        // use any to avoid compile time errors over HTML5\n        var a = document.createElement('a');\n        a.download = trace.file_name;\n        a.href = url;\n        a.textContent = 'Watermark ready';\n        a.dataset.downloadurl = [mime, a.download, a.href].join(':');\n        a.draggable = true;\n        a.style.position = 'fixed';\n        a.style.left = '0px';\n        a.style.top = '0px';\n        document.body.appendChild(a);\n    }\n    watermarkapplier.apply_watermark = apply_watermark;\n})(watermarkapplier || (watermarkapplier = {}));\n";

var preprocess;
(function (preprocess_1) {
    "use strict";
    var count;
    // TODO verify validity of identifiers
    function replace_identifier(identifier) {
        identifier = identifier.replace(/,$/, ''); // remove trailing comma
        return "'" + identifier + "':" + identifier + ',';
    }
    function replace_jsw_default(code) {
        code = code.substring(6).trim();
        code = code.replace(/\w+,?/g, replace_identifier);
        code = code.replace(/,$/, ''); // remove trailing comma
        return "trace_stack.push({location:" + count++ + ",context:{" + code + "}});";
    }
    function replace_jsw_global(code) {
        code = code.substring(13).trim();
        code = code.replace(/\w+,?/g, replace_identifier);
        code = code.replace(/,$/, ''); // remove trailing comma
        return "trace_stack.global_context = {" + code + "};";
    }
    function replace_jsw_end(code) {
        return "window.onload = function() { trace_stack.watermark(trace_stack); }";
    }
    function replace_jsw(code) {
        if (code.indexOf("///jsw_end") == 0) {
            return replace_jsw_end(code);
        }
        else if (code.indexOf("///jsw_global") == 0) {
            return replace_jsw_global(code);
        }
        else {
            return replace_jsw_default(code);
        }
    }
    function preprocess(code, header) {
        count = 0;
        // var orig_code = code;
        // match ///jsw to end of line
        code = code.replace(/\/\/\/jsw.*/g, replace_jsw);
        return (header || "") + code;
    }
    function apply_preprocessor(abs_fname, code, num, size) {
    	var fname = abs_fname.replace(/^.*\//, '');
	    fname = fname.replace('.pp', '');
	    fname = fname.replace('.jsw', '');
	    var watermarkapplier = applier || '';
	    var header = watermarkapplier + "\n"
	        + "var trace_stack = [];\n"
	        + "trace_stack.watermark_num = " + JSON.stringify(num) + ";\n"
	        + "trace_stack.watermark_size = " + JSON.stringify(size) + ";\n"
	        + "trace_stack.watermark = watermarkapplier.apply_watermark;\n"
	        + "trace_stack.file_name = " + JSON.stringify(fname) + ";\n"
	        + "trace_stack.orig_code = " + JSON.stringify(code) + ";\n";
	    code = preprocess(code, header);
	    return code + "\n";
	}
	preprocess_1.apply_preprocessor = apply_preprocessor;
})(preprocess || (preprocess = {}));



var jsw_scripts = {};
var jsw_blobs = [];
var watermarked_blobs = [];

var tabid;
var input_number;
var input_size;

function redirect_preprocessed_scripts(details) {
	var new_url = jsw_scripts[details.url] || details.url;

	console.log(details.url + " => " + new_url);

	return {redirectUrl: new_url};
}

// localStorage scripts is an array of {url, file_name}
function store_script(script, file) {
	// store script into a blob
	var mime = "application/javascript";
	var script_blob = new Blob([script], { type: mime });
	watermarked_blobs.push(script_blob); // stop blob being garbage collected
	var blob_url = window.URL.createObjectURL(script_blob);
	// store reference to blob in localStorage
	var stored_scripts = JSON.parse(localStorage["scripts"] || '[]');
	stored_scripts.push({url: blob_url, file_name: file});
	localStorage["scripts"] = JSON.stringify(stored_scripts);

	if (jsw_blobs.length == watermarked_blobs.length) {
		// remove webRequest listener when done
		chrome.webRequest.onBeforeRequest.removeListener(
	        redirect_preprocessed_scripts);
	}
}

function rediect_jswpp_scripts() {
	// add a listener to redirect http requests for .jsw.pp.js scripts
	chrome.webRequest.onBeforeRequest.addListener(
        redirect_preprocessed_scripts,
        {urls: ["*://*/*.jsw.pp.js"],
    	 tabId: tabid},
        ["blocking"]);

	// clear cache forcing sending of http requests
	chrome.webRequest.handlerBehaviorChanged();

	// reload the tab and insert scripts to insert the watermark
	chrome.tabs.reload(tabid, function () {
		chrome.tabs.executeScript(null,
						{	file: "insert_content.js",
							allFrames: true
						});
	});
}

function preprocess_scripts(scripts) {
	jsw_scripts = {};
	jsw_blobs = [];
	watermarked_blobs = [];
	for (var i = 0; i < scripts.length; i++) {
		var script_url = scripts[i];
		// find and preprocess scripts
		var xhr = new XMLHttpRequest();

		xhr.open("GET", script_url, false);
		xhr.send();

		var script = xhr.responseText;

		console.log(script);
		console.log("=============================");

		// preprocess script
		script = preprocess.apply_preprocessor(script_url, script, input_number, input_size);

		console.log(script);


		var mime = "application/javascript";
		var jsw_script_blob = new Blob([script], { type: mime });
		jsw_blobs.push(jsw_script_blob); // stop blob being garbage collected

		var blob_url = window.URL.createObjectURL(jsw_script_blob);

		jsw_scripts[script_url] = blob_url;
	}
	
	localStorage["jsw_scripts"] = JSON.stringify(jsw_scripts);
}

function find_jswpp_scripts() {
	chrome.tabs.sendMessage(tabid, 
			{ from: 'jsw_background', 
			  method: 'find_jswpp_scripts'
			});
}

function do_insert_watermark() {
	chrome.tabs.sendMessage(tabid, 
			{ from: 'jsw_background', 
			  method: 'insert_watermark',
			  number: input_number,
			  size: input_size
			});
}

function insert_find_jswpp_scripts_code() {
	
	// check if content script already loaded
	chrome.tabs.sendMessage(tabid, { from: 'jsw_background', method: 'check_insert_content_loaded'},
		function(response) {
			if (response) {
				// console.log("content script already added");
				// find_jswpp_scripts();
				do_insert_watermark();
			} else {
				// console.log("adding content script");
				// execute content script in tab
				chrome.tabs.executeScript(null,
							{	file: "insert_content.js",
								allFrames: true
							},
							// find_jswpp_scripts
							do_insert_watermark
							);
			}
		});
}



function find_watermark() {
	// find the watermarks
	// console.log("trying to find watermarks");
	chrome.tabs.sendMessage(tabid, { from: 'jsw_background', method: 'find_watermarks', watermark_size: input_size });
}

function insert_find_watermark_code() {
	
	// check if content script already loaded
	chrome.tabs.sendMessage(tabid, { from: 'jsw_background', method: 'check_find_content_loaded'},
		function(response) {
			if (response) {
				// console.log("content script already added");
				find_watermark();
			} else {
				// console.log("adding content script");
				// execute content script in tab
				chrome.tabs.executeScript(null,
						{	file: "find_content.js",
							allFrames: true
						},
						find_watermark);
			}
		});
}



// handle messages
chrome.runtime.onMessage.addListener(function(msg, sender, response) {
	if (msg.from === 'jsw_popup') {
		// messages from popup
		if (msg.method === 'find_watermark') {
			tabid = msg.tabid;
			input_size = msg.size;
			insert_find_watermark_code();
		}
		else if (msg.method === 'insert_watermark') {
			tabid = msg.tabid;
			input_number = msg.number;
			input_size = msg.size;
			insert_find_jswpp_scripts_code();
		}
		else if (msg.method === 'clear_nums') {
			localStorage.removeItem("nums");
		}
		else if (msg.method === 'clear_scripts') {
			// remove watermarked scripts
			var scripts = JSON.parse(localStorage["scripts"] || '[]');
			for (var i = 0; i < scripts.length; i++) {
				var script = scripts[i];
				window.URL.revokeObjectURL(script.url);
			}
			localStorage.removeItem("scripts");
			// remove preprocessed scripts
			var jsw_script_blob_urls = JSON.parse(localStorage["jsw_scripts"] || '[]');
			for (var i = 0; i < jsw_script_blob_urls.length; i++) {
				var blob_url = jsw_script_blob_urls[i];
				window.URL.revokeObjectURL(blob_url);
			}
			localStorage.removeItem("jsw_scripts");
			// reset local vars
			jsw_scripts = {};
			jswpp_blobs = [];
			watermarked_blobs = [];
		}
	}
	else if (msg.from === 'jsw_find_content') {
		// messages from find_content script
		if (msg.method === "storeNums") {
	    	var stored_nums = JSON.parse(localStorage["nums"] || '[]');
	    	stored_nums = stored_nums.concat(JSON.parse(msg.arg));
			localStorage["nums"] = JSON.stringify(stored_nums);
	    }
	}
	else if (msg.from === 'jsw_insert_content') {
		// messages from insert_content script
		if (msg.method === "storeJswppScripts") {
	    	var jswpp_scripts = JSON.parse(msg.arg);
	    	preprocess_scripts(jswpp_scripts);
	    	rediect_jswpp_scripts();
	    }
	    else if (msg.method === "storeScript") {
	    	store_script(msg.arg, msg.file);
	    }
	    else if (msg.method === "open_popup") {
	    	chrome.tabs.create({url: "popup.html"});
	    }
	}
});
