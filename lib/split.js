const { parse, toJSON } = require("./parser");


const skip = ["root", "recursion"];


function buildPath(node, path = []) {
    if (skip.includes(node.type)) {
        node.children.forEach(n => buildPath(n, path));
        return path;
    }
    // remove escapred property quotes?
    path.push(node.text);
    return path;
}


function split(queryString) {
    const ast = parse(queryString);
    // console.log(toJSON(ast, null, 2));
    return buildPath(ast);
}

module.exports = split;
