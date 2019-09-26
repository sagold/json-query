const get = require("./get");
const queryNode = require("./pattern/queryNode");
const tokenize = require("./pattern/tokenize");


function pattern(data, query, type = get.VALUE) {
    const matches = type === get.MAP ? {} : [];
    const cb = get.getCbFactory(type, matches);

    const tree = tokenize(query);
    const result = queryNode(data, tree);

    result.forEach(r => cb.apply(null, r));
    return matches;
}


module.exports = pattern;
