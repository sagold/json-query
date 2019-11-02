/* eslint no-unused-vars: 0 */
import { get, set, split, remove } from "../lib";
import { default as queryGet } from "../lib/get";

let result;

result = get({}, "/path/*/id");
result = get({}, "/path/*/id", "pointer");
// result = get({}, "/path/*/id", "invalid");
const getPointerResult = get({}, "/path/*/id", get.POINTER);
const getValueResult = get({}, "/path/*/id", get.VALUE);
const getAllResult = get({}, "/path/*/id", get.ALL);
const getObjResult = get({}, "/path/*/id", get.MAP);
result = get({}, "/path/*/id", (value, prop, parent, pointer) => pointer);
// errors
result = get({});
result = get();
result = get(null, "");

result = set({}, "/path/[1]/item", 42);
result = set({ with: { data: true } }, "/path/[1]/item", 42);
result = set({ with: { data: true } }, "/path/[1]/item", 42, "insert");
result = set({ with: { data: true } }, "/path/[1]/item", 42, set.REPLACE_ITEMS);
result = set({ with: { data: true } }, "/path/[1]/item", (pptr, prop, pobj, pointer) => {});
// errors
result = set({});
result = set();
result = set(null, "", 42);

const splitResult = split("(/a/b)+");

const removeResult = remove([], "/a/b/*/d");
// errors
result = remove(undefined, "/a/b/*/d");
result = remove(false, "/a/b/*/d");


// direct imports
queryGet({}, "**?id:true");



