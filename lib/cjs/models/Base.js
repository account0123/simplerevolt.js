"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Base = void 0;
class Base {
    client;
    constructor(client) {
        this.client = client;
    }
    clone() { return Object.assign(Object.create(this), this); }
    patch(data) { return data; }
    update(data) { return data; }
}
exports.Base = Base;
//# sourceMappingURL=Base.js.map