# Json Query

Install

`npm i @sagold/json-query`

and use with

`const jsonQuery = require("@sagold/json-query")`


At first, query acts like a normal **json-pointer** where its match is passed to the given callback function:

```js
	var query = require("query").run;
	var data = {
		"parent": {
			"child": {"id": "child-1"}
		}
	};
	query(data, "#/parent/child/id", function (value, key, object, jsonPointer) {
		// value = "child-1",
		// key = "id"
		// object = {"id": "child-1"}
		// jsonPointer = "#/parent/child/id"
	});
```


But query also supports **glob-patterns** with `*`:

```js
	var query = require("query").run;
	var data = {
		"parent": {
			"child": {"id": "child-1"}
		},
		"neighbour": {
			"child": {"id": "child-2"}
		}
	};
	query(data, "#/*/child/id", function (value, key, object, jsonPointer) {
		// will be called with value: "child-1" and "child-2"
	});
```

and **glob-patterns** with `**`:

```js
	var query = require("query").run;
	var data = {
		"parent": {
			"child": {"id": "child-1"}
		},
		"neighbour": {
			"child": {"id": "child-2"}
		}
	};
	query(data, "#/**/id", function (value, key, object, jsonPointer) {
		// will be called with value: "child-1" and "child-2"
	});
```

To **filter** the matched objects an object-query string may be appended on each single step:

```js
	var query = require("query").run;
	var data = {
		"parent": {
			"valid": true,
			"child": {"id": "child-1"}
		},
		"neighbour": {
			"valid": false,
			"child": {"id": "child-2"}
		}
	};
	query(data, "#/**?valid:true&&ignore:undefined/child", function (value, key, object, jsonPointer) {
		// will be called with value: {"id": "child-1"} only
	});
	// same result with
	query(data, "#/**?valid:!false/child", function (value, key, object, jsonPointer) { // ...
```

**regular expression** must be wrapped with `{.*}`:

```js
	var query = require("query").run;
	var data = {
		"albert": {valid: true},
		"alfred": {valid: false},
		"alfons": {valid: true}
	};
	query(data, "#/{al[^b]}?valid:true", function (value, key, object, jsonPointer) {
		// will be executed with value: alfons
	});
```


## queryGet

If you only require values or pointers, use queryGet to receive an Array as result:

```js
	var queryGet = require("query").get;

	// default: queryGet.VALUES
	var arrayOfValues = queryGet(data, "#/**/id", queryGet.VALUE);
	// ["#/..", "#/..", ...]
	var arrayOfJsonPointers = queryGet(data, "#/**/id", queryGet.POINTER);
	// [arguments, arguments], where arguments = 0:value 1:object 2:key 3:jsonPointer
	var arrayOfAllFourArguments = queryGet(data, "#/**/id", queryGet.ALL);
```


## queryDelete

Multiple items on objects or in arrays may also be delete with query.delete:

```js
	var queryDelete = require("query").delete;

	queryDelete(data, "#/**/*/data");
```


## Examples

- `query(data, "#/**/*", callback);` will iterate over each value of the data object
- `query(data, "#/**?valid:true", callback);` will select all objects having its property "valid" set to `true`

for further examples refer to the unit tests

- [query.delete](https://github.com/sagold/json-query/blob/master/test/unit/queryDelete.test.js)
- [query.get](https://github.com/sagold/json-query/blob/master/test/unit/queryGet.test.js)
- [query.query](https://github.com/sagold/json-query/blob/master/test/unit/query.test.js)



