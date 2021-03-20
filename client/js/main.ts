import Matter from "matter-js";
import p5 from "p5";

import DEBUG from "./debug.js";
import { interface_script } from "./interface.js";

import universe from "./universe/universe.js";
import User from "./universe/user/User.js";
import Spaceship from "./universe/user/spaceship/Spaceship.js";
import Module from "./universe/user/spaceship/modules/Module.js";

import config from "./util/config.js";

// helper functions
import { hexAlpha } from "./util/p5.util.js";

// presets
// import spaceship_presets from "./presets/spaceship_presets.json";
// import * as spaceship_presets from "./presets/spaceship_presets.json";
import spaceship_presets from "./presets/spaceship_presets.json";


let globals : {
	universe : typeof universe,
	DEBUG : typeof DEBUG,
	
	canvas : undefined | p5.Renderer,
	engine : undefined | Matter.Engine,
	world  : undefined | Matter.World,
	runner : undefined | Matter.Runner,
	
	mouse : any,
	mouse_constraint : any,
	
	ss : undefined | Spaceship
} = {
	universe,
	DEBUG,
	
	canvas: undefined,
	engine: undefined,
	world: undefined,
	runner: undefined,
	
	mouse: null,
	mouse_constraint: null,
	
	ss: undefined
};

new p5((s : p5) => {
	s.preload = () => {
		config.font.set(
			"new_courier",
			s.loadFont("../fonts/new_courier.ttf")
		);
		
		config.font.set(
			"FiraCode",
			s.loadFont("../fonts/FiraCode.ttf")
		);
	};
	
	s.setup = () => {
		globals.canvas = s.createCanvas(s.windowWidth, s.windowHeight);
		
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
		
		globals.ss = (<Spaceship>(<User>universe.users.get("jaacko0")).spaceships.get("ss0"));
		console.log(globals.ss);
		
		/* -- mouse controls -- */
		
		let mouse = Matter.Mouse.create(globals.canvas.elt);
		mouse.pixelRatio = s.pixelDensity();
		
		let mouse_constraint = Matter.MouseConstraint.create(globals.engine, {
			mouse,
			constraint: {
				damping: 1,
				stiffness: 1
			}
		});
		
		Matter.World.add(globals.world, mouse_constraint);
		
		Matter.Events.on(mouse_constraint, "mousedown", (e) => {
			console.log("hi!");
		});
		
		{ // mouse events
			/* Matter.Events.on(mouse_constraint, "mousedown", (e) => {
			* 	// FIXME: not sure why it's called `matter_module`
			* 	let matter_module = e.source.body;
			* 	
			* 	if (
			* 		matter_module &&
			* 		matter_module.meta &&
			* 		matter_module.meta.owner === "jaacko0" &&
			* 		matter_module.meta.spaceship === "ss0"
			* 	) {
			* 		// FIXME: both use the same parameters, maybe there's a shortcut somewhere
			* 		// NOTE: erase is remove from world, while remove is remove from ship
			* 		if (DEBUG.var.erase_mode) {
			* 			// erase selected module
			* 			Spaceship.erase_module(
			* 				globals.world,
			* 				matter_module.meta.owner,
			* 				matter_module.meta.spaceship,
			* 				matter_module.meta.__id__
			* 			);
			* 		} else {
			* 			// remove selected module
			* 			Spaceship.remove_module(
			* 				globals.world,
			* 				matter_module.meta.owner,
			* 				matter_module.meta.spaceship,
			* 				matter_module.meta.__id__
			* 			);
			* 		}
			* 	}
			* });
			*/
		}
		
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
					spaceship.input_keys[direction] = pressing;
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
			(globals.ss as Spaceship).update();
			for (let module of universe.modules.values()) {
				module.update();
			}
		});
		
		s.frameRate(60);
	}
	
	s.draw = () => {
		s.background("#111111");
		reset_drawing_defaults(s);
		
		// global modules
		draw_modules(s, universe.modules);
		
		// spaceships modules
		for (let [user_id, user] of universe.users) {
			for (let [spaceship_id, spaceship] of user.spaceships) {
				reset_drawing_defaults(s);
				draw_modules(s, spaceship.modules);
				
				reset_drawing_defaults(s);
				DEBUG.show_constraints(s, spaceship.constraints);
				
				reset_drawing_defaults(s);
				DEBUG.show_centroid(s, spaceship.centroid);
			}
		}
	}
	
	s.windowResized = () => {
		s.resizeCanvas(s.windowWidth, s.windowHeight);
	}
}, "p5_container");

function reset_drawing_defaults(s) {
	// default
	s.noStroke();
	s.fill(hexAlpha(s, ["#ffffff", 1]));
	s.textFont(config.font.get("FiraCode"));
	// textSize()
	s.textAlign(s.CENTER, s.CENTER);
}

// FIXME: this should be in debug.js?
function draw_modules(s, map) {
	for (let [module_id, module] of map) {
		// use module color
		reset_drawing_defaults(s);
		s.fill(hexAlpha(s, module.color));
		DEBUG.show_individual_modules(s);
		
		// TODO: calculate vertices from my own side instead of relying on Matter.JS so much
		s.triangle(
			module.Matter.vertices[0].x, module.Matter.vertices[0].y,
			module.Matter.vertices[1].x, module.Matter.vertices[1].y,
			module.Matter.vertices[2].x, module.Matter.vertices[2].y
		)
		
		reset_drawing_defaults(s);
		DEBUG.show_angle_indicators(s, module, Module.w_height, Module.w_length);
		
		reset_drawing_defaults(s);
		DEBUG.module_text(s, config.font.get("FiraCode"), module);
	}
}

globalThis.globals = globals;

// --------------------------------------------------------------------------------------------------------------------
/* -- render -- */

// DEBUG: last two argument are there for debugging
interface_script(globals.world, Matter.Runner, globals.runner);