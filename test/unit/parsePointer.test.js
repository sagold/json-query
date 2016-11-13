"use strict";


var expect = require("chai").expect;
var parsePointer = require("../../lib/common").parsePointer;


describe("parsePointer", function () {

	it("should split pointer to properties", function () {

		var properties = parsePointer("#/root/parent/target");

		expect(properties.length).to.eq(3);
		expect(properties[0]).to.eq("root");
	});

	it("should not split / within {}", function () {
		var properties = parsePointer("#/root/to/{par\/ent}/{tar\/get}/value");

		expect(properties.length).to.eq(5);
		expect(properties[0]).to.eq("root");
		expect(properties[4]).to.eq("value");
	});

	it("should not split on / if only one property is given", function () {
		var properties = parsePointer("#/{par\/ent}");

		expect(properties.length).to.eq(1);
	});
});
