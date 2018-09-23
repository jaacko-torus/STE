const Engine = Matter.Engine;
const	Render = Matter.Render;
const	Runner = Matter.Runner;
const	Body   = Matter.Body;
const	Events = Matter.Events;
const	World  = Matter.World;
const	Bodies = Matter.Bodies;

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
		showAngleIndicator : true
	}
});
Render.run(render);

// create runner
const runner = Runner.create();
Runner.run(runner, engine);

class spaceship {
	constructor(position, angle = Math.PI / 2) {
		// size refers to the size of a single face of the triangle
		this.size = 50;
		
		this.position = { x: position.x, y: position.y };
		this.velocity = {};
		
		this.angle           =         angle;
		this.angularSpeed    = Math.PI / 240;
		
		this.keys = {
			left  : false,
			up    : false,
			right : false,
			down  : false
		}
		
		this.capsule = this.create_capsule();
	}
	// length refers to the radius of the circle circumscribed around said shape(this is done solely for matter.js)
	get length() { return this.size * Math.sqrt(3) / 3 }
	
	get speed() {
		let angle = this.angle;
		return {
			get x() { return -Math.cos(angle) },
			get y() { return -Math.sin(angle) }
		}
	}

	create_capsule(options = {}) {
		let capsule = Bodies.polygon(400, 100, 3, this.length, { angle: this.angle }, options);
		World.add(world, capsule);
		return capsule;
	}

	update() {
		// this.velocity
		this.velocity = { x: this.capsule.velocity.x, y: this.capsule.velocity.y }
		this.angle = this.capsule.angle;
		this.angularVelocity = this.capsule.angularVelocity;
		
		if ( this.keys.left  ) { Body.setAngularVelocity(this.capsule, -this.angularSpeed);}
		if ( this.keys.up    ) { Body.setVelocity(this.capsule, { x:  this.speed.x, y:  this.speed.y }); }
		if ( this.keys.right ) { Body.setAngularVelocity(this.capsule,  this.angularSpeed);}
		if ( this.keys.down  ) { Body.setVelocity(this.capsule, { x: -this.speed.x, y: -this.speed.y }); }
	}
}

let ss = new spaceship({ x: 150, y: 150 }, Math.PI / 2);

document.addEventListener("keydown", (e) => {
	if (e.key.toLowerCase() === "a" || e.key === "ArrowLeft"  ) { ss.keys.left  = true; }
	if (e.key.toLowerCase() === "w" || e.key === "ArrowUp"    ) { ss.keys.up    = true; }
	if (e.key.toLowerCase() === "d" || e.key === "ArrowRight" ) { ss.keys.right = true; }
	if (e.key.toLowerCase() === "s" || e.key === "ArrowDown"  ) { ss.keys.down  = true; }
});

document.addEventListener("keyup", (e) => {
	if (e.key.toLowerCase() === "a" || e.key === "ArrowLeft"  ) { ss.keys.left  = false; }
	if (e.key.toLowerCase() === "w" || e.key === "ArrowUp"    ) { ss.keys.up    = false; }
	if (e.key.toLowerCase() === "d" || e.key === "ArrowRight" ) { ss.keys.right = false; }
	if (e.key.toLowerCase() === "s" || e.key === "ArrowDown"  ) { ss.keys.down  = false; }
});

let counter = 0;
Events.on(engine, "beforeUpdate", (event) => { // update loop, 60fps, 60 counter = 1sec
	counter += 1;
	ss.update();
});

// fit the render viewport to the scene; camera
Render.lookAt(render, {
	min: { x: 0, y: 0 },
	max: { x: 800, y: 600 }
});