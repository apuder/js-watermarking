
jsw_root = {};

function simple1(east) {
    if (!jsw_root.pos) {
	east.next = jsw_root.pos = {};
east.next.mpx = {};
east.next.mpx[0] = {};
east.next.mpx.wabi = east.next.mpx[0];
east.tsukimi = east.next.mpx.wabi[0] = {};
east.tsukimi.aware = {};
east.mpx = east.next.mpx.wabi.previous = {};
east.tsukimi[0] = {};
east.tsukimi.aware.miyabi = {};
east.mpx.rest = east.tsukimi;

}

}

function simple2(sneaky) {
    var south = {};
    if (sneaky.pos && sneaky.pos.mpx && sneaky.pos.mpx.wabi && sneaky.pos.mpx.wabi[0] && sneaky.pos.mpx.wabi[0].aware && sneaky.pos.mpx.wabi[0].aware.miyabi && !sneaky.pos.mpx.wabi[0].aware.miyabi.tree && sneaky.pos.mpx.wabi.previous && sneaky.pos.mpx.wabi[0][0] && !sneaky.pos.mpx.wabi[0][0][0] && sneaky.pos.mpx.wabi.previous.rest && !sneaky.pos.mpx.wabi.previous.rest.aware[0]) {
	south.miyabi = sneaky.pos.mpx.wabi[0].aware.miyabi.tree = {};
sneaky.tsukimi = sneaky.pos.mpx.wabi[0][0][0] = sneaky.pos.mpx.wabi.previous;
sneaky.tsukimi[0] = sneaky.tsukimi.rest.aware.miyabi;
south.tsukimi = sneaky.tsukimi.rest.aware[0] = {};
south.tsukimi[0] = sneaky.tsukimi;
sneaky.tsukimi[0][0] = sneaky.pos.mpx.wabi;
south.tsukimi.prev = {};
south.miyabi[0] = sneaky.tsukimi.rest;
south.miyabi.other = sneaky.tsukimi.rest[0];

}

}

function simple3(south) {
    var north = {};
    if (jsw_root.tsukimi && jsw_root.tsukimi.rest && jsw_root.tsukimi.rest[0] && !jsw_root.tsukimi.rest[0].tmp && jsw_root.tsukimi.rest.aware && jsw_root.tsukimi.rest.aware[0] && jsw_root.tsukimi.rest.aware[0].prev && !jsw_root.tsukimi.rest.aware[0].prev[0] && !jsw_root.tsukimi.rest.aware[0].prev.after && jsw_root.pos) {
	north.wabi = jsw_root.tsukimi.rest[0].tmp = {};
north.wabi[0] = jsw_root.tsukimi;
south.before = north.wabi[0].rest.aware[0].prev[0] = north.wabi[0];
north.wabi.cdr = south.before.rest.aware[0];
north.status = north.wabi.cdr.prev.after = {};
north.status.before = {};
north.status.before.next = jsw_root.pos;
north.status[0] = north.wabi.cdr.prev;
north.status.before[0] = north.status[0];

}

}

var west = {next: 1, two: 2, prev: {}};

simple1(west);
simple2(jsw_root);
simple3(west.prev);




