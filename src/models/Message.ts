import { Client, MessageEmbed, ServerChannel, User } from "..";
import { Message as ApiMessage, Embed } from "revolt-api";
import { Base } from "./Base";
import { ServerMember } from "./ServerMember";
import { mapObject, objectToMap } from "../utils";

export class Message extends Base {
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
    this.id = data._id;
    this.content = data.content || null;
    this.editedAt = data.edited ? new Date(data.edited) : null;
    this.channelId = data.channel;
    this.embeds = data.embeds?.map((embed) => MessageEmbed.from(client, embed)) || null;
    this.member = data.member ? (client.servers.resolve(data.member._id.server)?.members.create(data.member)) : null;
    this.reactions = data.reactions
      ? objectToMap(mapObject(data.reactions, (_, idArray) => ({ [_]: new Set(idArray) })))
      : new Map();
    this.userId = data.user?._id || null;
    // Get user from cache or creates a new one
    this.user = data.user ? client.users._add(new User(client, data.user)) : null;
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
