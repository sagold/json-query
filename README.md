# gson query

> Query and transform your json data using an extended glob-pattern. This is a really helpful tool to quickly
>
> - fuzzy search json-data matching some search properties
> - transform data with consistent structures
> - extract information from json-data

`npm install gson-query --save`

and get it like

`const query = require("gson-query");`


- [Quick introduction](#quick-introduction)
- [Introduction](#introduction)
- [CLI](#cli)


## Quick introduction

**run** a callback-function on each match of your _query_

```js
query.run(data, "/server/*/services/*", callback);
```

a **callback** receives the following arguments

```js
/**
 * @param {Any} value              - value of the matching query
 * @param {String} key             - the property or index of the value
 * @param {Object|Array} parent    - parent[key] === value
 * @param {String} jsonPointer     - json-pointer in data, pointing to value
 */
function callback(value, key, parent, jsonPointer) => { /* do sth */ }
```

**get** matches in an array instead of running a callback

```js
let results = query.get(data, "/server/*?state:critical", query.get.VALUE); // or POINTER or ALL
```

which is the same as

```js
let results = query.get(data, "/server/*/services/*", (value) => value);
```

or quickly **delete** properties from your data

```js
query.delete(data, "/server/*/services/{szm-.*}");
```


## Introduction

At first, **json-query** acts like a normal [**json-pointer**](https://github.com/sagold/json-pointer) where its match
is passed to the given callback function:

```js
const query = require("gson-query");
let data = {
    "parent": {
        "child": {"id": "child-1"}
    }
};
query.run(data, "#/parent/child/id", (value, key, object, jsonPointer) => {
    // value = "child-1"
    // key = "id"
    // object = {"id": "child-1"}
    // jsonPointer = "#/parent/child/id"
});
// or get the result in an array
let match = query.get(data, "#/parent/child/id");
// [ ["child-1", "id", {"id":"child-1"}, "#/parent/child/id"] ]
```


But query also supports **glob-patterns** with `*`:

```js
const query = require("gson-query");
let data = {
    "parent": {
        "child": {"id": "child-1"}
    },
    "neighbour": {
        "child": {"id": "child-2"}
    }
};
query.run(data, "#/*/child/id", function (value, key, object, jsonPointer) {
    // will be called with value: "child-1" and "child-2"
});
// or get the result in an array
var match = query.get(data, "#/parent/child/id");
// [ ["child-1", ...], ["child-2", ...] ]
```

and **glob-patterns** with `**`:

```js
const query = require("gson-query");
let data = {
    "parent": {
        "child": {"id": "child-1"}
    },
    "neighbour": {
        "child": {"id": "child-2"}
    }
};
query.run(data, "#/**/id", function (value, key, object, jsonPointer) {
    // will be called with value: "parent" "child-1" and "child-2"
});
```

or simply call `query.run(data, "#/**", callback)` to run callback on each object,array and value.


To **filter** the matched objects, an object-query string may be appended on each single step:

```js
const query = require("gson-query");
let data = {
    "parent": {
        "valid": true,
        "child": {"id": "child-1"}
    },
    "neighbour": {
        "valid": false,
        "child": {"id": "child-2"}
    },
    "dungeons": {
        "child": {"id": "child-3"}
    }
};
query.run(data, "#/**?valid:true&&ignore:undefined/child", function (value, key, object, jsonPointer) {
    // will be called with value: {"id": "child-1"} only
});
// same result with
query.run(data, "#/**?valid:!false/child", function (value, key, object, jsonPointer) { // ...
```

or match all objects that have a defined property _valid_ like `query.run(data, "#/**?valid", callback)`.



**regular expression** must be wrapped with `{.*}`:

```js
const query = require("gson-query");
let data = {
    "albert": {valid: true},
    "alfred": {valid: false},
    "alfons": {valid: true}
};
query.run(data, "#/{al[^b]}?valid:true", function (value, key, object, jsonPointer) {
    // will be executed with value: alfons
});
```


### queryGet

If you only require values or pointers, use queryGet to receive an Array or Object as result:

```js
const queryGet = require("gson-query").get;

// default: queryGet.VALUES
let arrayOfValues = queryGet(data, "#/**/id", queryGet.VALUE);
// ["#/..", "#/..", ...]
let arrayOfJsonPointers = queryGet(data, "#/**/id", queryGet.POINTER);
// [arguments, arguments], where arguments = 0:value 1:object 2:key 3:jsonPointer
let arrayOfAllFourArguments = queryGet(data, "#/**/id", queryGet.ALL);
// {"#/..": value, "#/..": value}
let mapOfPointersAndData = queryGet(data, "#/**/id", queryGet.MAP);
// {"#/..": value, "#/..": value}
let mapOfPointersAndData = queryGet(data, "#/**/id", (val, key, parent, pointer) => `custom-${pointer}`);
// ["custom-#/parent/child/id", "custom-#/neighbour/child/id", "custom-#/dungeons/child/id"]
```


### queryDelete

Multiple items on objects or in arrays may also be delete with query.delete:

```js
var queryDelete = require("gson-query").delete;

queryDelete(data, "#/**/*/data");
```


for further examples refer to the unit tests

- [query.delete](https://github.com/sagold/json-query/blob/master/test/unit/queryDelete.test.js)
- [query.get](https://github.com/sagold/json-query/blob/master/test/unit/queryGet.test.js)
- [query.query](https://github.com/sagold/json-query/blob/master/test/unit/query.test.js)


## CLI



