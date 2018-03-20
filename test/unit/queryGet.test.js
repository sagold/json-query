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

	it("should return an object that maps pointers to their respective value", function () {
		var result = queryGet(data, "#/**/*?needle:needle", queryGet.MAP);

		expect(result).to.be.an("object");
		expect(result).to.deep.equal({
			"#/a": data.a,
			"#/b": data.b,
			"#/b/d": data.b.d,
			"#/c/e/f": data.c.e.f
		});
	});

	it("should return custom functions return values", function () {
		var result = queryGet(data, "#/**/*?needle:needle", function cb(val, key, parent, pointer) {
			return "custom-" + pointer;
		});

		expect(result).to.have.length(4);
		expect(result).to.contain("custom-#/a", "custom-#/b", "custom-#/b/d", "custom-#/c/e/f");
	});
});
