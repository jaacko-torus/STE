function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import dat from "../../_snowpack/pkg/dat.gui.js";
let arrays = {};

class datGUI_builder {
  constructor(config, options = {}) {
    _defineProperty(this, "gui", void 0);

    _defineProperty(this, "gui_folder", void 0);

    this.gui = new dat.GUI();
    this.build_GUI(config, options); // in case adding to window fails for whatever reason

    return this.gui;
  }

  build_GUI(config, {
    folder_name = "Config",
    remember = false
  } = {}) {
    this.gui_folder = this.gui.addFolder(folder_name);

    if (remember) {
      this.gui.remember(config);
    }

    this.add(config, this.gui_folder); // Add a button to be able to update your scene with changed variables if they don't auto-update things on screen

    const gui_update = {
      // when button pressed, animation will restart with updated values.
      update: () => {
        this.restartAnimation();
      }
    };
    this.gui.add(gui_update, "update");
    globalThis.gui = this.gui;
  }

  add(obj, folder) {
    Object.entries(obj).forEach(([key, val]) => {
      // if starts with "_", then private, skip
      if (key.startsWith("_")) {
        return;
      }

      switch (typeof val) {
        case "number":
          // if the value of the object key is a number, establish limits and step
          let step, limit; // if it's a small decimal number, give it a GUI range of -1,1 with a step of 0.1...

          if (val > -1 && val < 1) {
            step = 0.1;
            limit = 1;
          } else {
            // otherwise, calculate the limits and step based on # of digits in the number.
            // To establish a step and limit, we'll use a base number that is an integer.
            // Make the limit one digit higher than the number of digits of the itself, i.e. '150' would have a range of -1000 to 1000
            // With a step one less than the number of digits, i.e. '10'
            const numDigits = this.getNumDigits(Math.round(val));
            limit = 10 ** numDigits;
            step = 10 ** (numDigits - 2);
          } // add the value to your GUI folder


          folder.add(obj, key, -limit, limit).step(step);
          break;
        // if the key is an object itself
        // call this function again to loop through that subobject
        // assigning it to the same folder

        case "object":
          if (Array.isArray(val)) {
            let dd = folder.add(obj, key, val[1]);
            dd.setValue(val[0]);
          } else {
            // it's an object
            this.add(val, folder);
          }

          break;

        case "string":
          // if it's a HEX value, we're going to assume it's a color.
          if (val.startsWith("#")) {
            folder.addColor(obj, key); // just add the value to the folder with no specific step, and let dat GUI interpret it as it sees fit
          } else {
            // or it's just a string
            folder.add(obj, key);
          }

          break;

        default:
          // other struff I don't wanna deal with
          folder.add(obj, key);
          break;
      }
    });
  }

  getNumDigits(val) {
    // A regex to compute the number of digits in a number.
    // Note that decimals will get counted as digits, which is why to establish our limit and step we rounded.
    return (`${val}`.match(/\d/g) || []).length;
  }

  restartAnimation() {// Your restart / teardown code here
  }

}

export { datGUI_builder };