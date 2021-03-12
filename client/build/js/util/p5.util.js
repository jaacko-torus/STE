function hexAlpha(s, [hex, alpha]) {
  // p5 extention
  var c = s.color(hex); // return color("rgba(" +  [red(c), green(c), blue(c), alpha].join(",") + ")");

  return s.color(`rgba(${[s.red(c), s.green(c), s.blue(c), alpha].join(",")})`);
}

export { hexAlpha };