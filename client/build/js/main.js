import Matter from "../_snowpack/pkg/matter-js.js";
import p5 from "../_snowpack/pkg/p5.js";

import DEBUG from "./debug.js";
import { interface_script } from "./interface.js";

import universe from "./universe/universe.js";
import User from "./universe/user/User.js";
import Spaceship from "./universe/user/spaceship/Spaceship.js";
import { w_size, w_height, w_length, h_size, h_height, h_length } from "./universe/user/spaceship/modules/Module.js";

import config from "./util/config.js";

// helper functions
import { hexAlpha } from "./helper/helper.js";

// presets
import * as spaceship_presets from "./presets/spaceship_presets.js";

let globals = {
	universe,
	DEBUG,
	
	canvas: null,
	engine: null,
	runner: null,
	
	mouse: null,
	mouse_constraint: null,
	
	ss: null
};

let font = {};


function preload() {
	config.font.set("new_courier", loadFont("../fonts/new_courier.ttf"));
	config.font.set("FiraCode", loadFont("../fonts/FiraCode.ttf"));
	// font["new_courier"] = loadFont("../fonts/new_courier.ttf");
}

function setup() {
	globals.canvas = createCanvas(windowWidth, windowHeight);
	
	// create engine
	globals.engine = Matter.Engine.create();
	globals.world = globals.engine.world;
	
	// set gravity to 0
	globals.engine.world.gravity.x = 0;
	globals.engine.world.gravity.y = 0;
	
	// create runner for engine
	globals.runner = Matter.Runner.create();
	Matter.Runner.run(globals.runner, globals.engine);
	
	
	
	
	// creating a spaceship
	
	new User("jaacko0", "jaacko");
	new Spaceship(
		globals.world,
		"jaacko0",
		"ss0",
		{ x: 5, y: 5 }, // position
		[ // modules
			// ordered by y, z, x in file since it's easier
			// ...spaceship_presets.d0_single
			// ...spaceship_presets.d1_single
			// ...spaceship_presets.d1_dt
			// ...spaceship_presets.d0_5x5
			// ...spaceship_presets.d1_5x5
			...spaceship_presets.d0_cool_ship
		]
	);
	
	globals.ss = universe.users.get("jaacko0").spaceships.get("ss0");
	console.log(globals.ss);
	
	/* -- mouse controls -- */
	
	let mouse = Matter.Mouse.create(globals.canvas.elt);
	mouse.pixelRatio = pixelDensity();
	
	let mouse_constraint = Matter.MouseConstraint.create(globals.engine, {
		mouse,
		constraint: {
			damping: 1,
			stiffness: 1
		}
	});
	
	Matter.World.add(globals.world, mouse_constraint);
	
	Matter.Events.on(mouse_constraint, "mousedown", (e) => {
		// FIXME: not sure why it's called `matter_module`
		let matter_module = e.source.body;
		
		if (
			matter_module &&
			matter_module.meta &&
			matter_module.meta.owner === "jaacko0" &&
			matter_module.meta.spaceship === "ss0"
		) {
			// FIXME: both use the same parameters, maybe there's a shortcut somewhere
			// NOTE: erase is remove from world, while remove is remove from ship
			if (DEBUG.var.erase_mode) {
				// erase selected module
				Spaceship.erase_module(
					globals.world,
					matter_module.meta.owner,
					matter_module.meta.spaceship,
					matter_module.meta.__id__
				);
			} else {
				// remove selected module
				Spaceship.remove_module(
					globals.world,
					matter_module.meta.owner,
					matter_module.meta.spaceship,
					matter_module.meta.__id__
				);
			}
		}
	});
	
	/* -- input events & loop -- */
	
	// FIXME: this should be it's own function
	let set_spaceship_input_keys = (e, spaceship, pressing) => {
		new Map([
			["left",  { letter: "a", arrow: "ArrowLeft"  }],
			["right", { letter: "d", arrow: "ArrowRight" }],
			["up",    { letter: "w", arrow: "ArrowUp"    }],
			["down",  { letter: "s", arrow: "ArrowDown"  }]
		]).forEach((key, direction) => {
			if (e.key.toLowerCase() === key.letter || e.key === key.arrow) {
				spaceship.keys[direction] = pressing;
			}
		});
	}
	
	document.addEventListener("keydown", (e) => {
		set_spaceship_input_keys(e, globals.ss, true);
	});
	
	document.addEventListener("keyup", (e) => {
		set_spaceship_input_keys(e, globals.ss, false)
	});
	
	// NOTE: keep counter for debug purposes
	// let counter = 0;
	Matter.Events.on(globals.engine, "beforeUpdate", (e) => { // update loop, 60fps, 60 counter = 1sec
		// counter += 1;
		globals.ss.update();
		for (let module of universe.modules.values()) {
			module.update();
		}
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
	// textFont(font.new_courier);
	textFont(config.font.get("FiraCode"));
	// textSize()
	textAlign(CENTER, CENTER);
}

// FIXME: this should be in debug.js?
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
	}
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
}

window.globals = globals;
// Making sure P5 can use these functions
window.preload = preload;
window.setup = setup;
window.draw = draw;
window.windowResized = windowResized;

// --------------------------------------------------------------------------------------------------------------------
/* -- render -- */

// DEBUG: last two argumeht are there for debugging
interface_script(globals.world, Matter.Runner, globals.runner);