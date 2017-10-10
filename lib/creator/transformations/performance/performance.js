"use strict";

import utils from "../../../transformations/utils";

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

export default function(j, ast, webpackProperties) {
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
}
