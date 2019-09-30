const { expect } = require("chai");
const { remove } = require("../../lib");


describe("remove", () => {

    let data;

    beforeEach(() => {
        data = {
            a: {
                id: "a",
                needle: "needle"
            },
            b: {
                id: "b",
                needle: "needle",
                d: {
                    id: "d",
                    needle: "needle"
                }
            },
            c: {
                e: {
                    f: {
                        id: "f",
                        needle: "needle"
                    }
                }
            }
        };
    });

    it("should delete any matches", () => {
        const removed = remove(data, "#/**/*/needle", true);
        expect(data.a.needle).to.be.undefined;
        expect(data.b.needle).to.be.undefined;
        expect(data.b.d.needle).to.be.undefined;
        expect(data.c.e.f.needle).to.be.undefined;
        expect(removed).to.deep.eq(["needle", "needle", "needle", "needle"]);

    });

    it("should delete any matches supporting filters", () => {
        const removed = remove(data, "#/**/*?needle:needle", true);
        expect(data.a).to.be.undefined;
        expect(data.b).to.be.undefined;
        expect(data.c.e.f).to.be.undefined;
        expect(removed).to.deep.eq([
            { id: "a", needle: "needle" },
            { id: "b", needle: "needle", d: { id: "d", needle: "needle" } },
            { id: "d", needle: "needle" },
            { id: "f", needle: "needle" }
        ]);
    });

    it("should also remove array indices", () => {
        const data = { array: [1, { remove: true }, { remove: true }, 2] };
        const result = remove(data, "#/array/*?remove:true");
        expect(result.array).to.have.length(2);
        expect(result.array).to.deep.equal([1, 2]);
    });
});
