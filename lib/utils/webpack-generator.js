var path = require("path");
var mkdirp = require("mkdirp");
import Generator from "yeoman-generator";
import { generatorCopyTpl, generatorCopy } from "../utils/copy-utils";

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
export default class WebpackGenerator extends Generator {
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
		var currentDirName = path.basename(this.destinationPath());
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
