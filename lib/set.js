const { parse } = require("./parser");
const { run, VALUE_INDEX, POINTER_INDEX } = require("./interpreter");


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

Object.keys(returnTypes).forEach(prop => (set[prop.toUpperCase()] = prop));

function set(data, queryString, returnType = "value") {
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
        throw new Error(`Failed parsing queryString from: '${ast.rest}'`);
    }


    // const result = run(data, ast);
    // if (returnTypes[returnType]) {
    //     return returnTypes[returnType](result);
    // } else if (typeof returnType === "function") {
    //     return result.map(r => returnType(...r));
    // }

    return result;
}


module.exports = set;
