import { Member as ApiMember } from "revolt-api";
import { AutumnFile, Server } from "..";
import { Base } from "./Base";
import { RoleCollection } from "../collections/RoleCollection";
export declare class ServerMember extends Base {
    readonly server: Server;
    avatar: AutumnFile | null;
    /**
     * User id
     */
    readonly id: string;
    readonly joinedAt: Date;
    readonly roles: RoleCollection;
    timeout: Date | null;
    readonly serverId: string;
    nickname: string | null;
    constructor(server: Server, data: ApiMember);
    /**
     * Member's currently hoisted role.
     */
    get hoistedRole(): import("./Role").Role | null;
    /**
     * Ordered list of roles for this member, from lowest to highest priority.
     */
    get orderedRoles(): import("@discordjs/collection").Collection<string, import("./Role").Role>;
    /**
     * Member's ranking
     * Smaller values are ranked as higher priority
     * Infinity is the default ranking
     */
    get ranking(): number;
    /**
     * Member's current role colour.
     */
    get roleColour(): string | null;
    update(data: Partial<ApiMember>): this;
    toString(): string;
    get user(): import("./User").User | null;
}
//# sourceMappingURL=ServerMember.d.ts.map