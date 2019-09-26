const pointerDelete = require("gson-pointer").delete;
const removeUndefinedItems = require("gson-pointer/lib/removeUndefinedItems");
const queryGet = require("./get");

const POINTER = 3;
const PARENT = 2;


function queryDelete(obj, jsonPointer) {
    const matches = queryGet(obj, jsonPointer, queryGet.ALL);
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
