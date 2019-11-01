const { propertyRegex } = require("./parser/grammar");
const split = require("./split");
const get = require("./get");


const cp = v => JSON.parse(JSON.stringify(v));
const toString = Object.prototype.toString;
const getType = v => toString.call(v).match(/\s([^\]]+)\]/).pop().toLowerCase();
const isProperty = new RegExp(`^("[^"]+"|${propertyRegex})$`);
const ignoreTypes = ["string", "number", "boolean", "null"];
const isArray = /^\[\d*\]$/;
const arrayHasIndex = /^\[(\d+)\]$/;
const isEscaped = /^".+"$/;
const isArrayProp = /(^\[\d*\]$|^\d+$)/;


function convertToIndex(index) {
    return parseInt(index.replace(/^(\[|\]$)/, ""));
}

function removeEscape(property) {
    return isEscaped.test(property) ? property.replace(/(^"|"$)/g, "") : property;
}


function insert(array, index, value) {
    if (array.length <= index) {
        array[index] = value;
    } else {
        array.splice(index, 0, value);
    }
}

function select(workingSet, query) {
    const nextSet = [];
    workingSet.forEach(d => nextSet.push(...get(d[0], query, get.ALL)));
    return nextSet;
}


function addToArray(result, index, value, force) {
    const target = result[0];

    // append?
    if (/^\[\]$/.test(index)) {
        target.push(value);
        const i = target.length - 1;
        return [target[i], i, target, `${result[3]}/${i}}`];
    }

    if (force === set.INSERT_ITEMS || (force == null && arrayHasIndex.test(index))) {
        index = convertToIndex(index);
        insert(target, index, value);
        return [target[index], index, target, `${result[3]}/${index}}`];
    }

    if (force === set.REPLACE_ITEMS || force == null) {
        index = convertToIndex(index);
        target[index] = value;
        return [target[index], index, target, `${result[3]}/${index}}`];
    }

    throw new Error(`Unknown array index '${index}' with force-option '${force}'`);
}


function create(workingSet, query, keyIsArray, force) {
    query = removeEscape(query);
    return workingSet
        .filter(o => {
            // replacing or inserting array
            if (Array.isArray(o[0]) && isArrayProp.test(query)) {
                return true;
            }
            return ignoreTypes.includes(getType(o[0][query])) === false;
        })
        .map(r => {
            const container = keyIsArray ? [] : {};
            const o = r[0];
            if (Array.isArray(o)) {
                return addToArray(r, query, container, force);
            }
            o[query] = o[query] || container;
            return [o[query], query, o, `${r[3]}/${query}`];
        });
}

set.REPLACE_ITEMS = "replace";
set.INSERT_ITEMS = "insert";


function set(data, queryString, value, force) {
    if (queryString == null) {
        return cp(data);
    }

    queryString = queryString.replace(/(\/$)/g, "");
    if (queryString === "") {
        return cp(value);
    }

    const result = cp(data);
    let workingSet = [[result, null, null, "#"]];
    const path = split(queryString);
    const property = path.pop();

    const arrayWithoutIndex = isArray.test(property) && arrayHasIndex.test(property) === false;
    if (isProperty.test(property) === false || arrayWithoutIndex) {
        throw new Error(`Unsupported query '${queryString}' ending with non-property`);
    }

    path.forEach((query, index) => {
        if (isProperty.test(query) === false) {
            workingSet = select(workingSet, query);
            return;
        }
        // process property & missing data-structure
        const nextKey = index >= path.length - 1 ? property : path[index + 1];
        const insertArray = isArrayProp.test(nextKey);
        workingSet = create(workingSet, query, insertArray, force);
    });

    workingSet.forEach(r => {
        let targetValue = value;
        if (getType(value) === "function") {
            targetValue = value(r[3], property, r[0], `${r[3]}/${property}`);
        }

        const d = r[0];
        if (Array.isArray(d)) {
            addToArray(r, property, targetValue, force);

        } else {
            const unescapedProp = removeEscape(property);
            d[unescapedProp] = targetValue;
        }
    });

    return result;
}


module.exports = set;
