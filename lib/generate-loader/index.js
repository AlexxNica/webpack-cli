var yeoman = require("yeoman-environment");
import { LoaderGenerator } from "./loader-generator";

/**
 * Runs a yeoman generator to create a new webpack loader project
 * @returns {void}
 */
function loaderCreator() {
	var env = yeoman.createEnv();
	var generatorName = "webpack-loader-generator";

	env.registerStub(new LoaderGenerator(), generatorName);

	env.run(generatorName);
}

export default loaderCreator;
