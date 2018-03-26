var o = require("gson-conform");
var common = require("./common");


var f = {
    query: function (query) {
        return function (item) {
            return valid(item, query);
        };
    },
    queryKey: function (obj, query) {
        return function (key) {
            return valid(obj[key], query);
        };
    },
    queryRegExp: function (obj, query, regex) {
        return function (key) {
            return regex.test(key) ? valid(obj[key], query) : false;
        };
    }
};

var MAP = {
    "false": false,
    "true": true,
    "null": null
};


/**
 * Filter properties by query: select|if:property
 *
 * @param  {Object|Array} obj
 * @param  {String} query key:value pairs separated by &
 * @return {Array} values matching the given query
 */
function filterValues(obj, query) {
    return filterKeys(obj, query).map(function (key) {
        return obj[key];
    });
}

/**
 * Filter properties by query: select|if:property
 *
 * @param  {Object|Array} obj
 * @param  {String} query key:value pairs separated by &
 * @return {Array} object keys matching the given query
 */
function filterKeys(obj, query) {
    if (obj && query) {
        var matches = query.split("?", 2);
        var keys;
        var regex;
        if (matches[0] === "*" || matches[0] === "**") {
            keys = o.keys(obj);
            return keys.filter(f.queryKey(obj, matches[1]));

        } else if (common.rIsRegExp.test(matches[0])) {
            keys = o.keys(obj);
            regex = common.convertToRegExp(matches[0]);
            return keys.filter(f.queryRegExp(obj, matches[1], regex));

        } else if (obj[matches[0]] && valid(obj[matches[0]], matches[1])) {
            return [matches[0]];
        }
    }
    return [];
}


/**
 * Returns true if the query matches. Query: key:value&key:value
 * @param  {Object|Array} obj
 * @param  {String} query key:value pairs separated by &
 * @return {Boolean} if query matched object
 */
function valid(obj, query) {
    if (!query) {
        return true;
    }
    if (!obj) {
        return false;
    }

    var key;
    var value;
    var isValid = true;
    var truthy;

    var tests = query
        .replace(/(&&)/g, "§$1§")
        .replace(/(\|\|)/g, "§$1§")
        .split("§");

    var or = false;
    for (var i = 0, l = tests.length; i < l; i += 2) {
        if (tests[i].indexOf(":!") > -1) {
            truthy = false;
            value = tests[i].split(":!");

        } else if (tests[i].indexOf(":") === -1) {
            truthy = false;
            value = [tests[i], undefined];

        } else {
            truthy = true;
            value = tests[i].split(":");
        }

        key = value[0];
        value = value[1];

        if (value === "undefined") {
            // undefined is unmappable
            value = undefined;

        } else {
            value = MAP[value] === undefined ? value : MAP[value];
        }

        value = (truthy ? (value === obj[key]) : (value !== obj[key]));

        if (or) {
            isValid = isValid || value;
        } else {
            isValid = isValid && value;
        }

        or = tests[i + 1] === "||";
    }

    return isValid;
}


exports.values = filterValues;
exports.keys = filterKeys;
exports.valid = valid;
