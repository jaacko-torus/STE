import $ from "../_snowpack/pkg/jquery.js";
import DEBUG from "./debug.js"; // import { datGUI_builder } from "./helper/dat.gui";

import { datGUI_builder } from "./util/dat.gui.util.js";
import universe from "./universe/universe.js";
import { load, reset } from "./universe/user/spaceship/Spaceship.js";

function interface_script(world, Runner, runner) {
  $(() => {
    $("#new_ship_code").val(`// touch modules to separate
// wasd and arrows to move

// comments don't work
// so don't use them here
// and erase these after you read them

/*
this is the main module
it's characterized with
 - the Q1 category
 - main: true
there are only supposed to be one of these

grid.d refers to the direction of the y axis
if d: 0 -> y axis point up (like in the link below)
if d: 1 -> y axis point down
*/

[ 0, 0, 0, [ "Q1", { "main": true, "grid": { "d": 0 } } ] ],

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

[ 0, 1, 0, ["T1"] ],
[ 1, 0, 0, ["R3"] ],
[ 0, 0, 1, ["R3"] ]`);
    $("#new_ship").on("click", () => {
      reset(world, "jaacko0", "ss0"); // square brackets required for JSON parser

      let new_ship_code = `[${$("#new_ship_code").val()}]`;
      let new_ship_JSON = JSON.parse(new_ship_code); // I have to deal with this ugly notation bc all the array elements have to be surrounded by an array for the JSON parser

      load( // TODO: add more props here, to make it more fancy :P
      world, "jaacko0", "ss0", // new_ship_d,
      new_ship_JSON);
      console.log(new_ship_JSON);
      console.log(universe.users.get("jaacko0").spaceships.get("ss0")); // Runner.stop(runner); // TODO: add reset button, for now, just comment or uncomment this
    });
    let gui = new datGUI_builder(DEBUG.var);

    if (globalThis.gui) {
      globalThis.gui = gui;
    }
  });
}

export { interface_script };