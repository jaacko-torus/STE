import { load, reset } from "./universe/user/spaceship/spaceship.js";
import { universe } from "./universe/universe.js";

function interface_script(world, Runner, runner) {
	$(document).ready(() => {
		$("#new_ship").click(() => {
			reset(world, "jaacko0", "ss0");
			
			// square brackets required for JSON parser
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
	});
}

export { interface_script };