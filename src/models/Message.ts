import type { Message as ApiMessage, DataEditMessage, DataMessageSend, Embed } from "revolt-api";

import type { Client } from "../Client.js";
import { MessageReactions } from "./MessageReactions.js";
import { Base } from "./Base.js";
import { MessageEmbed } from "./MessageEmbed.js";
import type { ServerMember } from "./ServerMember.js";
import type { User } from "./User.js";
import type { TextBasedChannel } from "./Channel.js";
import { ServerChannel } from "./ServerChannel.js";

export class Message extends Base {
  readonly authorId: string;
  readonly id: string;
  content: string | null;
  readonly channelId: string;
  editedAt: Date | null;
  embeds: MessageEmbed[] | null;
  flags: MessageFlags;
  readonly member: ServerMember | null | undefined;
  pinned: boolean;
  readonly reactions: MessageReactions;
  readonly replyIds: Set<string> = new Set();
  readonly userId: string | null;
  readonly user: User | null;

  constructor(client: Client, data: ApiMessage) {
    super(client);
    this.authorId = data.author;
    this.id = data._id;
    this.content = data.content || null;
    this.editedAt = data.edited ? new Date(data.edited) : null;
    this.flags = data.flags || 0;
    this.channelId = data.channel;
    this.embeds = data.embeds?.map((embed) => MessageEmbed.from(client, embed)) || null;
    this.member = data.member ? client.servers.resolve(data.member._id.server)?.members.create(data.member) : null;
    this.reactions = new MessageReactions(this, data.reactions || {}, data.interactions);
    this.userId = data.user?._id || null;
    this.user = data.user ? client.users.create(data.user) : null;
    this.pinned = data.pinned || false;
  }

  /**
   * Acknowledge this message as read
   */
  ack() {
    this.channel?.ack(this);
  }

  addEmbeds(...embeds: Embed[]) {
    const actual = this.embeds || [];
    embeds.forEach((embed) => actual.push(MessageEmbed.from(this.client, embed)));
    this.embeds = actual;
  }

  get author() {
    return this.client.users.resolve(this.authorId);
  }

  get channel() {
    return this.client.channels.resolve(this.channelId) as TextBasedChannel;
  }

  /**
   * Clear all reactions from this message
   */
  clearReactions() {
    return this.reactions.clearReactions();
  }

  /**
   * Delete a message
   * @throws RevoltAPIError
   */
  delete() {
    return this.client.messages.delete(this.id);
  }

  /**
   * Edit this message.
   * @throws RevoltAPIError
   */
  edit(data: DataEditMessage) {
    return this.client.messages.patch(this.id, this.channelId, data);
  }

  /**
   * Fetch this message.
   * @throws RevoltAPIError
   */
  fetch() {
    return this.channel.fetchMessage(this.id);
  }

  /**
   * Whether this message has suppressed desktop/push notifications
   */
  get isSuppressed() {
    return (this.flags & 1) == 1;
  }

  /**
   * React to a message
   * @param emoji Unicode or emoji ID
   * @throws RevoltAPIError
   */
  async react(emoji: string) {
    return await this.client.api.put(
      `/channels/${this.channelId as ""}/messages/${this.id as ""}/reactions/${emoji as ""}`,
    );
  }

  /**
   * Un-react from a message
   * @param emoji Unicode or emoji ID
   * @throws RevoltAPIError
   */
  async unreact(emoji: string) {
    return await this.client.api.delete(
      `/channels/${this.channelId as ""}/messages/${this.id as ""}/reactions/${emoji as ""}`,
    );
  }

  /**
   * Reply to Message
   * @throws RevoltAPIError
   */
  reply(
    data:
      | string
      | (Omit<DataMessageSend, "nonce"> & {
          nonce?: string;
        }),
    mention = false,
  ) {
    const obj = typeof data == "string" ? { content: data } : data;
    return this.channel?.sendMessage({
      ...obj,
      replies: [{ id: this.id, mention }],
    });
  }

  get server() {
    return this.channel instanceof ServerChannel ? this.channel.server : null;
  }

  override update(data: Partial<ApiMessage>) {
    if ("content" in data) this.content = data.content;
    if ("embeds" in data) this.embeds = data.embeds?.map((embed) => MessageEmbed.from(this.client, embed)) || null;
    if ("edited" in data) this.editedAt = new Date(data.edited || Date.now());
    if ("pinned" in data) this.pinned = data.pinned || false;
    if ("reactions" in data) this.reactions.update(data.reactions);
    if ("replies" in data) data.replies?.forEach((reply) => this.replyIds.add(reply));
    return this;
  }
}

/**
 * [Message Flags](https://docs.rs/revolt-models/latest/revolt_models/v0/enum.MessageFlags.html)
 */
export enum MessageFlags {
  SupressNotifications = 1,
}
