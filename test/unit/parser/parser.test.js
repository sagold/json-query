const { expect } = require("chai");
const { parse } = require("../../../lib/parser");


describe.only("parser", () => {
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
        const r = parse("/prop/**/*?{^id.*}:0");
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
