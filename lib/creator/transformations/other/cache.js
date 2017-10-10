"use strict";

import utils from "../../../transformations/utils";

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

export default function(j, ast, webpackProperties) {
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
}
