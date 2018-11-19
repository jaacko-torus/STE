// Matter modules

const Engine      = Matter.Engine;
const	Render      = Matter.Render;
const	Runner      = Matter.Runner;
const	Body        = Matter.Body;
const	Events      = Matter.Events;
const	World       = Matter.World;
const	Bodies      = Matter.Bodies;
const Constraint  = Matter.Constraint;
const Constraints = Matter.Constraints;

// create engine
const engine = Engine.create();
const world  = engine.world;

// set gravity to 0
engine.world.gravity.x = 0;
engine.world.gravity.y = 0;

// create renderer
const render = Render.create({
	element : document.body,
	engine  : engine,
	options : {
		width              : window.innerWidth,
		height             : window.innerHeight,
		// showCollisions     : true,
		showAngleIndicator : true,
		// wireframes: false
	}
});
Render.run(render);

// create runner
const runner = Runner.create();
Runner.run(runner, engine);

/*
	All modules presets will be named as follows:
	`module_preset_d<direction of capsule>_<preset name>`

	For custom sets during runtime use the following:
	`module_custom_d<direction of capsule>_<preset name>`
*/

/*
	The 5x5 is a module formation representing a grid of 5 by 5 triangles,
	with 5 crossing triangle as it's base and a height of 5 triangle heights stacked on top
*/

let module_preset_d0_single = [ [  0,  0,  0, "q1" ] ];
let module_preset_d1_single = [ [  0,  0,  0, "q1" ] ];

let module_preset_d1_dt = [ // double thruster
	[  0   ,    0 ,  0   , "q1" ],
	[  0.5 ,    1 ,  0   , "r3" ],
	[  0   ,    1 ,  0.5 , "r3" ]
]

let module_preset_d0_5x5 = [ // NOTE: do not use for now
	// 2
	[  0,  2, -2, "t1" ],
	[  0,  2, -1, "t1" ],
	[ -1,  2, -1, "t1" ],
	[ -1,  2,  0, "t1" ],
	[ -2,  2,  0, "t1" ],

	// 1
	[  1,  1, -1, "t1" ],
	[  0,  1, -1, "t1" ],
	[  0,  1,  0, "t1" ],
	[ -1,  1,  0, "t1" ],
	[ -1,  1,  1, "t1" ],

	// 0
	[  1,  0, -1, "t1" ],
	[  1,  0,  0, "t1" ],
	[  0,  0,  0, "q1" ],
	[  0,  0,  1, "t1" ],
	[ -1,  0,  1, "t1" ],

	// -1
	[  2, -1,  0, "t1" ],
	[  1, -1,  0, "t1" ],
	[  1, -1,  1, "t1" ],
	[  0, -1,  1, "t1" ],
	[  0, -1,  2, "t1" ],

	// -2
	[  2, -2,  0, "t1" ],
	[  2, -2,  1, "r3" ],
	[  1, -2,  1, "t1" ],
	[  1, -2,  2, "r3" ],
	[  0, -2,  2, "t1" ],
	// two bottom ones are thrusters
];

let module_preset_d1_5x5 = [ // NOTE: do not use for now
	// 2
	[  2, -2,  0, "t1" ],
	[  2, -2,  1, "t1" ],
	[  1, -2,  1, "t1" ],
	[  1, -2,  2, "t1" ],
	[  0, -2,  2, "t1" ],
	
	// 1
	[  1, -1,  0, "t1" ],
	[  2, -1,  0, "t1" ],
	[  1, -1,  1, "t1" ],
	[  0, -1,  1, "t1" ],
	[  0, -1,  2, "t1" ],
	
	// 0
	[  1,  0, -1, "t1" ],
	[  1,  0,  0, "t1" ],
	[  0,  0,  0, "q1" ],
	[  0,  0,  1, "t1" ],
	[ -1,  0,  1, "t1" ],
		
	// -1
	[  1,  1, -1, "t1" ],
	[  0,  1, -1, "t1" ],
	[  0,  1,  0, "t1" ],
	[ -1,  1,  0, "t1" ],
	[ -1,  1,  1, "t1" ],
		
	// -2 
	[  0,  2, -2, "r3" ],
	[  0,  2, -1, "t1" ],
	[ -1,  2, -1, "r3" ],
	[ -1,  2,  0, "t1" ],
	[ -2,  2,  0, "r3" ]
	// three bottom modules are thrusters
];


// --------------------------------------------------------------------------------------------------------------------
/* -- classes  -- */

let universe = {};
universe.modules = new Map();
universe.capsules = new Map();
universe.spaceships = new Map();
universe.users = new Map();

universe.constraints = new Map();


// spaceship - includes capsule, synonimous with "user"
class module {
	constructor(owner, id, {x, y, d}, {level, interval, size}, angle = Math.PI / 2) {
		this.owner = owner;

		this.level    = level;
		this.interval = interval;

		this.position = { x, y, d };
		this.velocity = { x: 0, y: 0 };
		this.angle    = angle;
		
		this.module = module.create(this, size);
		module.add_to_list(universe.modules, id, this);
	}
	
	// size refers to the size of a single face of the triangle
	// height refers to the height of the triangle
	// length is the value which needs to be pluged in in order to have an equilateral triangle with a side size of specified value.
	static get w_size()   { return 50; } // whole
	static get w_height() { return module.w_size * Math.sqrt(3) / 2; }
	static get w_length() { return module.w_size * Math.sqrt(3) / 3; }

	static get h_size()   { return module.w_size / 2; } // half
	static get h_height() { return module.h_size * Math.sqrt(3) / 2; }
	static get h_length() { return module.h_size * Math.sqrt(3) / 3; }
	
	static get w_constraints() {
		let s = module.w_size;
		return [
			{ x: -(     s / 8 ), y:  (s * Math.sqrt(3) / 3) - (s * Math.sqrt(3) / 8) },
			{ x: -( 3 * s / 8 ), y: -(s * Math.sqrt(3) / 6) + (s * Math.sqrt(3) / 8) },
			{ x: -(     s / 4 ), y: -(s * Math.sqrt(3) / 6) }
		];
	}

	static get h_constraints() {
		let s = module.h_size;
		return [
			{ x: -(     s / 8 ), y:  (s * Math.sqrt(3) / 3) - (s * Math.sqrt(3) / 8) },
			{ x: -( 3 * s / 8 ), y: -(s * Math.sqrt(3) / 6) + (s * Math.sqrt(3) / 8) },
			{ x: -(     s / 4 ), y: -(s * Math.sqrt(3) / 6) }
		];
	}
	
	static add_to_list(list, id, self) { list.set( id, self ); }

	static create(self, size) {
		let mod;
		if( size === 0.5 ) { mod = Bodies.polygon(self.position.x, self.position.y, 3, module.h_length, { angle: self.angle, mass: 0.25 }); }
		if( size === 1   ) { mod = Bodies.polygon(self.position.x, self.position.y, 3, module.w_length, { angle: self.angle, mass: 1    }); }

		World.add(world, mod);
		return mod;
	}
	
	static update() {
		universe.modules.forEach((mod_value, id_key) => {
			mod_value.position = { x: mod_value.module.position.x, y: mod_value.module.position.y, d: mod_value.position.d };
			mod_value.velocity = { x: mod_value.module.velocity.x, y: mod_value.module.velocity.y };
			
			mod_value.angle           = mod_value.module.angle;
			mod_value.angularVelocity = mod_value.module.angularVelocity;
		})
	}
	static get intervals() {
		// green, yellow, orange, red, pink, violet, blue, light blue, white, multicolor, black with white contrast, dark green
		return [ "Alpha", "Beta", "Charlie", "Delta", "Echo", "Foxtrot", "Golf", "Hotel", "India", "Juliet", "Kilo", "Lima" ];
	}
	
	static get categories() {
		return {
			// index 0 is the name of the sub-category
			"q": [ "capsule"     , "normal", "p_ai", [ "u_ai", "infobot", "pm_bot", "bms_bot", "sig_bot" ] ],
			"w": [ "weapon"      , "physical", "short_distance", "long_distance" ],
			"e": [ "shield"      , "physical", "electric" ],
			"r": [ "thruster"    , "chemical", "fision", "electric", "fusion", "anti_matter", "warp", ],
			"t": [ "struct"      , "normal" ],
			"y": [ "container"   , "normal" ],
			"u": [ "info_mod"    , "text", "table", "database" ],
			"i": [ "synthesizer" , "synthesizer", "item_builder", "item_container", "blueprint_container" ],
			"m": [ "special"     , "time", "item" ],
		};
	}
	
	static get classes() {
		return ["regular", "special", "advanced"];
	}
	
	static get special_subclass() {
		return {
			"time"  : ["x2", "x5", "x10", "x50", "x100"],
			"level" : ["/2", "/5", "/10", "/20",  "/40"]
		};
	}
	
	static get codes() {
		return {
			"0": "none",
			"1": "overclock"
		}
	}
}


// structs


class struct extends module {
	constructor(owner, id, position, meta, angle) {
		super(owner, id, position, meta, angle);

		this.class    = "regular";
		this.code     = "0";
	}
}

class t1 extends struct {
	constructor(owner, id, position, meta, angle) {
		super(owner, id, position, meta, angle);

		this.category = "T1";
	}
}


// capsules


class capsule extends module {
	constructor(owner, id, position, meta, angle) {
		super(owner, id, position, meta, angle);

		this.class    = "regular";
		this.code     = "0";
		
		module.add_to_list(universe.capsules, id, this);
	}

	// get angularSpeed() { return Math.PI / 900; }
	
	static update() { module.update(); }
}

class q1 extends capsule {
	constructor(owner, id, position, meta, angle) {
		super(owner, id, position, meta, angle);
		
		this.category = "Q1"

		this.keys = {
			left  : false,
			up    : false,
			right : false,
			down  : false
		};
	}
	
	get speed() { return super.speed; }

	static event_handler(cap) {
		for(let mod in universe.spaceships.get(cap.owner).modules) {
			if(universe.spaceships.get(cap.owner).modules[mod].category === "R3") {
				universe.spaceships.get(cap.owner).modules[mod].event_handler(cap);
			}
		}
	}
	
	static update() {
		capsule.update();

		universe.capsules.forEach((cap, id) => {
			q1.event_handler(cap);
		});
	}
}


// thrusters


// NOTE: thrusters need at least one clear side
class thruster extends module {
	constructor(owner, id, position, meta, angle) {
		super(owner, id, position, meta, angle);

		this.class    = "regular";
		this.code     = "0";
	}
	
	get speed() {
		let angle = this.angle;
		let rate  = 1/8000;
		return {
			get x() { return -Math.cos(angle) * rate; },
			get y() { return -Math.sin(angle) * rate; }
		};
	}

	get angularSpeed() { return Math.PI / 900; }

	event_handler(cap) {
		let speed_x, speed_y;
		// NOTE: torque will no longer be needed once basic thrusters are implemented
		// NOTE: torque will be needed once directional thrusters are implemented
		if(cap.position.d === 0) { speed_x =  this.speed.x; speed_y =  this.speed.y; }
		if(cap.position.d === 1) { speed_x =  this.speed.x; speed_y =  this.speed.y; }

		if( cap.keys.up    ) { this.module.force  = { x:  speed_x, y:  speed_y }; }
		if( cap.keys.left  ) { this.module.torque = -this.angularSpeed; }
		if( cap.keys.down  ) { this.module.force  = { x: -speed_x, y: -speed_y }; }
		if( cap.keys.right ) { this.module.torque =  this.angularSpeed; }
	}
}

class r3 extends thruster { // electric
	constructor(owner, id, position, meta, angle) {
		super(owner, id, position, meta, angle);

		this.category = "R3";
	}

	event_handler(cap, speed_x, speed_y) {
		super.event_handler(cap, speed_x, speed_y);
	}
}


// spaceship


class spaceship {
	constructor(owner, id, position, mods = [], angle = 3 * Math.PI / 2) {
		if(position.d === 0) { angle = 3 * Math.PI / 2; } else
		if(position.d === 1) { angle =     Math.PI / 2; }

		// in the spaceship class, owner refer to the user
		this.owner = owner;

		this.position = { x: position.x, y: position.y, d: position.d };
		this.angle = angle;

		this.keys = {};

		this.modules = {};
		this.constraints = {};
		
		this.add_modules(id, mods, this.position);
		module.add_to_list(universe.spaceships, id, this);

		universe.users.get(owner).spaceships[id] = this;
	}

	reset(owner) {
		for( let constraint of universe.constraints.keys() ) { universe.constraints.delete(constraint); }

		for( let constraint in this.constraints ) { delete this.constraints[constraint]; }
		for( let module     in this.modules     ) { delete this.modules[module]; }
	}

	w_or_h(coords) {
		let [x, y, z] = coords;
		let total = (x + y + z) % 1;

		if( total === 0   ) { return 1   ; }
		if( total === 0.5 ) { return 0.5 ; }
		// determine if module is whole or half, 1 or 0.5
		// return 1;
	}

	constraint_management(owner, a, b, k, d, size) {
		// array containing the coords for all modules
		let constraints;
		if( size = 0.5 ) { constraints = module.h_constraints; }
		if( size = 1   ) { constraints = module.w_constraints; }

		let i = (k + 1) % 3;
		let j = (k + 2) % 3;

		let o = a[k] - b[k]; // order of numeration and comparison

		a = { x: undefined, y: undefined, body: a.toString() };
		b = { x: undefined, y: undefined, body: b.toString() };

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

		universe.constraints.set(a.body + "|" + b.body, {
			owner,
			constraint: Constraint.create({
				bodyA: universe.modules.get(a.body).module, pointA: { x: a.x, y: a.y },
				bodyB: universe.modules.get(b.body).module, pointB: { x: b.x, y: b.y }
			})
		});

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

		universe.constraints.set(b.body + "|" + a.body, {
			owner,
			constraint: Constraint.create({
				bodyA: universe.modules.get(a.body).module, pointA: { x: a.x, y: a.y },
				bodyB: universe.modules.get(b.body).module, pointB: { x: b.x, y: b.y }
			})
		});

		return { a: a.body, b: b.body };
	}

	add_by_type(owner, id, category, {x, y, d}, {level, interval, size}, angle) {
		// capsules
		if(category === "q1") { this.modules[id] = new q1( owner, id, { x, y, d }, {level, interval, size}, angle); this.keys = this.modules[id].keys; }

		// structs
		if(category === "t1") { this.modules[id] = new t1( owner, id, { x, y, d }, {level, interval, size}, angle); }
		
		// thrusters
		if(category === "r3") { this.modules[id] = new r3( owner, id, { x, y, d }, {level, interval, size}, angle); } // electric, no fuel <- innexpensive and it just works
	}
	
	add_modules(owner, mods, position) {
		let level = "I";
		let interval = "Alpha";

		for(let i = 0; i < mods.length; i++) {
			// remove the fourth item that indicates the category, since the id will not be comprimised of it's category
			let category = mods[i].pop(3);
			let id = mods[i].toString();
			let coords = spaceship.coords( position, spaceship.tri_to_sqr_coords( position.d, mods[i][0], mods[i][1], mods[i][2] ) );

			let size = this.w_or_h(mods[i]);
			this.add_by_type(owner, id, category, { x: coords.x, y: coords.y, d: coords.d }, {level, interval, size}, coords.angle)
		}

		this.add_constraints(owner, mods, position.d); // NOTE: add size prop later
	}

	add_constraints(owner, mods, dir) {
		let list = [];

		//create three ordered lists ordered by xy, yz, zx
		for(let i = 0; i < 3; i++) {

			let j = (i + 1) % 3;
			let k = (i + 2) % 3;

			// start sorting arrays and add to `list`, arrays to be sorted are copies of `mods` + `spaceship.cap_coords` which is `[0,0,0]`
			list[i] = [...mods].sort((a, b) => {
				if(a[i] === b[i]) {
					if(a[j] === b[j]) {
						if(Math.abs(a[k] - b[k]) === 1) {
							// if two consecutive modular number coordinates are followed by a last coordinate in both arrays which has a difference of one, then the two modules are adjacent and should have a constraint
							this.add_constraint(owner, a, b, k, dir);
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

	add_constraint(owner, a, b, k, dir) {
		let c = this.constraint_management(owner, a, b, k, dir);

		World.add(world, [
			universe.constraints.get(c.a + "|" + c.b).constraint,
			universe.constraints.get(c.b + "|" + c.a).constraint
		]);

		return c;
	}

	// origin_d represents direction of main or capsule which can be either 0, or 1;
	// while output d is the orientation of module given it's coords and origin_d
	static tri_to_sqr_coords(origin_d, x, y, z) {
		// NOTE: simplify if-elses by checking position parameter before entering the equation
		console.log({x, y, z});
		
		if(origin_d === 0) { origin_d = -1; } else
		if(origin_d === 1) { origin_d =  1; } else
		{ return console.log("please enter a correct position parameter"); }

		x = z - x;
		y = -origin_d * y;
		
		if(origin_d ===  1) { origin_d = 1; } else
		if(origin_d === -1) { origin_d = 2; }
		
		let x_axis_d = (x % 2 + origin_d) % 2;
		let y_axis_d = (y % 2 + origin_d) % 2;
		let d = ((x_axis_d + y_axis_d) % 2 + origin_d) % 2;

		return { x, y, d };
	}

	static coords(origin, sqr_coords, size) {
		let height;
		if( size = 0.5 ) { size = "h_size"; height = "h_height"; }
		if( size = 1   ) { size = "w_size"; height = "w_height"; }

		let angle, y_offset = (module[size] * Math.sqrt(12) / 12) / 2;
		
		if(sqr_coords.d === 0) { angle = 3 * Math.PI / 2; y_offset *= -1; } else
		if(sqr_coords.d === 1) { angle =     Math.PI / 2; y_offset *=  1; }
		
		let x = origin.x + ( (module[size] / 2) * sqr_coords.x );
		let y = origin.y - (  module[height]    * sqr_coords.y ) + y_offset;

		return { x, y, d: sqr_coords.d, angle };
	}
}


// users

class user {
	constructor(id, name) {
		this.name = name;

		this.spaceships = {};

		universe.users.set(id, this);
	}
}


// creating a spaceship

new user("jaacko0", "jaacko");
new spaceship(
	"jaacko0",
	"ss0",
	{ x: 200, y: 300, d: 1 },
	[ // modules
		// ordered by y, z, x
		// ...module_preset_d1_single
		// ...module_preset_d1_dt
		// ...module_preset_d0_5x5
		...module_preset_d1_5x5
	],
);

let ss;
ss = universe.spaceships.get("ss0");


// --------------------------------------------------------------------------------------------------------------------
/* -- input events & loop -- */


function add_keyboard_events() {
	let ake = (key_dir) => {
		document.addEventListener(key_dir, (e) => {
			if( key_dir === "keydown" ) { key_dir =  true; }
			if( key_dir === "keyup"   ) { key_dir = false; }
			
			if (e.key.toLowerCase() === "w" || e.key === "ArrowUp"    ) { ss.keys.up    = key_dir; }
			if (e.key.toLowerCase() === "a" || e.key === "ArrowLeft"  ) { ss.keys.left  = key_dir; }
			if (e.key.toLowerCase() === "d" || e.key === "ArrowRight" ) { ss.keys.right = key_dir; }
			if (e.key.toLowerCase() === "s" || e.key === "ArrowDown"  ) { ss.keys.down  = key_dir; }
		});
	}

	ake("keydown");
	ake("keyup");
}

add_keyboard_events();

let counter = 0;
Events.on(engine, "beforeUpdate", (event) => { // update loop, 60fps, 60 counter = 1sec
	counter += 1;
	q1.update();
});


// --------------------------------------------------------------------------------------------------------------------
/* -- render -- */


// fit the render viewport to the scene; camera
Render.lookAt(render, {
	min: { x: - 40, y: - 60 },
	max: { x:  800, y:  600 }
});