"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleCollection = void 0;
const __1 = require("..");
const DataCollection_1 = require("./DataCollection");
class RoleCollection extends DataCollection_1.CachedCollection {
    constructor(server, iterable) {
        super(server.client, __1.Role, iterable);
    }
    _add(member) {
        const existing = this.cache.get(member.id);
        if (existing)
            return existing;
        this.cache.set(member.id, member);
        return member;
    }
}
exports.RoleCollection = RoleCollection;
//# sourceMappingURL=RoleCollection.js.map