const { expect } = require("chai");
const { join } = require("gson-pointer");
const { parse } = require("../../../lib/parser");


const valid = /(children|text|type|start|end|rest|errors|fullText|\d+)/;
const subset = /(children|text|type|\d+)/;
const toJSON = (ast) => JSON.stringify(ast, (key, value) => (key === "" || valid.test(key)) ? value : undefined, 2);
const toSmallJSON = (ast) => JSON.stringify(ast, (key, value) => (key === "" || (key === "rest" && value !== "") || subset.test(key)) ? value : undefined, 2);


describe("parser", () => {
    it("should support uri-fragment", () => {
        const r = parse("#");
        expect(r).not.to.eq(null);
        expect(r.rest).to.eq("");
    });

    it("should support uri-frament with trailing slash", () => {
        const r = parse("#/");
        expect(r).not.to.eq(null);
        expect(r.rest).to.eq("");
    });

    it("should support root slash", () => {
        const r = parse("/");
        expect(r).not.to.eq(null);
        expect(r.rest).to.eq("");
    });

    it("should support filters", () => {
        const r = parse("{.*}?id:!{^nr.*}");
        expect(r).not.to.eq(null);
        expect(r.rest).to.eq("");
    });

    it("should support queries", () => {
        const r = parse("/prop/**/*?prop:0");
        expect(r).not.to.eq(null);
        expect(r.rest).to.eq("");
    });

    it("should support patterns", () => {
        const r = parse("#((/a),(/b)(/c))+");
        expect(r).not.to.eq(null);
        expect(r.rest).to.eq("");
    });

    it("should support patterns with whitespaces", () => {
        const r = parse("#( (/a), (/b)(/c) )+");
        expect(r).not.to.eq(null);
        expect(r.rest).to.eq("");
    });

    it("should support patterns filters", () => {
        const r = parse("#( (/a), (/b)(/c) )+?id");
        expect(r).not.to.eq(null);
        expect(r.rest).to.eq("");
    });
});
