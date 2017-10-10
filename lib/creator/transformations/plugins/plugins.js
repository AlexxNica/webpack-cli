"use strict";

import utils from "../../../transformations/utils";

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

export default function(j, ast, webpackProperties) {
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
}
