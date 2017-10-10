"use strict";

const inquirer = require("inquirer");

/*
* @class - WebpackAdapter
*
* Custom adapter that is integrated in the scaffold. Here we can validate
* paths and answers from the user
*
*/
export default class WebpackAdapter {
	prompt(questions, callback) {
		const promise = inquirer.prompt(questions);
		promise.then(callback || function() {});
		return promise;
	}
}
