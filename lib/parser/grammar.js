// W3C ENBF grammar
// https://github.com/lys-lang/node-ebnf/blob/master/test/W3CEBNF.spec.ts
// https://www.w3.org/TR/xml/#sec-notation
const enbf = `
root ::= ("#" recursion | recursion | (query | pattern) recursion* | "#" SEP? | SEP)
recursion ::= (SEP query | pattern)*

query ::= (property | all | any | regex) typecheck? lookahead?
property ::= [a-zA-Z0-9-_]+
regex ::= "{" [^}]+ "}"
SEP ::= "/"
all ::= "**"
any ::= "*"

typecheck ::= "?:" ("value" | "boolean" | "string" | "number" | "object" | "array")
lookahead ::= "?" expression ((andExpr | orExpr) expression)*
andExpr ::= S? "&&" S?
orExpr ::= S? "||" S?

expression ::= property ((isnot | is) (property | regex))*
is ::= ":"
isnot ::= ":!"

pattern ::= S? "(" (SEP query | pattern (orPattern? pattern)*)* ")" quantifier? S? lookahead?
quantifier ::= "+"
orPattern ::= S? "," S?

S ::= [ ]*
`;


module.exports = {
    enbf
};
