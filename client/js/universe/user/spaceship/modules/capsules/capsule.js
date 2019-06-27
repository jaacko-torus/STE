import { universe } from "../../../../universe.js";

import { Module, add_to_list } from "../module.js";

class Capsule extends Module {
	constructor(world, owner, spaceship, id, position, meta, angle) {
		super(world, owner, spaceship, id, position, meta, angle);
		
		this.class = "regular";
		this.code  = "0";
		this.color = ["#00ff00", 0.5];
		
		this.keys = {
			left  : false,
			up    : false,
			right : false,
			down  : false
		};
		
		if (meta.main) { this.main = true; }
		
		if (owner && spaceship) {
			universe.users.get(owner).spaceships.get(spaceship).keys = universe.users.get(owner).spaceships.get(spaceship).modules.get(id).meta.keys;
			
			add_to_list(
				universe.users.get(owner).spaceships.get(spaceship).capsules,
				id,
				universe.users.get(owner).spaceships.get(spaceship).modules.get(id)
			);
			
			universe.users.get(owner).spaceships.get(spaceship).capsules.get(id).meta = this;
		}
	}
	
	get speed() {
		let angle = this.angle;
		let rate  = 1/8000;
		return {
			get rate() { return rate; },
			get x() { return -Math.cos(angle) * rate; },
			get y() { return -Math.sin(angle) * rate; }
		};
	}
	
	get angularSpeed() { return Math.PI / 900; }
	
	event_handler(capsule) {
		let speed_x, speed_y;
		if( this.position.d === 0) { speed_x = -this.speed.x; speed_y = -this.speed.y; }
		if( this.position.d === 1) { speed_x =  this.speed.x; speed_y =  this.speed.y; }
		
		if( this.keys.up    ) { capsule.force  = { x:  speed_x, y:  speed_y }; }
		if( this.keys.left  ) { capsule.torque = -this.angularSpeed; }
		if( this.keys.down  ) { capsule.force  = { x: -speed_x, y: -speed_y }; }
		if( this.keys.right ) { capsule.torque =  this.angularSpeed; }
		
		for( let [id, module] of universe.users.get(this.owner).spaceships.get(this.spaceship).modules) {
			if(module.meta.category === "R3") { module.meta.event_handler(module, this); }
		}
	}
	
	update() { super.update(); }
}

class Q1 extends Capsule {
	constructor(world, owner, spaceship, id, position, meta, angle) {
		super(world, owner, spaceship, id, position, meta, angle);
		
		this.category = "Q1";
	}
	
	get speed() {
		let angle = this.angle;
		let base_rate = super.speed.rate;
		let rate = 2 * base_rate;
		return {
			get x() { return -Math.cos(angle) * rate; },
			get y() { return -Math.sin(angle) * rate; }
		};
	}
	
	get angularSpeed() {
		let base_rate = super.angularSpeed;
		let rate = 3 * base_rate;
		return rate;
	}
	
	event_handler(capsule) {
		super.event_handler(capsule);
	}
	
	update(capsule) {
		super.update();
		
		this.event_handler(capsule);
	}
}

export {
	Capsule,
	Q1
};