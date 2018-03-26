const { expect } = require("chai");
const query = require("../../lib");


describe("query.get", () => {

    let data = {
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

    it("should return empty array", () => {
        let result = query.get({}, "#/**/*?needle:needle");

        expect(result).to.be.an("array");
        expect(result).to.have.length(0);
    });

    it("should return all queried values in array", () => {
        let result = query.get(data, "#/**/*?needle:needle");

        expect(result).to.have.length(4);
        expect(result).to.contain(data.a, data.b, data.b.d, data.c.e.f);
    });

    it("should return all queried pointers in array", () => {
        let result = query.get(data, "#/**/*?needle:needle", query.get.POINTER);

        expect(result).to.have.length(4);
        expect(result).to.contain("#/a", "#/b", "#/b/d", "#/c/e/f");
    });

    it("should return all queried values in array", () => {
        let result = query.get(data, "#/**/*/id", query.get.VALUE);

        expect(result).to.have.length(4);
        expect(result).to.contain("a", "b", "d", "f");
    });

    it("should return an object that maps pointers to their respective value", () => {
        let result = query.get(data, "#/**/*?needle:needle", query.get.MAP);

        expect(result).to.be.an("object");
        expect(result).to.deep.equal({
            "#/a": data.a,
            "#/b": data.b,
            "#/b/d": data.b.d,
            "#/c/e/f": data.c.e.f
        });
    });

    it("should return custom functions return values", () => {
        let result = query.get(data, "#/**/*?needle:needle", function cb(val, key, parent, pointer) {
            return `custom-${pointer}`;
        });

        expect(result).to.have.length(4);
        expect(result).to.contain("custom-#/a", "custom-#/b", "custom-#/b/d", "custom-#/c/e/f");
    });
});
