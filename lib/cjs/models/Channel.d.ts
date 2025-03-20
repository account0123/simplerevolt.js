import { DataEditChannel, Channel as ApiChannel, Override, DataMessageSend, DataMessageSearch } from "revolt-api";
import { Base } from "./Base";
import type { Client } from "../Client";
import { PermissionsBitField } from "../permissions/ops";
import { Permission } from "../permissions";
import type { Message } from "./Message";
import { APIRoutes } from "revolt-api/dist/routes";
import type { User } from "./User";
/**
 * Channel Class
 */
export declare class Channel extends Base {
    #private;
    readonly id: string;
    readonly channelType: ApiChannel["channel_type"];
    lastMessageId: string | null;
    constructor(client: Client, data: ApiChannel);
    /**
     * Mark a channel as read
     * @param message Last read message or its ID
     * @param skipRateLimiter Whether to skip the internal rate limiter
     * @param skipRequest For internal updates only
     * @param skipNextMarking For internal usage only
     */
    ack(message?: Message | string, skipRateLimiter?: boolean, skipRequest?: boolean, skipNextMarking?: boolean): Promise<void>;
    /**
     * Write to string as a channel mention
     */
    toString(): string;
    /**
     * Time when this server was created
     */
    get createdAt(): Date;
    /**
     * Absolute pathname to this channel in the client
     */
    get path(): string;
    /**
     * URL to this channel
     */
    get url(): string;
    /**
     * Whether this channel may be hidden to some users
     */
    get potentiallyRestrictedChannel(): boolean;
    /**
     * Permission the currently authenticated user has against this channel
     */
    get permission(): PermissionsBitField;
    /**
     * Check whether we have a given permission in a channel
     * @param permission Permission Names
     * @returns Whether we have this permission
     */
    havePermission(...permission: (keyof typeof Permission)[]): boolean;
    /**
     * Check whether we have at least one of the given permissions in a channel
     * @param permission Permission Names
     * @returns Whether we have one of the permissions
     */
    orPermission(...permission: (keyof typeof Permission)[]): boolean;
    /**
     * Delete or leave a channel
     * @param leaveSilently Whether to not send a message on leave
     */
    delete(leaveSilently?: boolean): Promise<void>;
    /**
     * Edit a channel
     * @param data Changes
     */
    edit(data: DataEditChannel): Promise<void>;
    static from(client: Client, data: ApiChannel): Channel;
    update(_: Partial<ApiChannel>): this;
}
/**
 * Channels with text-based messages
 * DMChannel | Group | TextChannel | VoiceChannel
 */
export declare class TextBasedChannel extends Channel {
    readonly typingIds: Set<string>;
    constructor(client: Client, data: ApiChannel);
    /**
     * Fetch a channel's webhooks
     * @requires `TextChannel`, `Group`
     * @returns Webhooks
     */
    /**
     * Fetch a message by its ID
     */
    fetchMessage(messageId: string): Promise<Message>;
    /**
     * Fetch multiple messages from a channel
     * @param params Message fetching route data
     */
    fetchMessages(params?: (APIRoutes & {
        method: "get";
        path: "/channels/{target}/messages";
    })["params"]): Promise<Message[]>;
    /**
     * Fetch multiple messages from a channel including the users that sent them
     */
    fetchMessagesWithUsers(params?: Omit<(APIRoutes & {
        method: "get";
        path: "/channels/{target}/messages";
    })["params"], "include_users">): Promise<{
        messages: Message[];
        users: User[];
    }>;
    /**
     * Search for messages
     */
    search(params: Omit<DataMessageSearch, "include_users">): Promise<Message[]>;
    /**
     * Search for messages including the users that sent them
     */
    searchWithUsers(params: Omit<DataMessageSearch, "include_users">): Promise<{
        messages: Message[];
        users: User[];
    }>;
    /**
     * Get mentions in this channel for user.
     */
    get mentions(): Set<string> | undefined;
    /**
     * Start typing in this channel
     */
    startTyping(): void;
    /**
     * Stop typing in this channel
     */
    stopTyping(): void;
    /**
     * Send a message
     * @param data Either the message as a string or message sending route data
     * @returns Sent message
     */
    sendMessage(data: string | DataMessageSend, idempotencyKey?: string): Promise<Message>;
    /**
     * Set role permissions
     * @param role_id Role Id, set to 'default' to affect all users
     * @param permissions Permission value
     */
    setPermissions(role_id: string | undefined, permissions: Override): Promise<{
        channel_type: "SavedMessages";
        _id: string;
        user: string;
    } | {
        channel_type: "DirectMessage";
        _id: string;
        active: boolean;
        recipients: string[];
        last_message_id?: string | null;
    } | {
        channel_type: "Group";
        _id: string;
        name: string;
        owner: string;
        description?: string | null;
        recipients: string[];
        icon?: import("revolt-api/dist/schema").components["schemas"]["File"] | null;
        last_message_id?: string | null;
        permissions?: number | null;
        nsfw?: boolean;
    } | {
        channel_type: "TextChannel";
        _id: string;
        server: string;
        name: string;
        description?: string | null;
        icon?: import("revolt-api/dist/schema").components["schemas"]["File"] | null;
        last_message_id?: string | null;
        default_permissions?: import("revolt-api/dist/schema").components["schemas"]["OverrideField"] | null;
        role_permissions?: {
            [key: string]: import("revolt-api/dist/schema").components["schemas"]["OverrideField"];
        };
        nsfw?: boolean;
    } | {
        channel_type: "VoiceChannel";
        _id: string;
        server: string;
        name: string;
        description?: string | null;
        icon?: import("revolt-api/dist/schema").components["schemas"]["File"] | null;
        default_permissions?: import("revolt-api/dist/schema").components["schemas"]["OverrideField"] | null;
        role_permissions?: {
            [key: string]: import("revolt-api/dist/schema").components["schemas"]["OverrideField"];
        };
        nsfw?: boolean;
    }>;
    /**
     * Get whether this channel is unread.
     */
    get unread(): boolean;
}
//# sourceMappingURL=Channel.d.ts.map