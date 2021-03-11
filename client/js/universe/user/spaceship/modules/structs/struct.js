import Module from "../Module.js";

class Struct extends Module {
	constructor(world, owner, spaceship, id, position, meta, angle) {
		super(world, owner, spaceship, id, position, meta, angle);
		
		this.class = "regular";
		this.code  = "0";
	}
}

class T1 extends Struct {
	constructor(world, owner, spaceship, id, position, meta, angle) {
		super(world, owner, spaceship, id, position, meta, angle);
		
		this.category = "T1";
		// TODO: add prop `category_description` whenever this is accessed, and load from `module.categories`
	}
}

export default Struct;
export {
	T1
};