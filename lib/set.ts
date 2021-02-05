import { propertyRegex } from "./parser/grammar";
import { Input, QueryResult } from "./types";
import split from "./split";
import get, { ReturnType } from "./get";

const cp = <T>(v:T):T => JSON.parse(JSON.stringify(v));
const toString = Object.prototype.toString;
const getType = v => toString.call(v).match(/\s([^\]]+)\]/).pop().toLowerCase();
const isProperty = new RegExp(`^("[^"]+"|${propertyRegex})$`);
const ignoreTypes = ["string", "number", "boolean", "null"];
const isArray = /^\[\d*\]$/;
const arrayHasIndex = /^\[(\d+)\]$/;
const isEscaped = /^".+"$/;
const isArrayProp = /(^\[\d*\]$|^\d+$)/;


type WorkingSet = Array<QueryResult>;


function convertToIndex(index: string): number {
    return parseInt(index.replace(/^(\[|\]$)/, ""));
}

function removeEscape(property: string): string {
    return isEscaped.test(property) ? property.replace(/(^"|"$)/g, "") : property;
}

function insert(array: Array<any>, index: number, value: any) {
    if (array.length <= index) {
        array[index] = value;
    } else {
        array.splice(index, 0, value);
    }
}

function select<T extends WorkingSet>(workingSet: T, query: string): T {
    const nextSet = [] as T;
    workingSet.forEach(d => nextSet.push(...get(d[0], query, ReturnType.ALL)));
    return nextSet;
}

function addToArray(result: QueryResult, index: string, value: any, force?: InsertMode) {
    const target = result[0];

    // append?
    if (/^\[\]$/.test(index)) {
        target.push(value);
        const i = target.length - 1;
        return [target[i], i, target, `${result[3]}/${i}}`];
    }

    // MERGE_ITEMS?
    if (force == null && getType(target[index]) === "object" && getType(value) === "object") {
        return [target[index], index, target, `${result[3]}/${index}}`];
    }

    if (force === set.INSERT_ITEMS || (force == null && arrayHasIndex.test(index))) {
        const arrayIndex = convertToIndex(index);
        insert(target, arrayIndex, value);
        return [target[arrayIndex], arrayIndex, target, `${result[3]}/${arrayIndex}}`];
    }

    if (force === set.REPLACE_ITEMS || force == null) {
        const arrayIndex = convertToIndex(index);
        target[arrayIndex] = value;
        return [target[arrayIndex], arrayIndex, target, `${result[3]}/${arrayIndex}}`];
    }

    throw new Error(`Unknown array index '${index}' with force-option '${force}'`);
}


function create<T extends WorkingSet>(workingSet: T, query: string, keyIsArray: boolean, force?: InsertMode): T {
    query = removeEscape(query);
    return workingSet
        .filter((o: QueryResult) => {
            // replacing or inserting array
            if (Array.isArray(o[0]) && isArrayProp.test(query)) {
                return true;
            }
            return ignoreTypes.includes(getType(o[0][query])) === false;
        })
        .map((r: QueryResult) => {
            const container = keyIsArray ? [] : {};
            const o = r[0];
            if (Array.isArray(o)) {
                return addToArray(r, query, container, force);
            }
            o[query] = o[query] || container;
            return [o[query], query, o, `${r[3]}/${query}`];
        }) as T;
}


export enum InsertMode {
    REPLACE_ITEMS = "replace",
    INSERT_ITEMS = "insert"
}


// for all array-indices within path, replace the values, ignoring insertion syntax /[1]/
set.REPLACE_ITEMS = InsertMode.REPLACE_ITEMS;
// for all array-indices within path, insert the values, ignoring replace syntax /1/
set.INSERT_ITEMS = InsertMode.INSERT_ITEMS;
// set.MERGE_ITEMS = "merge";


/**
 * Runs query on input data and assigns a value to query-results.
 * @param data - input data
 * @param queryString - gson-query string
 * @param value - value to assign
 * @param [force] - whether to replace or insert into arrays
 */
export default function set<T extends Input>(data: T, queryString: string, value: any, force?: InsertMode): T {
    if (queryString == null) {
        return cp(data);
    }

    queryString = queryString.replace(/(\/$)/g, "");
    if (queryString === "") {
        return cp(value);
    }

    const result = cp(data);
    let workingSet: WorkingSet = [[result, null, null, "#"]];
    const path = split(queryString);
    const property = path.pop();

    const arrayWithoutIndex = isArray.test(property) && arrayHasIndex.test(property) === false;
    if (isProperty.test(property) === false || arrayWithoutIndex) {
        throw new Error(`Unsupported query '${queryString}' ending with non-property`);
    }

    path.forEach((query: string, index: number) => {
        if ("__proto__" === query || "prototyped" === query || "constructor" === query) {
            return;
        }
        if (isProperty.test(query) === false) {
            workingSet = select(workingSet, query);
            return;
        }
        // process property & missing data-structure
        const nextKey = index >= path.length - 1 ? property : path[index + 1];
        const insertArray = isArrayProp.test(nextKey);
        workingSet = create(workingSet, query, insertArray, force);
    });

    workingSet.forEach((r: QueryResult) => {
        let targetValue = value;
        if (getType(value) === "function") {
            targetValue = value(r[3], property, r[0], `${r[3]}/${property}`);
        }

        const d = r[0];
        if (Array.isArray(d)) {
            addToArray(r, property, targetValue, force);

        } else {
            const unescapedProp = removeEscape(property);
            if ("__proto__" === unescapedProp || "prototyped" === unescapedProp || "constructor" === unescapedProp) {
                return;
            }
            d[unescapedProp] = targetValue;
        }
    });

    return result;
}
