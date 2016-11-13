"use strict";


var expect = require("chai").expect;
var queryGet = require("../../lib").get;


describe("queryGet", function () {

	var data = {
		"a": {
			"id": "a",
			"needle": "needle",
		},
		"b": {
			"id": "b",
			"needle": "needle",
			"d": {
				"id": "d",
				"needle": "needle"
			}
		},
		"c": {
			"e": {
				"f": {
					"id": "f",
					"needle": "needle"
				}
			}
		}
	};

	it("should return empty array", function () {
		var result = queryGet({}, "#/**/*?needle:needle");

		expect(result).to.be.an("array");
		expect(result).to.have.length(0);
	});

	it("should return all queried values in array", function () {
		var result = queryGet(data, "#/**/*?needle:needle");

		expect(result).to.have.length(4);
		expect(result).to.contain(data.a, data.b, data.b.d, data.c.e.f);
	});

	it("should return all queried pointers in array", function () {
		var result = queryGet(data, "#/**/*?needle:needle", queryGet.POINTER);

		expect(result).to.have.length(4);
		expect(result).to.contain("#/a", "#/b", "#/b/d", "#/c/e/f");
	});
});
