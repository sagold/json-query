const pointerDelete = require("gson-pointer").delete;
const removeUndefinedItems = require("gson-pointer/lib/removeUndefinedItems");
const run = require("./get");
const { PARENT_INDEX, POINTER_INDEX } = require("./interpreter/keys");


function queryDelete(input, jsonPointer, returnRemoved = false) {
    const removed = [];
    const matches = run(input, jsonPointer, "all");
    matches.forEach(function (match) {
        removed.push(match[0]);
        pointerDelete(input, match[POINTER_INDEX], true);
    });
    matches.forEach(function (match) {
        if (Array.isArray(match[PARENT_INDEX])) {
            removeUndefinedItems(match[PARENT_INDEX]);
        }
    });
    return returnRemoved ? removed : input;
}


module.exports = queryDelete;
