import { parse } from "./parser";
import { run, VALUE_INDEX, POINTER_INDEX } from "./interpreter";
import { Input } from "./types";


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

export enum ReturnType {
    POINTER = "pointer",
    VALUE = "value",
    ALL = "all",
    MAP = "map"
}

export default function get(data: Input, queryString: string, returnType: ReturnType|Function = ReturnType.VALUE) {
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
        return result.map(r => returnType(...r));
    } else if (returnTypes[returnType]) {
        return returnTypes[returnType](result);
    }

    return result;
}
