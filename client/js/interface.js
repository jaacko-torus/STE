import { datGUI_builder } from "./helper/helper.js";

import { load, reset } from "./universe/user/spaceship/spaceship.js";
import { universe } from "./universe/universe.js";
import { DEBUG } from "./debug.js";

// presets
import * as module_preset from "./presets/module_setup_presets.js";

function interface_script(world, Runner, runner) {
	$(document).ready(() => {
		$("#new_ship_code").val(
`// comments don't work
// so don't use them here
// and erase these after you read them

/*
this is the \`d\` variable
it changes the direction of the y axis

0 is down
1 is up
*/
[ 0 ],

/*
this is the main module
you shouldn't mess with this
*/
[  0,  0,  0, ["Q1", {"main": true}] ],

/*
these are the modules
they are setup like this
[x, y, z, ["type"]]
there are currently 3 types:
 Q1 - capsule
 T1 - structural
 R3 - thrusters

I use triangular coordinates for module placement:
https://bit.ly/2IFMQpq

click on module to disconnect
click and drag to drag
wasd and arrows to move

have fun :P
*/

[  0,  1,  0, ["T1"] ],

[  1,  0,  0, ["T1"] ],
[  0,  0,  1, ["T1"] ]
`
		);
		
		$("#new_ship").on("click", () => {
			reset(world, "jaacko0", "ss0");
			
			// square brackets required for JSON parser
			/*
				Please submit the new ship in format:
					[ 0 ], // d: 0 or 1
					[ 0, 0, 0, ["Q1", {"main": true}]], // required module
					[ 1, 1, 1, ["R1"]], // additional modules: coord x, coord y, coord z, ["type"]
					...
			*/
			let new_ship_code = `[${$("#new_ship_code").val()}]`;
			
			let new_ship_JSON = JSON.parse(new_ship_code);
			// I have to deal with this ugly notation bc all the array elements have to be surrounded by an array for the JSON parser
			let new_ship_d = new_ship_JSON.shift()[0];
			
			load( // TODO: add more props here, to make it more fancy :P
				world,
				"jaacko0",
				"ss0",
				new_ship_d,
				new_ship_JSON
			);
			
			console.log(new_ship_JSON);
			console.log(universe.users.get("jaacko0").spaceships.get("ss0"));
			// Runner.stop(runner); // TODO: add reset button, for now, just comment or uncomment this
		});
		
		let gui = new datGUI_builder(DEBUG.var);
		if( window.gui ) { window.gui = gui; }
	});
}

export { interface_script };