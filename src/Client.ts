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
import { handleEventV1 } from './events';

type Token = string;
export type Session = { _id: string; token: Token; user_id: string } | Token;


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
  messageDeleteBulk(messages:Message[], channel?: Channel): void;
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
  serverLeave(server:Server): void;
  serverRoleUpdate(server: Server, roleId: string, previousRole: Role): void;
  serverRoleDelete(server: Server, roleId: string, role: Role): void;

  serverMemberUpdate(
    member: ServerMember,
    previousMember: ServerMember
  ): void;
  serverMemberJoin(member: ServerMember): void;
  serverMemberLeave(member: ServerMember): void;

  userUpdate(user: User, previousUser:User): void;
  userSettingsUpdate(
    id: string,
    update: Record<string, [number, string]>
  ): void;

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

export class Client extends AsyncEventEmitter<keyof Events> {
  
  api: API;
  #reconnectTimeout: number | undefined;
  #session: Session | undefined;
  readonly channelUnreads = new ChannelUnreadCollection(this);
  readonly channels = new ChannelCollection(this);
  readonly emojis = new EmojiCollection(this);
  readonly events: EventClient<1>;
  readonly messages = new MessageCollection(this);
  readonly options: ClientOptions;
  // @ts-ignore unused
  private ready: boolean = false;
  readonly servers = new ServerCollection(this);
  user: User | null = null;
  readonly users = new UserCollection(this);
  constructor(
    options?: Partial<ClientOptions>,
    public configuration?: RevoltConfig,
  ) {
    super();

    this.options = {
      baseURL: 'https://api.revolt.chat',
      partials: false,
      eagerFetching: true,
      syncUnreads: false,
      autoReconnect: true,
      messageRewrites: true,
      /**
       * Retry delay function
       * @param retryCount Count
       * @returns Delay in seconds
       */
      retryDelayFunction(retryCount) {
        return (Math.pow(2, retryCount) - 1) * (0.8 + Math.random() * 0.4);
      },
      /**
       * Check whether a channel is muted
       * @param channel Channel
       * @return Whether it is muted
       */
      channelIsMuted() {
        return false;
      },
      ...options,
    };
    this.api = new API({
      baseURL: this.options.baseURL,
    });
    
    const setReady = (ready: boolean) => {
      if (typeof ready != "boolean") throw new Error("ready must be a boolean");
      this.ready = ready;
    }
    this.events = new EventClient(1, "json", this.options);
    this.events.on("error", (error) => this.emit("error", error));

    this.events.on("event", (event) =>
      handleEventV1(this, event, setReady.bind(this))
    );
  }

  get sessionId() {
    return typeof this.#session == "string" ? null : this.#session?._id;
  }

  /**
   * Get authentication header
   */
  get authenticationHeader() {
    return typeof this.#session == "string"
      ? ["X-Bot-Token", this.#session]
      : ["X-Session-Token", this.#session?.token as string];
  }

  /**
   * Connect to Revolt
   */
  connect() {
    clearTimeout(this.#reconnectTimeout);
    this.events.disconnect();
    this.ready = false;
    this.events.connect(
      this.configuration?.ws ?? "wss://ws.revolt.chat",
      typeof this.#session == "string" ? this.#session : this.#session!.token
    );
  }

  /**
   * Fetches the configuration of the server if it has not been already fetched.
   */
  async #fetchConfiguration() {
    if (!this.configuration) {
      this.configuration = await this.api.get("/");
    }
  }

  /**
   * Update API object to use authentication.
   */
  #updateHeaders() {
    this.api = new API({
      baseURL: this.options.baseURL,
      authentication: {
        revolt: this.#session,
      },
    });
  }

  /**
   * Log in with auth data, creating a new session in the process.
   * @param details Login data object
   * @returns An on-boarding function if on-boarding is required, undefined otherwise
   */
  async login(details: DataLogin) {
    await this.#fetchConfiguration();
    const data = await this.api.post("/auth/session/login", details);
    if (data.result == "Success") {
      this.#session = data;
      // TODO: return await this.connect();
    } else {
      throw "MFA not implemented!";
    }
  }

  /**
   * Log in as a bot
   * @param token Bot token
   */
  async loginBot(token: string) {
    await this.#fetchConfiguration();
    this.#session = token;
    this.#updateHeaders();
    this.connect();
  }

  /**
   * Use an existing session
   */
  async useExistingSession(session: Session) {
    this.#session = session;
    this.#updateHeaders();
  }


   /**
   * Proxy a file through January.
   * @param url URL to proxy
   * @returns Proxied media URL
   */
   proxyFile(url: string): string {
    if (this.configuration?.features.january.enabled) {
      return `${
        this.configuration.features.january.url
      }/proxy?url=${encodeURIComponent(url)}`;
    } else {
      return url;
    }
  }
}
