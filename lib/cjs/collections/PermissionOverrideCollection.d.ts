import { OverrideField } from "revolt-api";
import type { Channel, Server } from "..";
import { PermissionOverrides } from "../permissions/PermissionOverrides";
import { CachedCollection } from "./DataCollection";
export type PermissionOverridesData = OverrideField & {
    id: string;
};
export declare class PermissionOverrideCollection extends CachedCollection<PermissionOverrides> {
    readonly target: Channel | Server;
    constructor(target: Channel | Server);
    _add(permission: PermissionOverrides): PermissionOverrides;
    create(data: PermissionOverridesData): PermissionOverrides;
}
//# sourceMappingURL=PermissionOverrideCollection.d.ts.map