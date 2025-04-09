import { AsyncEventEmitter } from "@vladfrangu/async_event_emitter";
import { API, DataCreateBot, type DataLogin, type RevoltConfig } from "revolt-api";

import { ConnectionState, EventClient, EventClientOptions } from "./events/EventClient.js";
import { handleEventV1 } from "./events/index.js";

// Collections
import { BotCollection } from "./collections/BotCollection.js";
import { ChannelCollection } from "./collections/ChannelCollection.js";
import { ChannelUnreadCollection } from "./collections/ChannelUnreadCollection.js";
import { ChannelWebhookCollection } from "./collections/ChannelWebhookCollection.js";
import { EmojiCollection } from "./collections/EmojiCollection.js";
import { MessageCollection } from "./collections/MessageCollection.js";
import { ServerCollection } from "./collections/ServerCollection.js";
import { UserCollection } from "./collections/UserCollection.js";

import { SimpleRequest } from "./rest/Request.js";

// Models
import { PublicBot } from "./models/Bot.js";
import { Channel } from "./models/Channel.js";
import { Emoji } from "./models/Emoji.js";
import { Message } from "./models/Message.js";
import { Role } from "./models/Role.js";
import { Server } from "./models/Server.js";
import { ServerMember } from "./models/ServerMember.js";
import { User } from "./models/User.js";

type Token = string;
export type Session = { _id: string; token: Token; user_id: string } | Token;

/**
 * Events provided by the client
 */
export interface Events {
  error: [error: any];

  connected: [];
  connecting: [];
  disconnected: [];
  ready: [];
  logout: [];

  messageCreate: [message: Message];
  messageUpdate: [message: Message, previousMessage: Message];
  messageDelete: [message: Message];
  messageDeleteBulk: [messages: Message[], channel?: Channel];
  messageReactionAdd: [message: Message, userId: string, emoji: string];
  messageReactionRemove: [message: Message, userId: string, emoji: string];
  messageReactionRemoveEmoji: [message: Message, emoji: string];

  channelCreate: [channel: Channel];
  channelUpdate: [channel: Channel, previousChannel: Channel];
  channelDelete: [channel: Channel];
  channelGroupJoin: [channel: Channel, user: User];
  channelGroupLeave: [channel: Channel, user?: User];
  channelStartTyping: [channel: Channel, user?: User];
  channelStopTyping: [channel: Channel, user?: User];
  channelAcknowledged: [channel: Channel, messageId: string];

  serverCreate: [server: Server];
  serverUpdate: [server: Server, previousServer: Server];
  serverDelete: [server: Server];
  serverLeave: [server: Server];
  serverRoleUpdate: [server: Server, roleId: string, previousRole: Role];
  serverRoleDelete: [server: Server, roleId: string, role: Role];

  serverMemberUpdate: [member: ServerMember, previousMember: ServerMember];
  serverMemberJoin: [member: ServerMember];
  serverMemberLeave: [member: ServerMember];

  userUpdate: [user: User, previousUser: User];
  userSettingsUpdate: [id: string, update: Record<string, [number, string]>];

  emojiCreate: [emoji: Emoji];
  emojiDelete: [emoji: Emoji];
}

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

export class Client extends AsyncEventEmitter<Events> {
  api: SimpleRequest;
  #connectionFailureCount = 0;
  #reconnectTimeout: number | undefined;
  #session: Session | undefined;
  readonly bots = new BotCollection(this);
  readonly channelUnreads = new ChannelUnreadCollection(this);
  readonly channels = new ChannelCollection(this);
  readonly emojis = new EmojiCollection(this);
  readonly events: EventClient<1>;
  readonly messages = new MessageCollection(this);
  readonly channelWebhooks = new ChannelWebhookCollection(this);
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
      baseURL: "https://api.revolt.chat",
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
    this.api = new SimpleRequest(
      new API({
        baseURL: this.options.baseURL,
      }),
    );
    const setReady = (ready: boolean) => {
      if (typeof ready != "boolean") throw new Error("ready must be a boolean");
      this.ready = ready;
    };
    this.events = new EventClient(1, "json", this.options);
    this.events.on("error", (error) => this.emit("error", error));

    this.events.on("state", (state: ConnectionState) => {
      switch (state) {
        case ConnectionState.Connected:
          {
            this.servers.cache.forEach((server) => server.resetSyncStatus());
            this.#connectionFailureCount = 0;
            this.emit("connected");
          }
          break;
        case ConnectionState.Connecting:
          this.emit("connecting");
          break;
        case ConnectionState.Disconnected:
          this.emit("disconnected");
          if (this.options.autoReconnect) {
            this.#reconnectTimeout = setTimeout(
              () => this.connect(),
              this.options.retryDelayFunction(this.#connectionFailureCount) * 1e3,
            ) as never;
            this.#connectionFailureCount++;
          }
          break;
      }
    });

    this.events.on("event", (event) => handleEventV1(this, event, setReady.bind(this)));
  }

  /**
   *
   * @throws RevoltAPIError
   */
  async createBot(data: DataCreateBot) {
    const bot = await this.api.post("/bots/create", data);
    return this.bots.create(bot);
  }

  /**
   * Retrieve your user information and updates the client's user instance.
   * @throws RevoltAPIError
   */
  async fetchUser() {
    if (arguments.length) console.warn("Client#fetchUser expects 0 arguments, but got %d", arguments.length);
    const data = await this.api.get("/users/@me");
    this.user = this.users.create(data);
    return this.user;
  }

  /**
   * Fetch details of a public (or owned) bot by its id.
   * @throws RevoltAPIError
   */
  async fetchPublicBot(id: string) {
    const data = await this.api.get(`/bots/${id as ""}/invite`);
    return new PublicBot(this, data);
  }

  get connectionFailures() {
    return this.#connectionFailureCount;
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
  async connect() {
    clearTimeout(this.#reconnectTimeout);
    this.events.disconnect();
    this.ready = false;
    await this.events.connect(
      this.configuration?.ws ?? "wss://ws.revolt.chat",
      typeof this.#session == "string" ? this.#session : this.#session!.token,
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
    this.api = new SimpleRequest(
      new API({
        baseURL: this.options.baseURL,
        authentication: {
          revolt: this.#session,
        },
      }),
    );
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
    await this.connect();
  }

  get sessionId() {
    return typeof this.#session == "string" ? null : this.#session?._id;
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
      return `${this.configuration.features.january.url}/proxy?url=${encodeURIComponent(url)}`;
    } else {
      return url;
    }
  }
}
