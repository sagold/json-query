// W3C ENBF grammar
// https://github.com/lys-lang/node-ebnf/blob/master/test/W3CEBNF.spec.ts
// https://www.w3.org/TR/xml/#sec-notation
const enbf = `
root ::= ("#" recursion | recursion | (query | pattern) recursion* | "#" SEP? | SEP)
recursion ::= (SEP query | pattern)*

query ::= (property | all | any | regex) filter?
property ::= [a-zA-Z0-9\-_]+
regex ::= "{" [^}]+ "}"
SEP ::= "/"
all ::= "**"
any ::= "*"

filter ::= "?" expression ((andExpr | orExpr) expression)*
andExpr ::= S? "&&" S?
orExpr ::= S? "||" S?

expression ::= (property | regex) ((isnot | is) (property | regex))*
is ::= ":"
isnot ::= ":!"

pattern ::= S? "(" (SEP query | pattern (orPattern? pattern)*) ")" quantifier? S? filter?
quantifier ::= "+"
orPattern ::= S? "," S?

S ::= [ ]*
`;

module.exports = {
    enbf
}
