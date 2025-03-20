import { type Client } from "..";
import { ChannelCollectionInServer } from "../collections/ChannelCollection";
import { Base } from "./Base";
import { Server as ApiServer, FieldsServer } from "revolt-api";
import { AutumnFile } from "./File";
import { ServerCategoryCollection } from "../collections/ServerCategoryCollection";
import { ServerMemberCollection } from "../collections/ServerMemberCollection";
import { PermissionsBitField } from "../permissions/ops";
import { RoleCollection } from "../collections/RoleCollection";
export declare class Server extends Base {
    readonly id: string;
    readonly ownerId: string;
    readonly categories: ServerCategoryCollection;
    readonly channels: ChannelCollectionInServer;
    readonly defaultPermissions: PermissionsBitField;
    readonly members: ServerMemberCollection;
    roles: RoleCollection;
    discoverable: boolean;
    flags: number;
    isNSFW: boolean;
    name: string;
    description: string | null;
    icon: AutumnFile | null;
    banner: AutumnFile | null;
    constructor(client: Client, data: ApiServer);
    clear(properties: FieldsServer[]): void;
    update(data: Partial<ApiServer>): this;
}
//# sourceMappingURL=Server.d.ts.map