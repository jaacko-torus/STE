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

// spaceship - includes capsule, synonimous with "user"
class module {
	constructor(owner, id, position, angle = Math.PI / 2) {
		this.owner = owner;

		this.position     = { x: position.x, y:   position.y };
		this.velocity     = { x:          0, y:            0 };

		this.angle        = (         angle );
		this.angularSpeed = ( Math.PI / 240 );
		
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
	static get length() { return module.size * Math.sqrt(3) / 3 }
	static get constraints() {
		let s = module.size;
		return [
			{ x:        - (3/4 * s/16), y: -(s*Math.sqrt(3)/3) + (3/4 * s*Math.sqrt(3)/16) },
			{ x: -(s/2) + (3/4 * s/16), y:  (s*Math.sqrt(3)/6) - (3/4 * s*Math.sqrt(3)/16) },
			{ x: -(s/2) + (3/2 * s/16), y:   s*Math.sqrt(3)/6                              }
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
			mod_value.position = { x: mod_value.module.position.x, y: mod_value.module.position.y };
			mod_value.velocity = { x: mod_value.module.velocity.x, y: mod_value.module.velocity.y };

			mod_value.angle           = mod_value.module.angle;
			mod_value.angularVelocity = mod_value.module.angularVelocity;
		});
	}
}


// capsules

universe.capsules = new Map();

class capsule extends module {
	constructor(owner, id, position, angle) {
		super(owner, id, position, angle);

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
		if ( mod_value.keys.left  ) { Body.setAngularVelocity(mod_value.module, -mod_value.angularSpeed); }
		if ( mod_value.keys.up    ) { Body.setVelocity(mod_value.module, { x:  mod_value.speed.x, y:  mod_value.speed.y }); }
		if ( mod_value.keys.right ) { Body.setAngularVelocity(mod_value.module,  mod_value.angularSpeed); }
		if ( mod_value.keys.down  ) { Body.setVelocity(mod_value.module, { x: -mod_value.speed.x, y: -mod_value.speed.y }); }
	}
	
	static update() {
		module.update();

		universe.capsules.forEach((mod_value, id_key) => {
			capsule.event_handler(mod_value);
		});
	}
}


// spaceship
universe.users = {};
universe.spaceships = new Map();

class spaceship {
	constructor(owner, id, position, cap = "main", mods = [], angle = Math.PI / 2) {
		// in the spaceship class, owner refer to the user
		this.owner = owner;

		this.position = { x: position.x, y: position.y };

		this.capsule = new capsule(id, cap, this.position);
		this.modules = {};

		this.add_modules(id, mods, position);

		universe.spaceships[id] = this;
	}

	add_modules(owner, mods, position) {
		for(let i = 0; i < mods.length; i++) {
			let id = mods[i].toString();
			let coords = spaceship.coords( position, spaceship.tri_to_sqr_coords( position.d, mods[i][0], mods[i][1], mods[i][2] ) );
			this.modules[id] = new module(owner, id, { x: coords.x, y: coords.y }, coords.angle);
		}
	}

	// origin_d represents direction of main or capsule which can be either 0, or 1;
	// while output d is the orientation of module given it's coords and origin_d
	static tri_to_sqr_coords(origin_d, x, y, z) {
		if(origin_d === 0) { origin_d =  1; } else
		if(origin_d === 1) { origin_d = -1; } else
		{ return "please enter a correct position parameter"; }

		x = z-x;
		y = origin_d * y;
		
		if(origin_d ===  1) { origin_d = 2; } else
		if(origin_d === -1) { origin_d = 1; }

		let d = (x % 2 + origin_d) % 2;

		return { x, y, d };
	}

	static coords(position, sqr_coords) {
		let angle;
		if(sqr_coords.d === 0) { angle =   Math.PI / 2; sqr_coords.d =  module.size * Math.sqrt(12) / 12; } else
		if(sqr_coords.d === 1) { angle = 3*Math.PI / 2; sqr_coords.d = -module.size * Math.sqrt(12) / 12; } else
		{ console.log("please use a correct orientation"); }

		let x = position.x + sqr_coords.x * (module.size / 2);
		let y = position.y + sqr_coords.y + sqr_coords.d;

		return { x, y, angle };
	}
}

let ss = new spaceship(
	"jaacko",
	"ss0",
	{ x: 200, y: 300, d: 0 },
	"cap0",
	[
		[  1,  0,  0 ],
		[  0,  0,  1 ]
	]
);

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


document.addEventListener("keydown", (e) => {
	if (e.key.toLowerCase() === "a" || e.key === "ArrowLeft"  ) { ss.capsule.keys.left  = true; }
	if (e.key.toLowerCase() === "w" || e.key === "ArrowUp"    ) { ss.capsule.keys.up    = true; }
	if (e.key.toLowerCase() === "d" || e.key === "ArrowRight" ) { ss.capsule.keys.right = true; }
	if (e.key.toLowerCase() === "s" || e.key === "ArrowDown"  ) { ss.capsule.keys.down  = true; }
});

document.addEventListener("keyup", (e) => {
	if (e.key.toLowerCase() === "a" || e.key === "ArrowLeft"  ) { ss.capsule.keys.left  = false; }
	if (e.key.toLowerCase() === "w" || e.key === "ArrowUp"    ) { ss.capsule.keys.up    = false; }
	if (e.key.toLowerCase() === "d" || e.key === "ArrowRight" ) { ss.capsule.keys.right = false; }
	if (e.key.toLowerCase() === "s" || e.key === "ArrowDown"  ) { ss.capsule.keys.down  = false; }
});

let counter = 0;
Events.on(engine, "beforeUpdate", (event) => { // update loop, 60fps, 60 counter = 1sec
	counter += 1;
	capsule.update();
});


// --------------------------------------------------------------------------------------------------------------------
/* -- render -- */


// fit the render viewport to the scene; camera
Render.lookAt(render, {
	min: { x: 0, y: 0 },
	max: { x: 800, y: 600 }
});