function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import universe from "../universe.js";
import { map_set } from "../../util/util.js";

class User {
  constructor(id, name) {
    _defineProperty(this, "name", void 0);

    _defineProperty(this, "spaceships", new Map());

    this.name = name;
    map_set({
      map: universe.users,
      key: id,
      val: this
    });
  }

}

export default User;