const filter = require("./filter");
const { parsePointer } = require("./common");
// @note gson-pointer: only strings are valid pointer properties to join. Ensure key is a string (could be index)
const { join } = require("gson-pointer");


/**
 * callback for each match of json-glob-pointer
 *
 * @param  {Any} obj
 * @param  {String} jsonPointer - function (value, key, parentObject, pointerToValue)
 * @param  {Function} cb
 */
function queryRun(obj, jsonPointer, cb) {
    if (/^#?\/?$/.test(jsonPointer)) {
        cb(obj, null, null, "#");
        return;
    }

    // get steps into obj
    const steps = parsePointer(jsonPointer);
    // cleanup first and last
    if (steps[0] === "") {
        // @todo due to pointer cleanup, this is probably never called
        steps.shift();
    }
    if (steps[steps.length - 1] === "") {
        steps.length -= 1;
    }

    _query(obj, steps, cb, "#");
}


function cbPassAll(obj, cb, pointer) {
    return function (key) {
        cb(obj[key], key, obj, join(pointer, String(key)));
    };
}


function _query(obj, steps, cb, pointer) {
    let matches;
    const query = steps.shift();

    if (steps.length === 0) {
        // get keys matching the query and call back
        matches = filter.keys(obj, query);
        matches.forEach(cbPassAll(obj, cb, pointer));

    } else if (/^\*\*/.test(query)) {
        // run next query on current object
        _query(obj, steps.slice(0), cb, pointer);

    } else {
        matches = filter.keys(obj, query);
        matches.forEach(function (key) {
            _query(obj[key], steps.slice(0), cb, join(pointer, String(key)));
        });
    }

    if (/^\*\*/.test(query)) {
        // match this query (**) again
        steps.unshift(query);
        matches = filter.keys(obj, query);
        matches.forEach(function (key) {
            _query(obj[key], steps.slice(0), cb, join(pointer, String(key)));
        });
    }
}


module.exports = queryRun;
