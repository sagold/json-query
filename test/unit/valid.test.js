const { expect } = require("chai");
const filter = require("../../lib/filter");
const { valid } = filter;


describe("valid", () => {

    it("should return false if query fails", () => {
        let is_valid = valid({}, "type:var");

        expect(is_valid).to.be.false;
    });

    it("should return true if query is missing", () => {
        let is_valid = valid({});

        expect(is_valid).to.be.true;
    });

    it("should return false if no data is given", () => {
        let is_valid = valid(null, "type:undefined");

        expect(is_valid).to.be.false;
    });

    it("should return true if query has matches", () => {
        let is_valid = valid({

            type: true

        }, "type:true");

        expect(is_valid).to.be.true;
    });

    it("should match booleans", () => {
        let is_valid = valid({

            type: false

        }, "type:false");

        expect(is_valid).to.be.true;
    });

    it("should tests multiple properties", () => {
        let is_valid = valid({

            type: "var",
            init: false

        }, "type:var&&init:false");

        expect(is_valid).to.be.true;
    });

    it("should test for null", () => {
        let is_valid = valid({

            type: null

        }, "type:null");

        expect(is_valid).to.be.true;
    });

    it("should negate comparison on leading !", () => {
        let is_valid = valid({

            type: true,
            init: false

        }, "init:!true&&type:!funny");

        expect(is_valid).to.be.true;
    });

    it("should fail on negated comparison", () => {
        let is_valid = valid({

            type: true

        }, "type:!true");

        expect(is_valid).to.be.false;
    });

    it("should return false if a single match fails", () => {
        let is_valid = valid({

            type: "var",
            init: false

        }, "type:var&&init:false&&init:!false");

        expect(is_valid).to.be.false;
    });

    it("should validate undefined", () => {
        let is_valid = valid({}, "init:undefined");

        expect(is_valid).to.be.true;
    });

    it("should support or operator", () => {
        let is_valid = valid({

            value: true

        }, "value:false||init:undefined||init:!undefined");

        expect(is_valid).to.be.true;
    });
});
