import { Role, Server } from "..";
import { CachedCollection } from "./DataCollection";
export declare class RoleCollection extends CachedCollection<Role> {
    constructor(server: Server, iterable?: Iterable<Role>);
    _add(member: Role): Role;
}
//# sourceMappingURL=RoleCollection.d.ts.map