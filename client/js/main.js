// Matter modules
const Engine          = Matter.Engine;
// const Render          = Matter.Render;
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


// helper functions
import { hexAlpha } from "./helper/helper.js";

// presets
import * as module_preset from "./presets/module_setup_presets.js";

import { universe } from "./universe/universe.js";
// DEBUG: this is only for debugging purposes, delete this line later
window.universe = universe;

import { DEBUG } from "./debug.js";
window.DEBUG = DEBUG;

import { w_size, w_height, w_length, h_size, h_height, h_length } from "./universe/user/spaceship/modules/module.js";
import { T1 } from "./universe/user/spaceship/modules/structs/struct.js";
import { Q1 } from "./universe/user/spaceship/modules/capsules/capsule.js";
import { R3 } from "./universe/user/spaceship/modules/thrusters/thrusters.js";
import { Spaceship } from "./universe/user/spaceship/spaceship.js";
import { User } from "./universe/user/user.js";


let font = {};
let canvas;
let engine;
let world;
let runner;
let ss;


function preload() {
	font["new_courier"] = loadFont("../fonts/new_courier.ttf");
}

function setup() {
	canvas = createCanvas(windowWidth, windowHeight);
	
	// create engine
	engine = Engine.create();
	world  = engine.world;
	window.world = world;
	
	// set gravity to 0
	engine.world.gravity.x = 0;
	engine.world.gravity.y = 0;
	
	// create runner for engine
	runner = Runner.create();
	Runner.run(runner, engine);
	
	
	
	
	// creating a spaceship
	
	new User("jaacko0", "jaacko");
	new Spaceship(
		world,
		"jaacko0",
		"ss0",
		// { x: 200, y: 300, d: 1 },
		// { x: 0, y: 0, d: 1 }, // position
		{ x: 5, y: 5 }, // position
		[ // modules
			// ordered by y, z, x in file since it's easier
			// ...module_preset.d0_single
			// ...module_preset.d1_single
			// ...module_preset.d1_dt
			// ...module_preset.d0_5x5
			// ...module_preset.d1_5x5
			...module_preset.d0_cool_ship
		]
	);
	
	ss = universe.users.get("jaacko0").spaceships.get("ss0");
	window.ss = ss;
	console.log(ss);
	
	
	
	
	
	/* -- mouse controls -- */
	let mouse = Mouse.create(canvas.elt);
	mouse.pixelRatio = pixelDensity();
	
	let mouseConstraint = MouseConstraint.create(engine, {
		mouse,
		constraint: {
			damping: 1,
			stiffness: 1,
			// render: {
				// 	visible: true
				// }
		}
	});
	
	World.add(world, mouseConstraint);
	
	Events.on(mouseConstraint, "mousedown", e => {
		let module = e.source.body;
		
		if (
			module &&
			module.owner === "jaacko0" &&
			module.spaceship === "ss0"
		) {
			// NOTE: erase is remove from world, while remove is remove from ship
			
			// erase selected module
			if (  DEBUG.erase_mode ) { Spaceship.erase_module(world, "jaacko0", module.spaceship, module); }
			// remove selected module
			if ( !DEBUG.erase_mode ) { Spaceship.remove_module(world, "jaacko0", module.spaceship, module); }
		}
	});
	
	
	
	
	
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
	
	frameRate(60);
}


function draw() {
	background("#111111");
	reset_drawing_defaults();
	
	// global modules
	draw_modules(universe.modules);
	
	// spaceships modules
	for ( let [user_id, user] of universe.users ) {
		for ( let [spaceship_id, spaceship] of user.spaceships) {
			reset_drawing_defaults();
			draw_modules(spaceship.modules);
			
			reset_drawing_defaults();
			DEBUG.show_constraints(spaceship.constraints);
			
			reset_drawing_defaults();
			DEBUG.show_centroid(spaceship.centroid);
		}
	}
}





function reset_drawing_defaults() {
	// default
	noStroke();
	fill(hexAlpha("#ffffff", 1));
	textFont(font.new_courier);
	// textSize()
	textAlign(CENTER, CENTER);
}




function draw_modules(map) {
	for ( let [module_id, module] of map) {
		
		// use module color
		
		reset_drawing_defaults();
		fill(hexAlpha(module.color));
		DEBUG.show_individual_modules();
		
		// TODO: calculate vertices from my own side instead of relying on Matter.JS so much
		triangle(
			module.Matter.vertices[0].x, module.Matter.vertices[0].y,
			module.Matter.vertices[1].x, module.Matter.vertices[1].y,
			module.Matter.vertices[2].x, module.Matter.vertices[2].y
		)
		
		reset_drawing_defaults();
		DEBUG.show_angle_indicators(module, w_height, w_length);
		
		
		reset_drawing_defaults();
		DEBUG.module_text(font, module);
		
		// reset_drawing_defaults();
		// DEBUG.show_d_variable(font, module);
		
		// reset_drawing_defaults();
		// DEBUG.show_id(font, module);
		
		// reset_drawing_defaults();
		// DEBUG.show_neighbor_number(font, module);
	}
}




function windowResized() { resizeCanvas(windowWidth, windowHeight); }

// Making sure P5 can use these functions
window.preload = preload;
window.setup = setup;
window.draw = draw;
window.windowResized = windowResized;

// --------------------------------------------------------------------------------------------------------------------
/* -- render -- */

import { interface_script } from "./interface.js";

// DEBUG: last two argumeht are there for debugging
interface_script(world, Runner, runner);