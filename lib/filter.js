var o = require("gson-conform");
var common = require("./common");


var f = {
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

var selectCurly = /(\{[^}]*\})/g;
var selectPlaceholder = /§§§\d+§§§/g;
function splitQuery(value) {
    // nothing to escape
    if (value.indexOf("?") === -1 || value.indexOf("{") === -1) {
        return value.split("?", 2);
    }

    // @todo this must be simpler to solve
    var map = {};
    var temp = value.replace(selectCurly, function replace(match, group, index) {
        var id = "§§§" + index + "§§§";
        map[id] = match;
        return id;
    });
    var result = temp.split("?", 2);
    for (var i = 0; i < result.length; i += 1) {
        result[i] = result[i].replace(selectPlaceholder, function revertReplacement(match) {
            return map[match];
        });
    }
    return result;
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
        var matches = splitQuery(query);
        var propertyQuery = matches[0];
        var filterQuery = matches[1];

        var keys;
        var regex;
        if (propertyQuery === "*" || propertyQuery === "**") {
            keys = o.keys(obj);
            return keys.filter(f.queryKey(obj, filterQuery));

        } else if (common.rIsRegExp.test(propertyQuery)) {
            keys = o.keys(obj);
            regex = common.convertToRegExp(propertyQuery);
            return keys.filter(f.queryRegExp(obj, filterQuery, regex));

        } else if (obj[propertyQuery] && valid(obj[propertyQuery], filterQuery)) {
            return [propertyQuery];
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
            value = undefined; // undefined is unmappable
        } else {
            value = MAP[value] === undefined ? value : MAP[value];
        }

        // perform filter test, exception undefined is not matched for negated non-undefined values
        value = (truthy ? (value === obj[key]) : (value !== obj[key] && (obj[key] !== undefined || key === undefined)));

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
