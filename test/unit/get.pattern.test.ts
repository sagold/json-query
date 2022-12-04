/* eslint object-property-newline: 0 */
import "mocha";
import { expect } from "chai";
import { get, ReturnType } from "../../lib/get";

describe("ReturnType.pattern", () => {
    let data;
    beforeEach(() => {
        data = {
            a: {
                value: "1",
                a: {
                    value: "2",
                    a: {
                        value: "3",
                        a: {
                            value: "4",
                        },
                    },
                },
                b: {
                    value: "5",
                    a: {
                        value: "6",
                        b: {
                            value: "7",
                        },
                    },
                },
            },
        };
    });

    it("should return query", () => {
        const result = get(data, "#/**/a?value:6");
        expect(result).to.deep.equal([{ value: "6", b: { value: "7" } }]);
    });

    describe("associative", () => {
        it("should treat simple pattern as query", () => {
            const result = get(data, "#/a/b(/a)");
            expect(result).to.deep.equal([data.a.b.a]);
        });

        it("should treat multiple simple patterns as query", () => {
            const result = get(data, "#/a(/b)(/a)");
            expect(result).to.deep.equal([data.a.b.a]);
        });

        it("should treat pattern as query", () => {
            const result = get(data, "#/a(/b/a)");
            expect(result).to.deep.equal([data.a.b.a]);
        });

        it("should treat single pattern as query", () => {
            const result = get(data, "(/a/b/a)");
            expect(result).to.deep.equal([data.a.b.a]);
        });

        it("should ignore embracing parenthesis with no quantifier", () => {
            const result = get(data, "#/a((/b)(/a))");
            expect(result).to.deep.equal([data.a.b.a]);
        });
    });

    describe("quanitifer", () => {
        it("should return pattern recursively", () => {
            const result = get(data, "(/a)+");

            expect(result).to.deep.equal([
                data.a,
                data.a.a,
                data.a.a.a,
                data.a.a.a.a,
            ]);
        });

        it("should return target of pattern repeatedly", () => {
            const result = get(
                { a: { b: { a: { b: { a: {} } } } } },
                "(/a/b)+"
            );

            expect(result).to.deep.equal([{ a: { b: { a: {} } } }, { a: {} }]);
        });
    });

    describe("filter", () => {
        it("should filter results for queries outside patterns", () => {
            const result = get(data, "(/a)+/value");

            expect(result).to.deep.equal(["1", "2", "3", "4"]);
        });
    });

    describe("OR", () => {
        it("should select both patterns on same object", () => {
            const result = get(
                { root: { a: { id: 1 }, b: { id: 2 } } },
                "#/root((/a),(/b))"
            );
            expect(result).to.deep.equal([{ id: 1 }, { id: 2 }]);
        });

        it("should select both patterns ", () => {
            const result = get({ a: { id: 1 }, b: { id: 2 } }, "((/a),(/b))");
            expect(result).to.deep.equal([{ id: 1 }, { id: 2 }]);
        });

        it("should select both patterns repeatedly ", () => {
            const result = get(
                {
                    a: { id: 1, a: { id: 2 }, b: { id: 3 } },
                    b: { id: 4, b: { id: 5 } },
                },
                "((/a),(/b))+/id"
            );
            expect(result).to.deep.equal([1, 4, 2, 3, 5]);
        });

        it("should select multiple patterns", () => {
            const result = get({ a: 1, b: 2, c: 3, d: 4 }, "((/a),(/b),(/c))");
            expect(result).to.deep.equal([1, 2, 3]);
        });
    });

    describe("commutative", () => {
        it("should be independent of order", () => {
            const data = { a: 1, b: 2, c: 3, d: 4 };
            const r1 = get(data, "((/a),(/b),(/c))");
            const r2 = get(data, "((/c),(/a),(/b))");
            expect(r1.sort()).to.deep.equal(r2.sort());
        });
    });

    describe("formatting", () => {
        it.skip("should ignore first inner whitespace", () => {
            const result = get(data, "#/a( /b/a)");
            expect(result).to.deep.equal([data.a.b.a]);
        });

        it.skip("should ignore all whitespaces around parenthesis", () => {
            const result = get(data, "#/a ( /b/a ) /b");
            expect(result).to.deep.equal([data.a.b.a.b]);
        });

        it("should ignore whitespaces around or", () => {
            const result = get({ a: { id: 1 }, b: { id: 2 } }, "((/a) , (/b))");
            expect(result).to.deep.equal([{ id: 1 }, { id: 2 }]);
        });

        it.skip("should ignore whitespace around quantifier", () => {
            const result = get(data, " (/a) + /value");

            expect(result).to.deep.equal(["1", "2", "3", "4"]);
        });
    });

    describe("callback", () => {
        it("should return values", () => {
            const result = get(data, "(/a)+/value", ReturnType.VALUE);
            expect(result).to.deep.equal(["1", "2", "3", "4"]);
        });

        it("should return pointers", () => {
            const result = get(data, "(/a)+/value", ReturnType.POINTER);
            expect(result).to.deep.equal([
                "#/a/value",
                "#/a/a/value",
                "#/a/a/a/value",
                "#/a/a/a/a/value",
            ]);
        });

        it("should return pointers", () => {
            const result = get(data, "(/a)+/value", ReturnType.POINTER);
            expect(result).to.deep.equal([
                "#/a/value",
                "#/a/a/value",
                "#/a/a/a/value",
                "#/a/a/a/a/value",
            ]);
        });

        it("should return {pointer:value}", () => {
            const result = get(data, "(/a)+/value", ReturnType.MAP);
            expect(result).to.deep.equal({
                "#/a/value": "1",
                "#/a/a/value": "2",
                "#/a/a/a/value": "3",
                "#/a/a/a/a/value": "4",
            });
        });

        it("should call callback-function", () => {
            const result = {};
            get(data, "(/a)+/value", (key, value, parent, pointer) => {
                result[pointer] = true;
            });

            expect(result).to.deep.equal({
                "#/a/value": true,
                "#/a/a/value": true,
                "#/a/a/a/value": true,
                "#/a/a/a/a/value": true,
            });
        });
    });
});
