
var root = {};

function trivial() {
	if (!root.tmp) {
	root.tmp = {};
}
if (root.tmp && !root.tmp.result) {
	root.tmp.result = {};
}
if (root.tmp && root.tmp.result && !root.tmp.result.next) {
	root.tmp.result.next = {};
}
if (root.tmp && root.tmp.result && root.tmp.result.next && !root.tmp.result.next[0] && root.tmp && root.tmp.result) {
	root.tmp.result.next[0] = root.tmp.result;
}
if (root.tmp && root.tmp.result && root.tmp.result.next && !root.tmp.result.next.a && root.tmp) {
	root.tmp.result.next.a = root.tmp;
}
if (root.tmp && root.tmp.result && !root.tmp.result[0] && root.tmp && root.tmp.result && root.tmp.result.next) {
	root.tmp.result[0] = root.tmp.result.next;
}

}

trivial();

