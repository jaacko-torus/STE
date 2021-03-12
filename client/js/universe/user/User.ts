import universe from "../universe.js";

import { map_set } from "../../util/util.js";

class User {
	name : string;
	spaceships = new Map();
	
	constructor(id : string, name : string) {
		this.name = name;
		
		map_set({
			map: universe.users,
			key: id,
			val: this
		});
	}
}

export default User;