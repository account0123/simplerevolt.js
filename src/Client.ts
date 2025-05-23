import { AsyncEventEmitter } from "@vladfrangu/async_event_emitter";
import {
  API,
  Channel as ApiChannel,
  DataCreateBot,
  MFAMethod,
  MFAResponse,
  WebPushSubscription,
  type DataLogin,
  type RevoltConfig,
} from "revolt-api";

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
import type { Channel } from "./models/Channel.js";
import type { DMChannel } from "./models/DMChannel.js";
import type { Emoji } from "./models/Emoji.js";
import type { Group } from "./models/GroupChannel.js";
import { GroupFullInvite, ServerFullInvite } from "./models/Invite.js";
import type { Message } from "./models/Message.js";
import type { Role } from "./models/Role.js";
import type { Server } from "./models/Server.js";
import type { ServerMember } from "./models/ServerMember.js";
import type { User } from "./models/User.js";
import { SyncSettings } from "./models/SyncSettings.js";
import { RJSError } from "./errors/RJSError.js";
import { ErrorCodes } from "./errors/ErrorCodes.js";

type Token = string;
export type Session =
  | { _id: string; token: Token; user_id: string; name: string; subscription?: WebPushSubscription | null }
  | Token;

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
  readonly syncSettings = new SyncSettings(this);
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
   * This fetches your direct messages, including any DM and group DM conversations.
   * @returns Object containing the saved messages channel, direct messages, and groups
   */
  async fetchDMChannels() {
    const result = (await this.api.get("/users/dms")) as ApiChannel[];
    let channels: { savedMessages?: Channel; directMessages: DMChannel[]; groups: Group[] } = {
      directMessages: [],
      groups: [],
    };
    result
      .map((channel) => this.channels.create(channel))
      .forEach((channel) => {
        switch (channel.channelType) {
          case "SavedMessages":
            channels.savedMessages = channel;
            break;
          case "DirectMessage":
            channels.directMessages.push(channel as DMChannel);
            break;
          case "Group":
            channels.groups.push(channel as Group);
            break;
        }
      });
    return channels;
  }

  /**
   * Fetch an invite by its id.
   * @throws RevoltAPIError
   * @throws TypeError - Unknown invite type
   */
  async fetchFullInvite(id: string) {
    const result = await this.api.get(`/invites/${id as ""}`);
    const type = result.type;
    switch (type) {
      case "Group":
        return new GroupFullInvite(this, result);
      case "Server":
        return new ServerFullInvite(this, result);
      default:
        throw new TypeError("Unknown invite type " + type);
    }
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
    this.disconnect();
    await this.events.connect(
      this.configuration?.ws ?? "wss://ws.revolt.chat",
      typeof this.#session == "string" ? this.#session : this.#session!.token,
    );
  }

  /** Disconnect from Revolt */
  disconnect() {
    clearTimeout(this.#reconnectTimeout);
    this.events.disconnect();
    this.ready = false;
    this.emit("disconnected");
  }

  /**
   * This method should be called if the account is newly created.
   * @param username New username
   * @returns User if onboarding was successful, otherwise null
   * @throws TypeError - Invalid username
   * @throws RevoltAPIError
   */
  async completeOnboarding(username: string) {
    if (typeof username != "string") throw new TypeError("username must be a string");
    if (!username.match(/^(\p{L}|[\d_.\-])+$/u)) {
      throw new TypeError(
        "username provided is not valid (it should contain only letters, digits, underscores, dashes, and periods)",
      );
    }
    const result = await this.api.post("/onboard/complete");
    this.user = this.users.create(result);
    return this.user;
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
   * Join an invite by its code.
   */
  async joinInvite(code: string) {
    const result = await this.api.post(`/invites/${code as ""}`);
    switch (result.type) {
      case "Group":
        return {
          users: result.users.map((user) => this.users.create(user)),
          group: this.channels.create(result.channel),
        };
      case "Server":
        const server = this.servers.create(result.server);
        const channels = result.channels.map((channel) => this.channels.create(channel));
        channels.forEach((channel) => server.channels._add(channel));
        return {
          server,
          channels,
        };
    }
  }

  /**
   * Log in with auth data, creating a new session in the process.
   * @param details Login data object
   * @example
   * const { callback } = await client.login({ username: "user", password: "password" });
   * if (callback) {
   *   await callback("my_username"); // Complete onboarding
   * }
   */
  async login(details: DataLogin) {
    await this.#fetchConfiguration();
    const loginResult = await this.api.post("/auth/session/login", details);
    const result = loginResult.result;
    switch (result) {
      case "Success":
        this.#session = loginResult;
        this.#updateHeaders();
        await this.connect();
        break;
      case "MFA":
        throw new RJSError(ErrorCodes.MFANotImplemented);
      case "Disabled":
        throw new RJSError(ErrorCodes.AccountDisabled, loginResult.user_id);
      default:
        throw "Unknown login result: " + result;
    }

    // Call onboarding
    const hello = await this.api.get("/onboard/hello");
    if (hello.onboarding) {
      return {
        callback: this.completeOnboarding.bind(this),
      };
    }
  }

  /**
   * @param mfa_ticket MFA ticket
   * @param friendly_name Friendly name
   * @param code Password, recovery code, or TOTP code
   * @param method Password | Recovery | Totp
   * @throws RevoltAPIError
   * @returns Credentials for login
   */
  getMFACredentials(mfa_ticket: string, friendly_name: string | null, code: string, method: MFAMethod): DataLogin {
    if (typeof code != "string") throw new TypeError("code must be a string");
    if (typeof mfa_ticket != "string") throw new TypeError("ticket must be a string");

    let password, recovery_code, totp_code;
    switch (method) {
      case "Password":
        password = code;
        break;
      case "Recovery":
        recovery_code = code;
        break;
      case "Totp":
        totp_code = code;
        break;
      default:
        throw new TypeError("Unknown MFA method: " + method);
    }
    return { mfa_ticket, mfa_response: { password, recovery_code, totp_code } as MFAResponse, friendly_name };
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

  /**
   * Delete current session, and disconnect from EventClient.
   * @param request Whether to request a logout (not recommended for bots)
   */
  async logout(request = false) {
    if (request) {
      await this.api.post("/auth/session/logout");
    }
    this.disconnect();
    this.#session = undefined;
    this.#updateHeaders();
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
