/* eslint object-property-newline: 0 */
const tokenize = require("../../../lib/pattern/tokenize");
const { expect } = require("chai");


describe("tokenize", () => {

    it("should return query as node", () => {
        const groups = tokenize("#/a/b?value:6");
        expect(groups).to.deep.equal({ g: [{ p: "#/a/b?value:6" }] });
    });

    it("should return query patterns as nested nodes", () => {
        const groups = tokenize("#/a/b((/c)*(/d)/x)+/z");
        expect(groups).to.deep.equal({
                g: [{
                    p: "#/a/b",
                    r: "+",
                    g: [
                        {
                            r: "*",
                            g: [
                                { p: "/c" }
                            ]
                        },
                        {
                            g: [
                                { p: "/d" }
                            ]
                        },
                        { p: "/x" }
                    ]
                },
                { p: "/z" }
            ]
        });
    });

    describe("OR", () => {
        it("should add OR-node for comma separated patterns", () => {
            const groups = tokenize("((/a),(/b))");
            expect(groups).to.deep.equal({
                g: [{
                    g: [
                        {
                            g: [{ p: "/a" }],
                            or: true
                        },
                        {
                            g: [{ p: "/b" }]
                        }
                    ]
                }]
            });
        });
    });
});
