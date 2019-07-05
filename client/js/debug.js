import { hexAlpha } from "./helper/helper.js";
import { universe } from "./universe/universe.js";

const DEBUG = {
	
	// module_text(font, module, option = "none") { // option to force if necesary
	
	module_text(font, module) { // option to force if necesary
		
		// option = (option === "none" || typeof option == "undefined") ? DEBUG.var.module_text[0] : option;
		// if( option === "none" || !option ) {
		// 	option = DEBUG.var.module_text[0];
		// }
		
		
		// let option = DEBUG.var.module_text[0]; // use this without gui
		let option = DEBUG.var.module_text; // use this with the gui
		
		// "none", "id", "neighbor number", "d variable"
		switch (option) {
			case "none": break;
			case "id":
				this.show_id(font, module);
				break;
			case "neighbor number":
				this.show_neighbor_number(font, module);
				break;
			case "d variable":
				this.show_d_variable(font, module);
				break;
		}
	},
	
	show_individual_modules() { if( this.var.show_individual_modules ) {
		strokeWeight(2);
		stroke(hexAlpha(["#ffffff", 0.5]));
	} },
	
	show_angle_indicators(module, w_height, w_length) { if( this.var.show_angle_indicators ) {
		strokeWeight(1);
		stroke(hexAlpha(["#ffffff", 1]));
		
		line(
			module.position.x,
			module.position.y,
			
			// TODO: this only applies to d = 0 || 1
			module.position.x + cos(module.angle) * (w_height - w_length),
			module.position.y + sin(module.angle) * (w_height - w_length)
		);
	} },
		
	show_d_variable(font, module) {
		textFont(font.new_courier);
		textSize(12);
		textStyle(BOLD);
		textAlign(CENTER, CENTER);
		
		text(
			module.position.d,
			module.position.x,
			module.position.y
		);
	},
	
	show_neighbor_number(font, module) {
		textFont(font.new_courier);
		textSize(12);
		textStyle(BOLD);
		textAlign(CENTER, CENTER);
		text(module.neighbors.length, module.position.x, module.position.y);
	},
	
	show_id(font, module) {
		textFont(font.new_courier);
		textSize(9);
		textStyle(BOLD);
		textAlign(CENTER, CENTER);
		text(module.__id__, module.position.x, module.position.y);
	},
	
	show_constraints(constraints) { if(this.var.show_constraints) {
		for ( let [constraint_id, constraint] of constraints ) {
			// TODO: again, stop being so reliant on MatterJS
			
			let a = {
				x: constraint.bodyA.position.x + constraint.pointA.x,
				y: constraint.bodyA.position.y + constraint.pointA.y
			};
			let b = {
				x: constraint.bodyB.position.x + constraint.pointB.x,
				y: constraint.bodyB.position.y + constraint.pointB.y
			};
			let midpoint = {
				x: (a.x + b.x) / 2,
				y: (a.y + b.y) / 2
			}
			
			// strokeWeight(0.5);
			stroke(hexAlpha(["#ffffff", 0.9]))
			fill(hexAlpha(["#ffffff", 0.9]));
			
			strokeWeight(1.5);
			line(a.x, a.y, b.x, b.y);
			
			strokeWeight(0.5)
			circle(a.x, a.y, 4.5);
			circle(b.x, b.y, 4.5);
		}
	} },
	
	show_centroid(centroid) { if( this.var.show_centroid ) {
		strokeWeight(0.25);
		stroke(hexAlpha(["#cc0000", 0.9]))
		fill(hexAlpha(["#ff0000", 0.7]))
		circle(centroid.x, centroid.y, 5);
	} },
	
	show_active_thrusters: true,
	erase_mode: false,
	
	var: {
		// "none", "id", "neighbor number", "d variable"
		module_text : ["id", ["none", "id", "neighbor number", "d variable"]],
		show_individual_modules : true  ,
		show_angle_indicators   : false ,
		show_constraints        : false ,
		show_centroid           : false ,
		show_active_thrusters   : false ,
		erase_mode              : false
	},
};

export { DEBUG };