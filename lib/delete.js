var pointerDelete = require("gson-pointer/lib/delete");
var removeUndefinedItems = require("gson-pointer/lib/removeUndefinedItems");
var queryGet = require("./get");

var POINTER = 3;
var PARENT = 2;


function queryDelete(obj, jsonPointer) {
    var matches = queryGet(obj, jsonPointer, queryGet.ALL);
    matches.forEach(function (match) {
        pointerDelete(obj, match[POINTER], true);
    });
    matches.forEach(function (match) {
        if (Array.isArray(match[PARENT])) {
            removeUndefinedItems(match[PARENT]);
        }
    });
    return obj;
}


module.exports = queryDelete;
