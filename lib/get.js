/* eslint no-unused-vars: 0 */
const query = require("./run");


/**
 * Returns the query results as an array or object, depending on its callback
 *
 * ## return type
 *
 * - get.ALL = 'all' returns all arguments of query callback [value, key, parent, pointer]
 * - get.POINTER = 'pointer' returns only the json pointers to the targets
 * - get.VALUE = 'value' Default. Returns only the matched value
 * - get.MAP = Returns an object with all available pointers and their data, like { pointer: value }
 *
 * @param  {Mixed} obj
 * @param  {Pointer} jsonPointer
 * @param  {String} type			- type of return value. Defaults to "value"
 * @return {Array|Object} containing result in specified format
 */
function queryGet(obj, jsonPointer, type) {
    const matches = type === queryGet.MAP ? {} : [];
    const cb = getCbFactory(type, matches);
    query(obj, jsonPointer, cb);
    return matches;
}

queryGet.ALL = "all";
queryGet.MAP = "map";
queryGet.POINTER = "pointer";
queryGet.VALUE = "value";
queryGet.getCbFactory = getCbFactory;


function getCbFactory(type, matches) {
    if (typeof type === "function") {
        return function cb(value, key, obj, pointer) {
            matches.push(type(obj[key], key, obj, pointer));
        };
    }

    switch (type) {
        case queryGet.ALL:
            return function cbGetAll(value, key, obj, pointer) {
                matches.push([obj[key], key, obj, pointer]);
            };

        case queryGet.MAP:
            return function cbGetMap(value, key, obj, pointer) {
                matches[pointer] = value;
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

const run = require("./v2/run");
run.ALL = "all";
run.MAP = "map";
run.POINTER = "pointer";
run.VALUE = "value";
// run.getCbFactory = getCbFactory;

module.exports = run;
