import Matter from "matter-js";

import universe from "../../../universe.js";

import { map_set } from "../../../../util/util.js";
import Spaceship from "../Spaceship.js";
import User from "../../User.js";

interface IModuleConstructorParameters {
	world : Matter.World,
	owner : string,
	spaceship : string,
	id : string,
	position : { x : number, y : number, d : number },
	meta : { level : string, interval : string, size : number },
	angle : number
}

class Module {
	owner : string = "";
	spaceship : string = "";
	
	category : string;
	class : string = "regular";
	code : string = "";
	// FIXME: should I have some defaults for level and interval as well?
	level : string;
	interval : string;
	
	neighbors : string[] = [];
	
	position : { x : number, y : number, d: number};
	
	color = ["#333333", 0.5];
	
	velocity : { x : number, y : number };
	torque : number;
	
	angle : number;
	// TODO: size should be 1 or 0.5, so maybe use enum?
	size : number;
	
	__id__ : string;
	
	
	// TODO: make all the properties below
	// HACK: should not be using any right here
	Matter : any & Matter.Body & {
		meta: {
			owner: string,
			spaceship: Spaceship,
			__id__: string
		},
		position: { x: number, y: number },
		velocity: { x: number, y: number },
		force: { x: number, y: number },
		torque: number,
		angle: number
	} = { };
	
	// constructor(
	// 	world : Matter.World,
	// 	owner : string,
	// 	spaceship : string,
	// 	id : string,
	// 	{ x, y, d } : { x : number, y : number, d : number },
	// 	{ level, interval, size } : { level : string, interval : string, size : number },
	// 	angle : number = Math.PI / 2
	// ) {
	constructor(
		params : IModuleConstructorParameters
	) {
		this.owner = params.owner ?? "";
		this.spaceship = params.spaceship ?? "";
		
		this.level    = params.meta.level;
		this.interval = params.meta.interval;
		
		// this.position = { x, y };
		// if ( d === 0 || d === 1 ) { this.position.d = d; }
		// this.position.d = d;
		this.position = params.position;
		
		this.angle = params.angle;
		this.size = params.meta.size;
		
		this.__id__ = params.id ?? params.position.x + "," + params.position.y;
		
		// add to user's spaceship unless these are not specified
		if (params.owner && params.spaceship) {
			map_set({
				map: (<Spaceship>(<User>universe.users.get(params.owner)).spaceships.get(params.spaceship)).modules,
				key: this.__id__,
				val: this
			});
			
			// FIXME: not sure what this does?
			this.Matter = Module.create(params.world, params.owner, params.spaceship, this, params.meta.size);
			
			this.Matter.meta = {
				owner: this.owner,
				spaceship: this.spaceship,
				__id__: this.__id__
			};
		} else {
			if(!universe.modules.has(this.__id__)) {
				this.color = ["#000000", 1]; // <- for now so that I can look at the text
				
				map_set({
					map: universe.modules,
					key: this.__id__,
					val: this
				});
				
				this.Matter = Module.create(params.world, params.owner, params.spaceship, this, params.meta.size);
			} else {
				console.error("this module ID is already populated, please shift the coordinates of this module and try again");
			}
		}
	}
	
	update() {
		// DEBUG: too much recursion, go to capsule update()
		this.position = {
			x: this.Matter.position.x,
			y: this.Matter.position.y,
			d: this.position.d
		};
		
		this.velocity = {
			x: this.Matter.velocity.x,
			y: this.Matter.velocity.y
		};
		
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

	static create(world, owner, spaceship, module, size) {
		// let module_body;
		// if( size === 0.5 ) { // NOTE: I was trying to change the angle here?
		// 	if( self.angle ===  Math.PI / 2 ) { self.angle = -Math.PI / 2; } else
		// 	if( self.angle === -Math.PI / 2 ) { self.angle =  Math.PI / 2; }
		// }
		
		let length, mass
		if( size === 0.5 ) { length = Module.h_length; mass = 0.25; }
		if( size === 1   ) { length = Module.w_length; mass = 1   ; }
		
		let module_body = Matter.Bodies.polygon(
			module.position.x,
			module.position.y,
			3,
			length,
			{
				angle: module.angle,
				mass
			}
		);
		
		// add to user's spaceship unless these are not specified
		// FIXME: should this be `&&` instead?
		if (owner || spaceship) {
			Matter.World.add((<Spaceship>(<User>universe.users.get(owner)).spaceships.get(spaceship)).composite, module_body);
		} else {
			Matter.World.add(world, module_body);
		}
		
		return module_body;
	}
	
	// TODO: use a static class to replace an enum
		// https://masteringjs.io/tutorials/fundamentals/enum
	static get intervals() {
		// green, yellow, orange, red, pink, violet, blue, light blue, white, multicolor, black with white contrast, dark green
		return [ "Alpha", "Beta", "Charlie", "Delta", "Echo", "Foxtrot", "Golf", "Hotel", "India", "Juliet", "Kilo", "Lima" ];
	}
	
	static get categories() {
		return {
			// TODO: Add descriptions and all of this, load async from JSON file or something
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
	
	static get special_subclass() {
		// TODO: revise these special subclasses
		return {
			"time"  : ["x2", "x5", "x10", "x50", "x100"],
			"level" : ["/2", "/5", "/10", "/20",  "/40"]
		};
	}
	
	static get codes() {
		// TODO: come up with new
		return {
			"0": "none",
			"1": "overclock"
		}
	}
}

export default Module;
export {
	IModuleConstructorParameters
}