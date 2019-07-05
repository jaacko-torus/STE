/* -- module setup presets -- */

/*
	All module setup presets will be named as follows:
	`module_preset_d<direction of capsule>_<preset name>`
	
	For custom sets during runtime use the following:
	`module_custom_d<direction of capsule>_<preset name>`
*/

/*
	The 5x5 is a module formation representing a grid of 5 by 5 triangles,
	with 5 crossing triangle as it's base and a height of 5 triangle heights stacked on top
*/

let d0_single = [[0,0,0,["Q1",{"main":true,"grid":{"d":0}}]]];
let d1_single = [[0,0,0,["Q1",{"main":true,"grid":{"d":1}}]]];

let d1_dt = [ // double thruster
	[  0   ,  0   ,  0   , ["Q1", { "size": 0.5, "main": true }] ],
	[  0.5 ,  1   ,  0   , ["R3", { "size": 0.5 }] ],
	[  0   ,  1   ,  0.5 , ["R3", { "size": 0.5 }] ],

	[  1   ,  1   , -1   , ["T1", { "size": 0.5 }] ],
	[ -1   ,  1   ,  1   , ["T1", { "size": 0.5 }] ],
]

let d0_5x5 = [
	[  0,  0,  0,
		[
			"Q1",
			{
				"main": true,
				"grid": { "d": 0 }
			}
		]
	],
	
	// 2
	[  0,  2, -2, ["R3"] ],
	[  0,  2, -1, ["T1"] ],
	[ -1,  2, -1, ["R3"] ],
	[ -1,  2,  0, ["T1"] ],
	[ -2,  2,  0, ["R3"] ],

	// 1
	[  1,  1, -1, ["T1"] ],
	[  0,  1, -1, ["T1"] ],
	[  0,  1,  0, ["T1"] ],
	[ -1,  1,  0, ["T1"] ],
	[ -1,  1,  1, ["T1"] ],

	// 0
	[  1,  0, -1, ["T1"] ],
	[  1,  0,  0, ["T1"] ],
	// [  0,  0,  0, ["Q1", {main: true}] ],
	[  0,  0,  1, ["T1"] ],
	[ -1,  0,  1, ["T1"] ],

	// -1
	[  2, -1,  0, ["T1"] ],
	[  1, -1,  0, ["T1"] ],
	[  1, -1,  1, ["T1"] ],
	[  0, -1,  1, ["T1"] ],
	[  0, -1,  2, ["T1"] ],

	// -2
	[  2, -2,  0, ["T1"] ],
	[  2, -2,  1, ["R3"] ],
	[  1, -2,  1, ["T1"] ],
	[  1, -2,  2, ["R3"] ],
	[  0, -2,  2, ["T1"] ]
	// two bottom ones are thrusters
];

let d1_5x5 = [
	[  0,  0,  0,
		[
			"Q1",
			{
				"main": true,
				"grid": { "d": 1 }
			}
		]
	],
	
	// 2
	[  2, -2,  0, ["T1"] ],
	[  2, -2,  1, ["R3"] ],
	[  1, -2,  1, ["T1"] ],
	[  1, -2,  2, ["R3"] ],
	[  0, -2,  2, ["T1"] ],
	
	// 1
	[  1, -1,  0, ["T1"] ],
	[  2, -1,  0, ["T1"] ],
	[  1, -1,  1, ["T1"] ],
	[  0, -1,  1, ["T1"] ],
	[  0, -1,  2, ["T1"] ],
	
	// 0
	[  1,  0, -1, ["T1"] ],
	[  1,  0,  0, ["T1"] ],
	// [  0,  0,  0, ["Q1", {main: true}] ],
	[  0,  0,  1, ["T1"] ],
	[ -1,  0,  1, ["T1"] ],
		
	// -1
	[  1,  1, -1, ["T1"] ],
	[  0,  1, -1, ["T1"] ],
	[  0,  1,  0, ["T1"] ],
	[ -1,  1,  0, ["T1"] ],
	[ -1,  1,  1, ["T1"] ],
		
	// -2 
	[  0,  2, -2, ["R3"] ],
	[  0,  2, -1, ["T1"] ],
	[ -1,  2, -1, ["R3"] ],
	[ -1,  2,  0, ["T1"] ],
	[ -2,  2,  0, ["R3"] ]
	// three bottom modules are thrusters
];

let d0_cool_ship = [
	[  0,  0,  0,
		[
			"Q1",
			{
				"main": true,
				"grid": { "d": 0 }
			}
		]
	],
	
	[  0,  2, -1, ["T1"] ],
	[ -1,  2, -1, ["T1"] ],
	[ -1,  2,  0, ["T1"] ],
	
	[  1,  1, -1, ["T1"] ],
	[  0,  1, -1, ["T1"] ],
	[  0,  1,  0, ["T1"] ],
	[ -1,  1,  0, ["T1"] ],
	[ -1,  1,  1, ["T1"] ],
	
	[  1,  0, -1, ["T1"] ],
	[  1,  0,  0, ["T1"] ],
	// [  0,  0,  0, ["Q1", {main: true}] ],
	[  0,  0,  1, ["T1"] ],
	[ -1,  0,  1, ["T1"] ],
	
	[  2, -1,  0, ["R3"] ],
	[  1, -1,  0, ["T1"] ],
	[  1, -1,  1, ["T1"] ],
	[  0, -1,  1, ["T1"] ],
	[  0, -1,  2, ["R3"] ],
	
	[  2, -2,  1, ["R3"] ],
	[  1, -2,  1, ["T1"] ],
	[  1, -2,  2, ["R3"] ]
];

export {
	d0_single,
	d1_single,
	d1_dt,
	d0_5x5,
	d1_5x5,
	d0_cool_ship
};