function map_set(
	{map, key, val} : { map : Map<any, any>, key : any, val : any },
	overwrite : boolean = true
) {
	// TODO: throw error if couldn't overwrite
	if (!overwrite && map.has(key)) {
		console.log(`Can't overwrite ${map.get(key)} with ${val}`);
		return false;
	} else {
		map.set(key, val);
		return true;
	}
}

export {
	map_set
};