var yeoman = require("yeoman-environment");
import PluginGenerator from "./plugin-generator";

/**
 * Runs a yeoman generator to create a new webpack plugin project
 * @returns {void}
 */
function pluginCreator() {
	var env = yeoman.createEnv();
	var generatorName = "webpack-plugin-generator";

	env.registerStub(new PluginGenerator(), generatorName);

	env.run(generatorName);
}

export default pluginCreator;
