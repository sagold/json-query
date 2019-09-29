const o = require("gson-conform");
const { parse } = require("./parser");
const { join } = require("gson-pointer");

const VALUE_INDEX = 0;
// const KEY_INDEX = 1;
// const PARENT_INDEX = 2;
const POINTER_INDEX = 3;


const expander = {
    any(node, entry) {
        const result = [];
        const value = entry[VALUE_INDEX];
        o.keys(value).forEach(prop => {
            result.push([value[prop], prop, value, join(entry[POINTER_INDEX], "" + prop)]);
        });
        return result;
    },

    all(node, entry) {
        const result = [entry];
        o.forEach(entry[VALUE_INDEX], (value, prop) => {
            const childEntry = [value, prop, entry[VALUE_INDEX], join(entry[POINTER_INDEX], prop)];
            result.push(...expander.all(node, childEntry));
        });
        return result;
    },

    regex(node, entry) {
        const result = [];
        const regex = new RegExp(node.text.replace(/(^{|}$)/g, ""));
        const value = entry[VALUE_INDEX];
        o.keys(value).forEach(prop => {
            if (regex.test(prop)) {
                result.push([value[prop], prop, value, join(entry[POINTER_INDEX], prop)]);
            }
        });
        return result;
    }
};

const resolver = {

    property: (node, entry) => {
        const prop = node.text;
        if (entry[VALUE_INDEX] && entry[VALUE_INDEX][prop] !== undefined) {
            return [
                entry[VALUE_INDEX][prop],
                prop,
                entry[VALUE_INDEX],
                join(entry[POINTER_INDEX], prop)
            ];
        }
    },
    filter: (node, entry) => {
        let valid = true;
        let or = false;
        node.children.forEach(expr => {
            if (expr.type === "expression") {
                const isValid = resolver.expression(expr, entry) !== undefined;
                valid = or === true ? (valid || isValid) : valid && isValid;
                // console.log("isValid?", isValid, or, "=>", valid);
            } else {
                or = expr.type === "orExpr";
            }
        });
        return valid ? entry : undefined;
    },
    expression: (node, entry) => {
        const prop = node.children[0].text;
        const cmp = node.children[1];
        let test = node.children[2];
        if (test) {
            test = test.text;
        }

        const value = entry[VALUE_INDEX];
        if (cmp === undefined) {
            if (value[prop] !== undefined) {
                return entry;
            }
        } else if (cmp.type === "is") {
            if ("" + value[prop] === test) {
                return entry;
            }
        } else if (cmp.type === "isnot") {
            if ("" + value[prop] !== test && value[prop] !== undefined) {
                return entry;
            }
        } else {
            throw new Error(`Unknown comparisson type ${cmp.type}`);
        }

        return undefined;
    }
}

function collect(func, input, node, pointer) {
    const result = [];
    for (let i = 0, l = input.length; i < l; i += 1) {
        result.push(...func(node, input[i], node, pointer));
    }
    return result;
}

function reduce(func, input, node, pointer) {
    const result = [];
    for (let i = 0, l = input.length; i < l; i += 1) {
        const output = func(node, input[i], pointer);
        if (output) {
            result.push(output);
        }
    }
    return result;
}

function query(data, ast, pointer) {
    let result = data;
    ast.children.forEach(node => {
        if (expander[node.type]) {
            result = collect(expander[node.type], result, node, pointer);

        } else if (resolver[node.type]) {
            result = reduce(resolver[node.type], result, node, pointer);
        } else {
            throw new Error(`Unknown resolver ${node.type}`);
        }
    });
    return result;
}

function runPatternOnce(inputSet, ast, pointer) {
    const resultingSet = [];
    let workingSet = inputSet;
    ast.children.forEach(node => {
        if (node.type === "orPattern") {
            resultingSet.push(...workingSet);
            workingSet = inputSet;
            return;
        }
        workingSet = runNode(workingSet, node, pointer);
    });
    resultingSet.push(...workingSet);
    return resultingSet;
}


function pattern(data, ast, pointer) {
    const result = [];
    const quantifier = ast.children.find(node => node.type === "quantifier");
    const iterationCount = (quantifier && quantifier.text === "+") ? Infinity : 1;
    let workingSet = data;
    let count = 0;
    while (workingSet.length > 0 && count < iterationCount) {
        workingSet = runPatternOnce(workingSet, ast, pointer);
        result.push(...workingSet);
        count += 1;
    }
    return result;
}

function skip(data, ast, pointer) {
    let result = data;
    ast.children.forEach(n => {
        result = runNode(result, n, pointer);
    });
    return result;
}

function runNode(data, ast, pointer) {
    let result;
    if (ast.type === "query") {
        result = query(data, ast, pointer);
    } else if (ast.type === "pattern") {
        result = pattern(data, ast, pointer);
    } else {
        result = skip(data, ast, pointer);
    }
    return result;
}

const returnTypes = {
    value: r => r.map(e => e[VALUE_INDEX]),
    pointer: r => r.map(e => e[POINTER_INDEX]),
    all: r => r,
    map: r => {
        const map = {};
        r.forEach(e => (map[e[POINTER_INDEX]] = e[VALUE_INDEX]));
        return map;
    }
};

Object.keys(returnTypes).forEach(prop => (get[prop.toUpperCase()] = prop));

function get(data, queryString, returnType = "value") {
    if (queryString == null) {
        return [];
    }

    queryString = queryString.replace(/(\/$)/g, "");
    if (queryString === "") {
        queryString = "#";
    }

    const ast = parse(queryString);
    if (ast == null) {
        throw new Error(`empty ast for '${queryString}'`);
    }
    if (ast.rest !== "") {
        throw new Error(`Failed parsing queryString: '...${ast.rest}'`);
    }


    const result = runNode([[data, null, null, "#"]], ast);
    if (returnTypes[returnType]) {
        return returnTypes[returnType](result);
    } else if (typeof returnType === "function") {
        return result.map(r => returnType(...r));
    }

    return result;
}


module.exports = get;
