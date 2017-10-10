'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var _Promise = _interopDefault(require('babel-runtime/core-js/promise'));
var yeoman = _interopDefault(require('yeoman-environment'));
var Generator = _interopDefault(require('yeoman-generator'));
var path$1 = require('path');
var _typeof = _interopDefault(require('babel-runtime/helpers/typeof'));
var _Object$keys = _interopDefault(require('babel-runtime/core-js/object/keys'));
var _Object$assign = _interopDefault(require('babel-runtime/core-js/object/assign'));
var _JSON$stringify = _interopDefault(require('babel-runtime/core-js/json/stringify'));
var _Object$getPrototypeOf = _interopDefault(require('babel-runtime/core-js/object/get-prototype-of'));
var _classCallCheck = _interopDefault(require('babel-runtime/helpers/classCallCheck'));
var _createClass = _interopDefault(require('babel-runtime/helpers/createClass'));
var _possibleConstructorReturn = _interopDefault(require('babel-runtime/helpers/possibleConstructorReturn'));
var _inherits = _interopDefault(require('babel-runtime/helpers/inherits'));

"use strict";

var got = require("got");
var chalk = require("chalk");
var constant = function constant(value) {
	return function () {
		return value;
	};
};

/*
* @function npmExists
*
* Checks if the given dependency/module is registered on npm
*
* @param { String } moduleName - The dependency to be checked
* @returns { <Promise> } constant - Returns either true or false,
* based on if it exists or not
*/

function npmExists(moduleName) {
	//eslint-disable-next-line
	if (moduleName.length <= 14 || moduleName.slice(0, 14) !== "webpack-addons") {
		throw new TypeError(chalk.bold(moduleName + " isn't a valid name.\n") + chalk.red("\nIt should be prefixed with 'webpack-addons', but have different suffix.\n"));
	}
	var hostname = "https://www.npmjs.org";
	var pkgUrl = hostname + "/package/" + moduleName;
	return got(pkgUrl, {
		method: "HEAD"
	}).then(constant(true)).catch(constant(false));
}

var npmExists$1 = Object.freeze({
	default: npmExists
});

"use strict";

var path$3 = require("path");
var fs = require("fs");
var spawn = require("cross-spawn");
var globalPath$1 = require("global-modules");

var SPAWN_FUNCTIONS = {
	npm: spawnNPM,
	yarn: spawnYarn
};

function spawnNPM(pkg, isNew) {
	return spawn.sync("npm", [isNew ? "install" : "update", "-g", pkg], {
		stdio: "inherit"
	});
}

function spawnYarn(pkg, isNew) {
	return spawn.sync("yarn", ["global", isNew ? "add" : "upgrade", pkg], {
		stdio: "inherit"
	});
}
/*
* @function spawnChild
*
* Spawns a new process that installs the addon/dependency
*
* @param { String } pkg - The dependency to be installed
* @returns { <Function> } spawn - Installs the package
*/

function spawnChild(pkg) {
	var pkgPath = path$3.resolve(globalPath$1, pkg);
	var packageManager = getPackageManager();
	var isNew = !fs.existsSync(pkgPath);

	return SPAWN_FUNCTIONS[packageManager](pkg, isNew);
}

/*
* @function getPackageManager
*
* Returns the name of package manager to use,
* preferring yarn over npm if available
*
* @returns { String } - The package manager name
*/

function getPackageManager() {
	if (spawn.sync("yarn", [" --version"], { stdio: "ignore" }).error) {
		return "npm";
	}

	return "yarn";
}

"use strict";

var validate = (value) => {
	const pass = value.length;
	if (pass) {
		return true;
	}
	return "Please specify an answer!";
};

"use strict";

const InputValidate = require("webpack-addons").InputValidate;
var entryQuestions = (self, answer) => {
	let entryIdentifiers;
	let result;
	if (answer["entryType"] === true) {
		result = self
			.prompt([
				InputValidate(
					"multipleEntries",
					"Type the names you want for your modules (entry files), separated by comma [example: 'app,vendor']",
					validate
				)
			])
			.then(multipleEntriesAnswer => {
				let webpackEntryPoint = {};
				entryIdentifiers = multipleEntriesAnswer["multipleEntries"].split(",");
				function forEachPromise(obj, fn) {
					return obj.reduce(function(promise, prop) {
						const trimmedProp = prop.trim();
						return promise.then(n => {
							if (n) {
								Object.keys(n).forEach(val => {
									if (
										n[val].charAt(0) !== "(" &&
										n[val].charAt(0) !== "[" &&
										n[val].indexOf("function") < 0 &&
										n[val].indexOf("path") < 0 &&
										n[val].indexOf("process") < 0
									) {
										n[val] = `"${n[val]}.js"`;
									}
									webpackEntryPoint[val] = n[val];
								});
							} else {
								n = {};
							}
							return fn(trimmedProp);
						});
					}, Promise.resolve());
				}
				return forEachPromise(entryIdentifiers, entryProp =>
					self.prompt([
						InputValidate(
							`${entryProp}`,
							`What is the location of "${entryProp}"? [example: "./src/${entryProp}"]`,
							validate
						)
					])
				).then(propAns => {
					Object.keys(propAns).forEach(val => {
						if (
							propAns[val].charAt(0) !== "(" &&
							propAns[val].charAt(0) !== "[" &&
							propAns[val].indexOf("function") < 0 &&
							propAns[val].indexOf("path") < 0 &&
							propAns[val].indexOf("process") < 0
						) {
							propAns[val] = `"${propAns[val]}.js"`;
						}
						webpackEntryPoint[val] = propAns[val];
					});
					return webpackEntryPoint;
				});
			});
	} else {
		result = self
			.prompt([
				InputValidate(
					"singularEntry",
					"Which module will be the first to enter the application? [example: './src/index']",
					validate
				)
			])
			.then(singularAnswer => `"${singularAnswer["singularEntry"]}"`);
	}
	return result;
};

var getBabelPlugin = () => {
	return {
		test: new RegExp(/\.js$/),
		exclude: "/node_modules/",
		loader: "'babel-loader'",
		options: {
			presets: ["'es2015'"]
		}
	};
};

var getDefaultPlugins = () => {
	return ["new UglifyJSPlugin()"];
};

var tooltip = {
	uglify: () => {
		return `/*
 * We've enabled UglifyJSPlugin for you! This minifies your app
 * in order to load faster and run less javascript.
 *
 * https://github.com/webpack-contrib/uglifyjs-webpack-plugin
 *
 */`;
	},
	commonsChunk: () => {
		return `/*
 * We've enabled commonsChunkPlugin for you. This allows your app to
 * load faster and it splits the modules you provided as entries across
 * different bundles!
 *
 * https://webpack.js.org/plugins/commons-chunk-plugin/
 *
 */`;
	},
	cssPlugin: () => {
		return `/*
 * We've enabled ExtractTextPlugin for you. This allows your app to
 * use css modules that will be moved into a separate CSS file instead of inside
 * one of your module entries!
 *
 * https://github.com/webpack-contrib/extract-text-webpack-plugin
 *
 */`;
	},
	postcss: () => {
		return `/*
 * We've enabled Postcss, autoprefixer and precss for you. This allows your app
 * to lint  CSS, support variables and mixins, transpile future CSS syntax,
 * inline images, and more!
 *
 * To enable SASS or LESS, add the respective loaders to module.rules
 *
 * https://github.com/postcss/postcss
 *
 * https://github.com/postcss/autoprefixer
 *
 * https://github.com/jonathantneal/precss
 *
 */`;
	}
};

"use strict";

const Generator$1 = require("yeoman-generator");
const chalk$2 = require("chalk");

const createCommonsChunkPlugin = require("webpack-addons")
	.createCommonsChunkPlugin;

const Input = require("webpack-addons").Input;
const Confirm = require("webpack-addons").Confirm;
const RawList = require("webpack-addons").RawList;

class WebpackGenerator extends Generator$1 {
	constructor(args, opts) {
		super(args, opts);
		this.isProd = false;
		this.dependencies = ["webpack", "uglifyjs-webpack-plugin"];
		this.configuration = {
			config: {
				webpackOptions: {},
				topScope: []
			}
		};
	}
	prompting() {
		let done = this.async();
		let self = this;
		let oneOrMoreEntries;
		let regExpForStyles;
		let ExtractUseProps;
		let outputPath = "dist";
		process.stdout.write(
			`\n${chalk$2.bold("Insecure about some of the questions?")}\n`
		);
		process.stdout.write(
			`\n${chalk$2.bold.green(
				"https://github.com/webpack/webpack-cli/blob/master/INIT.md"
			)}\n\n`
		);
		this.configuration.config.webpackOptions.module = {
			rules: []
		};
		this.configuration.config.webpackOptions.plugins = getDefaultPlugins();
		this.configuration.config.topScope.push(
			"const webpack = require('webpack')",
			"const path = require('path')",
			tooltip.uglify(),
			"const UglifyJSPlugin = require('uglifyjs-webpack-plugin');",
			"\n"
		);
		this.prompt([
			Confirm("entryType", "Will your application have multiple bundles?")
		]).then(entryTypeAnswer => {
			// Ask different questions for entry points
			entryQuestions(self, entryTypeAnswer)
				.then(entryOptions => {
					this.configuration.config.webpackOptions.entry = entryOptions;
					oneOrMoreEntries = Object.keys(entryOptions);
				})
				.then(() => {
					this.prompt([
						Input(
							"outputType",
							"Which folder will your generated bundles be in? [default: dist]:"
						)
					])
						.then(outputTypeAnswer => {
							if (!this.configuration.config.webpackOptions.entry.length) {
								this.configuration.config.topScope.push(tooltip.commonsChunk());
								this.configuration.config.webpackOptions.output = {
									filename: "'[name].[chunkhash].js'",
									chunkFilename: "'[name].[chunkhash].js'"
								};
							} else {
								this.configuration.config.webpackOptions.output = {
									filename: "'[name].bundle.js'"
								};
							}
							if (outputTypeAnswer["outputType"].length) {
								outputPath = outputTypeAnswer["outputType"];
							}
							this.configuration.config.webpackOptions.output.path = `path.resolve(__dirname, '${outputPath}')`;
						})
						.then(() => {
							this.prompt([
								Confirm(
									"prodConfirm",
									"Are you going to use this in production?"
								)
							])
								.then(prodAnswer => {
									if (prodAnswer["prodConfirm"] === true) {
										this.isProd = true;
									} else {
										this.isProd = false;
									}
								})
								.then(() => {
									this.prompt([
										Confirm("babelConfirm", "Will you be using ES2015?")
									])
										.then(ans => {
											if (ans["babelConfirm"] === true) {
												this.configuration.config.webpackOptions.module.rules.push(
													getBabelPlugin()
												);
												this.dependencies.push(
													"babel-loader",
													"babel-core",
													"babel-preset-es2015"
												);
											}
										})
										.then(() => {
											this.prompt([
												RawList(
													"stylingType",
													"Will you use one of the below CSS solutions?",
													["SASS", "LESS", "CSS", "PostCSS", "No"]
												)
											])
												.then(stylingAnswer => {
													if (!this.isProd) {
														ExtractUseProps = [];
													}
													switch (stylingAnswer["stylingType"]) {
														case "SASS":
															this.dependencies.push(
																"sass-loader",
																"node-sass",
																"style-loader",
																"css-loader"
															);
															regExpForStyles = new RegExp(/\.(scss|css)$/);
															if (this.isProd) {
																ExtractUseProps = `use: [{
												loader: "css-loader",
												options: {
													sourceMap: true
												}
											}, {
												loader: "sass-loader",
												options: {
													sourceMap: true
												}
											}],
											fallback: "style-loader"`;
															} else {
																ExtractUseProps.push(
																	{
																		loader: "'style-loader'"
																	},
																	{
																		loader: "'css-loader'"
																	},
																	{
																		loader: "'sass-loader'"
																	}
																);
															}
															break;
														case "LESS":
															regExpForStyles = new RegExp(/\.(less|css)$/);
															this.dependencies.push(
																"less-loader",
																"less",
																"style-loader",
																"css-loader"
															);
															if (this.isProd) {
																ExtractUseProps = `
											use: [{
												loader: "css-loader",
												options: {
													sourceMap: true
												}
											}, {
												loader: "less-loader",
												options: {
													sourceMap: true
												}
											}],
											fallback: "style-loader"`;
															} else {
																ExtractUseProps.push(
																	{
																		loader: "'css-loader'",
																		options: {
																			sourceMap: true
																		}
																	},
																	{
																		loader: "'less-loader'",
																		options: {
																			sourceMap: true
																		}
																	}
																);
															}
															break;
														case "PostCSS":
															this.configuration.config.topScope.push(
																tooltip.postcss(),
																"const autoprefixer = require('autoprefixer');",
																"const precss = require('precss');",
																"\n"
															);
															this.dependencies.push(
																"style-loader",
																"css-loader",
																"postcss-loader",
																"precss",
																"autoprefixer"
															);
															regExpForStyles = new RegExp(/\.css$/);
															if (this.isProd) {
																ExtractUseProps = `
											use: [{
												loader: "style-loader"
											},{
												loader: "css-loader",
												options: {
													sourceMap: true,
													importLoaders: 1
												}
											}, {
												loader: "postcss-loader",
												options: {
													plugins: function () {
														return [
															precss,
															autoprefixer
														];
													}
												}
											}],
											fallback: "style-loader"`;
															} else {
																ExtractUseProps.push(
																	{
																		loader: "'style-loader'"
																	},
																	{
																		loader: "'css-loader'",
																		options: {
																			sourceMap: true,
																			importLoaders: 1
																		}
																	},
																	{
																		loader: "'postcss-loader'",
																		options: {
																			plugins: `function () {
														return [
															precss,
															autoprefixer
														];
													}`
																		}
																	}
																);
															}
															break;
														case "CSS":
															this.dependencies.push(
																"style-loader",
																"css-loader"
															);
															regExpForStyles = new RegExp(/\.css$/);
															if (this.isProd) {
																ExtractUseProps = `use: [{
												loader: "css-loader",
												options: {
													sourceMap: true
												}
											}],
											fallback: "style-loader"`;
															} else {
																ExtractUseProps.push(
																	{
																		loader: "'style-loader'",
																		options: {
																			sourceMap: true
																		}
																	},
																	{
																		loader: "'css-loader'"
																	}
																);
															}
															break;
														default:
															regExpForStyles = null;
													}
												})
												.then(() => {
													// Ask if the user wants to use extractPlugin
													this.prompt([
														Input(
															"extractPlugin",
															"If you want to bundle your CSS files, what will you name the bundle? (press enter to skip)"
														)
													])
														.then(extractAnswer => {
															if (regExpForStyles) {
																if (this.isProd) {
																	this.configuration.config.topScope.push(
																		tooltip.cssPlugin()
																	);
																	this.dependencies.push(
																		"extract-text-webpack-plugin"
																	);
																	if (
																		extractAnswer["extractPlugin"].length !== 0
																	) {
																		this.configuration.config.webpackOptions.plugins.push(
																			"new ExtractTextPlugin('" +
																				extractAnswer["extractPlugin"] +
																				".[contentHash].css')"
																		);
																	} else {
																		this.configuration.config.webpackOptions.plugins.push(
																			"new ExtractTextPlugin('" + "style.css')"
																		);
																	}
																	const moduleRulesObj = {
																		test: regExpForStyles,
																		use: `ExtractTextPlugin.extract({
													${ExtractUseProps}
												})`
																	};
																	this.configuration.config.webpackOptions.module.rules.push(
																		moduleRulesObj
																	);
																	this.configuration.config.topScope.push(
																		"const ExtractTextPlugin = require('extract-text-webpack-plugin');",
																		"\n"
																	);
																} else {
																	const moduleRulesObj = {
																		test: regExpForStyles,
																		use: ExtractUseProps
																	};
																	this.configuration.config.webpackOptions.module.rules.push(
																		moduleRulesObj
																	);
																}
															}
														})
														.then(() => {
															if (
																!this.configuration.config.webpackOptions.entry
																	.length
															) {
																oneOrMoreEntries.forEach(prop => {
																	this.configuration.config.webpackOptions.plugins.push(
																		createCommonsChunkPlugin(prop)
																	);
																});
															}
															done();
														});
												});
										});
								});
						});
				});
		});
	}
	installPlugins() {
		let asyncNamePrompt = this.async();
		let defaultName = this.isProd ? "prod" : "config";
		this.prompt([
			Input(
				"nameType",
				`Name your 'webpack.[name].js?' [default: '${defaultName}']:`
			)
		])
			.then(nameAnswer => {
				if (nameAnswer["nameType"].length) {
					this.configuration.config.configName = nameAnswer["nameType"];
				} else {
					this.configuration.config.configName = defaultName;
				}
			})
			.then(() => {
				asyncNamePrompt();
				this.runInstall(getPackageManager(), this.dependencies, {
					"save-dev": true
				});
			});
	}
}

"use strict";

const inquirer = require("inquirer");

/*
* @class - WebpackAdapter
*
* Custom adapter that is integrated in the scaffold. Here we can validate
* paths and answers from the user
*
*/
class WebpackAdapter {
	prompt(questions, callback) {
		const promise = inquirer.prompt(questions);
		promise.then(callback || function() {});
		return promise;
	}
}

"use strict";

const prettier = require("prettier");
const fs$1 = require("fs");
const chalk$4 = require("chalk");

/*
*
* Runs prettier and later prints the output configuration
*
* @param { String } outputPath - Path to write the config to
* @param { Node } source - AST to write at the given path
* @returns fs - Writes a file at given location and prints messages accordingly
*/

function runPrettier(outputPath, source) {
	function validateConfig() {
		let prettySource;
		try {
			prettySource = prettier.format(source, {
				singleQuote: true,
				useTabs: true,
				tabWidth: 1
			});
		} catch (err) {
			process.stdout.write(
				"\n" +
					chalk$4.yellow(
						`WARNING: Could not apply prettier to ${outputPath}` +
							" due validation error, but the file has been created\n"
					)
			);
			prettySource = source;
		}
		return fs$1.writeFileSync(outputPath, prettySource, "utf8");
	}
	return fs$1.writeFile(outputPath, source, "utf8", validateConfig);
}

//      
// eslint-disable-next-line node/no-unsupported-features


function safeTraverse(obj, paths) {
	var val = obj;
	var idx = 0;

	while (idx < paths.length) {
		if (!val) {
			return null;
		}
		val = val[paths[idx]];
		idx++;
	}
	return val;
}

// Convert nested MemberExpressions to strings like webpack.optimize.DedupePlugin
function memberExpressionToPathString(path) {
	if (path && path.object) {
		return [memberExpressionToPathString(path.object), path.property.name].join(".");
	}
	return path.name;
}

// Convert Array<string> like ['webpack', 'optimize', 'DedupePlugin'] to nested MemberExpressions
function pathsToMemberExpression(j, paths) {
	if (!paths.length) {
		return null;
	} else if (paths.length === 1) {
		return j.identifier(paths[0]);
	} else {
		var first = paths.slice(0, 1);
		var rest = paths.slice(1);
		return j.memberExpression(pathsToMemberExpression(j, rest), pathsToMemberExpression(j, first));
	}
}

/*
* @function findPluginsByName
*
* Find paths that match `new name.space.PluginName()` for a given array of plugin names
*
* @param j — jscodeshift API
* @param { Node } node - Node to start search from
* @param { Array<String> } pluginNamesArray - Array of plugin names like `webpack.LoaderOptionsPlugin`
* @returns Path
 * */
function findPluginsByName(j, node, pluginNamesArray) {
	return node.find(j.NewExpression).filter(function (path) {
		return pluginNamesArray.some(function (plugin) {
			return memberExpressionToPathString(path.get("callee").value) === plugin;
		});
	});
}

/*
 * @function findPluginsRootNodes
 *
 * Finds the path to the `plugins: []` node
 *
 * @param j — jscodeshift API
 * @param { Node } node - Node to start search from
 * @returns Path
 * */
function findPluginsRootNodes(j, node) {
	return node.find(j.Property, { key: { name: "plugins" } });
}

/*
 * @function createProperty
 *
 * Creates an Object's property with a given key and value
 *
 * @param j — jscodeshift API
 * @param { string | number } key - Property key
 * @param { string | number | boolean } value - Property value
 * @returns Node
 * */
function createProperty(j, key, value) {
	return j.property("init", createIdentifierOrLiteral(j, key), createLiteral(j, value));
}

/*
 * @function createLiteral
 *
 * Creates an appropriate literal property
 *
 * @param j — jscodeshift API
 * @param { string | boolean | number } val
 * @returns { Node }
 * */

function createLiteral(j, val) {
	var literalVal = val;
	// We'll need String to native type conversions
	if (typeof val === "string") {
		// 'true' => true
		if (val === "true") literalVal = true;
		// 'false' => false
		if (val === "false") literalVal = false;
		// '1' => 1
		if (!isNaN(Number(val))) literalVal = Number(val);
	}
	return j.literal(literalVal);
}

/*
 * @function createIdentifierOrLiteral
 *
 * Creates an appropriate identifier or literal property
 *
 * @param j — jscodeshift API
 * @param { string | boolean | number } val
 * @returns { Node }
 * */

function createIdentifierOrLiteral(j, val) {
	// IPath<IIdentifier> | IPath<ILiteral> doesn't work, find another way
	var literalVal = val;
	// We'll need String to native type conversions
	if (typeof val === "string" || val.__paths) {
		// 'true' => true
		if (val === "true") {
			literalVal = true;
			return j.literal(literalVal);
		}
		// 'false' => false
		if (val === "false") {
			literalVal = false;
			return j.literal(literalVal);
		}
		// '1' => 1
		if (!isNaN(Number(val))) {
			literalVal = Number(val);
			return j.literal(literalVal);
		}

		if (val.__paths) {
			return createExternalRegExp(j, val);
		} else {
			// Use identifier instead
			// TODO: Check if literalVal is a valid Identifier!
			return j.identifier(literalVal);
		}
	}
	return j.literal(literalVal);
}
/*
 * @function createOrUpdatePluginByName
 *
 * Findes or creates a node for a given plugin name string with options object
 * If plugin decalaration already exist, options are merged.
 *
 * @param j — jscodeshift API
 * @param { NodePath } rooNodePath - `plugins: []` NodePath where plugin should be added. See https://github.com/facebook/jscodeshift/wiki/jscodeshift-Documentation#nodepaths
 * @param { string } pluginName - ex. `webpack.LoaderOptionsPlugin`
 * @param { Object } options - plugin options
 * @returns void
 * */
function createOrUpdatePluginByName(j, rootNodePath, pluginName, options) {
	var pluginInstancePath = findPluginsByName(j, j(rootNodePath), [pluginName]);
	var optionsProps = void 0;
	if (options) {
		optionsProps = _Object$keys(options).map(function (key) {
			return createProperty(j, key, options[key]);
		});
	}

	// If plugin declaration already exist
	if (pluginInstancePath.size()) {
		pluginInstancePath.forEach(function (path) {
			// There are options we want to pass as argument
			if (optionsProps) {
				var args = path.value.arguments;
				if (args.length) {
					// Plugin is called with object as arguments
					// we will merge those objects
					var currentProps = j(path).find(j.ObjectExpression).get("properties");

					optionsProps.forEach(function (opt) {
						// Search for same keys in the existing object
						var existingProps = j(currentProps).find(j.Identifier).filter(function (path) {
							return opt.key.value === path.value.name;
						});

						if (existingProps.size()) {
							// Replacing values for the same key
							existingProps.forEach(function (path) {
								j(path.parent).replaceWith(opt);
							});
						} else {
							// Adding new key:values
							currentProps.value.push(opt);
						}
					});
				} else {
					// Plugin is called without arguments
					args.push(j.objectExpression(optionsProps));
				}
			}
		});
	} else {
		var argumentsArray = [];
		if (optionsProps) {
			argumentsArray = [j.objectExpression(optionsProps)];
		}
		var loaderPluginInstance = j.newExpression(pathsToMemberExpression(j, pluginName.split(".").reverse()), argumentsArray);
		rootNodePath.value.elements.push(loaderPluginInstance);
	}
}

/*
 * @function findVariableToPlugin
 *
 * Finds the variable to which a third party plugin is assigned to
 *
 * @param j — jscodeshift API
 * @param { Node } rootNode - `plugins: []` Root Node. See https://github.com/facebook/jscodeshift/wiki/jscodeshift-Documentation#nodepaths
 * @param { string } pluginPackageName - ex. `extract-text-plugin`
 * @returns { string } variable name - ex. 'var s = require(s) gives "s"`
 * */

function findVariableToPlugin(j, rootNode, pluginPackageName) {
	var moduleVarNames = rootNode.find(j.VariableDeclarator).filter(j.filters.VariableDeclarator.requiresModule(pluginPackageName)).nodes();
	if (moduleVarNames.length === 0) return null;
	return moduleVarNames.pop().id.name;
}

/*
* @function isType
*
* Returns true if type is given type
* @param { Node} path - pathNode
* @param { string } type - node type
* @returns {boolean}
*/

function isType(path, type) {
	return path.type === type;
}

function findObjWithOneOfKeys(p, keyNames) {
	return p.value.properties.reduce(function (predicate, prop) {
		var name = prop.key.name;
		return keyNames.indexOf(name) > -1 || predicate;
	}, false);
}

/*
* @function getRequire
*
* Returns constructed require symbol
* @param j — jscodeshift API
* @param { string } constName - Name of require
* @param { string } packagePath - path of required package
* @returns {NodePath} - the created ast
*/

function getRequire(j, constName, packagePath) {
	return j.variableDeclaration("const", [j.variableDeclarator(j.identifier(constName), j.callExpression(j.identifier("require"), [j.literal(packagePath)]))]);
}

/*
* @function checkIfExistsAndAddValue
*
* If a prop exists, it overrides it, else it creates a new one
* @param j — jscodeshift API
* @param { Node } node - objectexpression to check
* @param { string } key - Key of the property
* @param { string } value - computed value of the property
* @returns - nothing
*/

function checkIfExistsAndAddValue(j, node, key, value) {
	var existingProp = node.value.properties.filter(function (prop) {
		return prop.key.name === key;
	});
	var prop = void 0;
	if (existingProp.length > 0) {
		prop = existingProp[0];
		prop.value = value;
	} else {
		prop = j.property("init", j.identifier(key), value);
		node.value.properties.push(prop);
	}
}

/*
* @function createEmptyArrayProperty
*
* Creates an empty array
* @param j — jscodeshift API
* @param { String } key - st name
* @returns - { Array } arr - An empty array
*/
function createEmptyArrayProperty(j, key) {
	return j.property("init", j.identifier(key), j.arrayExpression([]));
}

/*
* @function createArrayWithChildren
*
* Creates an array and iterates on an object with properties
* @param j — jscodeshift API
* @param { String } key - object name
* @param { string } subProps - computed value of the property
* @param { Boolean } shouldDropKeys -
* @returns - { Array } arr - An array with the object properties
*/

function createArrayWithChildren(j, key, subProps, shouldDropKeys) {
	var arr = createEmptyArrayProperty(j, key);
	if (shouldDropKeys) {
		subProps.forEach(function (subProperty) {
			var objectOfArray = j.objectExpression([]);
			if (typeof subProperty !== "string") {
				loopThroughObjects(j, objectOfArray, subProperty);
				arr.value.elements.push(objectOfArray);
			} else {
				return arr.value.elements.push(createIdentifierOrLiteral(j, subProperty));
			}
		});
	} else {
		_Object$keys(subProps[key]).forEach(function (subProperty) {
			arr.value.elements.push(createIdentifierOrLiteral(j, subProps[key][subProperty]));
		});
	}
	return arr;
}

/*
* @function loopThroughObjects
*
* Loops through an object and adds property to an object with no identifier
* @param j — jscodeshift API
* @param { Node } p - node to add value to
* @param { Object } obj - Object to loop through
* @returns - { Function|Node } - Either pushes the node, or reruns until
* nothing is left
*/

function loopThroughObjects(j, p, obj) {
	_Object$keys(obj).forEach(function (prop) {
		if (prop.indexOf("inject") >= 0) {
			// TODO to insert the type of node, identifier or literal
			var propertyExpression = createIdentifierOrLiteral(j, obj[prop]);
			return p.properties.push(propertyExpression);
		}
		// eslint-disable-next-line no-irregular-whitespace
		if (_typeof(obj[prop]) !== "object" || obj[prop] instanceof RegExp) {
			p.properties.push(createObjectWithSuppliedProperty(j, prop, createIdentifierOrLiteral(j, obj[prop])));
		} else if (Array.isArray(obj[prop])) {
			var arrayProp = createArrayWithChildren(j, prop, obj[prop], true);
			p.properties.push(arrayProp);
		} else {
			var objectBlock = j.objectExpression([]);
			var propertyOfBlock = createObjectWithSuppliedProperty(j, prop, objectBlock);
			loopThroughObjects(j, objectBlock, obj[prop]);
			p.properties.push(propertyOfBlock);
		}
	});
}

/*
* @function createObjectWithSuppliedProperty
*
* Creates an object with an supplied property as parameter
* @param j — jscodeshift API
* @param { String } key - object name
* @param { Node } prop - property to be added
* @returns - { Node } - An property with the supplied property
*/

function createObjectWithSuppliedProperty(j, key, prop) {
	return j.property("init", j.identifier(key), prop);
}

/*
* @function createExternalRegExp
*
* Finds a regexp property with an already parsed AST from the user
* @param j — jscodeshift API
* @param { String } prop - property to find the value at
* @returns - { Node } - A literal node with the found regexp
*/

function createExternalRegExp(j, prop) {
	var regExpProp = prop.__paths[0].value.program.body[0].expression;
	return j.literal(regExpProp.value);
}

/*
* @function pushCreateProperty
*
* Creates a property and pushes the value to a node
* @param j — jscodeshift API
* @param { Node } p - Node to push against
* @param { String } key - key used as identifier
* @param { String } val - property value
* @returns - { Node } - Returns node the pushed property
*/

function pushCreateProperty(j, p, key, val) {
	var property = void 0;
	if (val.hasOwnProperty("type")) {
		property = val;
	} else {
		property = createIdentifierOrLiteral(j, val);
	}
	return p.value.properties.push(createObjectWithSuppliedProperty(j, key, property));
}

/*
* @function pushObjectKeys
*
* @param j — jscodeshift API
* @param { Node } p - path to push
* @param { Object } webpackProperties - The object to loop over
* @param { String } name - Key that will be the identifier we find and add values to
* @returns - { Node/Function } Returns a function that will push a node if
*subProperty is an array, else it will invoke a function that will push a single node
*/

function pushObjectKeys(j, p, webpackProperties, name) {
	p.value.properties.filter(function (n) {
		return safeTraverse(n, ["key", "name"]) === name;
	}).forEach(function (prop) {
		_Object$keys(webpackProperties).forEach(function (webpackProp) {
			if (webpackProp.indexOf("inject") >= 0) {
				return prop.value.properties.push(createIdentifierOrLiteral(j, webpackProperties[webpackProp]));
			} else if (Array.isArray(webpackProperties[webpackProp])) {
				var propArray = createArrayWithChildren(j, webpackProp, webpackProperties[webpackProp], true);
				return prop.value.properties.push(propArray);
			} else if (_typeof(webpackProperties[webpackProp]) !== "object" || webpackProperties[webpackProp].__paths || webpackProperties[webpackProp] instanceof RegExp) {
				return pushCreateProperty(j, prop, webpackProp, webpackProperties[webpackProp]);
			} else {
				pushCreateProperty(j, prop, webpackProp, j.objectExpression([]));
				return pushObjectKeys(j, prop, webpackProperties[webpackProp], webpackProp);
			}
		});
	});
}

/*
* @function isAssignment
*
* Checks if we are at the correct node and later invokes a callback
* for the transforms to either use their own transform function or
* use pushCreateProperty if the transform doesn't expect any properties
* @param j — jscodeshift API
* @param { Node } p - Node to push against
* @param { Function } cb - callback to be invoked
* @param { String } identifier - key to use as property
* @param { Object } property - WebpackOptions that later will be converted via
* pushCreateProperty via WebpackOptions[identifier]
* @returns - { Function } cb - Returns the callback and pushes a new node
*/

function isAssignment(j, p, cb, identifier, property) {
	if (p.parent.value.type === "AssignmentExpression") {
		if (j) {
			return cb(j, p, identifier, property);
		} else {
			return cb(p);
		}
	}
}

var utils = {
	safeTraverse: safeTraverse,
	createProperty: createProperty,
	findPluginsByName: findPluginsByName,
	findPluginsRootNodes: findPluginsRootNodes,
	createOrUpdatePluginByName: createOrUpdatePluginByName,
	findVariableToPlugin: findVariableToPlugin,
	isType: isType,
	createLiteral: createLiteral,
	createIdentifierOrLiteral: createIdentifierOrLiteral,
	findObjWithOneOfKeys: findObjWithOneOfKeys,
	getRequire: getRequire,
	checkIfExistsAndAddValue: checkIfExistsAndAddValue,
	createArrayWithChildren: createArrayWithChildren,
	createEmptyArrayProperty: createEmptyArrayProperty,
	createObjectWithSuppliedProperty: createObjectWithSuppliedProperty,
	createExternalRegExp: createExternalRegExp,
	pushCreateProperty: pushCreateProperty,
	pushObjectKeys: pushObjectKeys,
	isAssignment: isAssignment,
	loopThroughObjects: loopThroughObjects
};

"use strict";

/*
*
* Transform for entry. Finds the entry property from yeoman and creates a
* property based on what the user has given us.
*
* @param j — jscodeshift API
* @param ast - jscodeshift API
* @param { Object } webpackProperties - Object containing transformation rules
* @returns ast - jscodeshift API
*/

var entryTransform = function(j, ast, webpackProperties) {
	function createEntryProperty(p) {
		if (typeof webpackProperties === "string") {
			return utils.pushCreateProperty(j, p, "entry", webpackProperties);
		}
		if (Array.isArray(webpackProperties)) {
			const externalArray = utils.createArrayWithChildren(
				j,
				"entry",
				webpackProperties,
				true
			);
			return p.value.properties.push(externalArray);
		} else {
			utils.pushCreateProperty(j, p, "entry", j.objectExpression([]));
			return utils.pushObjectKeys(j, p, webpackProperties, "entry");
		}
	}
	if (webpackProperties) {
		return ast
			.find(j.ObjectExpression)
			.filter(p => utils.isAssignment(null, p, createEntryProperty));
	} else {
		return ast;
	}
};

"use strict";

/*
*
* Transform for output. Finds the output property from yeoman and creates a
* property based on what the user has given us.
*
* @param j — jscodeshift API
* @param ast - jscodeshift API
* @param { Object } webpackProperties - Object containing transformation rules
* @returns ast - jscodeshift API
*/
var outputTransform = function(j, ast, webpackProperties) {
	function createOutputProperties(p) {
		utils.pushCreateProperty(j, p, "output", j.objectExpression([]));
		return utils.pushObjectKeys(j, p, webpackProperties, "output");
	}
	if (webpackProperties) {
		return ast
			.find(j.ObjectExpression)
			.filter(p => utils.isAssignment(null, p, createOutputProperties));
	} else {
		return ast;
	}
};

"use strict";

/*
*
* Transform for context. Finds the context property from yeoman and creates a
* property based on what the user has given us.
*
* @param j — jscodeshift API
* @param ast - jscodeshift API
* @param { Object } webpackProperties - Object containing transformation rules
* @returns ast - jscodeshift API
*/

var contextTransform = function(j, ast, webpackProperties) {
	if (webpackProperties) {
		return ast
			.find(j.ObjectExpression)
			.filter(p =>
				utils.isAssignment(
					j,
					p,
					utils.pushCreateProperty,
					"context",
					webpackProperties
				)
			);
	} else {
		return ast;
	}
};

"use strict";

/*
*
* Transform for resolve. Finds the resolve property from yeoman and creates a
* property based on what the user has given us.
*
* @param j — jscodeshift API
* @param ast - jscodeshift API
* @param { Object } webpackProperties - Object containing transformation rules
* @returns ast - jscodeshift API
*/

var resolveTransform = function(j, ast, webpackProperties) {
	function createResolveProperties(p) {
		utils.pushCreateProperty(j, p, "resolve", j.objectExpression([]));
		return utils.pushObjectKeys(j, p, webpackProperties, "resolve");
	}
	if (webpackProperties) {
		return ast
			.find(j.ObjectExpression)
			.filter(p => utils.isAssignment(null, p, createResolveProperties));
	} else {
		return ast;
	}
};

"use strict";

/*
*
* Transform for devtool. Finds the devtool property from yeoman and creates a
* property based on what the user has given us.
*
* @param j — jscodeshift API
* @param ast - jscodeshift API
* @param { Object } webpackProperties - Object containing transformation rules
* @returns ast - jscodeshift API
*/

var devtoolTransform = function(j, ast, webpackProperties) {
	if (webpackProperties) {
		return ast
			.find(j.ObjectExpression)
			.filter(p =>
				utils.isAssignment(
					j,
					p,
					utils.pushCreateProperty,
					"devtool",
					webpackProperties
				)
			);
	} else {
		return ast;
	}
};

"use strict";

/*
*
* Transform for target. Finds the target property from yeoman and creates a
* property based on what the user has given us.
*
* @param j — jscodeshift API
* @param ast - jscodeshift API
* @param { Object } webpackProperties - Object containing transformation rules
* @returns ast - jscodeshift API
*/

var targetTransform = function(j, ast, webpackProperties) {
	if (webpackProperties && webpackProperties.length) {
		return ast
			.find(j.ObjectExpression)
			.filter(p =>
				utils.isAssignment(
					j,
					p,
					utils.pushCreateProperty,
					"target",
					webpackProperties
				)
			);
	} else {
		return ast;
	}
};

"use strict";

/*
*
* Transform for watch. Finds the watch property from yeoman and creates a
* property based on what the user has given us.
*
* @param j — jscodeshift API
* @param ast - jscodeshift API
* @param { Object } webpackProperties - Object containing transformation rules
* @returns ast - jscodeshift API
*/

var watchTransform = function(j, ast, webpackProperties) {
	if (typeof webpackProperties === "boolean") {
		return ast
			.find(j.ObjectExpression)
			.filter(p =>
				utils.isAssignment(
					j,
					p,
					utils.pushCreateProperty,
					"watch",
					webpackProperties
				)
			);
	} else {
		return ast;
	}
};

"use strict";

/*
*
* Transform for watchOptions. Finds the watchOptions property from yeoman and creates a
* property based on what the user has given us.
*
* @param j — jscodeshift API
* @param ast - jscodeshift API
* @param { Object } webpackProperties - Object containing transformation rules
* @returns ast - jscodeshift API
*/

var watchOptionsTransform = function(j, ast, webpackProperties) {
	function createWatchOptionsProperty(p) {
		utils.pushCreateProperty(j, p, "watchOptions", j.objectExpression([]));
		return utils.pushObjectKeys(j, p, webpackProperties, "watchOptions");
	}
	if (webpackProperties) {
		return ast
			.find(j.ObjectExpression)
			.filter(p => utils.isAssignment(null, p, createWatchOptionsProperty));
	} else {
		return ast;
	}
};

"use strict";

/*
*
* Transform for externals. Finds the externals property from yeoman and creates a
* property based on what the user has given us.
*
* @param j — jscodeshift API
* @param ast - jscodeshift API
* @param { Object } webpackProperties - Object containing transformation rules
* @returns ast - jscodeshift API
*/

var externalsTransform = function(j, ast, webpackProperties) {
	function createExternalProperty(p) {
		if (
			webpackProperties instanceof RegExp ||
			typeof webpackProperties === "string"
		) {
			return utils.pushCreateProperty(j, p, "externals", webpackProperties);
		}
		if (Array.isArray(webpackProperties)) {
			const externalArray = utils.createArrayWithChildren(
				j,
				"externals",
				webpackProperties,
				true
			);
			return p.value.properties.push(externalArray);
		} else {
			utils.pushCreateProperty(j, p, "externals", j.objectExpression([]));
			return utils.pushObjectKeys(j, p, webpackProperties, "externals");
		}
	}
	if (webpackProperties) {
		return ast
			.find(j.ObjectExpression)
			.filter(
				p =>
					utils.safeTraverse(p, [
						"parent",
						"value",
						"left",
						"property",
						"name"
					]) === "exports"
			)
			.forEach(createExternalProperty);
	} else {
		return ast;
	}
};

"use strict";

/*
*
* Transform for node. Finds the node property from yeoman and creates a
* property based on what the user has given us.
*
* @param j — jscodeshift API
* @param ast - jscodeshift API
* @param { Object } webpackProperties - Object containing transformation rules
* @returns ast - jscodeshift API
*/

var nodeTransform = function(j, ast, webpackProperties) {
	function createNodeProperty(p) {
		utils.pushCreateProperty(j, p, "node", j.objectExpression([]));
		return utils.pushObjectKeys(j, p, webpackProperties, "node");
	}
	if (webpackProperties) {
		return ast
			.find(j.ObjectExpression)
			.filter(p => utils.isAssignment(null, p, createNodeProperty));
	} else {
		return ast;
	}
};

"use strict";

/*
*
* Transform for performance. Finds the performance property from yeoman and creates a
* property based on what the user has given us.
*
* @param j — jscodeshift API
* @param ast - jscodeshift API
* @param { Object } webpackProperties - Object containing transformation rules
* @returns ast - jscodeshift API
*/

var performanceTransform = function(j, ast, webpackProperties) {
	function createPerformanceProperty(p) {
		utils.pushCreateProperty(j, p, "performance", j.objectExpression([]));
		return utils.pushObjectKeys(j, p, webpackProperties, "performance");
	}
	if (webpackProperties && typeof webpackProperties === "object") {
		return ast
			.find(j.ObjectExpression)
			.filter(p => utils.isAssignment(null, p, createPerformanceProperty));
	} else {
		return ast;
	}
};

"use strict";

/*
*
* Transform for stats. Finds the stats property from yeoman and creates a
* property based on what the user has given us.
*
* @param j — jscodeshift API
* @param ast - jscodeshift API
* @param { Object } webpackProperties - Object containing transformation rules
* @returns ast - jscodeshift API
*/

var statsTransform = function(j, ast, webpackProperties) {
	function createStatsProperty(p) {
		utils.pushCreateProperty(j, p, "stats", j.objectExpression([]));
		return utils.pushObjectKeys(j, p, webpackProperties, "stats");
	}
	if (webpackProperties && typeof webpackProperties === "object") {
		return ast
			.find(j.ObjectExpression)
			.filter(p => utils.isAssignment(null, p, createStatsProperty));
	} else if (webpackProperties && webpackProperties.length) {
		return ast
			.find(j.ObjectExpression)
			.filter(p =>
				utils.isAssignment(
					j,
					p,
					utils.pushCreateProperty,
					"stats",
					webpackProperties
				)
			);
	} else {
		return ast;
	}
};

"use strict";

/*
*
* Transform for amd. Finds the amd property from yeoman and creates a
* property based on what the user has given us.
*
* @param j — jscodeshift API
* @param ast - jscodeshift API
* @param { Object } webpackProperties - Object containing transformation rules
* @returns ast - jscodeshift API
*/

var amdTransform = function(j, ast, webpackProperties) {
	function createAMDProperty(p) {
		utils.pushCreateProperty(j, p, "amd", j.objectExpression([]));
		return utils.pushObjectKeys(j, p, webpackProperties, "amd");
	}
	if (webpackProperties && typeof webpackProperties === "object") {
		return ast
			.find(j.ObjectExpression)
			.filter(p => utils.isAssignment(null, p, createAMDProperty));
	} else {
		return ast;
	}
};

"use strict";

/*
*
* Transform for bail. Finds the bail property from yeoman and creates a
* property based on what the user has given us.
*
* @param j — jscodeshift API
* @param ast - jscodeshift API
* @param { Object } webpackProperties - Object containing transformation rules
* @returns ast - jscodeshift API
*/

var bailTransform = function(j, ast, webpackProperties) {
	if (webpackProperties) {
		return ast
			.find(j.ObjectExpression)
			.filter(p =>
				utils.isAssignment(
					j,
					p,
					utils.pushCreateProperty,
					"bail",
					webpackProperties
				)
			);
	} else {
		return ast;
	}
};

"use strict";

/*
*
* Transform for cache. Finds the cache property from yeoman and creates a
* property based on what the user has given us.
*
* @param j — jscodeshift API
* @param ast - jscodeshift API
* @param { Object } webpackProperties - Object containing transformation rules
* @returns ast - jscodeshift API
*/

var cacheTransform = function(j, ast, webpackProperties) {
	if (webpackProperties) {
		return ast
			.find(j.ObjectExpression)
			.filter(p =>
				utils.isAssignment(
					j,
					p,
					utils.pushCreateProperty,
					"cache",
					webpackProperties
				)
			);
	} else {
		return ast;
	}
};

"use strict";

/*
*
* Transform for profile. Finds the profile property from yeoman and creates a
* property based on what the user has given us.
*
* @param j — jscodeshift API
* @param ast - jscodeshift API
* @param { Object } webpackProperties - Object containing transformation rules
* @returns ast - jscodeshift API
*/

var profileTransform = function(j, ast, webpackProperties) {
	if (webpackProperties) {
		return ast
			.find(j.ObjectExpression)
			.filter(p =>
				utils.isAssignment(
					j,
					p,
					utils.pushCreateProperty,
					"profile",
					webpackProperties
				)
			);
	} else {
		return ast;
	}
};

"use strict";

/*
*
* Transform for merge. Finds the merge property from yeoman and creates a way
* for users to allow webpack-merge in their scaffold
*
* @param j — jscodeshift API
* @param ast - jscodeshift API
* @param { Object } webpackProperties - Object containing transformation rules
* @returns ast - jscodeshift API
*/

var mergeTransform = function(j, ast, webpackProperties) {
	function createMergeProperty(p) {
		// FIXME Use j.callExp()
		let exportsDecl = p.value.body.map(n => {
			if (n.expression) {
				return n.expression.right;
			}
		});
		const bodyLength = exportsDecl.length;
		let newVal = {};
		newVal.type = "ExpressionStatement";
		newVal.expression = {
			type: "AssignmentExpression",
			operator: "=",
			left: {
				type: "MemberExpression",
				computed: false,
				object: j.identifier("module"),
				property: j.identifier("exports")
			},
			right: j.callExpression(j.identifier("merge"), [
				j.identifier(webpackProperties),
				exportsDecl.pop()
			])
		};
		p.value.body[bodyLength - 1] = newVal;
	}
	if (webpackProperties) {
		return ast.find(j.Program).filter(p => createMergeProperty(p));
	} else {
		return ast;
	}
};

"use strict";

/*
*
* Transform for module. Finds the module property from yeoman and creates a
* property based on what the user has given us.
*
* @param j — jscodeshift API
* @param ast - jscodeshift API
* @param { Object } webpackProperties - Object containing transformation rules
* @returns ast - jscodeshift API
*/

var moduleTransform = function(j, ast, webpackProperties) {
	function createModuleProperties(p) {
		utils.pushCreateProperty(j, p, "module", j.objectExpression([]));
		return utils.safeTraverse(p, ["key", "name"] === "module");
	}
	function createRules(p) {
		return utils.pushObjectKeys(j, p, webpackProperties, "module");
	}
	if (!webpackProperties) {
		return ast;
	} else {
		return ast
			.find(j.ObjectExpression)
			.filter(p => utils.isAssignment(null, p, createModuleProperties))
			.forEach(p => createRules(p));
	}
};

"use strict";

/*
*
* Transform for plugins. Finds the plugins property from yeoman and creates a
* property based on what the user has given us.
*
* @param j — jscodeshift API
* @param ast - jscodeshift API
* @param { Object } webpackProperties - Object containing transformation rules
* @returns ast - jscodeshift API
*/

var pluginsTransform = function(j, ast, webpackProperties) {
	function createPluginsProperty(p) {
		const pluginArray = utils.createArrayWithChildren(
			j,
			"plugins",
			webpackProperties,
			true
		);
		return p.value.properties.push(pluginArray);
	}
	if (webpackProperties && Array.isArray(webpackProperties)) {
		return ast
			.find(j.ObjectExpression)
			.filter(p => utils.isAssignment(null, p, createPluginsProperty));
	} else {
		return ast;
	}
};

/*
*
* Get an property named topScope from yeoman and inject it to the top scope of
* the config, outside module.exports
*
* @param j — jscodeshift API
* @param ast - jscodeshift API
* @param { Object } webpackProperties - Object containing topscope properties
* @returns ast - jscodeshift API
*/

var topScopeTransform = function(j, ast, webpackProperties) {
	function createTopScopeProperty(p) {
		webpackProperties.forEach(n => {
			p.value.body.splice(-1, 0, n);
		});
	}
	if (webpackProperties) {
		return ast.find(j.Program).filter(p => createTopScopeProperty(p));
	}
};

"use strict";

/*
*
* Transform for devServer. Finds the devServer property from yeoman and creates a
* property based on what the user has given us.
*
* @param j — jscodeshift API
* @param ast - jscodeshift API
* @param { Object } webpackProperties - Object containing transformation rules
* @returns ast - jscodeshift API
*/

var devServerTransform = function(j, ast, webpackProperties) {
	function createDevServerProperty(p) {
		utils.pushCreateProperty(j, p, "devServer", j.objectExpression([]));
		return utils.pushObjectKeys(j, p, webpackProperties, "devServer");
	}
	if (webpackProperties && typeof webpackProperties === "object") {
		return ast
			.find(j.ObjectExpression)
			.filter(p => utils.isAssignment(null, p, createDevServerProperty));
	} else if (webpackProperties && webpackProperties.length) {
		return ast
			.find(j.ObjectExpression)
			.filter(p =>
				utils.isAssignment(
					j,
					p,
					utils.pushCreateProperty,
					"devServer",
					webpackProperties
				)
			);
	} else {
		return ast;
	}
};

"use strict";

const path$4 = require("path");
const j = require("jscodeshift");
const chalk$3 = require("chalk");
const pEachSeries = require("p-each-series");

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

function runTransform(webpackProperties) {
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

				const outputPath = path$4.join(process.cwd(), configurationName);
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
			chalk$3.green(
				"Congratulations! Your new webpack configuration file has been created!\n"
			)
	);
}

"use strict";

/*
* @function create
*
* Runs yeoman and runs the transformations based on the object
* built up from an author/user
*
* @param { String } options - An path to the given generator
* @returns { Function } runTransform - Run transformations based on yeoman prompt
*/

function create(options) {
	let env = yeoman.createEnv("webpack", null, new WebpackAdapter());
	const generatorName = options
		? replaceGeneratorName(path$1.basename(options[0]))
		: "webpack-default-generator";
	if (options) {
		const WebpackGenerator$$1 = class extends Generator {
			initializing() {
				options.forEach(path => {
					return this.composeWith(require.resolve(path));
				});
			}
		};
		env.registerStub(WebpackGenerator$$1, generatorName);
	} else {
		env.registerStub(WebpackGenerator, "webpack-default-generator");
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

function replaceGeneratorName(name) {
	return name.replace(/(webpack-addons)?([^:]+)(:.*)?/g, "generator$2");
}

"use strict";

var path$2 = require("path");
var chalk$1 = require("chalk");
var globalPath = require("global-modules");

/*
* @function processPromise
*
* Attaches a promise to the installation of the package
*
* @param { Function } child - The function to attach a promise to
* @returns { <Promise> } promise - Returns a promise to the installation
*/

function processPromise(child) {
	return new _Promise(function (resolve, reject) {
		//eslint-disable-line
		if (child.status !== 0) {
			reject();
		} else {
			resolve();
		}
	});
}

/*
* @function resolvePackages
*
* Resolves and installs the packages, later sending them to @creator
*
* @param { Array <String> } pkg - The dependencies to be installed
* @returns { <Function|Error> } create - Builds
* a webpack configuration through yeoman or throws an error
*/

function resolvePackages(pkg) {
	Error.stackTraceLimit = 30;

	var packageLocations = [];

	pkg.forEach(function (addon) {
		processPromise(spawnChild(addon)).then(function () {
			try {
				packageLocations.push(path$2.resolve(globalPath, addon));
			} catch (err) {
				console.log("Package wasn't validated correctly..");
				console.log("Submit an issue for", pkg, "if this persists");
				console.log("\nReason: \n");
				console.error(chalk$1.bold.red(err));
				process.exitCode = 1;
			}
		}).catch(function (err) {
			console.log("Package Coudln't be installed, aborting..");
			console.log("\nReason: \n");
			console.error(chalk$1.bold.red(err));
			process.exitCode = 1;
		}).then(function () {
			if (packageLocations.length === pkg.length) return create(packageLocations);
		});
	});
}

var resolvePackages$1 = Object.freeze({
	default: resolvePackages
});

var npmExists$2 = ( npmExists$1 && npmExists ) || npmExists$1;

var resolvePackages$2 = ( resolvePackages$1 && resolvePackages ) || resolvePackages$1;

"use strict";




/*
* @function npmPackagesExists
*
* Loops through an array and checks if a package is registered
* on npm and throws an error if it is not.
*
* @param { Array <String> } pkg - Array of packages to check existence of
* @returns { Array } resolvePackages - Returns an process to install the packages
*/

var npmPackagesExists = function npmPackagesExists(pkg) {
	var acceptedPackages = [];
	pkg.forEach(function (addon) {
		npmExists$2(addon).then(function (moduleExists) {
			if (!moduleExists) {
				Error.stackTraceLimit = 0;
				throw new TypeError("Package isn't registered on npm.");
			}
			if (moduleExists) {
				acceptedPackages.push(addon);
			}
		}).catch(function (err) {
			console.error(err.stack || err);
			process.exit(0);
		}).then(function () {
			if (acceptedPackages.length === pkg.length) return resolvePackages$2(acceptedPackages);
		});
	});
};

"use strict";

/*
* @function initializeInquirer
*
* First function to be called after running the init flag. This is a check,
* if we are running the init command with no arguments or if we got dependencies
*
* @param { Object } pkg - packages included when running the init command
* @returns { <Function> } create|npmPackagesExists - returns an installation of the package,
* followed up with a yeoman instance of that if there's packages. If not, it creates a defaultGenerator
*/

function initializeInquirer(pkg) {
	if (pkg.length === 0) {
		return create();
	}
	return npmPackagesExists(pkg);
}

var initialize = Object.freeze({
	default: initializeInquirer
});

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Gajus Kuizinas @gajus
*/
"use strict";

/* eslint-disable */

var Ajv = require("ajv");
var ajv = new Ajv({
	errorDataPath: "configuration",
	allErrors: true,
	verbose: true
});
require("ajv-keywords")(ajv, ["instanceof"]);
/* eslint-enable */

function validateSchema(schema, options) {
	if (Array.isArray(options)) {
		var errors = options.map(function (options) {
			return validateObject(schema, options);
		});
		errors.forEach(function (list, idx) {
			list.forEach(function applyPrefix(err) {
				err.dataPath = "[" + idx + "]" + err.dataPath;
				if (err.children) {
					err.children.forEach(applyPrefix);
				}
			});
		});
		return errors.reduce(function (arr, items) {
			return arr.concat(items);
		}, []);
	} else {
		return validateObject(schema, options);
	}
}

function validateObject(schema, options) {
	var validate = ajv.compile(schema);
	var valid = validate(options);
	return valid ? [] : filterErrors(validate.errors);
}

function filterErrors(errors) {
	var newErrors = [];
	errors.forEach(function (err) {
		var dataPath = err.dataPath;
		var children = [];
		newErrors = newErrors.filter(function (oldError) {
			if (oldError.dataPath.includes(dataPath)) {
				if (oldError.children) {
					children = children.concat(oldError.children.slice(0));
				}
				oldError.children = undefined;
				children.push(oldError);
				return false;
			}
			return true;
		});
		if (children.length) {
			err.children = children;
		}
		newErrors.push(err);
	});

	return newErrors;
}

var additionalProperties = false;
var definitions = { "common.arrayOfStringOrStringArrayValues": { "items": { "anyOf": [{ "minLength": 1, "type": "string" }, { "items": { "minLength": 1, "type": "string" }, "type": "array" }] }, "type": "array" }, "common.arrayOfStringValues": { "items": { "minLength": 1, "type": "string" }, "type": "array" }, "common.nonEmptyArrayOfUniqueStringValues": { "items": { "minLength": 1, "type": "string" }, "minItems": 1, "type": "array", "uniqueItems": true }, "entry": { "description": "The entry point(s) of the compilation.", "oneOf": [{ "minProperties": 1, "additionalProperties": { "oneOf": [{ "description": "The string is resolved to a module which is loaded upon startup.", "minLength": 1, "type": "string" }, { "description": "All modules are loaded upon startup. The last one is exported.", "$ref": "#/definitions/common.nonEmptyArrayOfUniqueStringValues" }] }, "description": "Multiple entry bundles are created. The key is the chunk name. The value can be a string or an array.", "type": "object" }, { "description": "The string is resolved to a module which is loaded upon startup.", "minLength": 1, "type": "string" }, { "allOf": [{ "$ref": "#/definitions/common.nonEmptyArrayOfUniqueStringValues" }], "description": "All modules are loaded upon startup. The last one is exported." }, { "description": "function returning an entry object or a promise.", "instanceof": "Function" }] }, "externals": { "anyOf": [{ "description": "An exact matched dependency becomes external. The same string is used as external dependency.", "type": "string" }, { "additionalProperties": { "anyOf": [{ "type": "string" }, { "type": "object" }, { "type": "boolean" }] }, "description": "If an dependency matches exactly a property of the object, the property value is used as dependency.", "type": "object" }, { "description": "`function(context, request, callback(err, result))` The function is called on each dependency.", "instanceof": "Function" }, { "description": "Every matched dependency becomes external.", "instanceof": "RegExp" }, { "items": { "$ref": "#/definitions/externals" }, "type": "array" }], "description": "Specify dependencies that shouldn't be resolved by webpack, but should become dependencies of the resulting bundle. The kind of the dependency depends on `output.libraryTarget`." }, "module": { "additionalProperties": false, "description": "Options affecting the normal modules (`NormalModuleFactory`).", "properties": { "exprContextCritical": { "type": "boolean" }, "exprContextRecursive": { "type": "boolean" }, "exprContextRegExp": { "anyOf": [{ "type": "boolean" }, { "instanceof": "RegExp" }] }, "exprContextRequest": { "type": "string" }, "loaders": { "allOf": [{ "$ref": "#/definitions/ruleSet-rules" }], "description": "An array of automatically applied loaders." }, "noParse": { "description": "Don't parse files matching. It's matched against the full resolved request.", "anyOf": [{ "items": { "instanceof": "RegExp" }, "minItems": 1, "type": "array" }, { "instanceof": "RegExp" }] }, "rules": { "allOf": [{ "$ref": "#/definitions/ruleSet-rules" }], "description": "An array of rules applied for modules." }, "unknownContextCritical": { "type": "boolean" }, "unknownContextRecursive": { "type": "boolean" }, "unknownContextRegExp": { "anyOf": [{ "type": "boolean" }, { "instanceof": "RegExp" }] }, "unknownContextRequest": { "type": "string" }, "unsafeCache": { "anyOf": [{ "type": "boolean" }, { "instanceof": "Function" }] }, "wrappedContextCritical": { "type": "boolean" }, "wrappedContextRecursive": { "type": "boolean" }, "wrappedContextRegExp": { "instanceof": "RegExp" } }, "type": "object" }, "output": { "additionalProperties": false, "description": "Options affecting the output of the compilation. `output` options tell webpack how to write the compiled files to disk.", "properties": { "auxiliaryComment": { "description": "Add a comment in the UMD wrapper.", "anyOf": [{ "description": "Append the same comment above each import style.", "type": "string" }, { "additionalProperties": false, "description": "Set explicit comments for `commonjs`, `commonjs2`, `amd`, and `root`.", "properties": { "amd": { "type": "string" }, "commonjs": { "type": "string" }, "commonjs2": { "type": "string" }, "root": { "type": "string" } }, "type": "object" }] }, "chunkFilename": { "description": "The filename of non-entry chunks as relative path inside the `output.path` directory.", "type": "string" }, "crossOriginLoading": { "description": "This option enables cross-origin loading of chunks.", "enum": [false, "anonymous", "use-credentials"] }, "devtoolFallbackModuleFilenameTemplate": { "description": "Similar to `output.devtoolModuleFilenameTemplate`, but used in the case of duplicate module identifiers.", "anyOf": [{ "type": "string" }, { "instanceof": "Function" }] }, "devtoolLineToLine": { "description": "Enable line to line mapped mode for all/specified modules. Line to line mapped mode uses a simple SourceMap where each line of the generated source is mapped to the same line of the original source. It’s a performance optimization. Only use it if your performance need to be better and you are sure that input lines match which generated lines.", "anyOf": [{ "description": "`true` enables it for all modules (not recommended)", "type": "boolean" }, { "description": "An object similar to `module.loaders` enables it for specific files.", "properties": { "exclude": { "type": "string" }, "include": { "type": "string" }, "test": { "type": "string" } }, "type": "object" }] }, "devtoolModuleFilenameTemplate": { "description": "Filename template string of function for the sources array in a generated SourceMap.", "anyOf": [{ "type": "string" }, { "instanceof": "Function" }] }, "filename": { "description": "Specifies the name of each output file on disk. You must **not** specify an absolute path here! The `output.path` option determines the location on disk the files are written to, filename is used solely for naming the individual files.", "type": "string" }, "hashDigest": { "minLength": 1, "type": "string" }, "hashDigestLength": { "minimum": 1, "type": "number" }, "hashFunction": { "minLength": 1, "type": "string" }, "hotUpdateChunkFilename": { "description": "The filename of the Hot Update Chunks. They are inside the output.path directory.", "type": "string" }, "hotUpdateFunction": { "description": "The JSONP function used by webpack for async loading of hot update chunks.", "type": "string" }, "hotUpdateMainFilename": { "description": "The filename of the Hot Update Main File. It is inside the `output.path` directory.", "type": "string" }, "jsonpFunction": { "description": "The JSONP function used by webpack for async loading of chunks.", "type": "string" }, "library": { "anyOf": [{ "type": "string" }, { "items": { "type": "string" }, "type": "array" }], "description": "If set, export the bundle as library. `output.library` is the name." }, "libraryTarget": { "enum": ["var", "assign", "this", "window", "global", "commonjs", "commonjs2", "commonjs-module", "amd", "umd", "umd2", "jsonp"] }, "path": { "description": "The output directory as **absolute path** (required).", "type": "string" }, "pathinfo": { "description": "Include comments with information about the modules.", "type": "boolean" }, "publicPath": { "description": "The `publicPath` specifies the public URL address of the output files when referenced in a browser.", "type": "string" }, "sourceMapFilename": { "description": "The filename of the SourceMaps for the JavaScript files. They are inside the `output.path` directory.", "type": "string" }, "sourcePrefix": { "description": "Prefixes every line of the source in the bundle with this string.", "type": "string" }, "strictModuleExceptionHandling": { "description": "Handles exceptions in module loading correctly at a performance cost.", "type": "boolean" }, "umdNamedDefine": { "description": "If `output.libraryTarget` is set to umd and `output.library` is set, setting this to true will name the AMD module.", "type": "boolean" } }, "type": "object" }, "resolve": { "additionalProperties": false, "properties": { "alias": { "anyOf": [{ "additionalProperties": { "type": "string" }, "type": "object" }, { "items": { "additionalProperties": false, "properties": { "alias": { "type": "string" }, "name": { "type": "string" }, "onlyModule": { "type": "boolean" } }, "type": "object" }, "type": "array" }] }, "aliasFields": { "$ref": "#/definitions/common.arrayOfStringOrStringArrayValues" }, "cachePredicate": { "instanceof": "Function" }, "descriptionFiles": { "$ref": "#/definitions/common.arrayOfStringValues" }, "enforceExtension": { "type": "boolean" }, "enforceModuleExtension": { "type": "boolean" }, "extensions": { "$ref": "#/definitions/common.arrayOfStringValues" }, "fileSystem": {}, "mainFields": { "$ref": "#/definitions/common.arrayOfStringOrStringArrayValues" }, "mainFiles": { "$ref": "#/definitions/common.arrayOfStringValues" }, "moduleExtensions": { "$ref": "#/definitions/common.arrayOfStringValues" }, "modules": { "$ref": "#/definitions/common.arrayOfStringValues" }, "plugins": { "type": "array" }, "resolver": {}, "symlinks": { "type": "boolean" }, "unsafeCache": { "anyOf": [{ "type": "boolean" }, { "additionalProperties": true, "type": "object" }] }, "useSyncFileSystemCalls": { "type": "boolean" } }, "type": "object" }, "ruleSet-condition": { "anyOf": [{ "instanceof": "RegExp" }, { "minLength": 1, "type": "string" }, { "instanceof": "Function" }, { "$ref": "#/definitions/ruleSet-conditions" }, { "additionalProperties": false, "properties": { "and": { "$ref": "#/definitions/ruleSet-conditions" }, "exclude": { "$ref": "#/definitions/ruleSet-condition" }, "include": { "$ref": "#/definitions/ruleSet-condition" }, "not": { "$ref": "#/definitions/ruleSet-conditions" }, "or": { "$ref": "#/definitions/ruleSet-conditions" }, "test": { "$ref": "#/definitions/ruleSet-condition" } }, "type": "object" }] }, "ruleSet-conditions": { "items": { "$ref": "#/definitions/ruleSet-condition" }, "type": "array" }, "ruleSet-loader": { "minLength": 1, "type": "string" }, "ruleSet-query": { "anyOf": [{ "type": "object" }, { "type": "string" }] }, "ruleSet-rule": { "additionalProperties": false, "properties": { "enforce": { "enum": ["pre", "post"] }, "exclude": { "$ref": "#/definitions/ruleSet-condition" }, "include": { "$ref": "#/definitions/ruleSet-condition" }, "issuer": { "$ref": "#/definitions/ruleSet-condition" }, "loader": { "anyOf": [{ "$ref": "#/definitions/ruleSet-loader" }, { "$ref": "#/definitions/ruleSet-use" }] }, "loaders": { "$ref": "#/definitions/ruleSet-use" }, "oneOf": { "$ref": "#/definitions/ruleSet-rules" }, "options": { "$ref": "#/definitions/ruleSet-query" }, "parser": { "additionalProperties": true, "type": "object" }, "query": { "$ref": "#/definitions/ruleSet-query" }, "resource": { "$ref": "#/definitions/ruleSet-condition" }, "resourceQuery": { "$ref": "#/definitions/ruleSet-condition" }, "rules": { "$ref": "#/definitions/ruleSet-rules" }, "test": { "$ref": "#/definitions/ruleSet-condition" }, "use": { "$ref": "#/definitions/ruleSet-use" } }, "type": "object" }, "ruleSet-rules": { "items": { "$ref": "#/definitions/ruleSet-rule" }, "type": "array" }, "ruleSet-use": { "anyOf": [{ "$ref": "#/definitions/ruleSet-use-item" }, { "instanceof": "Function" }, { "items": { "$ref": "#/definitions/ruleSet-use-item" }, "type": "array" }] }, "ruleSet-use-item": { "anyOf": [{ "$ref": "#/definitions/ruleSet-loader" }, { "instanceof": "Function" }, { "additionalProperties": false, "properties": { "loader": { "$ref": "#/definitions/ruleSet-loader" }, "options": { "$ref": "#/definitions/ruleSet-query" }, "query": { "$ref": "#/definitions/ruleSet-query" } }, "type": "object" }] } };
var properties = { "amd": { "description": "Set the value of `require.amd` and `define.amd`." }, "bail": { "description": "Report the first error as a hard error instead of tolerating it.", "type": "boolean" }, "cache": { "description": "Cache generated modules and chunks to improve performance for multiple incremental builds.", "anyOf": [{ "description": "You can pass `false` to disable it.", "type": "boolean" }, { "description": "You can pass an object to enable it and let webpack use the passed object as cache. This way you can share the cache object between multiple compiler calls.", "type": "object" }] }, "context": { "description": "The base directory (absolute path!) for resolving the `entry` option. If `output.pathinfo` is set, the included pathinfo is shortened to this directory.", "type": "string" }, "dependencies": { "description": "References to other configurations to depend on.", "items": { "type": "string" }, "type": "array" }, "devServer": { "type": "object" }, "devtool": { "description": "A developer tool to enhance debugging.", "anyOf": [{ "type": "string" }, { "enum": [false] }] }, "entry": { "$ref": "#/definitions/entry" }, "externals": { "$ref": "#/definitions/externals" }, "loader": { "description": "Custom values available in the loader context.", "type": "object" }, "module": { "$ref": "#/definitions/module" }, "name": { "description": "Name of the configuration. Used when loading multiple configurations.", "type": "string" }, "node": { "description": "Include polyfills or mocks for various node stuff.", "additionalProperties": { "enum": [false, true, "mock", "empty"] }, "properties": { "Buffer": { "enum": [false, true, "mock"] }, "__dirname": { "enum": [false, true, "mock"] }, "__filename": { "enum": [false, true, "mock"] }, "console": { "enum": [false, true, "mock"] }, "global": { "type": "boolean" }, "process": { "enum": [false, true, "mock"] } }, "type": "object" }, "output": { "$ref": "#/definitions/output" }, "performance": { "description": "Configuration for web performance recommendations.", "anyOf": [{ "enum": [false] }, { "additionalProperties": false, "properties": { "assetFilter": { "description": "Filter function to select assets that are checked", "instanceof": "Function" }, "hints": { "description": "Sets the format of the hints: warnings, errors or nothing at all", "enum": [false, "warning", "error"] }, "maxEntrypointSize": { "description": "Total size of an entry point (in bytes)", "type": "number" }, "maxAssetSize": { "description": "Filesize limit (in bytes) when exceeded, that webpack will provide performance hints", "type": "number" } }, "type": "object" }] }, "plugins": { "description": "Add additional plugins to the compiler.", "type": "array" }, "profile": { "description": "Capture timing information for each module.", "type": "boolean" }, "recordsInputPath": { "description": "Store compiler state to a json file.", "type": "string" }, "recordsOutputPath": { "description": "Load compiler state from a json file.", "type": "string" }, "recordsPath": { "description": "Store/Load compiler state from/to a json file. This will result in persistent ids of modules and chunks. An absolute path is expected. `recordsPath` is used for `recordsInputPath` and `recordsOutputPath` if they left undefined.", "type": "string" }, "resolve": { "$ref": "#/definitions/resolve" }, "resolveLoader": { "$ref": "#/definitions/resolve" }, "stats": { "description": "Used by the webpack CLI program to pass stats options.", "anyOf": [{ "type": "object" }, { "type": "boolean" }, { "enum": ["none", "errors-only", "minimal", "normal", "verbose"] }] }, "target": { "anyOf": [{ "enum": ["web", "webworker", "node", "async-node", "node-webkit", "atom", "electron", "electron-main", "electron-renderer"] }, { "instanceof": "Function" }] }, "watch": { "description": "Enter watch mode, which rebuilds on file change.", "type": "boolean" }, "watchOptions": { "properties": { "aggregateTimeout": { "description": "Delay the rebuilt after the first change. Value is a time in ms.", "type": "number" }, "poll": { "anyOf": [{ "description": "`true`: use polling.", "type": "boolean" }, { "description": "`number`: use polling with specified interval.", "type": "number" }] } }, "type": "object" } };
var required = ["entry"];
var type = "object";
var webpackOptionsSchema = {
  additionalProperties: additionalProperties,
  definitions: definitions,
  properties: properties,
  required: required,
  type: type
};

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Gajus Kuizinas @gajus
*/
"use strict";

var getSchemaPart = function getSchemaPart(path, parents, additionalPath) {
	parents = parents || 0;
	path = path.split("/");
	path = path.slice(0, path.length - parents);
	if (additionalPath) {
		additionalPath = additionalPath.split("/");
		path = path.concat(additionalPath);
	}
	var schemaPart = webpackOptionsSchema;
	for (var i = 1; i < path.length; i++) {
		var inner = schemaPart[path[i]];
		if (inner) schemaPart = inner;
	}
	return schemaPart;
};

var getSchemaPartText = function getSchemaPartText(schemaPart, additionalPath) {
	if (additionalPath) {
		for (var i = 0; i < additionalPath.length; i++) {
			var inner = schemaPart[additionalPath[i]];
			if (inner) schemaPart = inner;
		}
	}
	while (schemaPart.$ref) {
		schemaPart = getSchemaPart(schemaPart.$ref);
	}var schemaText = WebpackOptionsValidationError.formatSchema(schemaPart);
	if (schemaPart.description) schemaText += "\n" + schemaPart.description;
	return schemaText;
};

var indent = function indent(str, prefix, firstLine) {
	if (firstLine) {
		return prefix + str.replace(/\n(?!$)/g, "\n" + prefix);
	} else {
		return str.replace(/\n(?!$)/g, "\n" + prefix);
	}
};

var WebpackOptionsValidationError = function (_Error) {
	_inherits(WebpackOptionsValidationError, _Error);

	function WebpackOptionsValidationError(validationErrors) {
		_classCallCheck(this, WebpackOptionsValidationError);

		var _this = _possibleConstructorReturn(this, (WebpackOptionsValidationError.__proto__ || _Object$getPrototypeOf(WebpackOptionsValidationError)).call(this));

		if (Error.hasOwnProperty("captureStackTrace")) {
			Error.captureStackTrace(_this, _this.constructor);
		}
		_this.name = "WebpackOptionsValidationError";

		_this.message = "Invalid configuration object. " + "Webpack has been initialised using a configuration object that does not match the API schema.\n" + validationErrors.map(function (err) {
			return " - " + indent(WebpackOptionsValidationError.formatValidationError(err), "   ", false);
		}).join("\n");
		_this.validationErrors = validationErrors;
		return _this;
	}

	_createClass(WebpackOptionsValidationError, null, [{
		key: "formatSchema",
		value: function formatSchema(schema, prevSchemas) {
			prevSchemas = prevSchemas || [];

			var formatInnerSchema = function formatInnerSchema(innerSchema, addSelf) {
				if (!addSelf) return WebpackOptionsValidationError.formatSchema(innerSchema, prevSchemas);
				if (prevSchemas.indexOf(innerSchema) >= 0) return "(recursive)";
				return WebpackOptionsValidationError.formatSchema(innerSchema, prevSchemas.concat(schema));
			};

			if (schema.type === "string") {
				if (schema.minLength === 1) return "non-empty string";else if (schema.minLength > 1) return "string (min length " + schema.minLength + ")";
				return "string";
			} else if (schema.type === "boolean") {
				return "boolean";
			} else if (schema.type === "number") {
				return "number";
			} else if (schema.type === "object") {
				if (schema.properties) {
					var required$$1 = schema.required || [];
					return "object { " + _Object$keys(schema.properties).map(function (property) {
						if (required$$1.indexOf(property) < 0) return property + "?";
						return property;
					}).concat(schema.additionalProperties ? ["..."] : []).join(", ") + " }";
				}
				if (schema.additionalProperties) {
					return "object { <key>: " + formatInnerSchema(schema.additionalProperties) + " }";
				}
				return "object";
			} else if (schema.type === "array") {
				return "[" + formatInnerSchema(schema.items) + "]";
			}

			switch (schema.instanceof) {
				case "Function":
					return "function";
				case "RegExp":
					return "RegExp";
			}
			if (schema.$ref) return formatInnerSchema(getSchemaPart(schema.$ref), true);
			if (schema.allOf) return schema.allOf.map(formatInnerSchema).join(" & ");
			if (schema.oneOf) return schema.oneOf.map(formatInnerSchema).join(" | ");
			if (schema.anyOf) return schema.anyOf.map(formatInnerSchema).join(" | ");
			if (schema.enum) return schema.enum.map(function (item) {
				return _JSON$stringify(item);
			}).join(" | ");
			return _JSON$stringify(schema, 0, 2);
		}
	}, {
		key: "formatValidationError",
		value: function formatValidationError(err) {
			var dataPath = "configuration" + err.dataPath;
			if (err.keyword === "additionalProperties") {
				var baseMessage = dataPath + " has an unknown property '" + err.params.additionalProperty + "'. These properties are valid:\n" + getSchemaPartText(err.parentSchema);
				if (!err.dataPath) {
					switch (err.params.additionalProperty) {
						case "debug":
							return baseMessage + "\n" + "The 'debug' property was removed in webpack 2.\n" + "Loaders should be updated to allow passing this option via loader options in module.rules.\n" + "Until loaders are updated one can use the LoaderOptionsPlugin to switch loaders into debug mode:\n" + "plugins: [\n" + "  new webpack.LoaderOptionsPlugin({\n" + "    debug: true\n" + "  })\n" + "]";
					}
					return baseMessage + "\n" + "For typos: please correct them.\n" + "For loader options: webpack 2 no longer allows custom properties in configuration.\n" + "  Loaders should be updated to allow passing options via loader options in module.rules.\n" + "  Until loaders are updated one can use the LoaderOptionsPlugin to pass these options to the loader:\n" + "  plugins: [\n" + "    new webpack.LoaderOptionsPlugin({\n" + "      // test: /\\.xxx$/, // may apply this only for some modules\n" + "      options: {\n" + ("        " + err.params.additionalProperty + ": ...\n") + "      }\n" + "    })\n" + "  ]";
				}
				return baseMessage;
			} else if (err.keyword === "oneOf" || err.keyword === "anyOf") {
				if (err.children && err.children.length > 0) {
					return dataPath + " should be one of these:\n" + getSchemaPartText(err.parentSchema) + "\n" + ("Details:\n" + err.children.map(function (err) {
						return " * " + indent(WebpackOptionsValidationError.formatValidationError(err), "   ", false);
					}).join("\n"));
				}
				return dataPath + " should be one of these:\n" + getSchemaPartText(err.parentSchema);
			} else if (err.keyword === "enum") {
				if (err.parentSchema && err.parentSchema.enum && err.parentSchema.enum.length === 1) {
					return dataPath + " should be " + getSchemaPartText(err.parentSchema);
				}
				return dataPath + " should be one of these:\n" + getSchemaPartText(err.parentSchema);
			} else if (err.keyword === "allOf") {
				return dataPath + " should be:\n" + getSchemaPartText(err.parentSchema);
			} else if (err.keyword === "type") {
				switch (err.params.type) {
					case "object":
						return dataPath + " should be an object.";
					case "string":
						return dataPath + " should be a string.";
					case "boolean":
						return dataPath + " should be a boolean.";
					case "number":
						return dataPath + " should be a number.";
					case "array":
						return dataPath + " should be an array:\n" + getSchemaPartText(err.parentSchema);
				}
				return dataPath + " should be " + err.params.type + ":\n" + getSchemaPartText(err.parentSchema);
			} else if (err.keyword === "instanceof") {
				return dataPath + " should be an instance of " + getSchemaPartText(err.parentSchema) + ".";
			} else if (err.keyword === "required") {
				var missingProperty = err.params.missingProperty.replace(/^\./, "");
				return dataPath + " misses the property '" + missingProperty + "'.\n" + getSchemaPartText(err.parentSchema, ["properties", missingProperty]);
			} else if (err.keyword === "minLength" || err.keyword === "minItems") {
				if (err.params.limit === 1) return dataPath + " should not be empty.";else return dataPath + " " + err.message;
			} else {
				// eslint-disable-line no-fallthrough
				return dataPath + " " + err.message + " (" + _JSON$stringify(err, 0, 2) + ").\n" + getSchemaPartText(err.parentSchema);
			}
		}
	}]);

	return WebpackOptionsValidationError;
}(Error);

"use strict";

var fs$2 = require("fs");
var chalk$5 = require("chalk");
var diff = require("diff");
var inquirer$1 = require("inquirer");
var PLazy = require("p-lazy");
var Listr = require("listr");
function transformFile(currentConfigPath, outputConfigPath, options) {
	var recastOptions = _Object$assign({
		quote: "single"
	}, options);
	var tasks = new Listr([{
		title: "Reading webpack config",
		task: function task(ctx) {
			return new PLazy(function (resolve, reject) {
				fs$2.readFile(currentConfigPath, "utf8", function (err, content) {
					if (err) {
						reject(err);
					}
					try {
						var jscodeshift = require("jscodeshift");
						ctx.source = content;
						ctx.ast = jscodeshift(content);
						resolve();
					} catch (err) {
						reject("Error generating AST", err);
					}
				});
			});
		}
	}, {
		title: "Migrating config from v1 to v2",
		task: function task(ctx) {
			var transformations = require("./transformations").transformations;
			return new Listr(_Object$keys(transformations).map(function (key) {
				var transform = transformations[key];
				return {
					title: key,
					task: function task() {
						return transform(ctx.ast, ctx.source);
					}
				};
			}));
		}
	}]);

	tasks.run().then(function (ctx) {
		var result = ctx.ast.toSource(recastOptions);
		var diffOutput = diff.diffLines(ctx.source, result);
		diffOutput.forEach(function (diffLine) {
			if (diffLine.added) {
				process.stdout.write(chalk$5.green("+ " + diffLine.value));
			} else if (diffLine.removed) {
				process.stdout.write(chalk$5.red("- " + diffLine.value));
			}
		});
		inquirer$1.prompt([{
			type: "confirm",
			name: "confirmMigration",
			message: "Are you sure these changes are fine?",
			default: "Y"
		}]).then(function (answers) {
			if (answers["confirmMigration"]) {
				fs$2.writeFile(outputConfigPath, result, "utf8", function (err) {
					var webpackOptionsValidationErrors = validateSchema(webpackOptionsSchema, require(outputConfigPath));
					if (err) {
						throw err;
					} else if (webpackOptionsValidationErrors.length) {
						var validationMsg = new WebpackOptionsValidationError(webpackOptionsValidationErrors);
						throw validationMsg.message;
					} else {
						console.log(chalk$5.green("\n \u2714\uFE0E New webpack v2 config file is at " + outputConfigPath));
					}
				});
			} else {
				console.log(chalk$5.red("✖ Migration aborted"));
			}
		});
	}).catch(function (err) {
		console.log(chalk$5.red("✖ ︎Migration aborted due to some errors"));
		console.error(err);
		process.exitCode = 1;
	});
}

var migrate = Object.freeze({
	default: transformFile
});

var path$7 = require("path");

/**
 * Takes in a file path in the `./templates` directory. Copies that
 * file to the destination, with the `.tpl` extension stripped.
 *
 * @param {Generator} generator A Yeoman Generator instance
 * @param {string} templateDir Absolute path to template directory
 * @returns {Function} A curried function that takes a file path and copies it
 */
var generatorCopy = function generatorCopy(generator, templateDir) {
	return (/** @param {string} filePath */function (filePath) {
			var sourceParts = templateDir.split(path$7.delimiter);
			sourceParts.push.apply(sourceParts, filePath.split("/"));
			var targetParts = path$7.dirname(filePath).split("/");
			targetParts.push(path$7.basename(filePath, ".tpl"));

			generator.fs.copy(path$7.join.apply(null, sourceParts), generator.destinationPath(path$7.join.apply(null, targetParts)));
		}
	);
};

/**
 * Takes in a file path in the `./templates` directory. Copies that
 * file to the destination, with the `.tpl` extension and `_` prefix
 * stripped. Passes `this.props` to the template.
 *
 * @param {Generator} generator A Yeoman Generator instance
 * @param {string} templateDir Absolute path to template directory
 * @param {any} templateData An object containing the data passed to
 * the template files.
 * @returns {Function} A curried function that takes a file path and copies it
 */
var generatorCopyTpl = function generatorCopyTpl(generator, templateDir, templateData) {
	return (/** @param {string} filePath */function (filePath) {
			var sourceParts = templateDir.split(path$7.delimiter);
			sourceParts.push.apply(sourceParts, filePath.split("/"));
			var targetParts = path$7.dirname(filePath).split("/");
			targetParts.push(path$7.basename(filePath, ".tpl").slice(1));

			generator.fs.copyTpl(path$7.join.apply(null, sourceParts), generator.destinationPath(path$7.join.apply(null, targetParts)), templateData);
		}
	);
};

var path$6 = require("path");
var mkdirp = require("mkdirp");
/**
 * Creates a Yeoman Generator that generates a project conforming
 * to webpack-defaults.
 *
 * @param {any[]} prompts An array of Yeoman prompt objects
 *
 * @param {string} templateDir Absolute path to template directory
 *
 * @param {string[]} copyFiles An array of file paths (relative to `./templates`)
 * of files to be copied to the generated project. File paths should be of the
 * form `path/to/file.js.tpl`.
 *
 * @param {string[]} copyTemplateFiles An array of file paths (relative to
 * `./templates`) of files to be copied to the generated project. Template
 * file paths should be of the form `path/to/_file.js.tpl`.
 *
 * @param {Function} templateFn A function that is passed a generator instance and
 * returns an object containing data to be supplied to the template files.
 *
 * @returns {Generator} A class extending Generator
 */
class WebpackGenerator$1 extends Generator {
		constructor(args, opts) {
			super(args, opts);

			this.prompts = args.prompts;
			this.templateDir = args.templateDir;
			this.copyFiles = args.copyFiles;
			this.copyTemplateFiles = args.copyTemplateFiles;
			this.templateFn = args.templateFn;
		}
		prompting() {
			return this.prompt(this.prompts).then(props => {
				this.props = props;
			});
		}

		default() {
			var currentDirName = path$6.basename(this.destinationPath());
			if (currentDirName !== this.props.name) {
				this.log(`
				Your project must be inside a folder named ${this.props.name}
				I will create this folder for you.
				`);
				mkdirp(this.props.name);
				var pathToProjectDir = this.destinationPath(this.props.name);
				this.destinationRoot(pathToProjectDir);
			}
		}

		writing() {
			this.copy = generatorCopy(this, this.templateDir);
			this.copyTpl = generatorCopyTpl(
				this,
				this.templateDir,
				this.templateFn(this)
			);

			this.copyFiles.forEach(this.copy);
			this.copyTemplateFiles.forEach(this.copyTpl);
		}

		install() {
			this.npmInstall(["webpack-defaults", "bluebird"], {
				"save-dev": true
			}).then(() => {
				this.spawnCommand("npm", ["run", "webpack-defaults"]);
			});
		}
	}

var path$5 = require("path");
var _ = require("lodash");
/**
 * Formats a string into webpack loader format
 * (eg: 'style-loader', 'raw-loader')
 *
 * @param {string} name A loader name to be formatted
 * @returns {string} The formatted string
 */
function makeLoaderName(name) {
	name = _.kebabCase(name);
	if (!/loader$/.test(name)) {
		name += "-loader";
	}
	return name;
}

/**
 * A yeoman generator class for creating a webpack
 * loader project. It adds some starter loader code
 * and runs `webpack-defaults`.
 *
 * @class LoaderGenerator
 * @extends {Generator}
 */
var LoaderGenerator = new WebpackGenerator$1([{
	type: "input",
	name: "name",
	message: "Loader name",
	default: "my-loader",
	filter: makeLoaderName,
	validate: function validate(str) {
		return str.length > 0;
	}
}], path$5.join(__dirname, "templates"), ["src/cjs.js.tpl", "test/test-utils.js.tpl", "test/unit.test.js.tpl", "test/functional.test.js.tpl", "test/fixtures/simple-file.js.tpl", "examples/simple/webpack.config.js.tpl", "examples/simple/src/index.js.tpl", "examples/simple/src/lazy-module.js.tpl", "examples/simple/src/static-esm-module.js.tpl"], ["src/_index.js.tpl"], function (gen) {
	return { name: gen.props.name };
});

var yeoman$1 = require("yeoman-environment");
/**
 * Runs a yeoman generator to create a new webpack loader project
 * @returns {void}
 */
function loaderCreator() {
	var env = yeoman$1.createEnv();
	var generatorName = "webpack-loader-generator";

	env.registerStub(new LoaderGenerator(), generatorName);

	env.run(generatorName);
}



var generateLoader = Object.freeze({
	default: loaderCreator
});

var path$8 = require("path");
var _$1 = require("lodash");
/**
 * A yeoman generator class for creating a webpack
 * plugin project. It adds some starter plugin code
 * and runs `webpack-defaults`.
 *
 * @class PluginGenerator
 * @extends {Generator}
 */
var PluginGenerator = new WebpackGenerator$1([{
	type: "input",
	name: "name",
	message: "Plugin name",
	default: "my-webpack-plugin",
	filter: _$1.kebabCase,
	validate: function validate(str) {
		return str.length > 0;
	}
}], path$8.join(__dirname, "templates"), ["src/cjs.js.tpl", "test/test-utils.js.tpl", "test/functional.test.js.tpl", "examples/simple/src/index.js.tpl", "examples/simple/src/lazy-module.js.tpl", "examples/simple/src/static-esm-module.js.tpl"], ["src/_index.js.tpl", "examples/simple/_webpack.config.js.tpl"], function (gen) {
	return { name: _$1.upperFirst(_$1.camelCase(gen.props.name)) };
});

var yeoman$2 = require("yeoman-environment");
/**
 * Runs a yeoman generator to create a new webpack plugin project
 * @returns {void}
 */
function pluginCreator() {
	var env = yeoman$2.createEnv();
	var generatorName = "webpack-plugin-generator";

	env.registerStub(new PluginGenerator(), generatorName);

	env.run(generatorName);
}



var generatePlugin = Object.freeze({
	default: pluginCreator
});

var require$$0 = ( initialize && initializeInquirer ) || initialize;

var require$$1 = ( migrate && transformFile ) || migrate;

var require$$2 = ( generateLoader && loaderCreator ) || generateLoader;

var require$$3 = ( generatePlugin && pluginCreator ) || generatePlugin;

"use strict";

/*
* @function initialize
*
* First function to be called after running a flag. This is a check,
* to match the flag with the respective require.
*
* @param { String } command - which feature to use
* @param { Object } args - arguments from the CLI
* @returns { Module } returns the module with the command
*
*/

var lib = function initialize(command, args) {
	var popArgs = args.slice(2).pop();
	switch (command) {
		case "init":
			{
				var initPkgs = args.slice(2).length === 1 ? [] : [popArgs];
				//eslint-disable-next-line
				return require$$0(initPkgs);
			}
		case "migrate":
			{
				var filePaths = args.slice(2).length === 1 ? [] : [popArgs];
				if (!filePaths.length) {
					throw new Error("Please specify a path to your webpack config");
				}
				var inputConfigPath = path.resolve(process.cwd(), filePaths[0]);
				//eslint-disable-next-line
				return require$$1(inputConfigPath, inputConfigPath);
			}
		case "generate-loader":
			{
				return require$$2();
			}
		case "generate-plugin":
			{
				return require$$3();
			}
		default:
			{
				throw new Error("Unknown command " + command + " found");
			}
	}
};

module.exports = lib;
