const { expect } = require("chai");
const query = require("../../lib");


describe("queryGet", () => {

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
        let result = query.delete(data, "#/**/*/needle");

        expect(result.a.needle).to.be.undefined;
        expect(result.b.needle).to.be.undefined;
        expect(result.b.d.needle).to.be.undefined;
        expect(result.c.e.f.needle).to.be.undefined;
    });

    it("should delete any matches supporting filters", () => {
        let result = query.delete(data, "#/**/*?needle:needle");

        expect(result.a).to.be.undefined;
        expect(result.b).to.be.undefined;
        expect(result.c.e.f).to.be.undefined;
    });

    it("should also remove array indices", () => {
        let result = query.delete({ array: [1, { remove: true }, { remove: true }, 2] }, "#/array/*?remove:true");

        expect(result.array).to.have.length(2);
        expect(result.array).to.deep.equal([1, 2]);
    });
});
