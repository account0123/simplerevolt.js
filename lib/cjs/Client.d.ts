import { AsyncEventEmitter } from '@vladfrangu/async_event_emitter';
import { API, Role, type DataLogin, type RevoltConfig } from 'revolt-api';
import { EventClient, EventClientOptions } from './events/EventClient';
import { ChannelUnreadCollection } from './collections/ChannelUnreadCollection';
import { ChannelCollection } from './collections/ChannelCollection';
import { ServerCollection } from './collections/ServerCollection';
import { UserCollection } from './collections/UserCollection';
import { Channel, Emoji, Message, Server, ServerMember, User } from './models';
import { EmojiCollection } from './collections/EmojiCollection';
import { MessageCollection } from './collections/MessageCollection';
type Token = string;
export type Session = {
    _id: string;
    token: Token;
    user_id: string;
} | Token;
/**
 * Events provided by the client
 */
export type Events = {
    error(error: any): void;
    connected(): void;
    connecting(): void;
    disconnected(): void;
    ready(): void;
    logout(): void;
    messageCreate(message: Message): void;
    messageUpdate(message: Message, previousMessage: Message): void;
    messageDelete(message: Message): void;
    messageDeleteBulk(messages: Message[], channel?: Channel): void;
    messageReactionAdd(message: Message, userId: string, emoji: string): void;
    messageReactionRemove(message: Message, userId: string, emoji: string): void;
    messageReactionRemoveEmoji(message: Message, emoji: string): void;
    channelCreate(channel: Channel): void;
    channelUpdate(channel: Channel, previousChannel: Channel): void;
    channelDelete(channel: Channel): void;
    channelGroupJoin(channel: Channel, user: User): void;
    channelGroupLeave(channel: Channel, user?: User): void;
    channelStartTyping(channel: Channel, user?: User): void;
    channelStopTyping(channel: Channel, user?: User): void;
    channelAcknowledged(channel: Channel, messageId: string): void;
    serverCreate(server: Server): void;
    serverUpdate(server: Server, previousServer: Server): void;
    serverDelete(server: Server): void;
    serverLeave(server: Server): void;
    serverRoleUpdate(server: Server, roleId: string, previousRole: Role): void;
    serverRoleDelete(server: Server, roleId: string, role: Role): void;
    serverMemberUpdate(member: ServerMember, previousMember: ServerMember): void;
    serverMemberJoin(member: ServerMember): void;
    serverMemberLeave(member: ServerMember): void;
    userUpdate(user: User, previousUser: User): void;
    userSettingsUpdate(id: string, update: Record<string, [number, string]>): void;
    emojiCreate(emoji: Emoji): void;
    emojiDelete(emoji: Emoji): void;
};
/**
 * Client options object
 */
export type ClientOptions = Partial<EventClientOptions> & {
    /**
     * Base URL of the API server
     */
    baseURL: string;
    /**
     * Whether to allow partial objects to emit from events
     * @default false
     */
    partials: boolean;
    /**
     * Whether to eagerly fetch users and members for incoming events
     * @default true
     * @deprecated
     */
    eagerFetching: boolean;
    /**
     * Whether to automatically sync unreads information
     * @default false
     */
    syncUnreads: boolean;
    /**
     * Whether to reconnect when disconnected
     * @default true
     */
    autoReconnect: boolean;
    /**
     * Whether to rewrite sent messages that include identifiers such as @silent
     * @default true
     */
    messageRewrites: boolean;
    /**
     * Retry delay function
     * @param retryCount Count
     * @returns Delay in seconds
     * @default (2^x-1) ±20%
     */
    retryDelayFunction(retryCount: number): number;
    /**
     * Check whether a channel is muted
     * @param channel Channel
     * @return Whether it is muted
     * @default false
     */
    channelIsMuted(channel: Channel): boolean;
};
export declare class Client extends AsyncEventEmitter<keyof Events> {
    #private;
    configuration?: RevoltConfig | undefined;
    api: API;
    readonly channelUnreads: ChannelUnreadCollection;
    readonly channels: ChannelCollection;
    readonly emojis: EmojiCollection;
    readonly events: EventClient<1>;
    readonly messages: MessageCollection;
    readonly options: ClientOptions;
    private ready;
    readonly servers: ServerCollection;
    user: User | null;
    readonly users: UserCollection;
    constructor(options?: Partial<ClientOptions>, configuration?: RevoltConfig | undefined);
    get sessionId(): string | null | undefined;
    /**
     * Get authentication header
     */
    get authenticationHeader(): string[];
    /**
     * Connect to Revolt
     */
    connect(): void;
    /**
     * Log in with auth data, creating a new session in the process.
     * @param details Login data object
     * @returns An on-boarding function if on-boarding is required, undefined otherwise
     */
    login(details: DataLogin): Promise<void>;
    /**
     * Log in as a bot
     * @param token Bot token
     */
    loginBot(token: string): Promise<void>;
    /**
     * Use an existing session
     */
    useExistingSession(session: Session): Promise<void>;
    /**
    * Proxy a file through January.
    * @param url URL to proxy
    * @returns Proxied media URL
    */
    proxyFile(url: string): string;
}
export {};
//# sourceMappingURL=Client.d.ts.map