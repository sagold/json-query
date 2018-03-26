"use strict";


var expect = require("chai").expect;
var q = require("../../lib");


describe("query", function () {

    describe("readme-examples", function () {

        var cbMock;

        beforeEach(function () {

            cbMock = function cbMock() {
                cbMock.args.push(arguments);
                cbMock.called = true;
            };

            cbMock.called = false;
            cbMock.args = [];
        });

        it("should callback on 'child' ids", function () {
            var data = {
                "parent": {
                    "child": {"id": "child-1"}
                },
                "neighbour": {
                    "child": {"id": "child-2"}
                }
            };

            q.run(data, "#/*/child/id", cbMock);

            expect(cbMock.called).to.be.true;
            expect(cbMock.args.length).to.eq(2);
            expect(cbMock.args[0][0]).to.eq("child-1");
            expect(cbMock.args[1][0]).to.eq("child-2");
        });

        it("should callback on each objects id property", function () {
            var data = {
                "parent": {
                    "child": {"id": "child-1"}
                },
                "neighbour": {
                    "child": {"id": "child-2"}
                }
            };

            q.run(data, "#/**/id", cbMock);

            expect(cbMock.called).to.be.true;
            expect(cbMock.args.length).to.eq(2);
            expect(cbMock.args[0][0]).to.eq("child-1");
            expect(cbMock.args[1][0]).to.eq("child-2");
        });

        it("should callback on valid elements only", function () {
            var data = {
                "parent": {
                    "valid": true,
                    "child": {"id": "child-1"}
                },
                "neighbour": {
                    "valid": false,
                    "child": {"id": "child-2"}
                }
            };

            q.run(data, "#/**?valid:true&&ignore:undefined/child", cbMock);
            expect(cbMock.called).to.be.true;
            expect(cbMock.args.length).to.eq(1);
            expect(cbMock.args[0][0]).to.eq(data.parent.child);
        });

        it("should callback on regex and filters combined", function () {
            var data = {
                "albert": {valid: true},
                "alfred": {valid: false},
                "alfons": {valid: true}
            };

            q.run(data, "#/{al[^b]}?valid:true", cbMock);

            expect(cbMock.called).to.be.true;
            expect(cbMock.args.length).to.eq(1);
            expect(cbMock.args[0][3]).to.eq("#/alfons");
        });
    });
});
