// REFERENCES
// - https://github.com/MithrilJS/mithril.d.ts
// - https://github.com/MithrilJS/mithril.d.ts/blob/master/index.d.ts

// @todo namespace is optional
declare namespace GsonQuery {

    type JSONPointer = string;
    type Query = string;
    type QueryResult = [any, string, any, JSONPointer];
    type InputData = Object|Array<any>;

    export function QueryCallback(value: any, property: string, parent: any, pointer: JSONPointer): any;
    // interface QueryCallback {
    //     /** called for each result */
    //     (value: any, property: string, parent: any, pointer: JSONPointer): any;
    // }

    /**
     * @param  {JSONPointer} parentPointer pointer to parent object of target-property
     * @param  {string}      property      target property name
     * @param  {any}         parent        parent object
     * @param  {JSONPointer} pointer       pointer to target-property
     * @return {any} value to be assigned to target-property
     */
    export function SetCallback(parentPointer: JSONPointer, property: string, parent: any, pointer: JSONPointer): any;


    interface Get {
        /** query data and return results */
        (data: InputData, query: Query): Array<any>;
        /** query data and return results */
        (data: InputData, query: Query, returnType: "value"): Array<any>;
        /** query data and return results as a list of json-pointers */
        (data: InputData, query: Query, returnType: "pointer"): Array<JSONPointer>;
        /** query data and return results as an object with pointer: value */
        (data: InputData, query: Query, returnType: "map"): { [key: string]: any };
        /** query data and return results as a list of query items */
        (data: InputData, query: Query, returnType: "all"): Array<QueryResult>;
        /** query data and return result of callback return values */
        (data: InputData, query: Query, returnType: typeof QueryCallback): Array<any>;
        /* return result as list of json-pointer */
        POINTER: "pointer";
        /* return result values */
        VALUE: "value";
        /* return as object */
        MAP: "map";
        /* return a list of query results, containing: value, property, parent-object and json-pointer  */
        ALL: "all";
    }


    interface Set {
        /** set a value to the query-results and add any intermediate objects or arrays for non-sub-queries */
        (data: InputData, query: Query, value: typeof SetCallback, force?: "insert"|"replace"): any;
        /** set a value to the query-results and add any intermediate objects or arrays for non-sub-queries */
        (data: InputData, query: Query, value: any, force?: "insert"|"replace"): any;
        /** for all array-indices within path, replace the values, ignoring insertion syntax /[1]/ */
        REPLACE_ITEMS: "replace";
        /** for all array-indices within path, insert the values, ignoring replace syntax /1/ */
        INSERT_ITEMS: "insert";
    }
}


/** query data and return results */
export declare const get: GsonQuery.Get;
/** add value to the query-results */
export declare const set: GsonQuery.Set;
/** remove the value of the query result */
export declare function remove(data: GsonQuery.InputData, query: GsonQuery.Query, returnRemoved?: boolean): Array<any>;
/** split the `query` into a list of [properties, sub-queries] */
export declare function split(query: GsonQuery.Query): Array<GsonQuery.Query|GsonQuery.JSONPointer>;
