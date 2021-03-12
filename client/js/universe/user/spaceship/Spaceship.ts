import Matter from "matter-js";

import universe from "../../universe.js";

import Module from "./modules/Module.js";

import { T1 } from "./modules/structs/Struct.js";
import { Q1 } from "./modules/capsules/Capsule.js";
import { R3 } from "./modules/thrusters/Thrusters.js";

import { map_set } from "../../../util/util.js";

class Spaceship {
	owner;
	main = undefined;
	
	position = { x: 0, y: 0 }
	
	input_keys = {};
	
	capsules = new Map();
	modules = new Map();
	constraints = new Map();
	
	composite;
	
	projected_torques;
	
	constructor(world, owner, id, position, modules = [], angle = 3 * Math.PI / 2) {
		// if(position.d === 0) { angle = 3 * Math.PI / 2; } else
		// if(position.d === 1) { angle =     Math.PI / 2; }
		// if(grid.d === 0) { angle = 3 * Math.PI / 2; } else
		// if(grid.d === 1) { angle =     Math.PI / 2; }
		
		// in the spaceship class, owner refer to the user
		this.owner = owner;
		
		this.position = position;
		// this.grid = { d: grid.d }
		// this.angle = angle;
		
		this.composite = Matter.Composite.create();
		
		// FIXME: this map setting should maybe be its own function
		map_set({
			map: universe.users.get(owner).spaceships,
			key: id,
			val: this
		});
		
		// add modules once spaceship is virtualy in existance
		Spaceship.load(world, this.owner, id, modules);
		
		// NOTE: I don't like the look of the line below
		// Each module is already added to the world, am I messing up MatterJS through that?
		Matter.World.add(world, this.composite);
	}
	
	// it's going to loop through every capsule and get instructions
	update() {
		for (let capsule of this.capsules.values()) {
			capsule.update();
		}
	}
	
	get centroid() {
		/* TODO:
			get relative model position on every load event,
			compute centroid
			scale centroid by inverse of scale
			compute relation by main capsule
		*/
		// TODO: this method is easy but not very efficient
		let x_pos_total = 0;
		let y_pos_total = 0;
		
		// FIXME: I could do it this way since it's more efficient
		// but the centroid should only be calculated every time a module is added or subtracted only
		// as such I think it should be fine to make it slower but more readable
		for (let module of this.modules.values()) {
			x_pos_total += module.position.x;
			y_pos_total += module.position.y;
		}
		
		return {
			x: x_pos_total / this.modules.size,
			y: y_pos_total / this.modules.size
		}
	}
	
	set_projected_torques(centroid) {
		// TODO: change this later
		let motor_strength = 1;
		// TODO: find a better name, and maybe use a map?
		let module_list = { };
		
		// FIXME: don't know what `F` and `r` are
		// due to them being use quite extensively inside later on I think leaving them named as they are should be fine
		// But a NOTE should be added to explain what each of them mean
		let F = { x: 0, y: 0 };
		let r = { x: 0, y: 0 };
		
		for (let [id, module] of this.modules) {
			
			switch(module.category) {
				case "Q1":
				case "R3":
					
					switch (module.position.d) {
						case 0: F.x =  0  ; F.y =  1; break;
						case 1: F.x =  0  ; F.y = -1; break;
						case 2: F.x =  0.5; F.y =  0.5 * Math.sqrt(3); break;
						case 3: F.x = -0.5; F.y = -0.5 * Math.sqrt(3); break;
						case 4: F.x =  0.5; F.y = -0.5 * Math.sqrt(3); break;
						case 5: F.x = -0.5; F.y =  0.5 * Math.sqrt(3); break;
					}
					
					F.x *= motor_strength;
					F.y *= motor_strength;
					
					r.x = module.position.x - centroid.x;
					r.y = module.position.y - centroid.y;
					
					// TODO: explain what `tau` represents
					let tau = r.x * F.y - r.y * F.x;
					
					if( tau  <  0 ) { module.torque = -1; } else
					if( tau === 0 ) { module.torque =  0; } else
					if( tau  >  0 ) { module.torque =  1; }
					
					module_list[id] = module.torque;
			}
		}
		
		this.projected_torques = module_list;
		return this.projected_torques;
	}
	
	// TODO: idk what `a`, `b`, `k`, or `d` represent, they are parameters, use better names
	// TODO: rewrite this whole thing so that it makes more sense
	constraint_management(owner, spaceship, a, b, k, d, size) {
		// array containing the coords for all modules
		let constraints;
		if( size === 0.5 ) { constraints = Module.h_constraints; }
		if( size === 1   ) { constraints = Module.w_constraints; }
		
		let i = (k + 1) % 3;
		let j = (k + 2) % 3;
		
		let o = a[k] - b[k]; // order of numeration and comparison
		
		a = { x: undefined, y: undefined, body: a.toString() };
		b = { x: undefined, y: undefined, body: b.toString() };
		
		// TODO: maybe find some pattern here so that I can reduce the size of this shit while keeping the readeability
		
		if (d === 0) {
			if (k === 0 && o === -1) { a.x =  constraints[1].x; a.y =  constraints[1].y; b.x = -constraints[0].x; b.y = -constraints[0].y; }
			if (k === 0 && o ===  1) { a.x = -constraints[0].x; a.y = -constraints[0].y; b.x =  constraints[1].x; b.y =  constraints[1].y; }
			if (k === 1 && o === -1) { a.x =  constraints[2].x; a.y =  constraints[2].y; b.x =  constraints[2].x; b.y = -constraints[2].y; }
			if (k === 1 && o ===  1) { a.x =  constraints[2].x; a.y = -constraints[2].y; b.x =  constraints[2].x; b.y =  constraints[2].y; }
			if (k === 2 && o === -1) { a.x = -constraints[1].x; a.y =  constraints[1].y; b.x =  constraints[0].x; b.y = -constraints[0].y; }
			if (k === 2 && o ===  1) { a.x =  constraints[0].x; a.y = -constraints[0].y; b.x = -constraints[1].x; b.y =  constraints[1].y; }
		}
		
		if (d === 1) {
			if (k === 0 && o === -1) { a.x =  constraints[1].x; a.y = -constraints[1].y; b.x = -constraints[0].x; b.y =  constraints[0].y; }
			if (k === 0 && o ===  1) { a.x = -constraints[0].x; a.y =  constraints[0].y; b.x =  constraints[1].x; b.y = -constraints[1].y; }
			if (k === 1 && o === -1) { a.x =  constraints[2].x; a.y = -constraints[2].y; b.x =  constraints[2].x; b.y =  constraints[2].y; }
			if (k === 1 && o ===  1) { a.x =  constraints[2].x; a.y =  constraints[2].y; b.x =  constraints[2].x; b.y = -constraints[2].y; }
			if (k === 2 && o === -1) { a.x = -constraints[1].x; a.y = -constraints[1].y; b.x =  constraints[0].x; b.y =  constraints[0].y; }
			if (k === 2 && o ===  1) { a.x =  constraints[0].x; a.y =  constraints[0].y; b.x = -constraints[1].x; b.y = -constraints[1].y; }
			// for a
			// if(k === 0 && o === -1) { a.x =  constraints[1].x; a.y = -constraints[1].y; }
			// if(k === 0 && o ===  1) { a.x = -constraints[0].x; a.y =  constraints[0].y; }
			// if(k === 1 && o === -1) { a.x =  constraints[2].x; a.y = -constraints[2].y; }
			// if(k === 1 && o ===  1) { a.x =  constraints[2].x; a.y =  constraints[2].y; }
			// if(k === 2 && o === -1) { a.x = -constraints[1].x; a.y = -constraints[1].y; }
			// if(k === 2 && o ===  1) { a.x =  constraints[0].x; a.y =  constraints[0].y; }
			
			// for b
			// if(k === 0 && o === -1) { b.x = -constraints[0].x; b.y =  constraints[0].y; }
			// if(k === 0 && o ===  1) { b.x =  constraints[1].x; b.y = -constraints[1].y; }
			// if(k === 1 && o === -1) { b.x =  constraints[2].x; b.y =  constraints[2].y; }
			// if(k === 1 && o ===  1) { b.x =  constraints[2].x; b.y = -constraints[2].y; }
			// if(k === 2 && o === -1) { b.x =  constraints[0].x; b.y =  constraints[0].y; }
			// if(k === 2 && o ===  1) { b.x = -constraints[1].x; b.y = -constraints[1].y; }
			// if(k === 0 && o === -1) { b.x = 0; b.y = 0; }
			// if(k === 0 && o ===  1) { b.x = 0; b.y = 0; }
			// if(k === 1 && o === -1) { b.x = 0; b.y = 0; }
			// if(k === 1 && o ===  1) { b.x = 0; b.y = 0; }
			// if(k === 2 && o === -1) { b.x = 0; b.y = 0; }
			// if(k === 2 && o ===  1) { b.x = 0; b.y = 0; }
		}
		
		this.constraints.set(a.body + "|" + b.body, Matter.Constraint.create({
			bodyA: this.modules.get(a.body).Matter, pointA: { x: a.x, y: a.y },
			bodyB: this.modules.get(b.body).Matter, pointB: { x: b.x, y: b.y },
			
			damping: 0,
			stiffness: 1
		}));
		
		this.constraints.get(a.body + "|" + b.body).meta = { owner, spaceship };
		
		if (d === 0) {
			if (k === 0 && o === -1) { a.x =  constraints[0].x; a.y =  constraints[0].y; b.x = -constraints[1].x; b.y = -constraints[1].y; }
			if (k === 0 && o ===  1) { a.x = -constraints[1].x; a.y = -constraints[1].y; b.x =  constraints[0].x; b.y =  constraints[0].y; }
			if (k === 1 && o === -1) { a.x = -constraints[2].x; a.y =  constraints[2].y; b.x = -constraints[2].x; b.y = -constraints[2].y; }
			if (k === 1 && o ===  1) { a.x = -constraints[2].x; a.y = -constraints[2].y; b.x = -constraints[2].x; b.y =  constraints[2].y; }
			if (k === 2 && o === -1) { a.x = -constraints[0].x; a.y =  constraints[0].y; b.x =  constraints[1].x; b.y = -constraints[1].y; }
			if (k === 2 && o ===  1) { a.x =  constraints[1].x; a.y = -constraints[1].y; b.x = -constraints[0].x; b.y =  constraints[0].y; }
		}
		
		if (d === 1) {
			if (k === 0 && o === -1) { a.x =  constraints[0].x; a.y = -constraints[0].y; b.x = -constraints[1].x; b.y =  constraints[1].y; }
			if (k === 0 && o ===  1) { a.x = -constraints[1].x; a.y =  constraints[1].y; b.x =  constraints[0].x; b.y = -constraints[0].y; }
			if (k === 1 && o === -1) { a.x = -constraints[2].x; a.y = -constraints[2].y; b.x = -constraints[2].x; b.y =  constraints[2].y; }
			if (k === 1 && o ===  1) { a.x = -constraints[2].x; a.y =  constraints[2].y; b.x = -constraints[2].x; b.y = -constraints[2].y; }
			if (k === 2 && o === -1) { a.x = -constraints[0].x; a.y = -constraints[0].y; b.x =  constraints[1].x; b.y =  constraints[1].y; }
			if (k === 2 && o ===  1) { a.x =  constraints[1].x; a.y =  constraints[1].y; b.x = -constraints[0].x; b.y = -constraints[0].y; }
			// for a
			// if(k === 0 && o === -1) { a.x =  constraints[0].x; a.y = -constraints[0].y; }
			// if(k === 0 && o ===  1) { a.x = -constraints[1].x; a.y =  constraints[1].y; }
			// if(k === 1 && o === -1) { a.x = -constraints[2].x; a.y = -constraints[2].y; }
			// if(k === 1 && o ===  1) { a.x = -constraints[2].x; a.y =  constraints[2].y; }
			// if(k === 2 && o === -1) { a.x = -constraints[0].x; a.y = -constraints[0].y; }
			// if(k === 2 && o ===  1) { a.x =  constraints[1].x; a.y =  constraints[1].y; }
			
			// for b
			// if(k === 0 && o === -1) { b.x = -constraints[1].x; b.y =  constraints[1].y; }
			// if(k === 0 && o ===  1) { b.x =  constraints[0].x; b.y = -constraints[0].y; }
			// if(k === 1 && o === -1) { b.x = -constraints[2].x; b.y =  constraints[2].y; }
			// if(k === 1 && o ===  1) { b.x = -constraints[2].x; b.y = -constraints[2].y; }
			// if(k === 2 && o === -1) { b.x =  constraints[1].x; b.y =  constraints[1].y; }
			// if(k === 2 && o ===  1) { b.x = -constraints[0].x; b.y = -constraints[0].y; }
			// if(k === 0 && o === -1) { b.x = 0; b.y = 0; }
			// if(k === 0 && o ===  1) { b.x = 0; b.y = 0; }
			// if(k === 1 && o === -1) { b.x = 0; b.y = 0; }
			// if(k === 1 && o ===  1) { b.x = 0; b.y = 0; }
			// if(k === 2 && o === -1) { b.x = 0; b.y = 0; }
			// if(k === 2 && o ===  1) { b.x = 0; b.y = 0; }
		}
		
		this.constraints.set(b.body + "|" + a.body, Matter.Constraint.create({
			bodyA: this.modules.get(a.body).Matter, pointA: { x: a.x, y: a.y },
			bodyB: this.modules.get(b.body).Matter, pointB: { x: b.x, y: b.y },
			
			damping: 0,
			stiffness: 1
		}));
		
		this.constraints.get(b.body + "|" + a.body).meta = { owner, spaceship };
		
		return { a: a.body, b: b.body };
	}
	
	// TODO: get a better name like `new_module_from_category`
	add_by_type(world, owner, spaceship, id, category, {x, y, d}, {level, interval, size, main}, angle) {
		// FIXME: maybe use a hash for legibility?
		switch (category) {
			
			case "Q1": // capsules
				new Q1(world, owner, spaceship, id, { x, y, d }, {level, interval, size, main}, angle);
				break;
			
			case "T1": // structs
				new T1(world, owner, spaceship, id, { x, y, d }, {level, interval, size}, angle);
				break;
				
			case "R3": // thrusters
				new R3(world, owner, spaceship, id, { x, y, d }, {level, interval, size}, angle);
				break;
			
		}
	}
	
	add_modules(world, owner, spaceship, grid, modules, position) {
		let size, level, interval, main;
		
		let coord_list = [];
		
		for(let i = 0; i < modules.length; i++) {
			// fourth item in every module indicates it's category, remove it and set `category` to it
			// BUG: `.pop()` doesn't take any arguments
			// TODO: rewrite this body
			let props = modules[i].pop(3);
			let category = props[0];
			
			if (!props[1]) {
				props[1] = { };
			}
			
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
			
			let tri_to_sqr_coords = Spaceship.tri_to_sqr_coords( grid.d, modules[i] );
			let coords = Spaceship.coords(position, tri_to_sqr_coords, 1);
			coord_list.push({x: coords.x, y: coords.y});
			
			// TODO: should the 50 below be hard coded? I was thinking about using that number as zoom, but thats not necesary bc of p5
			coords = Spaceship.scale_coords(coords, 50);
			
			this.add_by_type(world, owner, spaceship, id, category, { x: coords.x, y: coords.y, d: coords.d }, {level, interval, size, main}, coords.angle);
		}
		
		this.set_projected_torques(this.centroid);
		
		// TODO: add constraints right after module was added instead of waiting for all of them to be added to world
		this.add_constraints(world, owner, spaceship, modules, grid.d, size);
		
		// TODO: make check to see if there are any errors in `add_by_type` and `add_constraints` and return bool
	}
	
	add_constraints(world, owner, spaceship, modules, dir, size) {
		let list = [];
		
		//create three ordered lists ordered by xy, yz, zx
		for(let i = 0; i < 3; i++) {
			
			let j = (i + 1) % 3;
			let k = (i + 2) % 3;
			
			
			// TODO: explain this mess
			// start sorting arrays and add to `list`, arrays to be sorted are copies of `mods` + `spaceship.cap_coords` which is `[0,0,0]`
			list[i] = [...modules].sort((a, b) => {
				if (a[i] === b[i]) {
					if (a[j] === b[j]) {
						if (Math.abs(a[k] - b[k]) === 1) {
							// if two consecutive modular number coordinates are followed by a last coordinate in both arrays which has a difference of one
							// then the two modules are adjacent and should have a constraint
							this.add_constraint(world, owner, spaceship, a, b, k, dir, size);
							// add a neighbor
							this.modules.get(a.toString()).neighbors.push(b.toString());
							this.modules.get(b.toString()).neighbors.push(a.toString());
							
							// FIXME: idk what's up with below comment
							// console.log([a.toString(), ...this.modules.get(a.toString()).meta.neighbors]);
							// console.log([b.toString(), ...this.modules.get(b.toString()).meta.neighbors]);
							// TODO: create a polygon from these
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
		
		Matter.Composite.add(this.composite, [ // add to spaceship.composite instead
			this.constraints.get(body_pair.a + "|" + body_pair.b),
			this.constraints.get(body_pair.b + "|" + body_pair.a)
		]);
	}
	
	// FIXME: idk what below function should do
	recalculate_d_given_neighbors(current_d, neighbors) {
		if( current_d === 0 ) {
			
		}
	}
	
	// origin_d represents direction of main or capsule which can be either 0, or 1;
	// while output d is the orientation of module given it's coords and origin_d
	static tri_to_sqr_coords(origin_d, [ x, y, z ]) {
		// NOTE: simplify if-elses by checking position parameter before entering the equation
		// console.log({x, y, z});
		
		if (![0, 1].includes(origin_d)) {
			return console.error(`${origin_d} is not a correct position parameter`);
		}
		
		if (origin_d === 0) {
			origin_d = -1;
		} else if (origin_d === 1) {
			origin_d =  1;
		}
		
		// if x, y, x are all whole numbers
		if(x % 1 === 0 && y % 1 === 0 && z % 1 === 0) {
			x = z - x;
			y = -origin_d * y;
			
			if (origin_d ===  1) { origin_d = 1; } else
			if (origin_d === -1) { origin_d = 2; }
		
			let x_axis_d = (x % 2 + origin_d) % 2;
			let y_axis_d = (y % 2 + origin_d) % 2;
			let d = ((x_axis_d + y_axis_d) % 2 + origin_d) % 2;
			
			return { x, y, d };
		}
		
		// FIXME: look at below code
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
		
		
		
		// TODO: support for 0.5 width modules
		
		let angle;
		let y_offset = (1 * Math.sqrt(12) / 12) / 2;
		
		if (sqr_coords.d === 0) { angle = 3 * Math.PI / 2; y_offset *= -1; } else
		if (sqr_coords.d === 1) { angle =     Math.PI / 2; y_offset *=  1; }
		
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
	
	static load(world, owner, spaceship, modules) {
	// static load(world, owner, spaceship, d, modules) {
		// let angle;
		// if(d === 0) { angle = 3 * Math.PI / 2; } else
		// if(d === 1) { angle =     Math.PI / 2; }
		
		// universe.users.get(owner).spaceships.get(spaceship).position.d = d
		// universe.users.get(owner).spaceships.get(spaceship).grid.d = d
		
		// add modules once spaceship is virtualy in existance
		let grid = {};
		
		for (let i = 0; i < modules.length; i += 1) {
			// FIXME: idk where these magical idexes are coming from
			if (modules[i][3][1] && modules[i][3][1].main) {
				grid = modules[i][3][1].grid;
			}
		}
		
		universe.users.get(owner).spaceships.get(spaceship).add_modules(
			world,
			owner,
			spaceship,
			
			grid,
			
			modules,
			universe.users.get(owner).spaceships.get(spaceship).position
		);
	}
	
	static reset(world, owner, spaceship) {
		// clear bodies
		Matter.Composite.clear(universe.users.get(owner).spaceships.get(spaceship).composite, false, true);
		
		// clear virtual bodies
		universe.users.get(owner).spaceships.get(spaceship).modules.clear();
		universe.users.get(owner).spaceships.get(spaceship).capsules.clear();
		universe.users.get(owner).spaceships.get(spaceship).constraints.clear();
	}
	
	static remove_module(world, owner, spaceship, id) {
		let module = universe.users.get(owner).spaceships.get(spaceship).modules.get(id);
		let MatterModule = universe.users.get(owner).spaceships.get(spaceship).modules.get(id).Matter;
		
		// remove body
		Matter.Composite.remove(
			universe.users.get(owner).spaceships.get(spaceship).composite,
			MatterModule,
			true
		);
		
		universe.users.get(owner).spaceships.get(spaceship).add_by_type(
		// world, owner, spaceship, id, category, {x, y, d}, {level, interval, size, main}, angle
			world, "", "", "",
			module.category,
			{
				x: module.position.x,
				y: module.position.y
			},
			{
				level: module.level,
				interval: module.interval,
				size: module.size
			},
			module.angle
		);
		
		// delete virtual body
		// TODO: I don't like this approach, but it's what I could come up with at the moment, figure something out later
		universe.users.get(owner).spaceships.get(spaceship).modules.delete(id);
		universe.users.get(owner).spaceships.get(spaceship).capsules.delete(id);
		
		Spaceship.remove_constraints(owner, spaceship, id);
	}
	
	static erase_module(world, owner, spaceship, id) {
		
		let module = universe.users.get(owner).spaceships.get(spaceship).modules.get(id);
		let matter_module = universe.users.get(owner).spaceships.get(spaceship).modules.get(id).Matter;
		
		// remove body
		Matter.Composite.remove(
			universe.users.get(owner).spaceships.get(spaceship).composite,
			matter_module,
			true
		);
		
		// delete virtual body
		// TODO: I don't like this approach, but it's what I could come up with at the moment, figure something out later
		// I don't know what the problem was here and in static remove_module
		universe.users.get(owner).spaceships.get(spaceship).modules.delete(id);
		universe.users.get(owner).spaceships.get(spaceship).capsules.delete(id);
		
		Spaceship.remove_constraints(owner, spaceship, id);
	}
	
	static remove_constraints(owner, spaceship, module_id) {
		// find modules attached to body
		let constraints = []
		
		for (let [id, contraint] of universe.users.get(owner).spaceships.get(spaceship).constraints) {
			if (id.includes(module_id)) { Spaceship.remove_constraint(owner, spaceship, id); /*constraints.push(id);*/ }
		}
	}
	
	static remove_constraint(owner, spaceship, id) {
		// remove from MatterJS
		Matter.Composite.remove(
			universe.users.get(owner).spaceships.get(spaceship).composite,
			universe.users.get(owner).spaceships.get(spaceship).constraints.get(id),
			true
		);
		
		// TODO: remove from virtual space
		universe.users.get(owner).spaceships.get(spaceship).constraints.delete(id);
	}
}


let load =  Spaceship.load;
let reset = Spaceship.reset;

export default Spaceship;
export {
	load,
	reset
};