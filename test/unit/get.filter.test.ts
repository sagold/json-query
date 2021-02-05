/* eslint object-property-newline: "off", @typescript-eslint/ban-ts-comment: "off" */
import "mocha";
import { expect } from "chai";
import get from "../../lib/get";


describe("get.filter", () => {
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
        const result = get(obj, "*");
        expect(result.length).to.eq(4);
    });

    it("should return all elements", () => {
        const result = get(obj, "**");
        expect(result.length).to.eq(13);
    });

    it("should return selected element", () => {
        const result = get(obj, "first");
        expect(result.length).to.eq(1);
        expect(result[0]).to.eq(obj.first);
    });

    it("should return all matched elements", () => {
        const result = get(obj, "*?type:true");
        expect(result.length).to.eq(2);
        expect(result[1]).to.eq(obj.second);
    });

    it("should return object as array", () => {
        const result = get(obj, "first?type:true");
        expect(result.length).to.eq(1);
        expect(result[0]).to.eq(obj.first);
    });

    it("should return empty array if nothing found", () => {
        const result = get(obj, "*?type:false");
        expect(result.length).to.eq(0);
    });

    it("should return empty array if no selector is given", () => {
        // @ts-ignore
        const result = get(obj);
        expect(result.length).to.eq(0);
    });

    it("should return empty array if object invalid", () => {
        const result = get(null, "first?type:false");
        expect(result.length).to.eq(0);
    });

    it("should return empty array if property not found", () => {
        const result = get(obj, "first?type:false");
        expect(result.length).to.eq(0);
    });

    it("should match regex on property names", () => {
        const result = get(obj, "{ir.*}?type:true");
        expect(result.length).to.eq(1);
        expect(result[0]).to.eq(obj.first);
    });

    it("should match regex on property names, containing ?", () => {
        const result = get(obj, "{f?irst}");
        expect(result.length).to.eq(1);
        expect(result[0]).to.eq(obj.first);
    });

    it("should match regex on property names, with a present query", () => {
        const result = get(obj, "{ird?}?type:true");
        expect(result.length).to.eq(1);
        expect(result[0]).to.eq(obj.first);
    });

    it("should match all defined properties", () => {
        const result = get(obj, "*?type");
        expect(result.length).to.eq(2);
    });


    describe("test-value", () => {
        it("should treat numbers as strings", () => {
            const result = get({ a: { id: 1 }, b: { id: "1" } }, "*?id:1");
            expect(result.length).to.eq(2);
            expect(result).to.deep.equal([{ id: 1 }, { id: "1" }]);
        });

        it("should support regex test-values", () => {
            const result = get({ a: { id: "word" }, b: { id: "12" } }, "*?id:{\\d\\d}");
            expect(result.length).to.eq(1);
            expect(result).to.deep.equal([{ id: "12" }]);
        });

        it("should support json-pointer in regex", () => {
            const result = get({ a: { $ref: "#/a-target" }, b: { $ref: "#/b-target" } }, "*?$ref:{#/b-target}");
            expect(result.length).to.eq(1);
            expect(result).to.deep.equal([{ $ref: "#/b-target" }]);
        });

        it("should support json-pointer when escaped by quotes", () => {
            const result = get({ a: { $ref: "#/a-target" }, b: { $ref: "#/b-target" } }, "*?$ref:\"#/b-target\"");
            expect(result.length).to.eq(1);
            expect(result).to.deep.equal([{ $ref: "#/b-target" }]);
        });
    });


    describe("or", () => {

        it("should return both filter targets", () => {
            const result = get(obj, "#/third/*?type:inThird||type:secondInThird");
            expect(result.length).to.eq(2);
            expect(result).to.deep.equal([
                { type: "inThird" },
                { type: "secondInThird" }
            ]);
        });
    });


    describe("undefined", () => {

        it("should not match undefined properties for a negated value", () => {
            const result = get({
                a: {},
                b: { type: false },
                c: { type: true }
            }, "*?type:!true");

            expect(result.length).to.eq(1);
            expect(result[0]).to.deep.equal({ type: false });
        });

        it("should match undefined properties if explicitly stated", () => {
            const result = get({
                a: {},
                b: { type: false },
                c: { type: true }
            }, "*?type:!true||type:undefined");

            expect(result.length).to.eq(2);
            // @ts-ignore
            expect(result[0]).to.deep.equal({}, { type: false });
        });
    });


    describe("array", () => {

        it("should query * in array", () => {
            const result = get(arr, "*?type:true");
            expect(result.length).to.eq(2);
        });

        it("should return empty array for input array", () => {
            const result = get(arr, "first?type:true");
            expect(result.length).to.eq(0);
        });

        it("should return index in array", () => {
            const result = get(arr, "1");
            expect(result.length).to.eq(1);
            expect(result[0]).to.eq(arr[1]);
        });

        it("should query index in array", () => {
            const result = get(arr, "1?type:true");
            expect(result.length).to.eq(1);
            expect(result[0].id).to.eq("second");
        });
    });
});
