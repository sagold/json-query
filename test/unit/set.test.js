/* eslint object-property-newline: 0 */
const { expect } = require("chai");
const set = require("../../lib/set");


describe("set", () => {
    // should return data on empty string
    // should return value for root pointer

    it("should set value to property", () => {
        const result = set({ value: 11 }, "/value", 9);
        expect(result).to.deep.eq({ value: 9 });
    });

    it("should create objects from path", () => {
        const result = set({}, "/outer/inner/value", 9);
        expect(result).to.deep.eq({ outer: { inner: { value: 9 } }});
    });

    it("should not replace inner objects on its path", () => {
        const result = set({ outer: { side: true } }, "/outer/inner/value", 9);
        expect(result).to.deep.eq({ outer: { side: true, inner: { value: 9 } }});
    });


    describe("array", () => {

        it("should create array and append item", () => {
            const result = set({}, "/outer[]/[]/value", 9);
            expect(result).to.deep.eq({ outer: [{ value: 9 }] });
        });

        it("should create array based on array indicator", () => {
            const result = set({}, "/outer[]/1/value", 9);
            expect(result).to.deep.eq({ outer: [undefined, { value: 9 }] });
        });

        it("should create array based on index-property", () => {
            const result = set({}, "/outer/[1]/value", 9);
            expect(result).to.deep.eq({ outer: [undefined, { value: 9 }] });
        });

        it("should insert array item based on index", () => {
            const result = set({ outer: ["first"]}, "/outer/[0]/value", 9);
            expect(result).to.deep.eq({ outer: [{ value: 9 }, "first"] });
        });
    });


    describe("queries", () => {

        it("should throw if last property (target) is a non-property", () => {
            expect(() => set(
                { list: [{ id: 1 }] },
                "/list/*", "title"
            )).to.throw(Error);
        });

        it("should select valid targets for glob-pattern", () => {
            const result = set({
                first: {},
                second: {}
            }, "/*/title", "title");

            expect(result).to.deep.eq({
                first: { title: "title" },
                second: { title: "title" }
            });
        });

        it("should select valid targets for query-pattern", () => {
            const result = set({
                first: { id: 1 },
                second: { id: 2 }
            }, "/*?id:1/title", "title");

            expect(result).to.deep.eq({
                first: { id: 1, title: "title" },
                second: { id: 2 }
            });
        });

        it("should recursively select pattern results", () => {
            const result = set({
                a: {
                    a: {}
                }
            }, "(/a)+/title", "title");

            expect(result).to.deep.eq({
                a: {
                    title: "title",
                    a: { title: "title" }
                }
            });
        });
    });
});
