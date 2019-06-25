const DEBUG = {
	erase_mode: false
};
window.DEBUG = DEBUG;

// Matter modules

const Engine          = Matter.Engine;
const Render          = Matter.Render;
const Runner          = Matter.Runner;
const Events          = Matter.Events;
// const Common          = Matter.Common;
const MouseConstraint = Matter.MouseConstraint;
const Mouse           = Matter.Mouse;
const World           = Matter.World;
// const Body            = Matter.Body;
// const Bodies          = Matter.Bodies;
// const Constraint      = Matter.Constraint;
// const Constraints     = Matter.Constraints;
// const Composite       = Matter.Composite;
// const Composites      = Matter.Composites;

// create engine
const engine = Engine.create();
const world  = engine.world;
window.world = world;

// set gravity to 0
engine.world.gravity.x = 0;
engine.world.gravity.y = 0;

// create renderer
const render = Render.create({ // replace with Pixi or P5 or whatever it is called
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

// create runner for engine
const runner = Runner.create();
Runner.run(runner, engine);


// --------------------------------------------------------------------------------------------------------------------


// maybe use es6 modules?
// presets
import * as module_preset from "./presets/module_setup_presets.js";

import { universe } from "./universe/universe.js";
// DEBUG: this is only for debugging purposes, delete this line later
window.universe = universe;

import { T1 } from "./universe/user/spaceship/modules/structs/struct.js";
import { Q1 } from "./universe/user/spaceship/modules/capsules/capsule.js";
import { R3 } from "./universe/user/spaceship/modules/thrusters/thrusters.js";
import { Spaceship } from "./universe/user/spaceship/spaceship.js";
import { User } from "./universe/user/user.js";


// --------------------------------------------------------------------------------------------------------------------


// creating a spaceship

new User("jaacko0", "jaacko");
new Spaceship(
	world,
	"jaacko0",
	"ss0",
	// { x: 200, y: 300, d: 1 },
	{ x: 0, y: 0, d: 1 },
	[ // modules
		// ordered by y, z, x
		// ...module_preset_d1_single
		// ...module_preset_d1_dt
		// ...module_preset_d0_5x5
		// ...module_preset.module_preset_d1_5x5
		...module_preset.module_preset_d1_single
	],
);

let ss = universe.users.get("jaacko0").spaceships.get("ss0");
window.ss = ss;


// --------------------------------------------------------------------------------------------------------------------


/* -- mouse controls -- */

let mouse = Mouse.create(render.canvas);

let mouseConstraint = MouseConstraint.create(engine, {
	mouse,
	constraint: {
		damping: 1,
		stiffness: 1,
		render: {
			visible: true
		}
	}
});

World.add(world, mouseConstraint);

// keep the mouse in sync with rendering
render.mouse = mouse;

Events.on(mouseConstraint, "mousedown", e => {
	let module = e.source.body;
	
	if (
		module &&
		module.meta.owner === "jaacko0" &&
		module.meta.spaceship === "ss0"
	) {
		// NOTE: erase is remove from world, while remove is remove from ship
		
		// erase selected module
		if (  DEBUG.erase_mode ) { Spaceship.erase_module(world, "jaacko0", module.meta.spaceship, module); }
		// remove selected module
		if ( !DEBUG.erase_mode ) { Spaceship.remove_module(world, "jaacko0", module.meta.spaceship, module); }
	}
});


// --------------------------------------------------------------------------------------------------------------------


/* -- input events & loop -- */

function add_keyboard_events() {
	// didn't wanna type this twice cuz it looked ugly, made a function instead
	let ake = key_dir => {
		document.addEventListener(key_dir, e => {
			if ( key_dir === "keydown" ) { key_dir =  true; }
			if ( key_dir === "keyup"   ) { key_dir = false; }
			
			if ( e.key.toLowerCase() === "w" || e.key === "ArrowUp"    ) { ss.keys.up    = key_dir; }
			if ( e.key.toLowerCase() === "a" || e.key === "ArrowLeft"  ) { ss.keys.left  = key_dir; }
			if ( e.key.toLowerCase() === "d" || e.key === "ArrowRight" ) { ss.keys.right = key_dir; }
			if ( e.key.toLowerCase() === "s" || e.key === "ArrowDown"  ) { ss.keys.down  = key_dir; }
		});
	}
	
	ake("keydown");
	ake("keyup");
}

add_keyboard_events();

// NOTE: keep counter for debug purposes
// let counter = 0;
Events.on(engine, "beforeUpdate", event => { // update loop, 60fps, 60 counter = 1sec
	// counter += 1;
	ss.update();
});


// --------------------------------------------------------------------------------------------------------------------
/* -- render -- */


// fit the render viewport to the scene; camera
Render.lookAt(render, {
	min: { x: - 40, y: - 60 },
	max: { x:  800, y:  600 }
});

import { interface_script } from "./interface.js";

// DEBUG: last two argumeht are there for debugging
interface_script(world, Runner, runner);