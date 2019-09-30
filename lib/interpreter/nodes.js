const o = require("gson-conform");
const join = (a, b) => `${a}/${b}`;
const { VALUE_INDEX, POINTER_INDEX } = require("./keys");

function flag(v) {
    const t = Object.prototype.toString.call(v);
    return t === "[object Object]" || t === "[object Array]";
}


const cache = {
    mem: [],
    get(entry, prop) {
        const v = entry[VALUE_INDEX][prop];
        if (cache.mem.includes(v)) {
            return undefined;
        }
        if (flag(v)) {
            cache.mem.push(v);
        }
        return [v, prop, entry[VALUE_INDEX], join(entry[POINTER_INDEX], prop)];
    },
    reset() {
        cache.mem.length = 0;
    }
};


const expand = {
    any(node, entry) {
        const value = entry[VALUE_INDEX];
        return o.keys(value)
            // .map(prop => cache.get(entry, prop));
            .map(prop => [value[prop], prop, value, join(entry[POINTER_INDEX], prop)]);
    },

    all(node, entry) {
        const result = [entry];
        o.forEach(entry[VALUE_INDEX], (value, prop) => {
            const childEntry = cache.get(entry, prop);
            // const childEntry = [value, prop, entry[VALUE_INDEX], join(entry[POINTER_INDEX], prop)];
            childEntry && result.push(...expand.all(node, childEntry));
        });
        return result;
    },

    regex(node, entry) {
        const regex = new RegExp(node.text.replace(/(^{|}$)/g, ""));
        const value = entry[VALUE_INDEX];
        return o.keys(value)
            .filter(prop => regex.test(prop))
            .map(prop => [value[prop], prop, value, join(entry[POINTER_INDEX], prop)]);
    }
};


const select = {
    property: (node, entry) => {
        const prop = node.text;
        if (entry[VALUE_INDEX] && entry[VALUE_INDEX][prop] !== undefined) {
            return [
                entry[VALUE_INDEX][prop],
                prop,
                entry[VALUE_INDEX],
                join(entry[POINTER_INDEX], prop)
            ];
        }
    },
    lookahead: (node, entry) => {
        let valid = true;
        let or = false;
        node.children.forEach(expr => {
            if (expr.type === "expression") {
                const isValid = select.expression(expr, entry) !== undefined;
                valid = or === true ? (valid || isValid) : valid && isValid;
            } else {
                or = expr.type === "orExpr";
            }
        });
        return valid ? entry : undefined;
    },
    expression: (node, entry) => {
        const prop = node.children[0].text;
        const cmp = node.children[1];
        let test = node.children[2];
        if (test) {
            test = test.text;
        }

        const value = entry[VALUE_INDEX];
        if (value == null) {
            return;
        }

        if (cmp === undefined) {
            if (value[prop] !== undefined) {
                return entry;
            }
        } else if (cmp.type === "is") {
            if ("" + value[prop] === test) {
                return entry;
            }
        } else if (cmp.type === "isnot") {
            if ("" + value[prop] !== test && value[prop] !== undefined) {
                return entry;
            }
        } else {
            throw new Error(`Unknown comparisson type ${cmp.type}`);
        }
    }
};


module.exports = {
    expand,
    select,
    cache
};
