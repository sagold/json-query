import get from "./lib/get";
import set from "./lib/set";
import split from "./lib/split";
import remove from "./lib/remove";
export { get, set, split, remove };
declare const _default: {
    get: typeof get;
    set: typeof set;
    split: typeof split;
    remove: typeof remove;
};
export default _default;
export type { Input, JSONPointer, QueryResult } from "./lib/types";
