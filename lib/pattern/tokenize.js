const REPEATER = "r";
const GROUPS = "g";
const POINTER = "p";
const PARENT = "parent";
const OR = "or";

function node(parent) {
    // eslint-disable-next-line object-property-newline
    return { [POINTER]: "", [REPEATER]: "", [GROUPS]: [], [PARENT]: parent };
}

function cleanup(node) {
    if (node[POINTER] === "" && node[GROUPS].length === 0) {
        return undefined;
    }

    const clean = {};

    const pointer = node[POINTER].trim();
    if (!(pointer === "")) {
        clean[POINTER] = pointer;
    }

    const quantifier = node[REPEATER].trim();
    if (!(quantifier === "")) {
        clean[REPEATER] = quantifier;
    }

    const groups = node[GROUPS].map(cleanup).filter(n => n !== undefined);
    if (groups.length > 0) {
        clean[GROUPS] = groups;
    }

    if (node[OR]) {
        clean[OR] = true;
    }

    return clean;
}


/**
 * Builds a tree for the pattern-query feature
 *
 * Node {
 *     p: string|undefined         - pointer fragment,
 *     r: string|undefined         - repeater shorthand for group iterations
 *     g: Array[Node]|undefined    - nested group of pointers and groups
 * }
 *
 * @param  {[type]} ptr [description]
 * @return {Array<Node>}
 */
module.exports = function tokenize(ptr) {
    const rootNode = node();
    let current = node(rootNode);
    rootNode[GROUPS].push(current);
    let previousNode;

    let closing = false;
    for (let i = 0; i < ptr.length; i += 1) {
        const char = ptr[i];

        // add new group
        if (char === "(") {
            closing = false;

            const next = node(current);
            current[GROUPS].push(next);
            current = next;

        // close existing group, start new group
        } else if (char === ")") {
            closing = true;

            previousNode = current[PARENT];
            current = current[PARENT][PARENT];

            const next = node(current);
            current[GROUPS].push(next);
            current = next;

        // update repeater-symbols
        } else if (closing === true && /[\w/]/.test(char) === false) {
            if (char === ",") {
                previousNode[OR] = true;
            } else {
                previousNode[REPEATER] += char;
            }

        } else {
            closing = false;
            current[POINTER] += char;
        }
    }

    return cleanup(rootNode);
};
