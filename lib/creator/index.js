"use strict";

import yeoman from "yeoman-environment";
import Generator from "yeoman-generator";
import { basename } from "path";
import defaultGenerator from "./yeoman/webpack-generator";
import WebpackAdapter from "./yeoman/webpack-adapter";
import runTransform from "./transformations/index";

/*
* @function create
*
* Runs yeoman and runs the transformations based on the object
* built up from an author/user
*
* @param { String } options - An path to the given generator
* @returns { Function } runTransform - Run transformations based on yeoman prompt
*/

export function create(options) {
	let env = yeoman.createEnv("webpack", null, new WebpackAdapter());
	const generatorName = options
		? replaceGeneratorName(basename(options[0]))
		: "webpack-default-generator";
	if (options) {
		const WebpackGenerator = class extends Generator {
			initializing() {
				options.forEach(path => {
					return this.composeWith(require.resolve(path));
				});
			}
		};
		env.registerStub(WebpackGenerator, generatorName);
	} else {
		env.registerStub(defaultGenerator, "webpack-default-generator");
	}

	env.run(generatorName).on("end", () => {
		if (generatorName !== "webpack-default-generator") {
			//HACK / FIXME
			env = env.options.env;
			return runTransform(env.configuration);
		} else {
			return runTransform(env.getArgument("configuration"));
		}
	});
}

/*
* @function replaceGeneratorName
*
* Replaces the webpack-addons pattern with the end of the addons name merged
* with 'generator'
*
* @param { String } name - name of the generator
* @returns { String } name - replaced pattern of the name
*/

export function replaceGeneratorName(name) {
	return name.replace(/(webpack-addons)?([^:]+)(:.*)?/g, "generator$2");
}
