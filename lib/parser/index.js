const { default: EBNF } = require("ebnf/dist/Grammars/W3CEBNF");
const { enbf } = require("./grammar");


const parser = new EBNF.Parser(enbf);


module.exports = {
    parse: (query) => parser.getAST(query)
};
