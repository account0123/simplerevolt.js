import { PermissionOverrides } from "../permissions/PermissionOverrides";
import { CachedCollection } from "./DataCollection";
export class PermissionOverrideCollection extends CachedCollection {
    target;
    constructor(target) {
        super(target.client, PermissionOverrides);
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
        const instance = new PermissionOverrides(this.target, data);
        this.cache.set(instance.id, instance);
        return instance;
    }
}
//# sourceMappingURL=PermissionOverrideCollection.js.map