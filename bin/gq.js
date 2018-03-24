#! /usr/bin/env node
const program = require("commander");
const chalk = require("chalk");
const get = require("../lib/get");
const { readFile } = require("fs");

const qStr = chalk.underline("query");
const gStr = chalk.bold("gq");


program
    .usage("[options] query")
    .description(`${chalk.bold("DESCRIPTION")}
    The ${gStr} utility will apply the ${qStr} on the given json data and write
    any results to the standard output. Per default, each result is written per
    line.

    ${chalk.bold("Query")}
    A basic ${qStr} describes a path from the root of a json object to the
    target destination, e.g. '/first/property'. To find multiple matches replace
    any property with a wildcard '*', e.g. '/first/*' wich will return any
    property from 'first'. To search independent of the depth of a target, use
    the glob-pattern '**', e.g. '/**/second' will return any property 'second'
    regardless of the depth within the json file.

    To further narrow down the search result, use a regular expression like
    '/**/{alf.*}' and/or add additional queries to the targets property
    structure with '/**?alf:!undefined&&alf:!true'. For further details goto
    https://github.com/sagold/gson-query

    ${chalk.bold("Pattern")}
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

    ${chalk.bold("Examples")}
    $ gq -f demo.json '/nodes/*/services/*?state:!healthy'
    $ cat demo.json | gq '/nodes/*/services/*?state:!healthy'`)
    .option("-f, --filename <filename>", "reads the json data from the given file")
    .option("-j, --json", "print the result in json format (one-liner). Will always json-print objects and arrays")
    .option("-b, --beautify", "pretty print the result in json format (multiple lines)")
    .option("-p, --pattern <pattern>", "print the result in the given pattern. Keys: %value, %key, %parent, %pointer, %index, %count")
    .option("-t, --target", "returns the json-pointer of each match (instead of its value)")
    .option("-d, --debug", "show stack trace of errors")
    .parse(process.argv);


function loadData(command) {
    if (command.pipe === true) {
        return new Promise((resolve, reject) => {
            let data = "";
            process.stdin.resume();
            process.stdin.setEncoding('utf8');
            process.stdin.on('data', (chunk) => (data += chunk));
            process.stdin.on('end', () => resolve(data));
            process.stdin.on('error', reject);
        });
    }

    return new Promise((resolve, reject) => {
        readFile(command.filename, 'utf-8', (err, data) => {
            if (err) {
                return reject(err);
            }
            return resolve(data);
        })
    });
}

function runQuery(data, program) {
    const queryString = program.args[0];
    let matches;

    if (program.pattern) {
        matches = get(data, queryString, get.ALL);
        matches = matches.map((args, index) => {
            const [ value, key, parent, pointer ] = args;
            return program.pattern
                .replace(/%value/g, format(program, value))
                .replace(/%key/g, format(program, key))
                .replace(/%parent/g, format(program, parent))
                .replace(/%pointer/g, format(program, pointer))
                .replace(/%total/g, format(program, matches.length))
                .replace(/%position/g, format(program, index + 1))
                .replace(/%index/g, format(program, index));
        });

    } else {
        matches = get(data, queryString, program.target ? get.POINTER : get.VALUE);
        matches = matches.map((match) => format(program, match));
    }
    while (matches.length) {
        console.log(matches.shift());
    }
}

function format(program, value) {
    let asJson = program.json;
    if (Object.prototype.toString.call(value) === "[object Object]" || Array.isArray(value)) {
        asJson = true;
    }
    if (program.pretty) {
        return JSON.stringify(value, null, 2);
    }
    if (asJson) {
        return JSON.stringify(value);
    }
    return value;
}

program.pipe = process.stdin.isTTY == null;

if (program.args.length === 0) {
    console.error(`gq: required argument 'query' is not given`);
    process.exit(1);
}

if (program.pattern && typeof program.pattern !== "string") {
    console.error(`gq: option 'pattern' must be a string`);
    process.exit(1);
}

loadData(program)
    .then((data) => {
        try {
            data = JSON.parse(data);
            return data
        } catch(e) {
            throw new Error(`gq: '${program.args[0]}' is an invalid json format`);
        }
    })
    .then((data) => runQuery(data, program))
    .catch((error) => {
        console.log(error.message);
        program.debug && console.log(error);
    });
