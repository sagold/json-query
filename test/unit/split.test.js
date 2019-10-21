/* eslint object-property-newline: 0 */
const { expect } = require("chai");
const split = require("../../lib/split");


describe("split", () => {

    it("should return array for missing input", () => {
        const path = split();
        expect(path).to.deep.eq([]);
    });

    it("should return array for empty string", () => {
        const path = split("");
        expect(path).to.deep.eq([]);
    });

    it("should split simple pointer to list of properties", () => {
        const path = split("#/outer/inner/last");
        expect(path).to.deep.eq(["outer", "inner", "last"]);
    });

    it("should separate properties from patterns", () => {
        const path = split("#/outer((/group?query)+)/target");
        expect(path).to.deep.eq(["outer", "((/group?query)+)", "target"]);
    });

    it("should separate properties and glob-patterns", () => {
        const path = split("#/outer/**/*/target");
        expect(path).to.deep.eq(["outer", "**", "*", "target"]);
    });

    it("should separate properties and lookahead", () => {
        const path = split("#/outer/referencing?parent/target");
        expect(path).to.deep.eq(["outer", "referencing?parent", "target"]);
    });

    it("should correctly split escaped property names", () => {
        const path = split('#/outer/"referencing/parent"/target');
        expect(path).to.deep.eq(["outer", "\"referencing/parent\"", "target"]);
    });

    it("should separate separate query types", () => {
        const path = split("((/recursive),(/tree))/**/id?:array");
        expect(path).to.deep.eq(["((/recursive),(/tree))", "**", "id?:array"]);
    });
});
