import { remove } from "gson-pointer";
import removeUndefinedItems from "gson-pointer/lib/removeUndefinedItems";
import get, { ReturnType } from "./get";
import { PARENT_INDEX, POINTER_INDEX } from "./interpreter/keys";


export default function queryRemove(input, jsonPointer, returnRemoved = false) {
    const removed = [];
    const matches = get(input, jsonPointer, ReturnType.ALL);
    matches.forEach(function (match) {
        removed.push(match[0]);
        remove(input, match[POINTER_INDEX], true);
    });
    matches.forEach(function (match) {
        if (Array.isArray(match[PARENT_INDEX])) {
            removeUndefinedItems(match[PARENT_INDEX]);
        }
    });
    return returnRemoved ? removed : input;
}
