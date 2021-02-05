import { parse } from "./parser";
import { run, VALUE_INDEX, POINTER_INDEX } from "./interpreter";
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
export var ReturnType;
(function (ReturnType) {
    ReturnType["POINTER"] = "pointer";
    ReturnType["VALUE"] = "value";
    ReturnType["ALL"] = "all";
    ReturnType["MAP"] = "map";
})(ReturnType || (ReturnType = {}));
export default function get(data, queryString, returnType = ReturnType.VALUE) {
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
    const result = run(data, ast);
    if (typeof returnType === "function") {
        return result.map((r) => returnType(...r));
    }
    else if (returnTypes[returnType]) {
        return returnTypes[returnType](result);
    }
    return result;
}
