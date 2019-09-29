/* eslint object-property-newline: 0 */
const { expect } = require("chai");
// const query = require("../../lib");
// const { filter } = query;
const run = require("../../lib/v2/run");
const filter = { values: (data, query) => run(data, query).map(r => r[0]) };


describe("filter", () => {

    let obj;
    let arr;

    beforeEach(() => {

        obj = {
            first: { type: true },
            second: { type: true },
            third: [
                { type: "inThird" },
                { type: "secondInThird" },
                { type: null }
            ],
            id: "obj"
        };

        arr = [
            { id: "first", type: true },
            { id: "second", type: true },
            {
                id: "third",
                values: [
                    { type: "inThird" },
                    { type: "secondInThird" }
                ]
            }
        ];
    });

    it("should return all direct elements", () => {
        const result = filter.values(obj, "*");

        expect(result.length).to.eq(4);
    });

    // changed and runs on all data
    it.skip("should return all elements", () => {
        const result = filter.values(obj, "**");

        expect(result.length).to.eq(4);
    });

    it("should return selected element", () => {
        const result = filter.values(obj, "first");

        expect(result.length).to.eq(1);
        expect(result[0]).to.eq(obj.first);
    });

    it("should return all matched elements", () => {
        const result = filter.values(obj, "*?type:true");

        expect(result.length).to.eq(2);
        expect(result[1]).to.eq(obj.second);
    });

    it("should return object as array", () => {
        const result = filter.values(obj, "first?type:true");

        expect(result.length).to.eq(1);
        expect(result[0]).to.eq(obj.first);
    });

    it("should return empty array if nothing found", () => {
        const result = filter.values(obj, "*?type:false");

        expect(result.length).to.eq(0);
    });

    it("should return empty array if no selector", () => {
        const result = filter.values(obj);

        expect(result.length).to.eq(0);
    });

    it("should return empty array if object invalid", () => {
        const result = filter.values(null, "first?type:false");

        expect(result.length).to.eq(0);
    });

    it("should return empty array if property not found", () => {
        const result = filter.values(obj, "first?type:false");

        expect(result.length).to.eq(0);
    });

    it("should match regex on property names", () => {
        const result = filter.values(obj, "{ir.*}?type:true");

        expect(result.length).to.eq(1);
        expect(result[0]).to.eq(obj.first);
    });

    it("should match regex on property names, containing ?", () => {
        const result = filter.values(obj, "{f?irst}");

        expect(result.length).to.eq(1);
        expect(result[0]).to.eq(obj.first);
    });

    it("should match regex on property names, with a present query", () => {
        const result = filter.values(obj, "{ird?}?type:true");
        expect(result.length).to.eq(1);
        expect(result[0]).to.eq(obj.first);
    });

    it("should match all defined properties", () => {
        const result = filter.values(obj, "*?type");

        expect(result.length).to.eq(2);
    });

    it("should treat numbers as strings", () => {
        const result = filter.values({ a: { id: 1 }, b: { id: "1" } }, "*?id:1");

        expect(result.length).to.eq(2);
        expect(result).to.deep.equal([{ id: 1 }, { id: "1" }]);
    });

    describe.skip("or", () => {

        it("should return both filter targets", () => {
            const result = filter.values(obj, "#/third/*?type:inThird||type:secondInThird");

            expect(result.length).to.eq(2);
            expect(result).to.deep.equal([
                { type: "inThird" },
                { type: "secondInThird" }
            ]);
        });
    });


    describe("undefined", () => {

        it("should not match undefined properties for a negated value", () => {
            const result = filter.values({
                a: {},
                b: { type: false },
                c: { type: true }
            }, "*?type:!true");

            expect(result.length).to.eq(1);
            expect(result[0]).to.deep.equal({ type: false });
        });

        it("should match undefined properties if explicitly stated", () => {
            const result = filter.values({
                a: {},
                b: { type: false },
                c: { type: true }
            }, "*?type:!true||type:undefined");

            expect(result.length).to.eq(2);
            expect(result[0]).to.deep.equal({}, { type: false });
        });
    });

    describe("on array", () => {

        it("should query * in array", () => {
            const result = filter.values(arr, "*?type:true");

            expect(result.length).to.eq(2);
        });

        it("should return empty array for input array", () => {
            const result = filter.values(arr, "first?type:true");

            expect(result.length).to.eq(0);
        });

        it("should return index in array", () => {
            const result = filter.values(arr, "1");

            expect(result.length).to.eq(1);
            expect(result[0]).to.eq(arr[1]);
        });

        it("should query index in array", () => {
            const result = filter.values(arr, "1?type:true");

            expect(result.length).to.eq(1);
            expect(result[0].id).to.eq("second");
        });
    });
});
