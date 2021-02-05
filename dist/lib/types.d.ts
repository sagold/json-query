export declare type Input = {
    [p: string]: any;
} | Array<any>;
export declare type JSONPointer = string;
export declare type QueryResult = [any, string | null, {
    [p: string]: any;
} | Array<any> | null, JSONPointer];
