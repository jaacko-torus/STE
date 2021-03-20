import Module, { IModuleConstructorParameters } from "../Module.js";

class Struct extends Module {
	constructor(params : IModuleConstructorParameters) {
		super(params);
	}
}

class T1 extends Struct {
	category = "T1";
	
	constructor(params : IModuleConstructorParameters) {
		super(params);
		
		// TODO: add prop `category_description` whenever this is accessed, and load from `module.categories`
	}
}

export default Struct;
export {
	T1
};