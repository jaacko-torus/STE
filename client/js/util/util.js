function map_set({map, key, val}, overwrite = true) {
	// TODO: throw error if couldn't overwrite
	if (!overwrite && map.has(id)) {
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