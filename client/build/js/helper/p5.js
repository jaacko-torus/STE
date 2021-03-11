function hexAlpha([hex, alpha]) { // p5 extention
	var c = color(hex);
	// return color("rgba(" +  [red(c), green(c), blue(c), alpha].join(",") + ")");
	return color(`rgba(${[red(c), green(c), blue(c), alpha].join(",")})`);
}

export {
	hexAlpha
}