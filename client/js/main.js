const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");


var ss = { // spaceship
	x :  100,
	y :  100,
	s :   60,
	r :    0,
	c : "#ff0000"
}

function triangle(x, y, s, r, c, debug = false) {
	// x, y, size, rotation, color
	// size refers to diameter of encircling circle
	let x1 = x + (s * Math.sin(r) / 2);
	let y1 = y - (s * Math.cos(r) / 2);

	let x2 = x + (s * Math.sin(r - (2 * Math.PI / 3)) / 2);
	let y2 = y - (s * Math.cos(r - (2 * Math.PI / 3)) / 2);
	
	let x3 = x + (s * Math.sin(r + (2 * Math.PI / 3)) / 2);
	let y3 = y - (s * Math.cos(r + (2 * Math.PI / 3)) / 2);

	ctx.beginPath();
	ctx.moveTo(x1,y1);
	ctx.lineTo(x2,y2);
	ctx.lineTo(x3,y3);
	ctx.fillStyle = c;
	ctx.fill();

	if(debug) {
		ctx.setLineDash([5, 3]);
		ctx.beginPath();
		ctx.arc(x, y, s / 2, 0, 2 * Math.PI);
		ctx.moveTo(x, y);
		ctx.lineTo(x1, y1)
		ctx.stroke();
	}
}

triangle(ss.x, ss.y, ss.s, ss.r, ss.c, true);