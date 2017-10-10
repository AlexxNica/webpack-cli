"use strict";

import npmPackagesExists from "./utils/npm-packages-exists";
import { create } from "./creator/index";

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

export default function initializeInquirer(pkg) {
	if (pkg.length === 0) {
		return create();
	}
	return npmPackagesExists(pkg);
}
