function hexAlpha([hex, alpha]) { // p5 extention
	var c = color(hex);
	// return color("rgba(" +  [red(c), green(c), blue(c), alpha].join(",") + ")");
	return color(`rgba(${[red(c), green(c), blue(c), alpha].join(",")})`);
}




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


// maybe use es6 modules?
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
			{ x: 0, y: 0, d: 0 },
			[ // modules
				// ordered by y, z, x
				// ...module_preset_d1_single
				// ...module_preset_d1_dt
				// ...module_preset_d0_5x5
				// ...module_preset.module_preset_d1_5x5
				...module_preset.module_preset_d0_cool_ship
			],
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
	noStroke();
	
	// default
	fill(hexAlpha("#ffffff", 1));
	
	// global modules
	for ( let [id, module] of universe.modules ) {
		
		fill(hexAlpha(module.meta.color));
		
		// TODO: calculate vertices from my own side instead of relying on Matter.JS so much
		triangle(
			module.vertices[0].x, module.vertices[0].y,
			module.vertices[1].x, module.vertices[1].y,
			module.vertices[2].x, module.vertices[2].y
		);
		
		strokeWeight(1);
		stroke(hexAlpha(["#ffffff", 1]));
		
		line(
			module.meta.position.x,
			module.meta.position.y,
			
			// TODO: this only applies to d = 0 || 1
			module.meta.position.x + cos(module.meta.angle) * (w_height - w_length),
			module.meta.position.y + sin(module.meta.angle) * (w_height - w_length)
		);
	}
	
	// spaceships modules
	for ( let [user_id, user] of universe.users ) {
		for ( let [spaceship_id, spaceship] of user.spaceships) {
			for ( let [module_id, module] of spaceship.modules) {
				
				fill(hexAlpha(module.meta.color));
				
				// TODO: calculate vertices from my own side instead of relying on Matter.JS so much
				// TODO: show stroke if show individual modules is true
				noStroke();
				if(DEBUG.show_individual_modules) {
					strokeWeight(2);
					stroke(hexAlpha(["#ffffff", 0.5]));
				}
				triangle(
					module.vertices[0].x, module.vertices[0].y,
					module.vertices[1].x, module.vertices[1].y,
					module.vertices[2].x, module.vertices[2].y
				)
				
				
				// DEBUG: currently module.meta.angle just keeps going up, redefine it as (angle % (2*Math.PI))
				if( DEBUG.show_angle_indicators ) {
					strokeWeight(1);
					stroke(hexAlpha(["#ffffff", 1]));
					
					line(
						module.meta.position.x,
						module.meta.position.y,
						
						// TODO: this only applies to d = 0 || 1
						module.meta.position.x + cos(module.meta.angle) * (w_height - w_length),
						module.meta.position.y + sin(module.meta.angle) * (w_height - w_length)
					);
				}
				
				
				// TODO: if d variable indicator is true
				textFont(font.new_courier);
				// textSize()
				textAlign(CENTER, CENTER);
				// text(module.meta.position.d, module.meta.position.x, module.meta.position.y);
				text(module.meta.neighbors.length, module.meta.position.x, module.meta.position.y);
			}
			
			if(DEBUG.show_constraints) {
				for ( let [constraint_id, constraint] of spaceship.constraints ) {
					// TODO: again, stop being so reliant on MatterJS
					
					let a = {
						x: constraint.bodyA.meta.position.x + constraint.pointA.x,
						y: constraint.bodyA.meta.position.y + constraint.pointA.y
					};
					let b = {
						x: constraint.bodyB.meta.position.x + constraint.pointB.x,
						y: constraint.bodyB.meta.position.y + constraint.pointB.y
					};
					let midpoint = {
						x: (a.x + b.x) / 2,
						y: (a.y + b.y) / 2
					}
					
					strokeWeight(0.5);
					stroke(hexAlpha(["#ffffff", 0.7]))
					fill(hexAlpha(["#ffffff", 0.5]));
					circle(midpoint.x, midpoint.y, 4)
				}
			}
		}
	}
}




function windowResized() { resizeCanvas(windowWidth, windowHeight); }

window.preload = preload;
window.setup = setup;
window.draw = draw;
window.windowResized = windowResized;

// --------------------------------------------------------------------------------------------------------------------
/* -- render -- */

import { interface_script } from "./interface.js";

// DEBUG: last two argumeht are there for debugging
interface_script(world, Runner, runner);