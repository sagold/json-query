# Json Query

Install

`npm i gson-query`

and use with

`const query = require("gson-query")`

At first, **json-query** acts like a normal [**json-pointer**](https://github.com/sagold/json-pointer) where its match
is passed to the given callback function:

```js
const query = require("gson-query");
const data = {
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
var match = query.get(data, "#/parent/child/id");
// [ ["child-1", "id", {"id":"child-1"}, "#/parent/child/id"] ]
```


But query also supports **glob-patterns** with `*`:

```js
const query = require("gson-query");
const data = {
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
var query = require("gson-query");
var data = {
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
var query = require("gson-query");
var data = {
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
var query = require("gson-query");
var data = {
    "albert": {valid: true},
    "alfred": {valid: false},
    "alfons": {valid: true}
};
query.run(data, "#/{al[^b]}?valid:true", function (value, key, object, jsonPointer) {
    // will be executed with value: alfons
});
```


## queryGet

If you only require values or pointers, use queryGet to receive an Array or Object as result:

```js
var queryGet = require("gson-query").get;

// default: queryGet.VALUES
var arrayOfValues = queryGet(data, "#/**/id", queryGet.VALUE);
// ["#/..", "#/..", ...]
var arrayOfJsonPointers = queryGet(data, "#/**/id", queryGet.POINTER);
// [arguments, arguments], where arguments = 0:value 1:object 2:key 3:jsonPointer
var arrayOfAllFourArguments = queryGet(data, "#/**/id", queryGet.ALL);
// {"#/..": value, "#/..": value}
var mapOfPointersAndData = queryGet(data, "#/**/id", queryGet.MAP);
```


## queryDelete

Multiple items on objects or in arrays may also be delete with query.delete:

```js
var queryDelete = require("gson-query").delete;

queryDelete(data, "#/**/*/data");
```


## Examples

- `query.run(data, "#/**/*", callback);` will iterate over each value of the data object
- `query.run(data, "#/**?valid:true", callback);` will select all objects having its property "valid" set to `true`


for further examples refer to the unit tests

- [query.delete](https://github.com/sagold/json-query/blob/master/test/unit/queryDelete.test.js)
- [query.get](https://github.com/sagold/json-query/blob/master/test/unit/queryGet.test.js)
- [query.query](https://github.com/sagold/json-query/blob/master/test/unit/query.test.js)



