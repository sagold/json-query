export type Input = { [p: string]: any }|Array<any>;
export type JSONPointer = string;
export type QueryResult = [any, string|null, { [p: string]: any }|Array<any>|null, JSONPointer];
