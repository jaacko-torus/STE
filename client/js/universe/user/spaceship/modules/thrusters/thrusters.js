import DEBUG from "../../../../../debug.js";

import Module from "../Module.js";

import universe from "../../../../universe.js";

// NOTE: thrusters need at least one clear side, and it has to be the one opposite to their direction
class Thruster extends Module {
	max_neighbors = 1;
	
	constructor(world, owner, spaceship, id, position, meta, angle) {
		super(world, owner, spaceship, id, position, meta, angle);
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
	
	event_handler(module, capsule) {
		let speed_x, speed_y;
		if( this.position.d === 0) { speed_x = this.speed.x; speed_y = this.speed.y; }
		if( this.position.d === 1) { speed_x = this.speed.x; speed_y = this.speed.y; }
		
		if( capsule.input_keys.left  && this.torque < 0 ) { module.Matter.force = { x: -this.torque * speed_x, y: -this.torque * speed_y }; }
		if( capsule.input_keys.right && this.torque > 0 ) { module.Matter.force = { x:  this.torque * speed_x, y:  this.torque * speed_y }; }
		
		
		// console.log(universe.users.get(capsule.owner).spaceships.get(capsule.spaceship).position.d)
		// console.log(capsule.)
		
		// let spaceship_d = universe.users.get(capsule.owner).spaceships.get(capsule.spaceship).grid.d;
		// if( spaceship_d === 0 ) {
		// 	if( capsule.keys.up   && this.position.d === 1 ) { module.Matter.force = { x: speed_x, y: speed_y }; }
		// 	if( capsule.keys.down && this.position.d === 0 ) { module.Matter.force = { x: speed_x, y: speed_y }; }
		// }
		// if( spaceship_d === 1 ) {
		// 	if( capsule.keys.up   && this.position.d === 1 ) { module.Matter.force = { x: speed_x, y: speed_y }; }
		// 	if( capsule.keys.down && this.position.d === 0 ) { module.Matter.force = { x: speed_x, y: speed_y }; }
		// }
		
		
		if( capsule.input_keys.up   && this.position.d === 1 ) { module.Matter.force = { x: speed_x, y: speed_y }; }
		if( capsule.input_keys.down && this.position.d === 0 ) { module.Matter.force = { x: speed_x, y: speed_y }; }
		
		if(
			DEBUG.show_active_thrusters &&
			module.Matter.force.x !== 0 &&
			module.Matter.force.y !== 0
		) {
			this.color = ["#ff0000", 0.5];
		} else {
			this.color = ["#333333", 0.5];
		}
	}
}

class R3 extends Thruster { // electric
	category = "R3";
	
	constructor(world, owner, spaceship, id, position, meta, angle) {
		super(world, owner, spaceship, id, position, meta, angle);
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
	
	get angular_speed() {
		let base_rate = super.angular_speed;
		let rate = 6 * base_rate;
		
		return rate;
	}
	
	event_handler(capsule, speed_x, speed_y) {
		super.event_handler(capsule, speed_x, speed_y);
	}
}

export default Thruster;
export {
	R3
};