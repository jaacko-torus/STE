import Module from "../Module.js";

class Struct extends Module {
	constructor(
		world : Matter.World,
		owner : string,
		spaceship : string,
		id : string,
		position : { x : number, y : number, d : number },
		meta : { level : string, interval : string, size : number },
		angle : number
	) {
		super(world, owner, spaceship, id, position, meta, angle);
	}
}

class T1 extends Struct {
	category = "T1";
	
	constructor(
		world : Matter.World,
		owner : string,
		spaceship : string,
		id : string,
		position : { x : number, y : number, d : number },
		meta : { level : string, interval : string, size : number },
		angle : number
	) {
		super(world, owner, spaceship, id, position, meta, angle);
		
		// TODO: add prop `category_description` whenever this is accessed, and load from `module.categories`
	}
}

export default Struct;
export {
	T1
};