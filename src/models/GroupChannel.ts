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

import type { Channel as ApiChannel } from "revolt-api";
import { Channel, User } from ".";
import { AutumnFile, Client } from "..";

export type GroupData = Extract<ApiChannel, { channel_type: "Group" }>;

export class Group extends Channel {
  name: string;
  description: string | null;
  icon: AutumnFile | null;
  ownerId: string;
  permissions: number | null;
  readonly recipientIds: Set<string>;

  constructor(client: Client, data: GroupData) {
    super(client, data);
    this.name = data.name;
    this.description = data.description || null;
    this.icon = data.icon ? new AutumnFile(client, data.icon) : null;
    this.permissions = data.permissions || null;
    this.ownerId = data.owner;
    this.recipientIds = new Set(data.recipients);
  }
  /**
   * Add a user to a group
   * @returns Nothing
   */
  async addMember(userId: string) {
    return await this.client.api.put(`/channels/${this.id as ""}/recipients/${userId as ""}`);
  }
  /**
   * Fetch a channel's members.
   * @requires `Group`
   * @returns An array of the channel's members.
   */
  async fetchMembers(): Promise<User[]> {
    const members = await this.client.api.get(`/channels/${this.id as ""}/members`);

    return members.map((user) => this.client.users._add(new User(this.client, user)));
  }

  /**
   * Remove a user from a group
   * @param user_id ID of the target user
   * @requires `Group`
   */
  async removeMember(user_id: string) {
    return await this.client.api.delete(`/channels/${this.id as ""}/recipients/${user_id as ""}`);
  }

  override update(data: Partial<GroupData>) {
    if (data.name) this.name = data.name;
    if ("description" in data) this.description = data.description || null;
    if ("icon" in data) this.icon = data.icon ? new AutumnFile(this.client, data.icon) : null;
    return this;
  }
}
