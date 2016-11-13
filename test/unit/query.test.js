"use strict";


var expect = require("chai").expect;
var query = require("../../lib");


describe("query", function () {

	var cbMock;

	beforeEach(function () {

		cbMock = function cbMock(value) {
			cbMock.args.push(arguments);
			cbMock.called = true;
		};

		cbMock.called = false;
		cbMock.args = [];
	});

	it("should callback for matched jsonpointer", function () {

		query.run({
			"first": {
				"value": "text"
			}
		}, "/first", cbMock);

		expect(cbMock.called).to.be.true;
		expect(cbMock.args.length).to.eq(1);
		expect(cbMock.args[0][0].value).to.eq("text");
	});

	it("should callback with value, key, object and pointer", function () {

		query.run({
			"first": {
				"value": "text"
			}
		}, "/first", cbMock);

		expect(cbMock.args[0][0].value).to.eq("text");
		expect(cbMock.args[0][1]).to.eq("first");
		expect(cbMock.args[0][2].first.value).to.eq("text");
		expect(cbMock.args[0][3]).to.eq("#/first");
	});

	it("should callback on nested objects", function () {

		query.run({
			"first": {
				"value": "text"
			}
		}, "/first/value", cbMock);

		expect(cbMock.args.length).to.eq(1);
		expect(cbMock.args[0][0]).to.eq("text");
		expect(cbMock.args[0][3]).to.eq("#/first/value");
	});

	it("should callback only if match", function () {

		query.run({
			"first": {
				"value": "text"
			}
		}, "/first/second", cbMock);

		expect(cbMock.called).to.be.false;
		expect(cbMock.args.length).to.eq(0);
	});


	describe("*", function () {

		it("should callback on all items", function () {

			query.run({
				"first": {
					"value": "text"
				},
				"second": "last"
			}, "/*", cbMock);

			expect(cbMock.called).to.be.true;
			expect(cbMock.args.length).to.eq(2);
			expect(cbMock.args[1][0]).to.eq("last");
			expect(cbMock.args[1][3]).to.eq("#/second");
		});

		it("should continue for all found items", function () {

			query.run({
				"first": {
					"value": "first"
				},
				"second": {
					"value": "second"
				},
				"third": {
					"value": "third"
				}

			}, "/*/value", cbMock);

			expect(cbMock.called).to.be.true;
			expect(cbMock.args.length).to.eq(3);
			expect(cbMock.args[2][0]).to.eq("third");
			expect(cbMock.args[2][3]).to.eq("#/third/value");
		});
	});


	describe("filter", function () {

		it("should callback on matched items", function () {

			query.run({
				"first": {
					"value": "text"
				},
				"second": {
					"value": "last"
				}
			}, "/*?value:last", cbMock);

			expect(cbMock.called).to.be.true;
			expect(cbMock.args.length).to.eq(1);
			expect(cbMock.args[0][0].value).to.eq("last");
			expect(cbMock.args[0][3]).to.eq("#/second");
		});

		it("should continue after query", function () {

			query.run({
				"first": {
					"value": "text"
				},
				"second": {
					"value": "last"
				}
			}, "/*?value:last/value", cbMock);

			expect(cbMock.called).to.be.true;
			expect(cbMock.args.length).to.eq(1);
			expect(cbMock.args[0][0]).to.eq("last");
			expect(cbMock.args[0][3]).to.eq("#/second/value");
		});
	});


	describe("**", function () {

		it("should callback on all keys", function () {

			query.run({
				"1": {
					"value": "2",
					"3": {
						"value": "4"
					}
				},
				"5": {
					"value": "6"
				}

			}, "/**/*", cbMock);

			expect(cbMock.called).to.be.true;
			expect(cbMock.args.length).to.eq(6);
			expect(cbMock.args[5][3]).to.eq("#/5/value");
		});

		it("should callback on all keys, even without /*", function () {

			query.run({
				"1": {
					"value": "2",
					"3": {
						"value": "4"
					}
				},
				"5": {
					"value": "6"
				}

			}, "/**", cbMock);

			expect(cbMock.called).to.be.true;
			expect(cbMock.args.length).to.eq(6);
			expect(cbMock.args[5][3]).to.eq("#/5/value");
		});

		it("should callback on all matched keys", function () {

			query.run({
				"first": {
					"value": "text",
					"inner": {
						"value": ""
					}
				},
				"second": {
					"value": "last"
				}

			}, "/**?value:!undefined", cbMock);

			expect(cbMock.called).to.be.true;
			expect(cbMock.args.length).to.eq(3);
			expect(cbMock.args[2][0]).to.a.string;
		});

		it("should continue on matched globs", function () {

			query.run({
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
			}, "#/**/*?needle:needle", cbMock);

			expect(cbMock.called).to.be.true;
			expect(cbMock.args.length).to.eq(4);
			expect(cbMock.args[3][0]).to.a.string;
		});
	});

	describe("regex", function () {

		it("should apply {...} as regex on property names", function () {

			query.run({
				"a1": true,
				"b1": false,
				"a2": true,
				"b2": false,
			}, "#/{a.*}", cbMock);

			expect(cbMock.called).to.be.true;
			expect(cbMock.args.length).to.eq(2);
			expect(cbMock.args[0][3]).to.eq("#/a1");
			expect(cbMock.args[1][3]).to.eq("#/a2");
		});
	});
});
