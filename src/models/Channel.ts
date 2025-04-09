import {
  DataEditChannel,
  Channel as ApiChannel,
  Override,
  DataMessageSend,
  Message as ApiMessage,
  User as ApiUser,
  DataMessageSearch,
} from "revolt-api";
import type { APIRoutes } from "revolt-api/dist/routes";
import { decodeTime, ulid } from "ulid";

import { Base } from "./Base.js";
import type { Client } from "../Client.js";
import type { Message } from "./Message.js";
import type { User } from "./User.js";
import { PermissionsBitField } from "../permissions/PermissionsBitField.js";
import { Permission } from "../permissions/index.js";

/**
 * Channel Class
 */
export class Channel extends Base {
  readonly id: string;
  readonly channelType: ApiChannel["channel_type"];
  lastMessageId: string | null = null;

  constructor(client: Client, data: ApiChannel) {
    super(client);
    this.id = data._id;
    this.channelType = data.channel_type;
  }

  #ackTimeout?: number;
  #ackLimit: number | null = null;
  #manuallyMarked?: boolean;

  /**
   * Mark a channel as read
   * @param message Last read message or its ID
   * @param skipRateLimiter Whether to skip the internal rate limiter
   * @param skipRequest For internal updates only
   * @param skipNextMarking For internal usage only
   */
  async ack(message?: Message | string, skipRateLimiter?: boolean, skipRequest?: boolean, skipNextMarking?: boolean) {
    if (!message && this.#manuallyMarked) {
      this.#manuallyMarked = false;
      return;
    }
    // Skip the next unread marking
    else if (skipNextMarking) {
      this.#manuallyMarked = true;
    }

    const lastMessageId = (typeof message == "string" ? message : message?.id) ?? this.lastMessageId ?? ulid();

    const unreads = this.client.channelUnreads;
    const channelUnread = unreads.cache.get(this.id);
    if (channelUnread) {
      unreads.patch(this.id, { last_id: lastMessageId });

      if (channelUnread.mentionIds.size) {
        channelUnread.mentionIds.clear();
      }
    }

    // Skip request if not needed
    if (skipRequest) return;

    /**
     * Send the actual acknowledgement request
     */
    const performAck = () => {
      this.#ackLimit = null;
      this.client.api.put(`/channels/${this.id}/ack/${lastMessageId as ""}`);
    };

    if (skipRateLimiter) return performAck();

    clearTimeout(this.#ackTimeout);
    if (this.#ackLimit && +new Date() > this.#ackLimit) {
      performAck();
    }

    // We need to use setTimeout here for both Node.js and browser.
    this.#ackTimeout = setTimeout(performAck, 5e3) as unknown as number;

    if (!this.#ackLimit) {
      this.#ackLimit = +new Date() + 15e3;
    }
  }

  // Implementation for this as SavedMessages
  calculatePermission() {
    return Permission.GrantAllSafe;
  }

  /**
   * Delete or leave a channel
   * @param leaveSilently Whether to not send a message on leave
   * @throws RevoltAPIError
   */
  delete(leaveSilently = false) {
    return this.client.channels.delete(this.id, leaveSilently);
  }

  /**
   * Edit a channel object by its id.
   * @throws RevoltAPIError
   */
  edit(data: DataEditChannel) {
    return this.client.channels.patch(this.id, data);
  }

  /**
   * Fetch channel data by its id, add it to the cache, and return the instance.
   * @throws RevoltAPIError
   */
  fetch() {
    return this.client.channels.fetch(this.id);
  }

  static from: (client: Client, data: ApiChannel) => Channel;

  /**
   * Channel mention
   */
  override toString() {
    return `<#${this.id}>`;
  }

  /**
   * Time when this server was created
   */
  get createdAt() {
    return new Date(decodeTime(this.id));
  }

  /**
   * Absolute pathname to this channel in the client
   */
  get path() {
    return `/channel/${this.id}`;
  }

  /**
   * URL to this channel
   */
  get url() {
    return this.client.configuration?.app + this.path;
  }

  /**
   * Whether this channel may be hidden to some users
   */
  get potentiallyRestrictedChannel() {
    return false;
  }

  /**
   * Permission the currently authenticated user has against this channel
   */
  get permission() {
    return new PermissionsBitField(this.calculatePermission());
  }

  /**
   * Check whether we have a given permission in a channel
   * @param permission Permission Names
   * @returns Whether we have this permission
   */
  havePermission(...permission: (keyof typeof Permission | number)[]) {
    return this.permission.bitwiseAndEq(
      ...permission.map((x) => {
        if (typeof x == "number") return x;
        if (typeof x == "string") return Permission[x] || (console.warn("Unknown permission: %s", x), 0);
        console.warn("Expected permission name or number: %s", typeof x);
        return 0;
      }),
    );
  }

  /**
   * Check whether we have at least one of the given permissions in a channel
   * @param permission Permission Names
   * @returns Whether we have one of the permissions
   */
  orPermission(...permission: (keyof typeof Permission)[]) {
    return permission.findIndex((x) => this.permission.bitwiseAndEq(Permission[x])) != -1;
  }

  /**
   * Fetch a channel's webhooks
   * @requires `TextChannel`, `Group`
   */
  async fetchWebhooks() {
    const webhooks = await this.client.api.get(`/channels/${this.id as ""}/webhooks`);

    return webhooks.map((webhook) => this.client.channelWebhooks.create(this, webhook));
  }

  override update(_: Partial<ApiChannel>) {
    return this;
  }
}

/**
 * Channels with text-based messages
 * DMChannel | Group | TextChannel | VoiceChannel
 */
export class TextBasedChannel extends Channel {
  readonly typingIds: Set<string>;

  constructor(client: Client, data: ApiChannel) {
    super(client, data);
    this.typingIds = new Set();
  }
  /**
   * Fetch a channel's webhooks
   * @requires `TextChannel`, `Group`
   * @returns Webhooks
   */

  /**
   * Fetch a message by its ID
   * @throws RevoltAPIError
   */
  async fetchMessage(messageId: string) {
    const message = await this.client.api.get(`/channels/${this.id as ""}/messages/${messageId as ""}`);

    return this.client.messages.create(message);
  }

  /**
   * Fetch multiple messages from a channel
   * @param params Message fetching route data
   * @throws RevoltAPIError
   */
  async fetchMessages(
    params?: (APIRoutes & {
      method: "get";
      path: "/channels/{target}/messages";
    })["params"],
  ) {
    const messages = (await this.client.api.get(`/channels/${this.id as ""}/messages`, params || {})) as ApiMessage[];

    return messages.map((message) => this.client.messages.create(message));
  }

  /**
   * Fetch multiple messages from a channel including the users that sent them
   * @throws RevoltAPIError
   */
  async fetchMessagesWithUsers(
    params?: Omit<
      (APIRoutes & {
        method: "get";
        path: "/channels/{target}/messages";
      })["params"],
      "include_users"
    >,
  ): Promise<{ messages: Message[]; users: User[] }> {
    const data = (await this.client.api.get(`/channels/${this.id as ""}/messages`, {
      ...params,
      include_users: true,
    })) as { messages: ApiMessage[]; users: ApiUser[] };

    return {
      messages: data.messages.map((message) => this.client.messages.create(message)),
      users: data.users.map((user) => this.client.users.create(user)),
    };
  }

  /**
   * Search for messages
   * @throws RevoltAPIError
   */
  async search(params: Omit<DataMessageSearch, "include_users">) {
    const messages = (await this.client.api.post(`/channels/${this.id as ""}/search`, params)) as ApiMessage[];

    return messages.map((message) => this.client.messages.create(message));
  }

  /**
   * Search for messages including the users that sent them
   * @throws RevoltAPIError
   */
  async searchWithUsers(params: Omit<DataMessageSearch, "include_users">) {
    const data = (await this.client.api.post(`/channels/${this.id as ""}/search`, {
      ...params,
      include_users: true,
    })) as { messages: ApiMessage[]; users: ApiUser[] };

    return {
      messages: data.messages.map((message) => this.client.messages.create(message)),
      users: data.users.map((user) => this.client.users.create(user)),
    };
  }

  /**
   * Get mentions in this channel for user.
   */
  get mentions() {
    if (this.channelType == "SavedMessages" || this.channelType == "VoiceChannel") return undefined;

    return this.client.channelUnreads.resolve(this.id)?.mentionIds;
  }
  /**
   * Start typing in this channel
   */
  startTyping() {
    this.client.events.send({
      type: "BeginTyping",
      channel: this.id,
    });
  }
  /**
   * Stop typing in this channel
   */
  stopTyping() {
    this.client.events.send({
      type: "EndTyping",
      channel: this.id,
    });
  }

  /**
   * Send a message.
   *
   * Content starting with `/s ` sends a silent message.
   * @param data Either the message as a string or message sending route data
   * @returns Sent message
   * @throws RevoltAPIError
   */
  async sendMessage(data: string | DataMessageSend, idempotencyKey: string = ulid()) {
    const msg: DataMessageSend = typeof data == "string" ? { content: data } : data;

    // Mark as silent message
    if (msg.content?.startsWith("/s ")) {
      msg.content = msg.content.substring(3);
      msg.flags ||= 1;
      msg.flags |= 1;
    }

    try {
      const message = await this.client.api.post(`/channels/${this.id as ""}/messages`, msg, {
        headers: {
          "Idempotency-Key": idempotencyKey,
        },
      });
      return this.client.messages.create(message);
    } catch (error) {
      // Propagate error
      throw error;
    }
  }

  /**
   * Set role permissions
   * @param role_id Role Id, set to 'default' to affect all users
   * @param permissions Permission value
   * @throws RevoltAPIError
   */
  async setPermissions(role_id = "default", permissions: Override) {
    return await this.client.api.put(`/channels/${this.id as ""}/permissions/${role_id as ""}`, {
      permissions,
    });
  }

  /**
   * Get whether this channel is unread.
   */
  get unread() {
    if (
      !this.lastMessageId ||
      this.channelType == "SavedMessages" ||
      this.channelType == "VoiceChannel" ||
      this.client.options.channelIsMuted(this)
    )
      return false;

    return (this.client.channelUnreads.resolve(this.id)?.lastMessageId ?? "0").localeCompare(this.lastMessageId) == -1;
  }
}
