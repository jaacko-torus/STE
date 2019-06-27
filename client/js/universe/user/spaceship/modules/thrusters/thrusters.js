import { DEBUG } from "../../../../../debug.js";
import { Module } from "../module.js";
import { universe } from "../../../../universe.js";

// NOTE: thrusters need at least one clear side, and it has to be the one opposite to their direction
class Thruster extends Module {
	constructor(world, owner, spaceship, id, position, meta, angle) {
		super(world, owner, spaceship, id, position, meta, angle);
		
		this.max_neighbors = 1;
		
		this.class = "regular";
		this.code  = "0";
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
	
	event_handler(module, capsule) {
		let speed_x, speed_y;
		if( this.position.d === 0) { speed_x = this.speed.x; speed_y = this.speed.y; }
		if( this.position.d === 1) { speed_x = this.speed.x; speed_y = this.speed.y; }
		
		if( capsule.keys.left  && this.torque < 0 ) { module.force = { x: -this.torque * speed_x, y: -this.torque * speed_y }; }
		if( capsule.keys.right && this.torque > 0 ) { module.force = { x:  this.torque * speed_x, y:  this.torque * speed_y }; }
		if( capsule.keys.right ) { speed_x =  this.speed.x; speed_y =  this.speed.y; }
		if( capsule.keys.up    ) { module.force = { x:  speed_x, y:  speed_y }; }
		if( capsule.keys.down  ) { module.force = { x: -speed_x, y: -speed_y }; }
		
		if(
			DEBUG.show_active_thrusters &&
			module.force.x !== 0 &&
			module.force.y !== 0
		) { this.color = ["#ff0000", 0.5]; } else
		{ this.color = ["#333333", 0.5]; }
	}
}

class R3 extends Thruster { // electric
	constructor(world, owner, spaceship, id, position, meta, angle) {
		super(world, owner, spaceship, id, position, meta, angle);
		
		this.category = "R3";
	}
	
	get speed() {
		let angle = this.angle;
		let base_rate = super.speed.rate;
		let rate = 4 * base_rate;
		return {
			get x() { return -Math.cos(angle) * rate; },
			get y() { return -Math.sin(angle) * rate; }
		};
	}
	
	get angularSpeed() {
		let base_rate = super.angularSpeed;
		let rate = 6 * base_rate;
		return rate;
	}
	
	event_handler(capsule, speed_x, speed_y) {
		super.event_handler(capsule, speed_x, speed_y);
	}
}

export {
	Thruster,
	R3
};