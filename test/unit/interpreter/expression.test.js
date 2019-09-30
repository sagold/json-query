const { expect } = require("chai");
const { select } = require("../../../lib/interpreter/nodes");
const { parse, reduce } = require("../../../lib/parser");
const get = require("../../../lib/get");
const expr = select.expression;


describe("expression", () => {
    function ast(queryString) {
        const data = reduce(parse(`*?${queryString}`));
        const expressions = get(data, "**?type:expression");
        expect(expressions.length).to.eq(1);
        return expressions[0];
    }

    it("should parse expression", () => {
        const result = ast("type:var");
        expect(result.type).to.eq("expression");
    });

    it("should return undefined if query fails", () => {
        const result = expr(ast("type:var"), [{}]);
        expect(result).to.be.undefined;
    });

    it("should return undefined if no data is given", () => {
        const result = expr(ast("type:undefined"), [null]);
        expect(result).to.be.undefined;
    });

    it("should return entry if query has matches", () => {
        const result = expr(ast("type:true"), [{ type: true }]);
        expect(result).to.deep.eq([{ type: true }]);
    });

    it("should match booleans", () => {
        const result = expr(ast("type:false"), [{ type: false }]);
        expect(result).to.deep.eq([{ type: false }]);
    });

    it("should test for null", () => {
        const result = expr(ast("type:null"), [{ type: null }]);
        expect(result).to.deep.eq([{ type: null }]);
    });

    it("should fail on negated comparison", () => {
        const result = expr(ast("type:!true"), [{ type: true }]);
        expect(result).to.be.undefined;
    });

    it("should validate undefined", () => {
        const result = expr(ast("init:undefined"), [{}]);
        expect(result).to.deep.equal([{}]);
    });
});

