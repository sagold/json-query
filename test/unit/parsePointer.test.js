/* eslint no-useless-escape: 0 */
const { expect } = require("chai");
const { parsePointer } = require("../../lib/common");


describe("parsePointer", () => {

    it("should split pointer to properties", () => {

        let properties = parsePointer("#/root/parent/target");

        expect(properties.length).to.eq(3);
        expect(properties[0]).to.eq("root");
    });

    it("should not split / within {}", () => {
        let properties = parsePointer("#/root/to/{par\/ent}/{tar\/get}/value");

        expect(properties.length).to.eq(5);
        expect(properties[0]).to.eq("root");
        expect(properties[4]).to.eq("value");
    });

    it("should not split on / if only one property is given", () => {
        let properties = parsePointer("#/{par\/ent}");

        expect(properties.length).to.eq(1);
    });
});
