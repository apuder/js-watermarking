
jsw_root = {};

function simple1(east) {
    ///jsw east
}

function simple2(sneaky) {
    var south = {};
    ///jsw sneaky, south
}

function simple3(south) {
    var north = {};
    ///jsw south north
}

var west = {next: 1, two: 2, prev: {}};

simple1(west);
simple2(jsw_root);
simple3(west.prev);

///jsw_global jsw_root

///jsw_end
