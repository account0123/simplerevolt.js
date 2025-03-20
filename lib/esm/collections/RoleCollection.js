import { Role } from "..";
import { CachedCollection } from "./DataCollection";
export class RoleCollection extends CachedCollection {
    constructor(server, iterable) {
        super(server.client, Role, iterable);
    }
    _add(member) {
        const existing = this.cache.get(member.id);
        if (existing)
            return existing;
        this.cache.set(member.id, member);
        return member;
    }
}
//# sourceMappingURL=RoleCollection.js.map