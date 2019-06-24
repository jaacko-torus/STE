import { Module } from "../module.js";
import { universe } from "../../../../universe.js";

let H = 0;

// NOTE: thrusters need at least one clear side
class Thruster extends Module {
	constructor(world, owner, spaceship, id, position, meta, angle) {
		super(world, owner, spaceship, id, position, meta, angle);

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
		// NOTE: torque will no longer be needed once basic thrusters are implemented
		// NOTE: torque will be needed once directional thrusters are implemented
		// NOTE: ^ then why the fuck was I frustrated about MatterJS
		if( this.position.d === 0) { speed_x = this.speed.x; speed_y = this.speed.y; }
		if( this.position.d === 1) { speed_x = this.speed.x; speed_y = this.speed.y; }
		
		
		if( capsule.keys.up    ) { module.force  = { x:  speed_x, y:  speed_y }; }
		if( capsule.keys.left  ) { module.torque = -this.angularSpeed; }
		if( capsule.keys.down  ) { module.force  = { x: -speed_x, y: -speed_y }; }
		if( capsule.keys.right ) { module.torque =  this.angularSpeed; }
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