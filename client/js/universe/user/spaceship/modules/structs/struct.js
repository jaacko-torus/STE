import Module from "../Module.js";

class Struct extends Module {
	constructor(world, owner, spaceship, id, position, meta, angle) {
		super(world, owner, spaceship, id, position, meta, angle);
	}
}

class T1 extends Struct {
	category = "T1";
	
	constructor(world, owner, spaceship, id, position, meta, angle) {
		super(world, owner, spaceship, id, position, meta, angle);
		
		// TODO: add prop `category_description` whenever this is accessed, and load from `module.categories`
	}
}

export default Struct;
export {
	T1
};