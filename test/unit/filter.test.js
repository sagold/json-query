/* eslint object-property-newline: 0 */
const { expect } = require("chai");
const query = require("../../lib");
const { filter } = query;


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
        var result = filter.values(obj, "*");

        expect(result.length).to.eq(4);
    });

    it("should return all elements", () => {
        var result = filter.values(obj, "**");

        expect(result.length).to.eq(4);
    });

    it("should return selected element", () => {
        var result = filter.values(obj, "first");

        expect(result.length).to.eq(1);
        expect(result[0]).to.eq(obj.first);
    });

    it("should return all matched elements", () => {
        var result = filter.values(obj, "*?type:true");

        expect(result.length).to.eq(2);
        expect(result[1]).to.eq(obj.second);
    });

    it("should return object as array", () => {
        var result = filter.values(obj, "first?type:true");

        expect(result.length).to.eq(1);
        expect(result[0]).to.eq(obj.first);
    });

    it("should return empty array if nothing found", () => {
        var result = filter.values(obj, "*?type:false");

        expect(result.length).to.eq(0);
    });

    it("should return empty array if no selector", () => {
        var result = filter.values(obj);

        expect(result.length).to.eq(0);
    });

    it("should return empty array if object invalid", () => {
        var result = filter.values(null, "first?type:false");

        expect(result.length).to.eq(0);
    });

    it("should return empty array if property not found", () => {
        var result = filter.values(obj, "first?type:false");

        expect(result.length).to.eq(0);
    });

    it("should match regex on property names", () => {
        var result = filter.values(obj, "{ir.*}?type:true");

        expect(result.length).to.eq(1);
        expect(result[0]).to.eq(obj.first);
    });

    it("should match regex on property names, containing ?", () => {
        var result = filter.values(obj, "{f?irst}");

        expect(result.length).to.eq(1);
        expect(result[0]).to.eq(obj.first);
    });

    it("should match regex on property names, with a present query", () => {
        var result = filter.values(obj, "{ird?}?type:true");
        expect(result.length).to.eq(1);
        expect(result[0]).to.eq(obj.first);
    });

    it("should match all defined properties", () => {
        var result = filter.values(obj, "*?type");

        expect(result.length).to.eq(2);
    });

    describe("undefined", () => {

        it("should not match undefined properties for a negated value", () => {
            var result = filter.values({
                a: {},
                b: { type: false },
                c: { type: true }
            }, "*?type:!true");

            expect(result.length).to.eq(1);
            expect(result[0]).to.deep.equal({ type: false });
        });

        it("should match undefined properties if explicitly stated", () => {
            var result = filter.values({
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
            var result = filter.values(arr, "*?type:true");

            expect(result.length).to.eq(2);
        });

        it("should return empty array for input array", () => {
            var result = filter.values(arr, "first?type:true");

            expect(result.length).to.eq(0);
        });

        it("should return index in array", () => {
            var result = filter.values(arr, "1");

            expect(result.length).to.eq(1);
            expect(result[0]).to.eq(arr[1]);
        });

        it("should query index in array", () => {
            var result = filter.values(arr, "1?type:true");

            expect(result.length).to.eq(1);
            expect(result[0].id).to.eq("second");
        });
    });
});
