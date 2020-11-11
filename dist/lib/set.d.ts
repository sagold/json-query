import { Input } from "./types";
export declare enum InsertMode {
    REPLACE_ITEMS = "replace",
    INSERT_ITEMS = "insert"
}
declare function set<T extends Input>(data: T, queryString: string, value: any, force?: InsertMode): T;
declare namespace set {
    var REPLACE_ITEMS: string;
    var INSERT_ITEMS: string;
}
export default set;
