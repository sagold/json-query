# gson query

> Query and transform your json data using an extended glob-pattern. This is a really helpful tool to quickly
>
> - fuzzy search json-data matching some search properties
> - transform data with consistent structures
> - extract information from json-data

`npm install gson-query --save`

and get it like

`const query = require("gson-query");`


- [Introduction](#quick-introduction)
- [API](#api)
  - [query](#query)
  - [callback](#callback)
  - [query.run](#query.run)
  - [query.get](#query.get)
  - [query.delete](#query.delete)
- [cli](#cli)


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


## API

All examples import `const query = require("gson-query");`

### query

At first, **json-query** acts like a normal [**json-pointer**](https://github.com/sagold/json-pointer)

```js
let data = {
  "parent": {
    "child": { "id": "child-1" }
  }
};
const result = query.get(data, "#/parent/child/id", query.get.VALUE);
// result:
[
  "child-1"
]
```

But query also supports **glob-patterns** with `*`:

```js
let data = {
  "parent": {
    "child": { "id": "child-1" }
  },
  "neighbour": {
    "child": { "id": "child-2" }
  }
};
const result = query.get(data, "#/*/child/id", query.get.VALUE);
// result:
[
  "child-1",
  "child-2"
]
```

and **glob-patterns** with `**`:

```js
let data = {
  "parent": {
    "id": "parent",
    "child": {"id": "child-1"}
  },
  "neighbour": {
    "child": {"id": "child-2"}
  }
};
const result = query.get(data, "#/**/id", query.get.VALUE);
// result:
[
  "parent",
  "child-1",
  "child-2"
]
```

or simply call `query.get(data, "#/**", query.get.VALUE)` to query the value of each property

```js
let data = {
  "parent": {
    "id": "parent",
    "child": { "id": "child-1" }
  }
};
const result = query.get(data, "#/**/id", query.get.VALUE);
// result:
[
  {
    "id":"parent",
    "child": { "id":"child-1" }
  },
  "parent",
  { "id":"child-1" },
  "child-1"
]
```

To **filter** the matched objects, an object-query string may be appended on each single step:

```js
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
let result = query.get(data, "#/**?valid:true&&ignore:undefined/child", query.get.VALUE);
// same result with
result = query.get(data, "#/**?valid:!false/child", query.get.VALUE);
// result:
[
  {
    "valid": true,
    "child": {"id": "child-1"}
  }
]
```

or match all objects that have a defined property _valid_ like `query.run(data, "#/**?valid", callback)`.

```js
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
const result = query.get(data, "#/**?valid", query.get.VALUE);
// result:
[
  {
    "valid": true,
    "child": {
      "id": "child-1"
    }
  },
  {
    "valid": false,
    "child": {
      "id": "child-2"
    }
  }
]
```

**regular expression** must be wrapped with `{.*}`:

```js
let data = {
  "albert": {valid: true},
  "alfred": {valid: false},
  "alfons": {valid: true}
};
const result = query.get(data, "#/{al[^b]}?valid:true", query.get.POINTER);
// result:
[
  "#/alfred"
]
```


### query.run

If you want a callback on each match use `query.run(data:object|array, query:string, callback:function):void`

```js
query.run(data, "#/**/*?valid", (value, key, parent, jsonPointer) => {});
```


### callback

Each **callback** has the following signature
`callback(value:any, key:string, parent:object|array, jsonPointer:string)`

```js
/**
 * @param {Any} value              - value of the matching query
 * @param {String} key             - the property or index of the value
 * @param {Object|Array} parent    - parent[key] === value
 * @param {String} jsonPointer     - json-pointer in data, pointing to value
 */
function callback(value, key, parent, jsonPointer) => { /* do sth */ }
```


### query.get

If you only require values or pointers, use `query.get(data:object|array, query:string, type:TYPE = "all")` to receive an Array or Object as result

```js
// default: query.get.VALUES
let arrayOfValues = query.get(data, "#/**/id", query.get.VALUE);
// result: [value, value]

let arrayOfJsonPointers = query.get(data, "#/**/id", query.get.POINTER);
// result: ["#/..", "#/..", ...]

let arrayOfAllFourArguments = query.get(data, "#/**/id", query.get.ALL);
// result: [arguments, arguments], where arguments = 0:value 1:object 2:key 3:jsonPointer

let mapOfPointersAndData = query.get(data, "#/**/id", query.get.MAP);
// result: {"#/..": value, "#/..": value}

let mapOfPointersAndData = query.get(data, "#/**/id", (val, key, parent, pointer) => `custom-${pointer}`);
// result: ["custom-#/parent/child/id", "custom-#/neighbour/child/id", "custom-#/dungeons/child/id"]
```


### query.delete

Multiple items on objects or in arrays may also be delete with `query.delete(data:object|array, query:string):void`:

```js
query.delete(data, "#/**/*/data");
```


for further examples refer to the unit tests

- [query.delete](https://github.com/sagold/json-query/blob/master/test/unit/queryDelete.test.js)
- [query.get](https://github.com/sagold/json-query/blob/master/test/unit/queryGet.test.js)
- [query.query](https://github.com/sagold/json-query/blob/master/test/unit/query.test.js)


## CLI

> You can use gson-query as a commandline tool with `gq`.

- Installation `npm install gson-query -g`
- Usage: `gq query -f filename`
- Pipe Usage: `cat some.json | gq query`
- Example: `gq '/keywords/*' -f package.json` will print all keywords


```
$ gq -h

  Usage: gq [options] query

  DESCRIPTION
  The gq utility will apply the query on the given json data and write
  any results to the standard output. Per default, each result is written per
  line.

  query
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

  value formats
  Value formats can be modified with options
  -j  value as valid json value in one line (default for objects and arrays)
  -b  value as valid json format, multiple lines

  output options
  Different output options may be specified. A per line output is set by default,
  but can be changed in the following order (highest option matches first)
  -a  prints all matches in one valid json array like [ %value ]
  -o  prints all matches in one valid json object like { %pointer: %value }
  -p  specifies a pattern for per line output
  -t  prints json-pointer of matches per line

  pattern
  For customized output a pattern may be given, which is a string containing
  variables (%name) which will be replaced by the specified contents.

  Example pattern: $ gq -p '%number/%total %pointer: %value'

  Valid variable names are:
  %value     - the matching value
  %key       - the property name of the match
  %parent    - the value of the parent (which contains the match)
  %pointer   - the json-pointer to the target
  %index     - the index of the match
  %position  - the position of the match (index starting at 1)
  %total     - the total number of matches

  Examples
  $ gq -f demo.json '/nodes/*/services/*?state:!healthy'
  $ cat demo.json | gq '/nodes/*/services/*?state:!healthy'

  Options:

  -a, --array                print all matches as a valid json like [%match]. Overrides -o, -t, -p.
  -b, --beautify             pretty print the result in json format (multiple lines)
  -d, --debug                show stack trace of errors
  -f, --filename <filename>  reads the json data from the given file
  -j, --json                 print the result in json format (one-liner). Will always json-print objects and arrays
  -o, --object               print all matches as a valid json map {%pointer: %match}. Overrides -t -p.
  -p, --pattern <pattern>    print the result in the given pattern. @see pattern description
  -t, --target               returns the json-pointer of each match (instead of its value)
  -h, --help                 output usage information
```

For further details and options checkout `$ gq -h`.


