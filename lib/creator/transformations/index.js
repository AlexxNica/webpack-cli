"use strict";

const path = require("path");
const j = require("jscodeshift");
const chalk = require("chalk");
const pEachSeries = require("p-each-series");

import runPrettier from "../utils/run-prettier";

import entryTransform from "./entry/entry";
import outputTransform from "./output/output";
import contextTransform from "./context/context";
import resolveTransform from "./resolve/resolve";
import devtoolTransform from "./devtool/devtool";
import targetTransform from "./target/target";
import watchTransform from "./watch/watch";
import watchOptionsTransform from "./watch/watchOptions";
import externalsTransform from "./externals/externals";
import nodeTransform from "./node/node";
import performanceTransform from "./performance/performance";
import statsTransform from "./stats/stats";
import amdTransform from "./other/amd";
import bailTransform from "./other/bail";
import cacheTransform from "./other/cache";
import profileTransform from "./other/profile";
import mergeTransform from "./other/merge";
import moduleTransform from "./module/module";
import pluginsTransform from "./plugins/plugins";
import topScopeTransform from "./top-scope/top-scope";
import devServerTransform from "./devServer/devServer";

/*
* @function runTransform
*
* Runs the transformations from an object we get from yeoman
*
* @param { Object } transformObject - Options to transform
* @returns { <Promise> } - A promise that writes each transform, runs prettier
* and writes the file
*/

const transformsObject = {
	entryTransform,
	outputTransform,
	contextTransform,
	resolveTransform,
	devtoolTransform,
	targetTransform,
	watchTransform,
	watchOptionsTransform,
	externalsTransform,
	nodeTransform,
	performanceTransform,
	statsTransform,
	amdTransform,
	bailTransform,
	cacheTransform,
	profileTransform,
	moduleTransform,
	pluginsTransform,
	topScopeTransform,
	mergeTransform,
	devServerTransform
};

export default function runTransform(webpackProperties) {
	// webpackOptions.name sent to nameTransform if match
	Object.keys(webpackProperties).forEach(scaffoldPiece => {
		const config = webpackProperties[scaffoldPiece];

		const transformations = Object.keys(transformsObject).map(k => {
			const stringVal = k.substr(0, k.indexOf("Transform"));
			if (config.webpackOptions) {
				if (config.webpackOptions[stringVal]) {
					return [transformsObject[k], config.webpackOptions[stringVal]];
				} else {
					return [transformsObject[k], config[stringVal]];
				}
			} else {
				return [transformsObject[k]];
			}
		});

		const ast = j("module.exports = {}");

		return pEachSeries(transformations, f => {
			if (!f[1]) {
				return f[0](j, ast);
			} else {
				return f[0](j, ast, f[1]);
			}
		})
			.then(() => {
				let configurationName;
				if (!config.configName) {
					configurationName = "webpack.config.js";
				} else {
					configurationName = "webpack." + config.configName + ".js";
				}

				const outputPath = path.join(process.cwd(), configurationName);
				const source = ast.toSource({
					quote: "single"
				});

				runPrettier(outputPath, source);
			})
			.catch(err => {
				console.error(err.message ? err.message : err);
			});
	});
	process.stdout.write(
		"\n" +
			chalk.green(
				"Congratulations! Your new webpack configuration file has been created!\n"
			)
	);
}
