"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoiceChannel = exports.TextChannel = exports.ServerChannel = void 0;
const Channel_1 = require("./Channel");
const ops_1 = require("../permissions/ops");
const File_1 = require("./File");
const PermissionOverrideCollection_1 = require("../collections/PermissionOverrideCollection");
const permissions_1 = require("../permissions");
class ServerChannel extends Channel_1.TextBasedChannel {
    defaultPermissions = null;
    rolePermissions = new PermissionOverrideCollection_1.PermissionOverrideCollection(this);
    description = null;
    icon = null;
    serverId;
    name;
    constructor(client, data) {
        super(client, data);
        this.name = data.name;
        this.serverId = data.server;
        this.update(data);
    }
    /**
     * Whether this channel may be hidden to some users
     */
    get potentiallyRestrictedChannel() {
        const deny = this.defaultPermissions?.deny || new ops_1.PermissionsBitField();
        // Default is denied to view this channel?
        const denyViewChannel = deny.bitwiseAndEq(permissions_1.Permission.ViewChannel);
        // Default is denied to view server channels?
        const defaultNotViewChannel = !this.server?.defaultPermissions.bitwiseAndEq(permissions_1.Permission.ViewChannel);
        return (denyViewChannel ||
            defaultNotViewChannel ||
            [...(this.server?.roles.cache.keys() ?? [])].some((role) => {
                const roleOverrideDeny = this.rolePermissions.resolve(role)?.deny || new ops_1.PermissionsBitField();
                const roleDeny = this.server?.roles.resolve(role)?.permissions?.deny || new ops_1.PermissionsBitField();
                // Role is denied to view this channel?
                return (roleOverrideDeny.bitwiseAndEq(permissions_1.Permission.ViewChannel) ||
                    // Role is denied to view server channels?
                    roleDeny.bitwiseAndEq(permissions_1.Permission.ViewChannel));
            }));
    }
    async createInvite() {
        return await this.client.api.post(`/channels/${this.id}/invites`);
    }
    /**
     * Delete many messages by their IDs
     */
    async deleteMessages(ids) {
        await this.client.api.delete(`/channels/${this.id}/messages/bulk`, {
            ids,
        });
    }
    /**
     * Fetch multiple messages from a channel including the users that sent them
     */
    async fetchMessagesWithUsers(params) {
        const data = (await this.client.api.get(`/channels/${this.id}/messages`, {
            ...params,
            include_users: true,
        }));
        return {
            messages: data.messages.map((message) => this.client.messages.create(message)),
            users: data.users.map((user) => this.client.users.create(user)),
            members: data.members.map((member) => this.server ? this.server.members.create(member) : null).filter((x) => x),
        };
    }
    get server() {
        return this.client.servers.resolve(this.serverId);
    }
    /**
     * Search for messages including the users that sent them
     */
    async searchWithUsers(params) {
        const data = (await this.client.api.post(`/channels/${this.id}/search`, {
            ...params,
            include_users: true,
        }));
        return {
            messages: data.messages.map((message) => this.client.messages.create(message)),
            users: data.users.map((user) => this.client.users.create(user)),
            members: data.members.map((member) => this.server ? this.server.members.create(member) : null).filter((x) => x),
        };
    }
    update(data) {
        if (data.name)
            this.name = data.name;
        if ("description" in data)
            this.description = data.description || null;
        if ("icon" in data)
            this.icon = data.icon ? new File_1.AutumnFile(this.client, data.icon) : null;
        if ("default_permissions" in data)
            this.defaultPermissions = data.default_permissions
                ? this.rolePermissions.create({
                    id: "Default",
                    ...data.default_permissions,
                })
                : null;
        return this;
    }
}
exports.ServerChannel = ServerChannel;
class TextChannel extends ServerChannel {
    constructor(client, data) {
        super(client, data);
        this.update(data);
    }
}
exports.TextChannel = TextChannel;
class VoiceChannel extends ServerChannel {
    constructor(client, data) {
        super(client, data);
        this.update(data);
    }
}
exports.VoiceChannel = VoiceChannel;
//# sourceMappingURL=ServerChannel.js.map