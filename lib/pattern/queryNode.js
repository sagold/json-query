const get = require("../get");
const VALUE_INDEX = 0;
const POINTER_INDEX = 3;


const quickJoin = (a, b) => `${a}${b.substr(1)}`;


function runGroups(inputSet, nodes) {
    const resultingSet = [];

    const lastIndex = nodes.length - 1;
    let workingSet = inputSet;
    nodes.forEach((groupNode, index) => {
        workingSet = runNode(workingSet, groupNode);
        if (groupNode.or === true && lastIndex !== index) {
            resultingSet.push(...workingSet);
            workingSet = inputSet;
        }
    });

    resultingSet.push(...workingSet);
    return resultingSet;
}


function runNode(inputSet, node) {
    let querySet = inputSet;

    // perform the query (querySet), finding results from inputSet
    if (node.p) {
        querySet = [];
        let localResult;
        for (let i = 0; i < inputSet.length; i += 1) {
            // join pointers, since we perform each pattern individually
            localResult = get(inputSet[i][VALUE_INDEX], node.p, get.ALL);
            localResult.forEach(r => r[POINTER_INDEX] = quickJoin(inputSet[i][POINTER_INDEX], r[POINTER_INDEX]));
            querySet.push(...localResult);
        }
    }

    if (querySet.length === 0 || node.g == null) {
        return querySet;
    }

    // current working copy to pass to groups (each group creates a new working set: pipe)
    if (node.r == null) {
        return runGroups(querySet, node.g);
    }

    // build up results, while repeating,
    // thus store result, and pass last workingSet
    let workingSet = querySet;
    let resultingSet = [];
    while(workingSet.length > 0) {
        workingSet = runGroups(workingSet, node.g);
        resultingSet.push(...workingSet);
    }

    return resultingSet;
}


function run(data, node) {
    return runNode([[data, null, null, "#"]], node);
}


module.exports = run;
