import universe from "../../../../universe.js";

import Module from "../Module.js";

import { map_set } from "../../../../../util/util.js";

class Capsule extends Module {
	main = false;
	
	class = "regular";
	code  = "0";
	color = ["#00ff00", 0.5];
	
	input_keys = {
		left  : false,
		up    : false,
		right : false,
		down  : false
	};
	
	constructor(
		world : Matter.World,
		owner : string,
		spaceship : string,
		id : string,
		position : { x : number, y : number, d : number },
		meta : { main : boolean, level : string, interval : string, size : number },
		angle : number
	) {
		super(world, owner, spaceship, id, position, meta, angle);
		
		// this is necessary to avoid values like `1` or `"tom"` to get through
		if (meta.main === true) {
			this.main = true;
		}
		
		if (
			owner !== undefined &&
			spaceship !== undefined
		) {
			// FIXME: maybe make a function for this?
			universe.users.get(owner).spaceships.get(spaceship).input_keys =
				universe.users.get(owner).spaceships.get(spaceship).modules.get(id).input_keys;
			
			map_set({
				map: universe.users.get(owner).spaceships.get(spaceship).capsules,
				key: id,
				val: this
			});
		}
	}
	
	get speed() {
		let angle = this.angle;
		let rate = 1 / 8000;
		
		return {
			get rate() { return rate; },
			get x() { return -Math.cos(angle) * rate; },
			get y() { return -Math.sin(angle) * rate; }
		};
	}
	
	get angular_speed() {
		return Math.PI / 900;
	}
	
	event_handler() {
		let speed_x, speed_y;
		
		if (this.position.d === 0) { speed_x = -this.speed.x; speed_y = -this.speed.y; }
		if (this.position.d === 1) { speed_x =  this.speed.x; speed_y =  this.speed.y; }
		
		if (this.input_keys.left)  { this.Matter.torque = -this.angular_speed; }
		if (this.input_keys.right) { this.Matter.torque =  this.angular_speed; }
		if (this.input_keys.up)    { this.Matter.force  = { x:  speed_x, y:  speed_y }; }
		if (this.input_keys.down)  { this.Matter.force  = { x: -speed_x, y: -speed_y }; }
		
		for (let [id, module] of universe.users.get(this.owner).spaceships.get(this.spaceship).modules) {
			if (module.category === "R3") { module.event_handler(module, this); }
		}
	}
	
	update() {
		super.update();
		// Set some props so that they can be read from virtual module
		for (let [id, module] of universe.users.get(this.owner).spaceships.get(this.spaceship).modules) {
			module.position = {
				x: module.Matter.position.x,
				y: module.Matter.position.y,
				d: module.position.d
			};
			
			module.velocity = {
				x: module.Matter.velocity.x,
				y: module.Matter.velocity.y
			};
			
			module.angle = module.Matter.angle;
			
			// DEBUG: too much recursion when call module.update(), it's weird
		}
	}
}

class Q1 extends Capsule {
	category = "Q1";
	
	constructor(
		world : Matter.World,
		owner : string,
		spaceship : string,
		id : string,
		position : { x : number, y : number, d : number },
		meta : { main : boolean, level : string, interval : string, size : number },
		angle : number
	) {
		super(world, owner, spaceship, id, position, meta, angle);
	}
	
	get speed() {
		let angle = this.angle;
		let base_rate = super.speed.rate;
		let rate = 2 * base_rate;
		
		return {
			// FIXME: type definition should say that `rate` is optional
			get rate() { return rate; },
			get x() { return -Math.cos(angle) * rate; },
			get y() { return -Math.sin(angle) * rate; }
		};
	}
	
	get angular_speed() {
		let base_rate = super.angular_speed;
		let rate = 3 * base_rate;
		
		return rate;
	}
	
	event_handler() {
		super.event_handler();
	}
	
	// FIXME: idk why this used to take a parameter
	// update(capsule) {
	
	update() {
		super.update();
		
		this.event_handler();
	}
}

export default Capsule;
export {
	Q1
};