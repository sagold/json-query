"use strict";


var stripPointerPrefix = require("gold-json-pointer/lib/common").stripPointerPrefix;
var rIsRegExp = /^\{.*\}$/;


function convertToRegExp(pointerPartial) {
	return new RegExp(pointerPartial.replace(/^\{|\}$/g, ""));
}


function splitRegExp(pointer) {
	pointer = pointer.replace(/^\{|\/\{/g, "§{");
	pointer = pointer.replace(/\}\/|\}$/g, "}§");
	return pointer.split("§");
}


/**
 * Can not be used in conjuction with filters...
 * REMOVE stripPointer...
 *
 * @param  {String} pointer
 * @return {Array}
 */
function parsePointer(pointer) {
	var partials, current, result, regex;
	pointer = stripPointerPrefix(pointer);

	if (pointer.indexOf("{") === -1) {
		return pointer.split("/");

	} else {
		result = [];
		partials = splitRegExp(pointer);

		while ((current = partials.shift()) != null) {
			if (current === "") {
				continue;
			}

			if (rIsRegExp.test(current)) {
				result.push(current);

			} else {
				result.push.apply(result, current.split("/"));
			}
		}

		return result;
	}
}


exports.rIsRegExp = rIsRegExp;
exports.convertToRegExp = convertToRegExp;
exports.splitRegExp = splitRegExp;
exports.parsePointer = parsePointer;

