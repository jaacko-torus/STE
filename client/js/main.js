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

let modules = {};

// spaceship - includes capsule, synonimous with "user"
class module {
	constructor(id, position, angle = Math.PI / 2) {
		this.id = id;
		this.position = { x: position.x, y: position.y };
		this.velocity = {};
		this.angle           =         angle;
		this.angularSpeed    = Math.PI / 240;
		
		module.add_to_list(id, modules, this.position, this.angle);
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

	static add_to_list(id, list, position, angle) {
		if(!list[id]) {
			list[id] = module.create(position, angle);
		} else {
			console.error("this id already exists, please choose another one");
		}
	}

	static duplicate_to_list(id, prev_list, next_list) {
		if(!next_list[id]) {
			next_list[id] = prev_list[id];
		} else {
			console.error("this id already exists, please choose another one");
		}
	}

	static create(position, angle, options = {}) {
		let mod = Bodies.polygon(position.x, position.y, 3, module.length, { angle }, options);
		World.add(world, mod);
		return mod;
	}

	update() {
		this.velocity = { x: modules[this.id].velocity.x, y: modules[this.id].velocity.y }
		this.angle = modules[this.id].angle;
		this.angularVelocity = modules[this.id].angularVelocity;
	}
}


// capsules


let capsules = {};

class capsule extends module {
	constructor(id, position, angle) {
		super(id, position, angle);

		this.keys = {
			left  : false,
			up    : false,
			right : false,
			down  : false
		};

		module.duplicate_to_list(id, modules, capsules);
		Events.on(capsules[this.id], "sleepStart", () => {})
	}

	get speed() { return super.speed; }
	
	event_handler() {
		if ( this.keys.left  ) { Body.setAngularVelocity(capsules[this.id], -this.angularSpeed); }
		if ( this.keys.up    ) { Body.setVelocity(capsules[this.id], { x: this.speed.x, y:  this.speed.y }); }
		if ( this.keys.right ) { Body.setAngularVelocity(capsules[this.id],  this.angularSpeed); }
		if ( this.keys.down  ) { Body.setVelocity(capsules[this.id], { x: -this.speed.x, y: -this.speed.y }); }
	}
	
	update() {
		super.update();
		this.event_handler();
	}
}


// spaceship


class spaceship {
	constructor(id, position, capsule, modules, angle) {

	}
}

// --------------------------------------------------------------------------------------------------------------------
/* -- Making new objects -- */

/*
 1. Make spaceship object
 2. add a capsule
 3. add modules
 4. You're allowed to add them all at once using the `spaceship` class
*/


let ss = {}; // spaceship

ss.mod1 = new module("mod1", {x: 50, y: 50});
ss.capsule = new capsule("jaackotorus0", { x: 150, y: 150 });

// function sign(x, z) { return -(x * z) / Math.abs( x * z ); }
// function value(x, z) { return Math.abs(x) + Math.abs(z); }
function result(x, z) { return 2 * z - (x+1); }

/*

Let [X, Y] &
Let [x, y, z] &
Let s = length of side
Where `Y = Y0 + y(s/2)`

*/

ss.mod2 = new module("[1,0,0]", {
	x: ss.capsule.position.x + (module.size / 2),
	y: ss.capsule.position.y - (module.size * Math.sqrt(12) / 12)
}, 3 * Math.PI / 2);
ss.mod3 = new module("[0,0,1]", {
	x: ss.capsule.position.x - (module.size / 2),
	y: ss.capsule.position.y - (module.size * Math.sqrt(12) / 12)
}, 3 * Math.PI / 2);

ss.c1 = Constraint.create({
	bodyA  : capsules[ss.capsule.id] , pointA : { x: -module.constraints[0].x, y:  module.constraints[0].y },
	bodyB  : modules[ss.mod2.id]     , pointB : { x:  module.constraints[1].x, y: -module.constraints[1].y }
});

ss.c2 = Constraint.create({
	bodyA  : capsules[ss.capsule.id] , pointA : { x: -module.constraints[1].x, y:  module.constraints[1].y },
	bodyB  : modules[ss.mod2.id]     , pointB : { x:  module.constraints[0].x, y: -module.constraints[0].y }
});

World.add(world, [ss.c1, ss.c2]);

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
	ss.capsule.update();
});


// --------------------------------------------------------------------------------------------------------------------
/* -- render -- */


// fit the render viewport to the scene; camera
Render.lookAt(render, {
	min: { x: 0, y: 0 },
	max: { x: 800, y: 600 }
});