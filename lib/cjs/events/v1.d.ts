import type { Channel as ApiChannel, Emoji as ApiEmoji, Error, FieldsChannel, FieldsMember, FieldsServer, FieldsUser, Member, MemberCompositeKey, Message as ApiMessage, RelationshipStatus, Role, Server as ApiServer, User as ApiUser } from "revolt-api";
import { Client, User, Server, Channel, Message, Emoji } from "..";
import { ServerMember } from "../models/ServerMember";
/**
 * Version 1 of the events protocol
 */
export type ProtocolV1 = {
    client: ClientMessage;
    server: ServerMessage;
};
/**
 * Messages sent to the server
 */
type ClientMessage = {
    type: "Authenticate";
    token: string;
} | {
    type: "BeginTyping";
    channel: string;
} | {
    type: "EndTyping";
    channel: string;
} | {
    type: "Ping";
    data: number;
} | {
    type: "Pong";
    data: number;
};
export declare enum ServerEventType {
    Error = "Error",
    Bulk = "Bulk",
    Authenticated = "Authenticated",
    Ready = "Ready",
    Ping = "Ping",
    Pong = "Pong",
    Message = "Message",
    MessageUpdate = "MessageUpdate",
    MessageAppend = "MessageAppend",
    MessageDelete = "MessageDelete",
    MessageReact = "MessageReact",
    MessageUnreact = "MessageUnreact",
    MessageRemoveReaction = "MessageRemoveReaction",
    ChannelCreate = "ChannelCreate",
    ChannelUpdate = "ChannelUpdate",
    ChannelDelete = "ChannelDelete",
    ChannelGroupJoin = "ChannelGroupJoin",
    ChannelGroupLeave = "ChannelGroupLeave",
    ChannelStartTyping = "ChannelStartTyping",
    ChannelStopTyping = "ChannelStopTyping",
    ChannelAck = "ChannelAck",
    ServerCreate = "ServerCreate",
    ServerUpdate = "ServerUpdate",
    ServerDelete = "ServerDelete",
    ServerMemberUpdate = "ServerMemberUpdate",
    ServerMemberJoin = "ServerMemberJoin",
    ServerMemberLeave = "ServerMemberLeave",
    ServerRoleUpdate = "ServerRoleUpdate",
    ServerRoleDelete = "ServerRoleDelete",
    UserUpdate = "UserUpdate",
    UserRelationship = "UserRelationship",
    UserPresence = "UserPresence",
    UserSettingsUpdate = "UserSettingsUpdate",
    UserPlatformWipe = "UserPlatformWipe",
    EmojiCreate = "EmojiCreate",
    EmojiDelete = "EmojiDelete",
    Auth = "Auth"
}
/**
 * Messages sent from the server
 */
type ServerMessage = {
    type: "Error";
    data: Error;
} | {
    type: "Bulk";
    v: ServerMessage[];
} | {
    type: "Authenticated";
} | ({
    type: "Ready";
} & ReadyData) | {
    type: "Ping";
    data: number;
} | {
    type: "Pong";
    data: number;
} | ({
    type: "Message";
} & Message) | {
    type: "MessageUpdate";
    id: string;
    channel: string;
    data: Partial<ApiMessage>;
} | {
    type: "MessageAppend";
    id: string;
    channel: string;
    append: Pick<Partial<ApiMessage>, "embeds">;
} | {
    type: "MessageDelete";
    id: string;
    channel: string;
} | {
    type: "MessageReact";
    id: string;
    channel_id: string;
    user_id: string;
    emoji_id: string;
} | {
    type: "MessageUnreact";
    id: string;
    channel_id: string;
    user_id: string;
    emoji_id: string;
} | {
    type: "MessageRemoveReaction";
    id: string;
    channel_id: string;
    emoji_id: string;
} | {
    type: "BulkMessageDelete";
    channel: string;
    ids: string[];
} | ({
    type: "ChannelCreate";
} & ApiChannel) | {
    type: "ChannelUpdate";
    id: string;
    data: Partial<ApiChannel>;
    clear?: FieldsChannel[];
} | {
    type: "ChannelDelete";
    id: string;
} | {
    type: "ChannelGroupJoin";
    id: string;
    user: string;
} | {
    type: "ChannelGroupLeave";
    id: string;
    user: string;
} | {
    type: "ChannelStartTyping";
    id: string;
    user: string;
} | {
    type: "ChannelStopTyping";
    id: string;
    user: string;
} | {
    type: "ChannelAck";
    id: string;
    user: string;
    message_id: string;
} | {
    type: "ServerCreate";
    id: string;
    server: ApiServer;
    channels: ApiChannel[];
} | {
    type: "ServerUpdate";
    id: string;
    data: Partial<ApiServer>;
    clear?: FieldsServer[];
} | {
    type: "ServerDelete";
    id: string;
} | {
    type: "ServerMemberUpdate";
    id: MemberCompositeKey;
    data: Partial<Member>;
    clear?: FieldsMember[];
} | {
    type: "ServerMemberJoin";
    id: string;
    user: string;
} | {
    type: "ServerMemberLeave";
    id: string;
    user: string;
} | {
    type: "ServerRoleUpdate";
    id: string;
    role_id: string;
    data: Partial<Role>;
} | {
    type: "ServerRoleDelete";
    id: string;
    role_id: string;
} | {
    type: "UserUpdate";
    id: string;
    data: Partial<ApiUser>;
    clear?: FieldsUser[];
} | {
    type: "UserRelationship";
    user: ApiUser;
    status: RelationshipStatus;
} | {
    type: "UserPresence";
    id: string;
    online: boolean;
} | {
    type: "UserSettingsUpdate";
    id: string;
    update: {
        [key: string]: [number, string];
    };
} | {
    type: "UserPlatformWipe";
    user_id: string;
    flags: number;
} | ({
    type: "EmojiCreate";
} & ApiEmoji) | {
    type: "EmojiDelete";
    id: string;
} | ({
    type: "Auth";
} & ({
    event_type: "DeleteSession";
    user_id: string;
    session_id: string;
} | {
    event_type: "DeleteAllSessions";
    user_id: string;
    exclude_session_id: string;
}));
/**
 * Initial synchronisation packet
 */
type ReadyData = {
    users: User[];
    servers: Server[];
    channels: Channel[];
    members: ServerMember[];
    emojis: Emoji[];
};
/**
 * Handle an event for the Client
 * @param client Client
 * @param event Event
 * @param setReady Signal state change
 */
export declare function handleEvent(client: Client, event: ServerMessage, setReady: (value: boolean) => void): Promise<void>;
export {};
//# sourceMappingURL=v1.d.ts.map