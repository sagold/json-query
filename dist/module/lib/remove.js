import { remove, removeUndefinedItems } from "gson-pointer";
import get, { ReturnType } from "./get";
import { PARENT_INDEX, POINTER_INDEX } from "./interpreter/keys";
/**
 * Runs query on input data and removes matching properties from results
 * @param data - input data
 * @param queryString - gson-query string
 * @param [returnRemoved] - if true, will returned removed properties, else input-data is removed
 */
export default function queryRemove(data, queryString, returnRemoved = false) {
    const removed = [];
    const matches = get(data, queryString, ReturnType.ALL);
    matches.forEach(function (match) {
        removed.push(match[0]);
        remove(data, match[POINTER_INDEX], true);
    });
    matches.forEach(function (match) {
        if (Array.isArray(match[PARENT_INDEX])) {
            removeUndefinedItems(match[PARENT_INDEX]);
        }
    });
    return returnRemoved ? removed : data;
}
