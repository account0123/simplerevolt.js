import { Role as ApiRole } from "revolt-api";
import type { Server } from "..";
import { Base } from "./Base";
import { PermissionOverrides } from "../permissions/PermissionOverrides";
type RoleData = ApiRole & {
    id: string;
};
export declare class Role extends Base {
    readonly server: Server;
    readonly id: string;
    name: string;
    colour: string | null;
    hoist: boolean;
    rank: number | null;
    permissions: PermissionOverrides | null;
    constructor(server: Server, data: RoleData);
    update(data: Partial<ApiRole>): this;
}
export {};
//# sourceMappingURL=Role.d.ts.map