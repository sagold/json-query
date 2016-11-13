"use strict";


var query = require("./run");


/**
 * Returns the query results as an array
 *
 * ## return type
 *
 * - get.ALL = 'all' returns all arguments of query callback [value, key, parent, pointer]
 * - get.POINTER = 'pointer' returns only the json pointers to the targets
 * - get.VALUE = 'value' Default. Returns only the matched value
 *
 * @param  {Mixed} obj
 * @param  {Pointer} jsonPointer
 * @param  {String} type			- type of return value. Defaults to "value"
 * @return {Array} containing result in specified format
 */
function queryGet(obj, jsonPointer, type) {
    var matches = [];
    var cb = getCbFactory(type, matches);
    query(obj, jsonPointer, cb);
    return matches;
}

queryGet.ALL = "all";
queryGet.POINTER = "pointer";
queryGet.VALUE = "value";


function getCbFactory(type, matches) {
    switch (type) {
        case queryGet.ALL:
            return function cbGetAll(value, key, obj, pointer) {
                matches.push([obj[key], key, obj, pointer]);
            };

        case queryGet.POINTER:
            return function cbGetPointer(value, key, obj, pointer) {
                matches.push(pointer);
            };

        case queryGet.VALUE:
            return function cbGetValue(value, key, obj, pointer) {
                matches.push(value);
            };

        default:
            return function cbGetValue(value, key, obj, pointer) {
                matches.push(value);
            };
    }
}


module.exports = queryGet;
