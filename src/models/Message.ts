import type { Message as ApiMessage, Embed } from "revolt-api";

import type { Client } from "../Client.js";
import { Base, MessageEmbed, ServerChannel, type ServerMember, type User } from "./index.js";
import { mapObject, objectToMap } from "../utils/index.js";

export class Message extends Base {

  readonly authorId: string;
  readonly id: string;
  content: string | null;
  readonly channelId: string;
  editedAt: Date | null;
  embeds: MessageEmbed[] | null;
  readonly member: ServerMember | null | undefined;
  pinned: boolean;
  readonly reactions: Map<string, Set<string>>;
  readonly userId: string | null;
  readonly user: User | null;

  constructor(client: Client, data: ApiMessage) {
    super(client);
    this.authorId = data.author;
    this.id = data._id;
    this.content = data.content || null;
    this.editedAt = data.edited ? new Date(data.edited) : null;
    this.channelId = data.channel;
    this.embeds = data.embeds?.map((embed) => MessageEmbed.from(client, embed)) || null;
    this.member = data.member ? client.servers.resolve(data.member._id.server)?.members.create(data.member) : null;
    this.reactions = data.reactions
      ? objectToMap(mapObject(data.reactions, (_, idArray) => ({ [_]: new Set(idArray) })))
      : new Map();
    this.userId = data.user?._id || null;
    this.user = data.user ? client.users.create(data.user) : null;
    this.pinned = data.pinned || false;
  }

  addEmbeds(...embeds: Embed[]) {
    const actual = this.embeds || [];
    embeds.forEach((embed) => actual.push(MessageEmbed.from(this.client, embed)));
    this.embeds = actual;
  }

  get channel() {
    return this.client.channels.resolve(this.channelId);
  }

  get author() {
    return this.client.users.resolve(this.authorId);
  }
  
  get server() {
    return this.channel instanceof ServerChannel ? this.channel.server : null;
  }

  override update(data: Partial<ApiMessage>) {
    if ("content" in data) this.content = data.content;
    if ("embeds" in data) this.embeds = data.embeds?.map((embed) => MessageEmbed.from(this.client, embed)) || null;
    if ("edited" in data) this.editedAt = new Date(data.edited || Date.now());
    if ("pinned" in data) this.pinned = data.pinned || false;
    return this;
  }
}

/**
 * [Message Flags](https://docs.rs/revolt-models/latest/revolt_models/v0/enum.MessageFlags.html)
 */
export enum MessageFlags {
  SupressNotifications = 1,
}
