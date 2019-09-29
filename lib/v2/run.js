const o = require("gson-conform");
const { parse } = require("../parser");
const { join } = require("gson-pointer");

const VALUE_INDEX = 0;
const KEY_INDEX = 1;
const PARENT_INDEX = 2;
const POINTER_INDEX = 3;


const mapValue = {
    "false": false,
    "true": true,
    "null": null
};

const resolver = {
    any: (node, data) => {
        const result = [];
        for (let i = 0, l = data.length; i < l; i += 1) {
            const entry = data[i];
            const value = entry[VALUE_INDEX];
            o.keys(value).forEach(prop => {
                result.push([value[prop], prop, value, join(entry[POINTER_INDEX], "" + prop)]);
            });
        }
        return result;
    },
    all: (node, data) => {
        const result = [];
        for (let i = 0, l = data.length; i < l; i += 1) {
            const entry = data[i];
            result.push(entry);
            o.forEach(entry[VALUE_INDEX], (value, prop) => {
                const childEntry = [value, prop, entry[VALUE_INDEX], join(entry[POINTER_INDEX], prop)];
                result.push(...resolver.all(node, [childEntry]));
            });
        }
        return result;
    },
    property: (node, data) => {
        const prop = node.text;
        const result = [];
        for (let i = 0, l = data.length; i < l; i += 1) {
            const entry = data[i];
            if (entry[VALUE_INDEX] && entry[VALUE_INDEX][prop] !== undefined) {
                result.push([
                    entry[VALUE_INDEX][prop],
                    prop,
                    entry[VALUE_INDEX],
                    join(entry[POINTER_INDEX], prop)
                ]);
            }
        }
        return result;
    },
    regex: (node, data) => {
        const regex = new RegExp(node.text.replace(/(^{|}$)/g, ""));
        const result = [];
        for (let i = 0, l = data.length; i < l; i += 1) {
            const entry = data[i];
            const value = entry[VALUE_INDEX];
            o.keys(value).forEach(prop => {
                if (regex.test(prop)) {
                    result.push([value[prop], prop, value, join(entry[POINTER_INDEX], prop)]);
                }
            });
        }
        return result;
    },
    filter: (node, data) => {
        let result = data;
        node.children.forEach(expr => {
            result = resolver.expression(expr, data);
        });
        return result;
    },
    expression: (node, data) => {
        const prop = node.children[0].text;
        const cmp = node.children[1];
        let test = node.children[2];
        if (test) {
            test = mapValue[test.text] === undefined ? test.text : mapValue[test.text];
            if (test === "undefined") {
                test = undefined;
            }
        }

        let result = [];
        for (let i = 0, l = data.length; i < l; i += 1) {
            const entry = data[i];
            const value = entry[VALUE_INDEX];
            if (cmp === null) {
                if (value[prop] !== undefined) {
                    result.push(entry);
                }
            } else if (cmp.type === "is") {
                if (value[prop] === test) {
                    result.push(entry);
                }
            } else if (cmp.type === "isnot") {
                if (value[prop] !== test) {
                    result.push(entry);
                }
            } else {
                console.log("Unknown comparisson type", cmp.type);
            }
        }

        return result;
    }
}

function query(data, ast, pointer) {
    let result = data;
    ast.children.forEach(node => {
        if (resolver[node.type]) {
            result = resolver[node.type](node, result);
            // console.log("query resolved", node.text, "->", result);
        } else {
            console.log("unknown resolver", node.type);
        }
    });
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
    } else {
        result = skip(data, ast, pointer);
    }
    return result;
}


module.exports = function run(data, queryString, cb) {
    const ast = parse(queryString);
    const result = runNode([[data, null, null, "#"]], ast);
    result.forEach(e => cb(...e));
    return result;
}
