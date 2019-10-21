/* eslint object-property-newline: 0 */
const { expect } = require("chai");
const set = require("../../lib/set");
// const { parse } = require("../../lib/parser");


describe("set", () => {

    it("should set value to property", () => {
        const result = set({ value: 11 }, "/value", 9);

        expect(result).to.eq(9);
    });

    it("should create objects from path", () => {
        const result = set({}, "/outer/inner/value", 9);

        expect(result).to.deep.eq({ outer: { inner: { value: 9 } }});
    });

    it("should not replace inner objects on its path", () => {
        const result = set({ outer: { side: true } }, "/outer/inner/value", 9);

        expect(result).to.deep.eq({ outer: { side: true, inner: { value: 9 } }});
    });
});
