module.exports = function format({ json, beautify }, value) {
    let asJson = Object.prototype.toString.call(value) === "[object Object]" || Array.isArray(value) || json;
    if (beautify) {
        return JSON.stringify(value, null, 2);
    }
    if (asJson) {
        return JSON.stringify(value);
    }
    return value;
};
