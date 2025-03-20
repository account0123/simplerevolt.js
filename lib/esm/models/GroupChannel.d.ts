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
export type GroupData = Extract<ApiChannel, {
    channel_type: "Group";
}>;
export declare class Group extends Channel {
    name: string;
    description: string | null;
    icon: AutumnFile | null;
    ownerId: string;
    permissions: number | null;
    readonly recipientIds: Set<string>;
    constructor(client: Client, data: GroupData);
    /**
     * Add a user to a group
     * @returns Nothing
     */
    addMember(userId: string): Promise<undefined>;
    /**
     * Fetch a channel's members.
     * @requires `Group`
     * @returns An array of the channel's members.
     */
    fetchMembers(): Promise<User[]>;
    /**
     * Remove a user from a group
     * @param user_id ID of the target user
     * @requires `Group`
     */
    removeMember(user_id: string): Promise<undefined>;
    update(data: Partial<GroupData>): this;
}
//# sourceMappingURL=GroupChannel.d.ts.map