function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import Module from "../Module.js";

class Struct extends Module {
  constructor(world, owner, spaceship, id, position, meta, angle) {
    super(world, owner, spaceship, id, position, meta, angle);
  }

}

class T1 extends Struct {
  constructor(world, owner, spaceship, id, position, meta, angle) {
    super(world, owner, spaceship, id, position, meta, angle); // TODO: add prop `category_description` whenever this is accessed, and load from `module.categories`

    _defineProperty(this, "category", "T1");
  }

}

export default Struct;
export { T1 };