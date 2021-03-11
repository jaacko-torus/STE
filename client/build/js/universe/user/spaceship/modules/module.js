// const Engine      = Matter.Engine;
// const Render      = Matter.Render;
// const Runner      = Matter.Runner;
// const Body        = Matter.Body;
// const Events      = Matter.Events;
// const World       = Matter.World;
// const Bodies      = Matter.Bodies;
// const Constraint  = Matter.Constraint;
// const Constraints = Matter.Constraints;
// const Composite   = Matter.Composite;
// const Composites  = Matter.Composites;

import { universe } from "../../../universe.js";

class Module {
	constructor(world, owner, spaceship, id, {x, y, d}, {level, interval, size}, angle = Math.PI / 2) {
		this.owner = owner || "";
		this.spaceship = spaceship || "";
		
		this.level    = level;
		this.interval = interval;
		
		// current neighbors
		this.neighbors = [];
		
		// this.position = { x, y };
		// if ( d === 0 || d === 1 ) { this.position.d = d; }
		// this.position.d = d;
		this.position = { x, y, d };
		
		this.color = ["#333333", 0.5];
		
		this.velocity = { x: 0, y: 0 };
		this.angle    = angle;
		this.size     = size;
		
		this.__id__ = id || x + "," + y;
		
		
		this.Matter = {};
		
		// add to user's spaceship unless these are not specified
		if (owner && spaceship) {
			Module.add_to_list(
				universe.users.get(owner).spaceships.get(spaceship).modules,
				this.__id__,
				this
			);
			this.Matter = Module.create(world, owner, spaceship, this, size);
			this.Matter.meta = {
				owner     : this.owner,
				spaceship : this.spaceship,
				__id__    : this.__id__
			};
		} else {
			if(!universe.modules.has(this.__id__)) {
				this.color = ["#000000", 1]; // <- for now so that I can look at the text
				Module.add_to_list(universe.modules, this.__id__, this);
				this.Matter = Module.create(world, owner, spaceship, this, size);
			} else { console.error("this module ID is already populated, please shift the coordinates of this module and try again"); }
		}
	}
	
	update() {
		// DEBUG: too much recursion, go to capsule update()
		this.position = { x: this.Matter.position.x, y: this.Matter.position.y, d: this.position.d };
		this.velocity = { x: this.Matter.velocity.x, y: this.Matter.velocity.y };
		this.angle = this.Matter.angle;
	}
	
	// size refers to the size of a single side of the triangle
	// height refers to the height of the triangle
	// length refers to radius to corner of triangle, it's used by MatterJS
	static get w_size()   { return 50; } // whole
	static get w_height() { return Module.w_size * Math.sqrt(3) / 2; }
	static get w_length() { return Module.w_size * Math.sqrt(3) / 3; }

	static get h_size()   { return Module.w_size / 2; } // half
	static get h_height() { return Module.h_size * Math.sqrt(3) / 2; }
	static get h_length() { return Module.h_size * Math.sqrt(3) / 3; }
	
	static get w_constraints() { // TODO: maybe replace these numbers with `w_size`, `w_height`, and `w_length`, might help
		let s = Module.w_size;
		let h = Module.w_height;
		let l = Module.w_length;
		
		return [
			{ x: -(     s / 8 ), y:  l     - h / 4 },
			{ x: -( 3 * s / 8 ), y: -l / 2 + h / 4 },
			{ x: -(     s / 4 ), y: -l / 2 }
		];
	}

	static get h_constraints() {
		let s = Module.h_size;
		let h = Module.h_height;
		let l = Module.h_length;
		
		return [
			{ x: -(     s / 8 ), y:  l     - h / 4 },
			{ x: -( 3 * s / 8 ), y: -l / 2 + h / 4 },
			{ x: -(     s / 4 ), y: -l / 2 }
		];
	}
	
	static add_to_list(list, id, value, overwrite = true) {
		// TODO: throw error if couldn't overwrite
		if (!overwrite && list.has(id)) {
			console.log("can't overwrite ", list.get(id), " with ", value);
			return false;
		} else {
			list.set( id, value );
			return true;
		}
	}

	static create(world, owner, spaceship, module, size) {
		// let module_body;
		// if( size === 0.5 ) { // NOTE: I was trying to change the angle here?
		// 	if( self.angle ===  Math.PI / 2 ) { self.angle = -Math.PI / 2; } else
		// 	if( self.angle === -Math.PI / 2 ) { self.angle =  Math.PI / 2; }
		// }
		
		let length, mass
		if( size === 0.5 ) { length = Module.h_length; mass = 0.25; }
		if( size === 1   ) { length = Module.w_length; mass = 1   ; }
		// let module_body = Bodies.polygon(module.Matter.position.x, module.Matter.position.y, 3, length, { angle: module.Matter.angle, mass });
		let module_body = Bodies.polygon(module.position.x, module.position.y, 3, length, { angle: module.angle, mass });
		
		// add to user's spaceship unless these are not specified
		if (owner || spaceship) {
			World.add(universe.users.get(owner).spaceships.get(spaceship).composite, module_body);
		} else { World.add(world, module_body); }
		
		return module_body;
	}
	
	static get intervals() {
		// green, yellow, orange, red, pink, violet, blue, light blue, white, multicolor, black with white contrast, dark green
		return [ "Alpha", "Beta", "Charlie", "Delta", "Echo", "Foxtrot", "Golf", "Hotel", "India", "Juliet", "Kilo", "Lima" ];
	}
	
	static get categories() {
		return { // TODO: Add descriptions and all of this, load async from JSON file or something
			// index 0 is the name of the sub-category
			"q": [ "capsule"     , "normal", "p_ai", [ "u_ai", "infobot", "pm_bot", "bms_bot", "sig_bot" ] ],
			"w": [ "weapon"      , "physical", "short_distance", "long_distance" ],
			"e": [ "shield"      , "physical", "electric" ],
			"r": [ "thruster"    , "chemical", "fission", "electric", "fusion", "anti_matter", "warp", ],
			"t": [ "struct"      , "normal" ],
			"y": [ "container"   , "normal" ],
			"u": [ "info_mod"    , "text", "table", "database" ],
			"i": [ "synthesizer" , "synthesizer", "item_builder", "item_container", "blueprint_container" ],
			"m": [ "special"     , "time", "item" ],
		};
	}
	
	static get classes() { return ["regular", "special", "advanced"]; }
	
	static get special_subclass() { // TODO: revise these special subclasses
		return {
			"time"  : ["x2", "x5", "x10", "x50", "x100"],
			"level" : ["/2", "/5", "/10", "/20",  "/40"]
		};
	}
	
	static get codes() { // TODO: come up with new
		return {
			"0": "none",
			"1": "overclock"
		}
	}
}




let add_to_list = Module.add_to_list;
let h_constraints = Module.h_constraints;
let w_constraints = Module.w_constraints;

let w_size   = Module.w_size;
let w_height = Module.w_height;
let w_length = Module.w_length;
let h_size   = Module.h_size;
let h_height = Module.h_height;
let h_length = Module.h_length;

export {
	Module,
	
	add_to_list,
	
	h_constraints,
	w_constraints,
	
	w_size, w_height, w_length,
	h_size, h_height, h_length,
};