import { OverrideField } from "revolt-api";
import { Channel, Server } from "..";
import { Base } from "../models/Base";
import { PermissionsBitField } from "./ops";
import { PermissionOverridesData } from "../collections/PermissionOverrideCollection";
export declare class PermissionOverrides extends Base {
    allow: PermissionsBitField;
    channel: Channel | null;
    deny: PermissionsBitField;
    /**
     * Role ID or `default`
     */
    readonly id: string;
    server: Server | null;
    constructor(target: Channel | Server, data: PermissionOverridesData);
    update(data: OverrideField): this;
}
//# sourceMappingURL=PermissionOverrides.d.ts.map