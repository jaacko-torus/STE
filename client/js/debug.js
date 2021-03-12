import universe from "./universe/universe.js";

import config from "./util/config.js";

import { hexAlpha } from "./util/p5.util.js"

const DEBUG = {
	
	// module_text(font, module, option = "none") { // option to force if necesary
	
	module_text(s, font, module) { // option to force if necesary
		
		// FIXME: idk what commend below is for?
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
				this.show_id(s, font, module);
				break;
			case "neighbor number":
				this.show_neighbor_number(s, font, module);
				break;
			case "d variable":
				this.show_d_variable(s, font, module);
				break;
		}
	},
	
	show_individual_modules(s) {
		if (this.var.show_individual_modules) {
			s.strokeWeight(2);
			s.stroke(hexAlpha(s, ["#ffffff", 0.5]));
		}
	},
	
	show_angle_indicators(s, module, w_height, w_length) {
		if (this.var.show_angle_indicators ) {
			s.strokeWeight(1);
			s.stroke(hexAlpha(s, ["#ffffff", 1]));
			
			s.line(
				module.position.x,
				module.position.y,
				
				// TODO: this only applies to d = 0 || 1
				module.position.x + Math.cos(module.angle) * (w_height - w_length),
				module.position.y + Math.sin(module.angle) * (w_height - w_length)
			);
		}
	},
		
	show_d_variable(s, font, module) {
		s.textFont(font);
		s.textSize(12);
		s.textStyle(s.BOLD);
		s.textAlign(s.CENTER, s.CENTER);
		
		s.text(
			module.position.d,
			module.position.x,
			module.position.y
		);
	},
	
	show_neighbor_number(s, font, module) {
		s.textFont(font);
		s.textSize(12);
		s.textStyle(s.BOLD);
		s.textAlign(s.CENTER, s.CENTER);
		s.text(module.neighbors.length, module.position.x, module.position.y);
	},
	
	show_id(s, font, module) {
		s.textFont(font);
		s.textSize(9);
		s.textStyle(s.BOLD);
		s.textAlign(s.CENTER, s.CENTER);
		
		// FIXME: not sure what I was attempting below
		// if(!module.owner) { console.log(module); }
		
		s.text(module.__id__, module.position.x, module.position.y);
	},
	
	show_constraints(s, constraints) {
		if (this.var.show_constraints) {
			for (let [constraint_id, constraint] of constraints) {
				// FIXME: I'm not sure how I'm being reliant on MatterJS, please explain
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
				s.stroke(hexAlpha(s, ["#ffffff", 0.9]))
				s.fill(hexAlpha(s, ["#ffffff", 0.9]));
				
				s.strokeWeight(1.5);
				s.line(a.x, a.y, b.x, b.y);
				
				s.strokeWeight(0.5)
				s.circle(a.x, a.y, 4.5);
				s.circle(b.x, b.y, 4.5);
			}
		}
	},
	
	show_centroid(s, centroid) {
		if (this.var.show_centroid) {
			s.strokeWeight(0.25);
			s.stroke(hexAlpha(s, ["#cc0000", 0.9]))
			s.fill(hexAlpha(s, ["#ff0000", 0.7]))
			s.circle(centroid.x, centroid.y, 5);
		}
	},
	
	// FIXME: it looks like the variables below are being used instead of the ones inside `DEBUG.var`
	show_active_thrusters: true,
	erase_mode: false,
	
	var: {
		// "none", "id", "neighbor number", "d variable"
		module_text : ["none", ["none", "id", "neighbor number", "d variable"]],
		show_individual_modules : false ,
		show_angle_indicators   : false ,
		show_constraints        : false ,
		show_centroid           : false ,
		show_active_thrusters   : false ,
		erase_mode              : false
	},
};

export default DEBUG;