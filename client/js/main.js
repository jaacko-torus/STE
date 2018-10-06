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
		showCollisions     : true,
		showAngleIndicator : true,
		// wireframes: false
	}
});
Render.run(render);

// create runner
const runner = Runner.create();
Runner.run(runner, engine);


// --------------------------------------------------------------------------------------------------------------------
/* -- classes  -- */

let universe = {};
universe.modules = new Map();
universe.capsules = new Map();
universe.users = {}; // useless rn
universe.spaceships = new Map();

// spaceship - includes capsule, synonimous with "user"
class module {
	constructor(owner, id, {x, y, d}, angle = Math.PI / 2) {
		this.owner = owner;

		this.position     = { x, y, d };
		this.velocity     = { x: 0, y: 0 };

		this.angle        = (         angle );
		this.angularSpeed = ( Math.PI / 900 );
		
		this.module = module.create(this);
		module.add_to_list(universe.modules, id, this);
	}
	
	get speed() {
		let angle = this.angle;
		return {
			get x() { return -Math.cos(angle) },
			get y() { return -Math.sin(angle) }
		}
	}
	
	// size refers to the size of a single face of the triangle
	static get size() { return 50; }
	static get height() { return module.size * Math.sqrt(3) / 2; }
	static get length() { return module.size * Math.sqrt(3) / 3; }
	static get constraints() {
		let s = module.size;
		// return [
		// 	{ x:        - (3/4 * s/16), y: -(s*Math.sqrt(3)/3) + (3/4 * s*Math.sqrt(3)/16) },
		// 	{ x: -(s/2) + (3/4 * s/16), y:  (s*Math.sqrt(3)/6) - (3/4 * s*Math.sqrt(3)/16) },
		// 	{ x: -(s/2) + (3/2 * s/16), y:   s*Math.sqrt(3)/6                              }
		// ];

		return [
			{ x: -(   s/8 ), y:  (s*Math.sqrt(3)/3) - (s*Math.sqrt(3)/8) },
			{ x: -( 3*s/8 ), y: -(s*Math.sqrt(3)/6) + (s*Math.sqrt(3)/8) },
			{ x: -(   s/4 ), y: -(s*Math.sqrt(3)/8) }
		];
	}
	
	static add_to_list(list, id, self) { list.set( id, self ); }

	static create(self) {
		let mod = Bodies.polygon(self.position.x, self.position.y, 3, module.length, { angle: self.angle });
		World.add(world, mod);
		return mod;
	}

	static update() {
		universe.modules.forEach((mod_value, id_key) => {
			mod_value.position = { x: mod_value.module.position.x, y: mod_value.module.position.y, d: mod_value.position.d };
			mod_value.velocity = { x: mod_value.module.velocity.x, y: mod_value.module.velocity.y };

			mod_value.angle           = mod_value.module.angle;
			mod_value.angularVelocity = mod_value.module.angularVelocity;
		});
	}
}


// capsules


class capsule extends module {
	constructor(owner, id, position, angle) {

		super(owner, id, position, angle);
		// console.log(position.y);

		this.keys = {
			left  : false,
			up    : false,
			right : false,
			down  : false
		};

		module.add_to_list(universe.capsules, id, this);
	}

	get speed() { return super.speed; }
	
	static event_handler(mod_value) {
		let speed_x, speed_y;
		// NOTE: torque will no longer be needed once basic thrusters are implemented
		// NOTE: torque will be needed once directional thrusters are implemented
		if(mod_value.position.d === 0) { speed_x = -mod_value.speed.x; speed_y = -mod_value.speed.y; }
		if(mod_value.position.d === 1) { speed_x =  mod_value.speed.x; speed_y =  mod_value.speed.y; }

		if( mod_value.keys.left  ) { mod_value.module.torque = -mod_value.angularSpeed }
		if( mod_value.keys.up    ) { mod_value.module.force = { x:  speed_x/8000, y:  speed_y/8000 }; }
		if( mod_value.keys.right ) { mod_value.module.torque =  mod_value.angularSpeed }
		if( mod_value.keys.down  ) { mod_value.module.force = { x: -speed_x/8000, y: -speed_y/8000 }; }
	}
	
	static update() {
		module.update();

		universe.capsules.forEach((mod_value, id_key) => {
			capsule.event_handler(mod_value);
		});
	}
}


// spaceship


class spaceship {
	constructor(owner, id, position, cap = "main", mods = [], angle = 3 * Math.PI / 2) {
		if(position.d === 0) { angle = 3 * Math.PI / 2; } else
		if(position.d === 1) { angle =     Math.PI / 2; }

		// in the spaceship class, owner refer to the user
		this.owner = owner;

		this.position = { x: position.x, y: position.y, d: position.d };
		this.angle = angle;

		this.capsule = {};
		this.modules = {};
		
		this.add_modules(id, cap, mods, this.position);
		module.add_to_list(universe.spaceships, id, this);
	}
	
	add_modules(owner, cap, mods, position) {
		// first add the capsule
		let cap_coords = spaceship.cap_coords;
		let coords = spaceship.coords( position, spaceship.tri_to_sqr_coords( position.d, cap_coords[0], cap_coords[1], cap_coords[2] ) );
		console.log(coords);
		this.capsule = new capsule(owner, cap, { x: coords.x, y: coords.y, d: coords.d }, coords.angle);

		// then add all other modules
		for(let i = 0; i < mods.length; i++) {
			let id = mods[i].toString();
			let coords = spaceship.coords( position, spaceship.tri_to_sqr_coords( position.d, mods[i][0], mods[i][1], mods[i][2] ) );
			console.log(coords);
			this.modules[id] = new module(owner, id, { x: coords.x, y: coords.y, d: coords.d }, coords.angle);
		}
	}

	static get cap_coords() { return [  0,  0,  0 ]; }

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
		
		let d = (x % 2 + origin_d) % 2;
		// let d = (y % 2 + origin_d) % 2;
		console.log({x, y})
		return { x, y, d };
	}

	static coords(origin, sqr_coords) {
		let angle, y_offset = (module.size * Math.sqrt(12) / 12) / 2;
		
		if(sqr_coords.d === 0) { angle = 3 * Math.PI / 2; y_offset *= -1; } else
		if(sqr_coords.d === 1) { angle =     Math.PI / 2; y_offset *=  1; }
		
		let x = origin.x + ( (module.size / 2) * sqr_coords.x );
		let y = origin.y - (  module.height    * sqr_coords.y ) + y_offset;

		return { x, y, d: sqr_coords.d, angle };
	}
}




let ss = new spaceship(
	"jaacko0",
	"ss0",
	{ x: 200, y: 300, d: 1 },
	"cap0",
	[
		// testing x
		[  0,  0,  1 ],
		[  1,  0,  0 ],
		[  1,  0, -1 ],
		[  1,  0, -2 ],
		[  2,  0, -2 ],

		// testing y
		// [ -1, -1, -1 ],
		[  0,  1,  0 ],
		[  0,  1, -1 ],
		// [  2,  2,  2 ]
	]
);

// let hs = new spaceship(
// 	"jaacko1",
// 	"ss1",
// 	{ x: 150, y: 200, d: 0 },
// 	"cap1",
// 	[
// 		[  1,  0,  0 ],
// 		[  0,  0,  1 ]
// 	]
// );

// --------------------------------------------------------------------------------------------------------------------
/* -- Making new objects -- */

/*
 1. Make spaceship object
 2. add a capsule
 3. add modules
 4. You're allowed to add them all at once using the `spaceship` class
*/


// let ss = {}; // spaceship

// ss.mod1 = new module("none", "mod1", {x:  50, y:  50});
// ss.capsule = new capsule("jaackotorus", "cap0", { x: 150, y: 150 });



// ss.mod2 = new module("[1,0,0]", {
// 	x: ss.capsule.position.x + (module.size / 2),
// 	y: ss.capsule.position.y - (module.size * Math.sqrt(12) / 12)
// }, 3 * Math.PI / 2);
// ss.mod3 = new module("[0,0,1]", {
// 	x: ss.capsule.position.x - (module.size / 2),
// 	y: ss.capsule.position.y - (module.size * Math.sqrt(12) / 12)
// }, 3 * Math.PI / 2);

// ss.c1 = Constraint.create({
// 	bodyA  : Capsules[ss.capsule.id] , pointA : { x: -module.constraints[0].x, y:  module.constraints[0].y },
// 	bodyB  : Modules[ss.mod2.id]     , pointB : { x:  module.constraints[1].x, y: -module.constraints[1].y }
// });

// ss.c2 = Constraint.create({
// 	bodyA  : Capsules[ss.capsule.id] , pointA : { x: -module.constraints[1].x, y:  module.constraints[1].y },
// 	bodyB  : Modules[ss.mod2.id]     , pointB : { x:  module.constraints[0].x, y: -module.constraints[0].y }
// });

// World.add(world, [ss.c1, ss.c2]);

// --------------------------------------------------------------------------------------------------------------------
/* -- input events & loop -- */


function add_keyboard_events() {
	let ake = (key_dir) => {
		document.addEventListener(key_dir, (e) => {
			if( key_dir === "keydown" ) { key_dir =  true; }
			if( key_dir === "keyup"   ) { key_dir = false; }
			
			if (e.key.toLowerCase() === "w" || e.key === "ArrowUp"    ) { ss.capsule.keys.up    = key_dir; }
			if (e.key.toLowerCase() === "a" || e.key === "ArrowLeft"  ) { ss.capsule.keys.left  = key_dir; }
			if (e.key.toLowerCase() === "d" || e.key === "ArrowRight" ) { ss.capsule.keys.right = key_dir; }
			if (e.key.toLowerCase() === "s" || e.key === "ArrowDown"  ) { ss.capsule.keys.down  = key_dir; }
		});
	}

	ake("keydown");
	ake("keyup");
}

add_keyboard_events();

let counter = 0;
Events.on(engine, "beforeUpdate", (event) => { // update loop, 60fps, 60 counter = 1sec
	counter += 1;
	capsule.update();
});


// --------------------------------------------------------------------------------------------------------------------
/* -- render -- */


// fit the render viewport to the scene; camera
Render.lookAt(render, {
	min: { x: -40, y: -60 },
	max: { x: 800, y: 600 }
});