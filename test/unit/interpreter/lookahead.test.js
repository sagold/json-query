const { expect } = require("chai");
const { select } = require("../../../lib/interpreter/nodes");
const { parse, reduce } = require("../../../lib/parser");
const get = require("../../../lib/get");
const lookahead = select.lookahead;


describe("lookahead", () => {
    function asNode(query) {
        const ast = reduce(parse(`*?${query}`));
        const result = get(ast, "**?type:lookahead");
        return result.pop();
    }

    it("parse should compile lookahead", () => {
        const ast = asNode("type:var&&init:false");
        expect(ast.type).to.eq("lookahead");
    });

    it("should tests multiple properties", () => {
        const result = lookahead(asNode("type:var&&init:false"), [{ type: "var", init: false }]);
        expect(result).to.deep.eq([{ type: "var", init: false }]);
    });

    it("should negate comparison on leading !", () => {
        const result = lookahead(asNode("init:!true&&type:!funny"), [{ type: true, init: false }]);
        expect(result).to.deep.eq([{ type: true, init: false }]);
    });

    it("should return undefined if a single match fails", () => {
        const result = lookahead(asNode("type:var&&init:false&&init:!false"), [{ type: "var", init: false }]);
        expect(result).to.be.undefined;
    });

    it("should support or operator", () => {
        const result = lookahead(asNode("value:false||init:undefined||init:!undefined"), [{ value: true }]);
        expect(result).to.deep.eq([{ value: true }]);
    });
});
