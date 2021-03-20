import Capsule from "./user/spaceship/modules/capsules/Capsule";
import Module from "./user/spaceship/modules/Module";
import Spaceship from "./user/spaceship/Spaceship";
import User from "./user/User";

let universe = {
	modules: new Map<string, Module>(),
	users: new Map<string, User>(),
	
	capsules: new Map<string, Capsule>(),
	spaceships: new Map<string, Spaceship>()
};

export default universe;