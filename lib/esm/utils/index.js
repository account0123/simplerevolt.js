export function objectToMap(obj) {
    if (typeof obj != "object")
        throw new TypeError("Expected an object");
    const map = new Map();
    Object.entries(obj).forEach(([key, value]) => map.set(key, value));
    return map;
}
export function mapObject(obj, mapper) {
    if (typeof obj != "object")
        throw new TypeError("Expected an object");
    if (typeof mapper != "function")
        throw new TypeError("Expected a mapper function");
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
        const entry = mapper(key, value);
        Object.assign(result, entry);
    }
    return result;
}
//# sourceMappingURL=index.js.map