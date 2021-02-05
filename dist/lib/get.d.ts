import { Input, JSONPointer } from "./types";
export declare enum ReturnType {
    POINTER = "pointer",
    VALUE = "value",
    ALL = "all",
    MAP = "map"
}
export declare type ResultCallback = (value: any, property: string | null, parent: {
    [p: string]: any;
} | Array<any> | null, pointer: JSONPointer) => any;
/**
 * Runs query on input data and returns the results
 * @param data - input data
 * @param queryString - gson-query string
 * @param returnType - result format or a custom callback
 */
declare function get(data: Input, queryString: string, returnType?: ReturnType | ResultCallback): any;
declare namespace get {
    var POINTER: ReturnType;
    var VALUE: ReturnType;
    var ALL: ReturnType;
    var MAP: ReturnType;
}
export default get;
