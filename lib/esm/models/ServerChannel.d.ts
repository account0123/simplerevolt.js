import { Channel as ApiChannel, DataMessageSearch } from "revolt-api";
import { TextBasedChannel } from "./Channel";
import { AutumnFile } from "./File";
import { ServerMember, type Client, type Message, type User } from "..";
import { PermissionOverrides } from "../permissions/PermissionOverrides";
import { PermissionOverrideCollection } from "../collections/PermissionOverrideCollection";
import { APIRoutes } from "revolt-api/dist/routes";
type ServerChannelData = Extract<ApiChannel, {
    channel_type: "TextChannel" | "VoiceChannel";
}>;
export declare class ServerChannel extends TextBasedChannel {
    defaultPermissions: PermissionOverrides | null;
    readonly rolePermissions: PermissionOverrideCollection;
    description: string | null;
    icon: AutumnFile | null;
    readonly serverId: string;
    name: string;
    constructor(client: Client, data: ServerChannelData);
    /**
     * Whether this channel may be hidden to some users
     */
    get potentiallyRestrictedChannel(): boolean;
    createInvite(): Promise<{
        type: "Server";
        _id: string;
        server: string;
        creator: string;
        channel: string;
    } | {
        type: "Group";
        _id: string;
        creator: string;
        channel: string;
    }>;
    /**
     * Delete many messages by their IDs
     */
    deleteMessages(ids: string[]): Promise<void>;
    /**
     * Fetch multiple messages from a channel including the users that sent them
     */
    fetchMessagesWithUsers(params?: Omit<(APIRoutes & {
        method: "get";
        path: "/channels/{target}/messages";
    })["params"], "include_users">): Promise<{
        messages: Message[];
        users: User[];
        members?: ServerMember[];
    }>;
    get server(): import("./Server").Server | null;
    /**
     * Search for messages including the users that sent them
     */
    searchWithUsers(params: Omit<DataMessageSearch, "include_users">): Promise<{
        messages: Message[];
        users: User[];
        members: ServerMember[];
    }>;
    update(data: Partial<ServerChannelData>): this;
}
type TextChannelData = Extract<ApiChannel, {
    channel_type: "TextChannel";
}>;
export declare class TextChannel extends ServerChannel {
    constructor(client: Client, data: TextChannelData);
}
type VoiceChannelData = Extract<ApiChannel, {
    channel_type: "VoiceChannel";
}>;
export declare class VoiceChannel extends ServerChannel {
    constructor(client: Client, data: VoiceChannelData);
}
export {};
//# sourceMappingURL=ServerChannel.d.ts.map