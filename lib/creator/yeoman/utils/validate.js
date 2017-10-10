"use strict";

export default value => {
	const pass = value.length;
	if (pass) {
		return true;
	}
	return "Please specify an answer!";
};
