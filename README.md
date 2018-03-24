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
query.run(data, "#/parent/child/id", (value, key, parent, jsonPointer) => {
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
query.run(data, "#/*/child/id", function (value, key, parent, jsonPointer) {
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
query.run(data, "#/**/id", function (value, key, parent, jsonPointer) {
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
query.run(data, "#/**?valid:true&&ignore:undefined/child", function (value, key, parent, jsonPointer) {
    // will be called with value: {"id": "child-1"} only
});
// same result with
query.run(data, "#/**?valid:!false/child", function (value, key, parent, jsonPointer) { /* do sth */ });
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
query.run(data, "#/{al[^b]}?valid:true", function (value, key, parent, jsonPointer) {
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

> You can use gson-query as a commandline tool with `gq`.

Usage: `$ gq query -f filename`

Pipe Usage: `$ cat some.json | gq query`

Example: `$ gq '/dependencies/*' -f package.json` will print all dependency versions

```
$ gq -h

  Usage: gq [options] query

  DESCRIPTION
    The gq utility will apply the query on the given json data and write
    any results to the standard output. Per default, each result is written per
    line.

    Query
    A basic query describes a path from the root of a json object to the
    target destination, e.g. '/first/property'. To find multiple matches replace
    any property with a wildcard '*', e.g. '/first/*' wich will return any
    property from 'first'. To search independent of the depth of a target, use
    the glob-pattern '**', e.g. '/**/second' will return any property 'second'
    regardless of the depth within the json file.

    To further narrow down the search result, use a regular expression like
    '/**/{alf.*}' and/or add additional queries to the targets property
    structure with '/**?alf:!undefined&&alf:!true'. For further details goto
    https://github.com/sagold/gson-query

    Pattern
    For a custom output a pattern may be given, which is a string containing
    variables (%name) which will be replaced by the specified contents.

    Example pattern: $ gq -p '%number/%total %pointer: %value'

    Valid variable names are:
    * value     - the matching value
    * key       - the property name of the match
    * parent    - the value of the parent (which contains the match)
    * pointer   - the json-pointer to the target
    * index     - the index of the match
    * position  - the position of the match (index starting at 1)
    * total     - the total number of matches

    Examples
    $ gq -f demo.json '/nodes/*/services/*?state:!healthy'
    $ cat demo.json | gq '/nodes/*/services/*?state:!healthy'

  Options:

    -f, --filename <filename>  reads the json data from the given file
    -j, --json                 print the result in json format (one-liner).
                               Will always json-print objects and arrays
    -b, --beautify             pretty print the result in json format (multiple lines)
    -p, --pattern <pattern>    print the result in the given pattern.
                               Keys: %value, %key, %parent, %pointer, %index, %count
    -t, --target               returns the json-pointer of each match (instead of its value)
    -d, --debug                show stack trace of errors
    -h, --help                 output usage information
```

For further details and options checkout `$ gq -h` or read the [description in source](./bin/gq.js)

