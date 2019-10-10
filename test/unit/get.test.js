/* eslint object-property-newline: 0 */
const { expect } = require("chai");
const get = require("../../lib/get");
const { parse } = require("../../lib/parser");


describe("get", () => {
    let cbMock;

    beforeEach(() => {
        cbMock = (...args) => {
            cbMock.args.push(args);
            cbMock.called = true;
        };

        cbMock.called = false;
        cbMock.args = [];
    });

    it("should throw an error for a invalid query", () => {
        expect(() => get({}, "query//woot")).to.throw(Error)
            .with.property("message", "Failed parsing queryString from: '//woot'");
    });

    it("should return empty array", () => {
        const result = get({}, "#/**/*?needle:needle");

        expect(result).to.be.an("array");
        expect(result).to.have.length(0);
    });

    it("should resolve properties containing ':'", () => {
        const result = get({ a: { "b:c": 42 } }, "#/a/b:c");

        expect(result).to.be.an("array");
        expect(result).to.deep.eq([ 42 ]);
    });

    it("should callback for matched jsonpointer", () => {
        get({
            first: {
                value: "text"
            }
        }, "/first", cbMock);

        expect(cbMock.called).to.be.true;
        expect(cbMock.args.length).to.eq(1);
        expect(cbMock.args[0][0].value).to.eq("text");
    });

    it("should ignore trailing slashes", () => {
        get({
            first: {
                value: "text"
            }
        }, "/first/", cbMock);

        expect(cbMock.called).to.be.true;
        expect(cbMock.args.length).to.eq(1);
        expect(cbMock.args[0][0].value).to.eq("text");
    });

    it("should callback root-object for root pointer", () => {
        const data = { first: { value: "text" } };
        get(data, "/", cbMock);

        expect(cbMock.called).to.be.true;
        expect(cbMock.args.length).to.eq(1);
        expect(cbMock.args[0][0]).to.eq(data);
        expect(cbMock.args[0][3]).to.eq("#");
    });

    it("should callback root-object for root uri-pointer", () => {
        const data = { first: { value: "text" } };
        get(data, "#", cbMock);

        expect(cbMock.called).to.be.true;
        expect(cbMock.args.length).to.eq(1);
        expect(cbMock.args[0][0]).to.eq(data);
        expect(cbMock.args[0][3]).to.eq("#");
    });

    it("should callback root-object for root uri-pointer with trailing slash", () => {
        const data = { first: { value: "text" } };
        get(data, "#/", cbMock);

        expect(cbMock.called).to.be.true;
        expect(cbMock.args.length).to.eq(1);
        expect(cbMock.args[0][0]).to.eq(data);
        expect(cbMock.args[0][3]).to.eq("#");
    });

    it("should callback with value, key, object and pointer", () => {
        get({
            first: {
                value: "text"
            }
        }, "/first", cbMock);

        expect(cbMock.args[0][0].value).to.eq("text");
        expect(cbMock.args[0][1]).to.eq("first");
        expect(cbMock.args[0][2].first.value).to.eq("text");
        expect(cbMock.args[0][3]).to.eq("#/first");
    });

    it("should callback on nested objects", () => {
        get({
            first: {
                value: "text"
            }
        }, "/first/value", cbMock);

        expect(cbMock.args.length).to.eq(1);
        expect(cbMock.args[0][0]).to.eq("text");
        expect(cbMock.args[0][3]).to.eq("#/first/value");
    });

    it("should callback only if match", () => {
        get({
            first: {
                value: "text"
            }
        }, "/first/second", cbMock);

        expect(cbMock.called).to.be.false;
        expect(cbMock.args.length).to.eq(0);
    });


    describe("*", () => {

        it("should callback on all items", () => {
            get({
                first: {
                    value: "text"
                },
                second: "last"
            }, "/*", cbMock);

            expect(cbMock.called).to.be.true;
            expect(cbMock.args.length).to.eq(2);
            expect(cbMock.args[1][0]).to.eq("last");
            expect(cbMock.args[1][3]).to.eq("#/second");
        });

        it("should continue for all found items", () => {
            get({
                first: {
                    value: "first"
                },
                second: {
                    value: "second"
                },
                third: {
                    value: "third"
                }

            }, "/*/value", cbMock);

            expect(cbMock.called).to.be.true;
            expect(cbMock.args.length).to.eq(3);
            expect(cbMock.args[2][0]).to.eq("third");
            expect(cbMock.args[2][3]).to.eq("#/third/value");
        });
    });


    describe("filter", () => {

        it("should callback on matched items", () => {
            get({
                first: {
                    value: "text"
                },
                second: {
                    value: "last"
                }
            }, "/*?value:last", cbMock);

            expect(cbMock.called).to.be.true;
            expect(cbMock.args.length).to.eq(1);
            expect(cbMock.args[0][0].value).to.eq("last");
            expect(cbMock.args[0][3]).to.eq("#/second");
        });

        // @note bug through gson-pointer upgrade to v3.x.
        // now, only strings are valid as a pointer or else they are ignored
        it("should return arrays' objects using look ahead", () => {
            const calls = [];
            get({ list: [1, { remove: true }, { remove: true }, 2] }, "#/list/*?remove:true",
                (value, key, object, pointer) => calls.push({ value, pointer })
            );

            expect(calls).to.have.length(2);
            expect(calls[0].value).to.deep.eq({ remove: true });
            expect(calls[0].pointer).to.eq("#/list/1");
            expect(calls[1].pointer).to.eq("#/list/2");
        });

        it("should continue after query", () => {
            get({
                first: {
                    value: "text"
                },
                second: {
                    value: "last"
                }
            }, "/*?value:last/value", cbMock);

            expect(cbMock.called).to.be.true;
            expect(cbMock.args.length).to.eq(1);
            expect(cbMock.args[0][0]).to.eq("last");
            expect(cbMock.args[0][3]).to.eq("#/second/value");
        });

        it("should filter numbers", () => {
            const result = get({ a: { id: 1 }, b: { id: "1" } }, "*?id:1");

            expect(result.length).to.eq(2);
            expect(result).to.deep.equal([{ id: 1 }, { id: "1" }]);
        });
    });


    describe("escaping quotes", () => {

        it("should escape property in quotes", () => {
            const result = get({ "{a/b)": { "#c/d?": "..." } }, '"{a/b)"/"#c/d?"');

            expect(result.length).to.eq(1);
            expect(result).to.deep.equal(["..."]);
        });

        it("should escape query-property in quotes", () => {
            const result = get({ a: { "#/id/x": 1 }, b: { "#/id/x": 2 } }, "*?\"#/id/x\"");

            expect(result.length).to.eq(2);
            expect(result).to.deep.equal([{ "#/id/x": 1 }, { "#/id/x": 2 }]);
        });

        it("should escape property in quotes", () => {
            const result = get({ "{a/b)": { "#c/d?": "..." } }, '"{a/b)"/"#c/d?"');

            expect(result.length).to.eq(1);
            expect(result).to.deep.equal(["..."]);
        });

        it("should escape test-value in quotes", () => {
            const result = get({ a: { $ref: "#/a-target" }, b: { $ref: "#/b-target" } }, "*?$ref:\"#/b-target\"");
            expect(result.length).to.eq(1);
            expect(result).to.deep.equal([{ $ref: "#/b-target" }]);
        });
    });


    describe("**", () => {

        it("should callback on all keys", () => {
            get({
                "1": {
                    value: "2",
                    "3": {
                        value: "4"
                    }
                },
                "5": {
                    value: "6"
                }

            }, "/**/*", cbMock);

            expect(cbMock.called).to.be.true;
            expect(cbMock.args.length).to.eq(6);
            expect(cbMock.args[5][3]).to.eq("#/5/value");
        });

        // no root is added -> result += 1
        it("should callback on all keys, even without /*", () => {
            get({
                "1": {
                    value: "2",
                    "3": {
                        value: "4"
                    }
                },
                "5": {
                    value: "6"
                }

            }, "/**", cbMock);

            expect(cbMock.called).to.be.true;
            expect(cbMock.args.length).to.eq(7);
            expect(cbMock.args[6][3]).to.eq("#/5/value");
        });

        it("should callback on all matched keys", () => {
            get({
                first: {
                    value: "text",
                    inner: {
                        value: ""
                    }
                },
                second: {
                    value: "last"
                }

            }, "/**?value:!undefined", cbMock);

            expect(cbMock.called).to.be.true;
            expect(cbMock.args.length).to.eq(3);
            expect(cbMock.args[2][0]).to.a.string;
        });

        it("should continue on matched globs", () => {
            get({
                a: {
                    id: "a",
                    needle: "needle"
                },
                b: {
                    id: "b",
                    needle: "needle",
                    d: {
                        id: "d",
                        needle: "needle"
                    }
                },
                c: {
                    e: {
                        f: {
                            id: "f",
                            needle: "needle"
                        }
                    }
                }
            }, "#/**/*?needle:needle", cbMock);

            expect(cbMock.called).to.be.true;
            expect(cbMock.args.length).to.eq(4);
            expect(cbMock.args[3][0]).to.a.string;
        });
    });


    describe("regex", () => {

        it("should apply {...} as regex on property names", () => {
            get({
                a1: true,
                b1: false,
                a2: true,
                b2: false
            }, "#/{a.*}", cbMock);

            expect(cbMock.called).to.be.true;
            expect(cbMock.args.length).to.eq(2);
            expect(cbMock.args[0][3]).to.eq("#/a1");
            expect(cbMock.args[1][3]).to.eq("#/a2");
        });
    });


    describe("typecheck", () => {
        let input;
        beforeEach(() => input = {
            a: "string",
            b: true,
            c: {},
            d: [],
            e: 144,
            list: [
                false,
                { id: "message" },
                42
            ]
        });

        it("should support typechecks", () => {
            const result = get(input, "/**?:string");
            expect(result).to.deep.equal(["string", "message"]);
        });

        it("should return boolean", () => {
            const result = get(input, "/**?:boolean");
            expect(result).to.deep.equal([true, false]);
        });

        it("should return numbers", () => {
            const result = get(input, "/**?:number");
            expect(result).to.deep.equal([144, 42]);
        });

        it("should return objects", () => {
            const result = get(input, "/**?:object");
            expect(result).to.deep.equal([input, {}, { id: "message" }]);
        });

        it("should return arrays", () => {
            const result = get(input, "/**?:array");
            expect(result).to.deep.equal([[], [false, { id: "message" }, 42 ]]);
        });

        it("should return non-object and non-arrays", () => {
            const result = get(input, "/**?:value");
            expect(result).to.deep.equal(["string", true, 144, false, "message", 42]);
        });
    });


    describe("callback", () => {

        it("should return custom functions return values", () => {
            const result = get({ a: {
                    b: { stack: "needle" },
                    c: { needle: "stack",
                        d: { needle: "needle" }
                    }
                }},
                "#/**/*?needle:needle",
                (val, key, parent, pointer) => {
                    return `custom-${pointer}`;
                }
            );

            expect(result).to.have.length(1);
            expect(result).to.contain("custom-#/a/c/d");
        });
    });


    describe("circular references", () => {

        it("should parse simple queries into circular references", () => {
            const a = { id: "a" };
            const b = { id: "b" };
            a.node = b;
            b.node = a;

            const result = get(a, "#/node/node/node/id");
            expect(result).to.have.length(1);
            expect(result).to.deep.eq(["b"]);
        });

        it("should not parse data twice for all operator", () => {
            const a = { id: "a" };
            const b = { id: "b" };
            a.node = b;
            b.node = a;

            const result = get(a, "/**/id");
            expect(result).to.have.length(2);
        });

        it("should reset cache for next query", () => {
            const a = { id: "a" };
            const b = { id: "b" };
            a.node = b;
            b.node = a;

            const first = get(a, "/**/id");
            expect(first).to.have.length(2, "expected first run to have 2 matches");

            const second = get(a, "/**/id");
            expect(second).to.have.length(2, "expected second run to have 2 matches");
        });

        it("should finish parsing circular ast", () => {
            const ast = parse("#/recursive/tree/referencing?parent");

            const result = get(ast, "**?type:lookahead");
            expect(result).to.have.length(1);
            expect(result[0].type).to.eq("lookahead");
        });
    });
});
