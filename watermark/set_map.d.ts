
declare class Set<K> {
	size: number;
	constructor();
	add(obj: K): Set<K>;
	has(obj: K): boolean;
	delete(obj: K): boolean;
	keys(): K[];
	values(): K[];
	new ();
}

declare class Map<K, V> {
	size: number;
	constructor();
	set(key: K, value: V): Map<K, V>;
	get(key: K): V;
	delete(key: K): V;
	keys(): K[];
	values(): V[];
	new ();
}
