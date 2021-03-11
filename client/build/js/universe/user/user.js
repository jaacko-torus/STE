import { add_to_list } from "./spaceship/modules/module.js";
import { universe } from "../universe.js";

class User {
	constructor(id, name) {
		this.name = name;
		
		this.spaceships = new Map();
		
		add_to_list(universe.users, id, this);
	}
}

export {
	User
};