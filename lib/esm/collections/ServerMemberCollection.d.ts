import { Member } from "revolt-api";
import type { Server } from "..";
import { ServerMember } from "../models/ServerMember";
import { CachedCollection } from "./DataCollection";
export declare class ServerMemberCollection extends CachedCollection<ServerMember> {
    readonly server: Server;
    constructor(server: Server);
    _add(member: ServerMember): ServerMember;
    create(data: Member): ServerMember;
}
//# sourceMappingURL=ServerMemberCollection.d.ts.map