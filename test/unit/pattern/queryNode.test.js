/* eslint object-property-newline: 0 */
const { expect } = require("chai");
const queryNode = require("../../../lib/pattern/queryNode");


function run(...args) {
    return queryNode(...args).map(r => r[0]);
}


describe("queryNode", () => {

    it("should run simple query", () => {
        const result = run(
            { a: { id: "leave" }, b: { id: "leaves" }, c: { id: "leave" } },
            { p: "#/{^[^a]}?id:leaves" }
        );

        expect(result).to.deep.equal([{ id: "leaves" }]);
    });

    it("should run simple query as group", () => {
        const result = run(
            { a: { id: "leave" }, b: { id: "leaves" }, c: { id: "leave" } },
            { g: [
                { p: "#/{^[^a]}?id:leaves" }
            ] }
        );

        expect(result).to.deep.equal([{ id: "leaves" }]);
    });

    it("should run nested groups", () => {
        const result = run(
            { a: { id: "leave" }, b: { id: "leaves" }, c: { id: "leave" } },
            {
                g: [
                    { g: [{ "p": "#/b/id" }] }
                ]
            }
        );

        expect(result).to.deep.equal(["leaves"]);
    });

    it("should only return results of group", () => {
        const result = run(
            {
                node: {
                    value: "1",
                    nodes: [
                        { value: "2" }
                    ]
                }
            },
            {
                p: "#/node",
                g: [{
                    p: "/nodes/*"
                }]
            }
        );

        expect(result).to.deep.equal([{ value: "2" }]);
    });

    it("should return result of last group", () => {
        const result = run(
            {
                node: {
                    value: "1",
                    nodes: [
                        { value: "2" }
                    ]
                }
            },
            {
                p: "#/node",
                g: [
                    { p: "/nodes" },
                    { p: "/*" }
                ]
            }
        );

        expect(result).to.deep.equal([{ value: "2" }]);
    });

    it("should return group until end of pattern", () => {
        const result = run(
            {
                a: {
                    value: "1",
                    a: {
                        value: "2",
                        a: {
                            value: "3"
                        }
                    }
                }
            },
            {
                r: "+",
                g: [
                    { p: "/a" }
                ]
            }
        );

        expect(result).to.deep.equal([
            { value: "1", a: { value: "2", a: { value: "3" } } },
            { value: "2", a: { value: "3" } },
            { value: "3" }
        ]);
    });
});
