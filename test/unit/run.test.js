/* eslint object-property-newline: 0 */
const { expect } = require("chai");
const query = require("../../lib");


describe("query.run", () => {
    let cbMock;

    beforeEach(() => {
        cbMock = (...args) => {
            cbMock.args.push(args);
            cbMock.called = true;
        };

        cbMock.called = false;
        cbMock.args = [];
    });

    it("should callback for matched jsonpointer", () => {
        query.run({
            first: {
                value: "text"
            }
        }, "/first", cbMock);

        expect(cbMock.called).to.be.true;
        expect(cbMock.args.length).to.eq(1);
        expect(cbMock.args[0][0].value).to.eq("text");
    });

    it("should ignore trailing slashes", () => {
        query.run({
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
        query.run(data, "/", cbMock);

        expect(cbMock.called).to.be.true;
        expect(cbMock.args.length).to.eq(1);
        expect(cbMock.args[0][0]).to.eq(data);
        expect(cbMock.args[0][3]).to.eq("#");
    });

    it("should callback root-object for root uri-pointer", () => {
        const data = { first: { value: "text" } };
        query.run(data, "#", cbMock);

        expect(cbMock.called).to.be.true;
        expect(cbMock.args.length).to.eq(1);
        expect(cbMock.args[0][0]).to.eq(data);
        expect(cbMock.args[0][3]).to.eq("#");
    });

    it("should callback root-object for root uri-pointer with trailing slash", () => {
        const data = { first: { value: "text" } };
        query.run(data, "#/", cbMock);

        expect(cbMock.called).to.be.true;
        expect(cbMock.args.length).to.eq(1);
        expect(cbMock.args[0][0]).to.eq(data);
        expect(cbMock.args[0][3]).to.eq("#");
    });

    it("should callback with value, key, object and pointer", () => {
        query.run({
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
        query.run({
            first: {
                value: "text"
            }
        }, "/first/value", cbMock);

        expect(cbMock.args.length).to.eq(1);
        expect(cbMock.args[0][0]).to.eq("text");
        expect(cbMock.args[0][3]).to.eq("#/first/value");
    });

    it("should callback only if match", () => {
        query.run({
            first: {
                value: "text"
            }
        }, "/first/second", cbMock);

        expect(cbMock.called).to.be.false;
        expect(cbMock.args.length).to.eq(0);
    });


    describe("*", () => {

        it("should callback on all items", () => {
            query.run({
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
            query.run({
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
            query.run({
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
            let calls = [];
            query.run({ list: [1, { remove: true }, { remove: true }, 2] }, "#/list/*?remove:true",
                (value, key, object, pointer) => calls.push({ value, pointer })
            );

            expect(calls).to.have.length(2);
            expect(calls[0].value).to.deep.eq({ remove: true });
            expect(calls[0].pointer).to.eq("#/list/1");
            expect(calls[1].pointer).to.eq("#/list/2");
        });

        it("should continue after query", () => {
            query.run({
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
    });


    describe("**", () => {

        it("should callback on all keys", () => {
            query.run({
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

        it("should callback on all keys, even without /*", () => {
            query.run({
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
            expect(cbMock.args.length).to.eq(6);
            expect(cbMock.args[5][3]).to.eq("#/5/value");
        });

        it("should callback on all matched keys", () => {
            query.run({
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
            query.run({
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
            query.run({
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
});
