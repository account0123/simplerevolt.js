"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionOverrideCollection = void 0;
const PermissionOverrides_1 = require("../permissions/PermissionOverrides");
const DataCollection_1 = require("./DataCollection");
class PermissionOverrideCollection extends DataCollection_1.CachedCollection {
    target;
    constructor(target) {
        super(target.client, PermissionOverrides_1.PermissionOverrides);
        this.target = target;
    }
    _add(permission) {
        const existing = this.cache.get(permission.id);
        if (existing)
            return existing;
        this.cache.set(permission.id, permission);
        return permission;
    }
    create(data) {
        const instance = new PermissionOverrides_1.PermissionOverrides(this.target, data);
        this.cache.set(instance.id, instance);
        return instance;
    }
}
exports.PermissionOverrideCollection = PermissionOverrideCollection;
//# sourceMappingURL=PermissionOverrideCollection.js.map