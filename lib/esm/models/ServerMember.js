import { AutumnFile } from "..";
import { Base } from "./Base";
import { RoleCollection } from "../collections/RoleCollection";
export class ServerMember extends Base {
    server;
    avatar = null;
    /**
     * User id
     */
    id;
    joinedAt;
    roles;
    timeout = null;
    serverId;
    nickname = null;
    constructor(server, data) {
        super(server.client);
        this.server = server;
        this.id = data._id.user;
        this.serverId = data._id.server;
        this.joinedAt = new Date(Date.parse(data.joined_at));
        this.roles = new RoleCollection(this.server);
        this.update(data);
    }
    /**
     * Member's currently hoisted role.
     */
    get hoistedRole() {
        return this.orderedRoles.filter((x) => x.hoist).last() || null;
    }
    /**
     * Ordered list of roles for this member, from lowest to highest priority.
     */
    get orderedRoles() {
        return this.roles.cache.sort((a, b) => (b.rank || 0) - (a.rank || 0));
    }
    /**
     * Member's ranking
     * Smaller values are ranked as higher priority
     * Infinity is the default ranking
     */
    get ranking() {
        if (this.id == this.server.ownerId) {
            return -1;
        }
        const roles = this.orderedRoles;
        if (roles.size) {
            return roles.last()?.rank ?? Infinity;
        }
        else {
            return Infinity;
        }
    }
    /**
     * Member's current role colour.
     */
    get roleColour() {
        return this.orderedRoles.filter((x) => x.colour).last()?.colour || null;
    }
    update(data) {
        // removable
        if ("nickname" in data)
            this.nickname = data.nickname;
        // removable
        if ("avatar" in data)
            this.avatar = data.avatar ? new AutumnFile(this.client, data.avatar) : null;
        if ("timeout" in data)
            this.timeout = data.timeout ? new Date(data.timeout) : null;
        for (const roleId of data.roles || []) {
            const role = this.server.roles.resolve(roleId);
            if (role)
                this.roles._add(role);
        }
        return this;
    }
    toString() {
        return `<@${this.id}>`;
    }
    get user() {
        return this.client.users.resolve(this.id);
    }
}
//# sourceMappingURL=ServerMember.js.map