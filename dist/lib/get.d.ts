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
export default function get(data: Input, queryString: string, returnType?: ReturnType | ResultCallback): any;
