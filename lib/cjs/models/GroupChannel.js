"use strict";
/** @description Display name of the channel
 name: string;
 /** @description User id of the owner of the group
 owner: string;
 /** @description Channel description
 description?: string | null;
 /** @description Array of user ids participating in channel
 recipients: string[];
 /** @description Custom icon attachment
 icon?: components["schemas"]["File"] | null;
 /** @description Id of the last message sent in this channel
 last_message_id?: string | null;
 /**
  * Format: int64
  * @description Permissions assigned to members of this group (does not apply to the owner of the group)
  
 permissions?: number | null;
 /** @description Whether this group is marked as not safe for work
 nsfw?: boolean;
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Group = void 0;
const _1 = require(".");
const __1 = require("..");
class Group extends _1.Channel {
    name;
    description;
    icon;
    ownerId;
    permissions;
    recipientIds;
    constructor(client, data) {
        super(client, data);
        this.name = data.name;
        this.description = data.description || null;
        this.icon = data.icon ? new __1.AutumnFile(client, data.icon) : null;
        this.permissions = data.permissions || null;
        this.ownerId = data.owner;
        this.recipientIds = new Set(data.recipients);
    }
    /**
     * Add a user to a group
     * @returns Nothing
     */
    async addMember(userId) {
        return await this.client.api.put(`/channels/${this.id}/recipients/${userId}`);
    }
    /**
     * Fetch a channel's members.
     * @requires `Group`
     * @returns An array of the channel's members.
     */
    async fetchMembers() {
        const members = await this.client.api.get(`/channels/${this.id}/members`);
        return members.map((user) => this.client.users._add(new _1.User(this.client, user)));
    }
    /**
     * Remove a user from a group
     * @param user_id ID of the target user
     * @requires `Group`
     */
    async removeMember(user_id) {
        return await this.client.api.delete(`/channels/${this.id}/recipients/${user_id}`);
    }
    update(data) {
        if (data.name)
            this.name = data.name;
        if ("description" in data)
            this.description = data.description || null;
        if ("icon" in data)
            this.icon = data.icon ? new __1.AutumnFile(this.client, data.icon) : null;
        return this;
    }
}
exports.Group = Group;
//# sourceMappingURL=GroupChannel.js.map