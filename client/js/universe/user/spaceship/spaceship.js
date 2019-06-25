// const Engine      = Matter.Engine;
// const Render      = Matter.Render;
// const Runner      = Matter.Runner;
// const Body        = Matter.Body;
// const Events      = Matter.Events;
const World       = Matter.World;
// const Bodies      = Matter.Bodies;
const Constraint  = Matter.Constraint;
// const Constraints = Matter.Constraints;
const Composite   = Matter.Composite;
// const Composites  = Matter.Composites;

import { universe } from "../../universe.js";
import { add_to_list, h_constraints, w_constraints, w_size, w_height, w_length, h_size, h_height, h_length } from "./modules/module.js";
import { T1 } from "./modules/structs/struct.js";
import { Q1 } from "./modules/capsules/capsule.js";
import { R3 } from "./modules/thrusters/thrusters.js";

class Spaceship {
	constructor(world, owner, id, position, modules = [], angle = 3 * Math.PI / 2) {
		if(position.d === 0) { angle = 3 * Math.PI / 2; } else
		if(position.d === 1) { angle =     Math.PI / 2; }
		
		// in the spaceship class, owner refer to the user
		this.owner = owner;
		this.main  = undefined;
		
		this.position = { x: position.x, y: position.y, d: position.d };
		this.angle = angle;
		
		this.keys = {};
		
		this.capsules = new Map();
		this.modules = new Map();
		this.constraints = new Map();
		
		this.composite = Composite.create();
		
		add_to_list(universe.users.get(owner).spaceships, id, this);
		
		// add modules once spaceship is virtualy in existance
		this.add_modules(world, owner, id, modules, this.position);
		// NOTE: I don't like the look of the line below
		World.add(world, this.composite);
	}
	
	update() {
		// it's going to loop through every capsule and get instructions
		for( let [id, capsule] of this.capsules) { capsule.meta.update(capsule); }
		// this.get_centroid();
	}
	
	get centroid() {
		/* TODO:
			get relative model position on every load event,
			compute centroid
			scale centroid by inverse of scale
			compute relation by main capsule
		*/
		let x_pos_total = 0;
		let y_pos_total = 0;
		for( let [id, module] of this.modules) {
			x_pos_total += module.meta.position.x;
			y_pos_total += module.meta.position.y;
		}
		
		return {
			x: x_pos_total / this.modules.size,
			y: y_pos_total / this.modules.size
		}
	}
	
	set_torques(centroid, module, id) {
		let motor_strength = 1; // TODO: change this later
		
		let F = { x: 0, y: 0 };
		let r = { x: 0, y: 0 };
		
		if(module.d === 0) { F.x =  0  ; F.y =  1; } else
		if(module.d === 1) { F.x =  0  ; F.y = -1; } else
		if(module.d === 2) { F.x =  0.5; F.y =  0.5 * Math.sqrt(3); } else
		if(module.d === 3) { F.x = -0.5; F.y = -0.5 * Math.sqrt(3); } else
		if(module.d === 4) { F.x = -0.5; F.y =  0.5 * Math.sqrt(3); } else
		if(module.d === 5) { F.x =  0.5; F.y = -0.5 * Math.sqrt(3); }
		
		F.x *= motor_strength;
		F.y *= motor_strength;
		
		// position : p2, centroid : p1
		// rx = p2.x - p1.x
		// ry = p2.y - p1.y
		// module.meta.position.x
		// module.meta.position.y
		
		r.x = module.x - centroid.x;
		r.y = module.y - centroid.y;
		let tau = r.x * F.y - r.y * F.x;
		// console.log(module.position.x, module.position.y)
		// console.log(d, F.x, F.y)
		// console.log(r.x, r.y)
		// console.log(tau)
	}
	
	constraint_management(owner, spaceship, a, b, k, d, size) {
		// array containing the coords for all modules
		let constraints;
		if( size === 0.5 ) { constraints = h_constraints; }
		if( size === 1   ) { constraints = w_constraints; }
		
		let i = (k + 1) % 3;
		let j = (k + 2) % 3;
		
		let o = a[k] - b[k]; // order of numeration and comparison
		
		a = { x: undefined, y: undefined, body: a.toString() };
		b = { x: undefined, y: undefined, body: b.toString() };
		
		// TODO: maybe find some pattern here so that I can reduce the size of this shit while keeping the readeability
		
		if(d === 0) {
			if(k === 0 && o === -1) { a.x =  constraints[1].x; a.y =  constraints[1].y; b.x = -constraints[0].x; b.y = -constraints[0].y; }
			if(k === 0 && o ===  1) { a.x = -constraints[0].x; a.y = -constraints[0].y; b.x =  constraints[1].x; b.y =  constraints[1].y; }
			if(k === 1 && o === -1) { a.x =  constraints[2].x; a.y =  constraints[2].y; b.x =  constraints[2].x; b.y = -constraints[2].y; }
			if(k === 1 && o ===  1) { a.x =  constraints[2].x; a.y = -constraints[2].y; b.x =  constraints[2].x; b.y =  constraints[2].y; }
			if(k === 2 && o === -1) { a.x = -constraints[1].x; a.y =  constraints[1].y; b.x =  constraints[0].x; b.y = -constraints[0].y; }
			if(k === 2 && o ===  1) { a.x =  constraints[0].x; a.y = -constraints[0].y; b.x = -constraints[1].x; b.y =  constraints[1].y; }
		}
		
		if(d === 1) {
			if(k === 0 && o === -1) { a.x =  constraints[1].x; a.y = -constraints[1].y; b.x = -constraints[0].x; b.y =  constraints[0].y; }
			if(k === 0 && o ===  1) { a.x = -constraints[0].x; a.y =  constraints[0].y; b.x =  constraints[1].x; b.y = -constraints[1].y; }
			if(k === 1 && o === -1) { a.x =  constraints[2].x; a.y = -constraints[2].y; b.x =  constraints[2].x; b.y =  constraints[2].y; }
			if(k === 1 && o ===  1) { a.x =  constraints[2].x; a.y =  constraints[2].y; b.x =  constraints[2].x; b.y = -constraints[2].y; }
			if(k === 2 && o === -1) { a.x = -constraints[1].x; a.y = -constraints[1].y; b.x =  constraints[0].x; b.y =  constraints[0].y; }
			if(k === 2 && o ===  1) { a.x =  constraints[0].x; a.y =  constraints[0].y; b.x = -constraints[1].x; b.y = -constraints[1].y; }
		}
		
		universe.users.get(owner).spaceships.get(spaceship).constraints.set(a.body + "|" + b.body, Constraint.create({
			bodyA: universe.users.get(owner).spaceships.get(spaceship).modules.get(a.body), pointA: { x: a.x, y: a.y },
			bodyB: universe.users.get(owner).spaceships.get(spaceship).modules.get(b.body), pointB: { x: b.x, y: b.y },
			
			damping: 0,
			stiffness: 1,
			// render: { visible: false }
		}));
		
		universe.users.get(owner).spaceships.get(spaceship).constraints.get(a.body + "|" + b.body).meta = { owner, spaceship };
		
		if(d === 0) {
			if(k === 0 && o === -1) { a.x =  constraints[0].x; a.y =  constraints[0].y; b.x = -constraints[1].x; b.y = -constraints[1].y; }
			if(k === 0 && o ===  1) { a.x = -constraints[1].x; a.y = -constraints[1].y; b.x =  constraints[0].x; b.y =  constraints[0].y; }
			if(k === 1 && o === -1) { a.x = -constraints[2].x; a.y =  constraints[2].y; b.x = -constraints[2].x; b.y = -constraints[2].y; }
			if(k === 1 && o ===  1) { a.x = -constraints[2].x; a.y = -constraints[2].y; b.x = -constraints[2].x; b.y =  constraints[2].y; }
			if(k === 2 && o === -1) { a.x = -constraints[0].x; a.y =  constraints[0].y; b.x =  constraints[1].x; b.y = -constraints[1].y; }
			if(k === 2 && o ===  1) { a.x =  constraints[1].x; a.y = -constraints[1].y; b.x = -constraints[0].x; b.y =  constraints[0].y; }
		}
		
		if(d === 1) {
			if(k === 0 && o === -1) { a.x =  constraints[0].x; a.y = -constraints[0].y; b.x = -constraints[1].x; b.y =  constraints[1].y; }
			if(k === 0 && o ===  1) { a.x = -constraints[1].x; a.y =  constraints[1].y; b.x =  constraints[0].x; b.y = -constraints[0].y; }
			if(k === 1 && o === -1) { a.x = -constraints[2].x; a.y = -constraints[2].y; b.x = -constraints[2].x; b.y =  constraints[2].y; }
			if(k === 1 && o ===  1) { a.x = -constraints[2].x; a.y =  constraints[2].y; b.x = -constraints[2].x; b.y = -constraints[2].y; }
			if(k === 2 && o === -1) { a.x = -constraints[0].x; a.y = -constraints[0].y; b.x =  constraints[1].x; b.y =  constraints[1].y; }
			if(k === 2 && o ===  1) { a.x =  constraints[1].x; a.y =  constraints[1].y; b.x = -constraints[0].x; b.y = -constraints[0].y; }
		}
		
		universe.users.get(owner).spaceships.get(spaceship).constraints.set(b.body + "|" + a.body, Constraint.create({
			bodyA: universe.users.get(owner).spaceships.get(spaceship).modules.get(a.body), pointA: { x: a.x, y: a.y },
			bodyB: universe.users.get(owner).spaceships.get(spaceship).modules.get(b.body), pointB: { x: b.x, y: b.y },
			
			damping: 0,
			stiffness: 1,
			// render: { visible: false }
		}));
		
		universe.users.get(owner).spaceships.get(spaceship).constraints.get(b.body + "|" + a.body).meta = { owner, spaceship };
		
		return { a: a.body, b: b.body };
	}
	
	add_by_type(world, owner, spaceship, id, category, {x, y, d}, {level, interval, size, main}, angle) {
		switch(category) {
			
			case "Q1": // capsules
				new Q1(world, owner, spaceship, id, { x, y, d }, {level, interval, size, main}, angle);
				// DEBUG: this can't stand on it's owner
				// console.log(this.centroid)
				console.log(x, y)
				this.set_torques(this.centroid, {x, y, d}, id);
				break;
			
			case "T1": // structs
				new T1(world, owner, spaceship, id, { x, y, d }, {level, interval, size}, angle);
				break;
				
				case "R3": // thrusters
				// electric, no fuel <- innexpensive and it just works
				new R3(world, owner, spaceship, id, { x, y, d }, {level, interval, size}, angle);
				this.set_torques(this.centroid, {x, y, d}, id);
				break;
		}
	}
	
	add_modules(world, owner, spaceship, modules, position) {
		let size, level, interval, main;
		
		let coord_list = [];
		
		for(let i = 0; i < modules.length; i++) {
			// fourth item in every module indicates it's category, remove it and set `category` to it
			if (modules[i][3][1] && modules[i][3][1].main) {
				console.log(modules[i][3][1].main);
			}
			
			let props = modules[i].pop(3);
			let category = props[0];
			
			if (!props[1]) props[1] = {};
			({
				level = "I",
				interval = "Alpha",
				size = 1,
				
				// only for capsules
				main = false
			} = props[1]);
			
			// with the remaining first 3 items, make an id and string it
			let id = modules[i].toString();
			if (main) { this.main = id; }
			// TODO: make some logic for the half size modules
			// if(mods[i][0] % 1 === 0.5 || mods[i][1] % 1 === 0.5) {
			// 	// change d to opposite
			
			// 	if(position.d === 0) { position.d === 1; } else
			// 	if(position.d === 1) { position.d === 0; }
			// }
			
			let tri_to_sqr_coords = Spaceship.tri_to_sqr_coords( position.d, modules[i][0], modules[i][1], modules[i][2] );
			let coords = Spaceship.coords( position, tri_to_sqr_coords );
			coord_list.push({x: coords.x, y: coords.y});
			// console.log(coords)
			// console.log(Spaceship.scale_coords(coords, 5))
			coords = Spaceship.scale_coords(coords, 50);
			
			this.add_by_type(world, owner, spaceship, id, category, { x: coords.x, y: coords.y, d: coords.d }, {level, interval, size, main}, coords.angle);
		}
		
		// let centroid = this.centroid();
		// this.set_torques(this.centroid);
		
		this.add_constraints(world, owner, spaceship, modules, position.d, size);
		
		// TODO: make check to see if there are any errors in `add_by_type` and `add_constraints` and return bool
	}
	
	add_constraints(world, owner, spaceship, modules, dir, size) {
		let list = [];
		
		//create three ordered lists ordered by xy, yz, zx
		for(let i = 0; i < 3; i++) {
			
			let j = (i + 1) % 3;
			let k = (i + 2) % 3;
			
			// start sorting arrays and add to `list`, arrays to be sorted are copies of `mods` + `spaceship.cap_coords` which is `[0,0,0]`
			list[i] = [...modules].sort((a, b) => {
				if(a[i] === b[i]) {
					if(a[j] === b[j]) {
						if(Math.abs(a[k] - b[k]) === 1) {
							// if two consecutive modular number coordinates are followed by a last coordinate in both arrays which has a difference of one
							// then the two modules are adjacent and should have a constraint
							this.add_constraint(world, owner, spaceship, a, b, k, dir, size);
						}
						
						return a[k] - b[k];
					}
					return a[j] - b[j];
				}
				return a[i] - b[i];
			});
		}
		
		let [xy, yz, zx] = list;
		return {xy, yz, zx};
	}
	
	add_constraint(world, owner, spaceship, a, b, k, dir, size) {
		let body_pair = this.constraint_management(owner, spaceship, a, b, k, dir, size);
		
		Composite.add(universe.users.get(owner).spaceships.get(spaceship).composite, [ // add to spaceship.composite instead
			universe.users.get(owner).spaceships.get(spaceship).constraints.get(body_pair.a + "|" + body_pair.b),
			universe.users.get(owner).spaceships.get(spaceship).constraints.get(body_pair.b + "|" + body_pair.a)
		]);
		
		// TODO: deprecate this return, it's unnecesary
		return body_pair;
	}
	
	static get_vertices(spaceship) {
		// loop through every
		universe.users.get(owner).spaceships.get(spaceship)
	}
	
	// origin_d represents direction of main or capsule which can be either 0, or 1;
	// while output d is the orientation of module given it's coords and origin_d
	static tri_to_sqr_coords(origin_d, x, y, z) {
		// NOTE: simplify if-elses by checking position parameter before entering the equation
				// console.log({x, y, z});
		
		if(origin_d === 0) { origin_d = -1; } else
		if(origin_d === 1) { origin_d =  1; } else
		{ return console.log(`${origin_d} is not a correct position parameter`); }
		
		if(x % 1 === 0 && y % 1 === 0 && z % 1 === 0) { // if x, y, x are all whole numbers
			x = z - x;
			y = -origin_d * y;
			
			if(origin_d ===  1) { origin_d = 1; } else
			if(origin_d === -1) { origin_d = 2; }
		
			let x_axis_d = (x % 2 + origin_d) % 2;
					// console.log(x_axis_d);
			let y_axis_d = (y % 2 + origin_d) % 2;
					// console.log(y_axis_d);
			let d = ((x_axis_d + y_axis_d) % 2 + origin_d) % 2;
					// console.log(d);
			
			return { x, y, d };
		}
		
		// This is idiotic, find another way
		// if(x % 1 === 0.5 || y % 1 === 0.5 || z % 1 === 0.5) {
		// 	x = z - x;
		// 	y = -origin_d * y;
			
		// 	if(origin_d ===  1) { origin_d = 1; } else
		// 	if(origin_d === -1) { origin_d = 2; }
			
		// 	let x_axis_d = (x % 2 + origin_d) % 2;
		// 	let y_axis_d = (y % 2 + origin_d) % 2;
		// 	let d = ((x_axis_d + y_axis_d) % 2 + origin_d) % 2;
			
			
		// 	return { x, y, d }
		// }
	}
	
	static coords(origin, sqr_coords, size) {
		// let height;
		// if( size = 0.5 ) { size = h_size; height = h_height; }
		// if( size = 1   ) { size = w_size; height = w_height; }
		
		// let angle, y_offset = (size * Math.sqrt(12) / 12) / 2;
		
		// if(sqr_coords.d === 0) { angle = 3 * Math.PI / 2; y_offset *= -1; } else
		// if(sqr_coords.d === 1) { angle =     Math.PI / 2; y_offset *=  1; }
		
		// let x = origin.x + ( (size / 2) * sqr_coords.x );
		// let y = origin.y - (  height    * sqr_coords.y ) + y_offset;
		
		// return { x, y, d: sqr_coords.d, angle };
		
		
		
		
		
		
		
		// let height;
		// if( size = 0.5 ) { size = h_size; height = h_height; }
		// if( size = 1   ) { size = w_size; height = w_height; }
		
		let angle;
		let y_offset = (1 * Math.sqrt(12) / 12) / 2;
		
		if(sqr_coords.d === 0) { angle = 3 * Math.PI / 2; y_offset *= -1; } else
		if(sqr_coords.d === 1) { angle =     Math.PI / 2; y_offset *=  1; }
		
		let x = origin.x + ( ( 1 / 2 )        * sqr_coords.x );
		let y = origin.y - ( Math.sqrt(3) / 2 * sqr_coords.y ) + y_offset;
		
		return { x, y, d: sqr_coords.d, angle };
	}
	
	static scale_coords(coords, scale) {
		// TODO: translate figure after scale to origin of main capsule
		return {
			x: coords.x * scale,
			y: coords.y * scale,
			d: coords.d,
			angle: coords.angle
		}
	}
	
	static load(world, owner, spaceship, d, modules) {
		let angle;
		if(d === 0) { angle = 3 * Math.PI / 2; } else
		if(d === 1) { angle =     Math.PI / 2; }
		
		universe.users.get(owner).spaceships.get(spaceship).position.d = d
		
		// add modules once spaceship is virtualy in existance
		universe.users.get(owner).spaceships.get(spaceship).add_modules(
			world,
			owner,
			spaceship,
			modules,
			universe.users.get(owner).spaceships.get(spaceship).position
		);
	}
	
	static reset(world, owner, spaceship) {
		// clear bodies
		Composite.clear(universe.users.get(owner).spaceships.get(spaceship).composite, false, true);
		
		// clear virtual bodies
		universe.users.get(owner).spaceships.get(spaceship).modules.clear();
		universe.users.get(owner).spaceships.get(spaceship).capsules.clear();
		universe.users.get(owner).spaceships.get(spaceship).constraints.clear();
	}
	
	static remove_module(world, owner, spaceship, module) {
		// // remove body
		Composite.remove(universe.users.get(owner).spaceships.get(spaceship).composite, module, true);
		
		universe.users.get(owner).spaceships.get(spaceship).add_by_type(
			world, "", "", "",
			module.meta.category,
			{x: module.meta.position.x, y: module.meta.position.y},
			{level: module.meta.level, interval: module.meta.interval, size: module.meta.size},
			module.meta.angle
		)
		
		// // delete virtual body
		// // TODO: I don't like this approach, but it's what I could come up with at the moment, figure something out later
		universe.users.get(owner).spaceships.get(spaceship).modules.delete(module.meta.__id__);
		universe.users.get(owner).spaceships.get(spaceship).capsules.delete(module.meta.__id__);
		
		Spaceship.remove_constraints(owner, spaceship, module.meta.__id__);
	}
	
	static erase_module(world, owner, spaceship, module) {
		// erase body
		Composite.remove(universe.users.get(owner).spaceships.get(spaceship).composite, module, true);
		
		// delete virtual body
		// TODO: I don't like this approach, but it's what I could come up with at the moment, figure something out later
		universe.users.get(owner).spaceships.get(spaceship).modules.delete(module.meta.__id__);
		universe.users.get(owner).spaceships.get(spaceship).capsules.delete(module.meta.__id__);
		
		Spaceship.remove_constraints(owner, spaceship, module.meta.__id__);
	}
	
	static remove_constraints(owner, spaceship, module_id) {
		// find modules attached to body
		let constraints = []
		
		for(let [id, contraint] of universe.users.get(owner).spaceships.get(spaceship).constraints) {
			if (id.includes(module_id)) { Spaceship.remove_constraint(owner, spaceship, id); /*constraints.push(id);*/ }
		}
		
		// remove_constraint(constraints)
	}
	
	static remove_constraint(owner, spaceship, id) {
		Composite.remove(
			universe.users.get(owner).spaceships.get(spaceship).composite,
			universe.users.get(owner).spaceships.get(spaceship).constraints.get(id),
			true
		);
	}
}


let load = Spaceship.load;
let reset = Spaceship.reset;

export {
	Spaceship,
	load,
	reset
};