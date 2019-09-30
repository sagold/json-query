const { expand, select } = require("./nodes");
const { VALUE_INDEX, KEY_INDEX, PARENT_INDEX, POINTER_INDEX } = require("./keys");


function collect(func, input, node, pointer) {
    const result = [];
    for (let i = 0, l = input.length; i < l; i += 1) {
        result.push(...func(node, input[i], node, pointer));
    }
    return result;
}


function reduce(func, input, node, pointer) {
    const result = [];
    for (let i = 0, l = input.length; i < l; i += 1) {
        const output = func(node, input[i], pointer);
        if (output) {
            result.push(output);
        }
    }
    return result;
}


function query(data, ast, pointer) {
    let result = data;
    ast.children.forEach(node => {
        if (expand[node.type]) {
            result = collect(expand[node.type], result, node, pointer);

        } else if (select[node.type]) {
            result = reduce(select[node.type], result, node, pointer);

        } else {
            throw new Error(`Unknown filter ${node.type}`);
        }
    });
    return result;
}


function runPatternOnce(inputSet, ast, pointer) {
    const resultingSet = [];
    let workingSet = inputSet;
    ast.children.forEach(node => {
        if (node.type === "orPattern") {
            resultingSet.push(...workingSet);
            workingSet = inputSet;
            return;
        }
        workingSet = runNode(workingSet, node, pointer);
    });
    resultingSet.push(...workingSet);
    return resultingSet;
}


function pattern(data, ast, pointer) {
    const result = [];
    const quantifier = ast.children.find(node => node.type === "quantifier");
    const iterationCount = (quantifier && quantifier.text === "+") ? Infinity : 1;
    let workingSet = data;
    let count = 0;
    while (workingSet.length > 0 && count < iterationCount) {
        workingSet = runPatternOnce(workingSet, ast, pointer);
        result.push(...workingSet);
        count += 1;
    }
    return result;
}


function skip(data, ast, pointer) {
    let result = data;
    ast.children.forEach(n => (result = runNode(result, n, pointer)));
    return result;
}


function runNode(data, ast, pointer) {
    let result;
    if (ast.type === "query") {
        result = query(data, ast, pointer);
    } else if (ast.type === "pattern") {
        result = pattern(data, ast, pointer);
    } else {
        result = skip(data, ast, pointer);
    }
    return result;
}


module.exports = {
    VALUE_INDEX,
    KEY_INDEX,
    PARENT_INDEX,
    POINTER_INDEX,
    run(data, ast) {
        return runNode([[data, null, null, "#"]], ast);
    }
};
