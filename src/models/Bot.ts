import {
  Bot as ApiBot,
  File,
  PublicBot as ApiPublicBot,
  BotWithUserResponse,
  DataEditBot,
  User as ApiUser,
} from "revolt-api";
import type { Client } from "../Client.js";
import { Base } from "./Base.js";
import { AutumnFile } from "./File.js";
import type { Group } from "./GroupChannel.js";
import type { Server } from "./Server.js";
import type { User } from "./User.js";

export class OwnedBot extends Base {
  analytics: boolean = false;
  readonly discoverable: boolean;
  flags: BotFlags;
  readonly id: string;
  interactionsUrl: string | null = null;
  readonly ownerId: string;
  readonly privacyPolicyUrl: string | null;
  public: boolean = false;
  readonly termsOfServiceUrl: string | null;
  token: string = "";
  user: User | null = null;

  constructor(client: Client, data: ApiBot & { user?: ApiUser }) {
    super(client);
    this.id = data._id;
    this.discoverable = data.discoverable || false;
    this.flags = data.flags || 0;
    this.ownerId = data.owner;
    this.privacyPolicyUrl = data.privacy_policy_url || null;
    this.termsOfServiceUrl = data.terms_of_service_url || null;
    this.update(data);
  }

  /**
   * Delete a bot by its id.
   * @throws RevoltAPIError
   */
  async delete() {
    return this.client.bots.delete(this.id);
  }

  /**
   * @returns New OwnedBot instance
   * @throws RevoltAPIError
   */
  fetch() {
    return this.client.bots.fetch(this.id);
  }

  /**
   * Edit details of this bot.
   * @throws RevoltAPIError
   */
  edit(data: DataEditBot) {
    return this.client.bots.edit(this.id, data);
  }

  get owner() {
    return this.client.users.resolve(this.ownerId);
  }

  override update(data: Partial<BotWithUserResponse>) {
    if ("analytics" in data) this.analytics = data.analytics || false;
    if ("flags" in data) this.flags = data.flags || 0;
    if ("interactions_url" in data) this.interactionsUrl = data.interactions_url;
    if ("public" in data) this.public = data.public;
    if ("token" in data) this.token = data.token;
    if ("user" in data) this.user = this.client.users.create(data.user);
    return this;
  }
}

export class PublicBot extends Base {
  avatar: AutumnFile | null = null;
  description: string | null = null;
  readonly id: string;
  username: string;

  constructor(client: Client, data: ApiPublicBot) {
    super(client);
    this.id = data._id;
    this.username = data.username;
    this.update(data);
  }

  /**
   * Add the bot to a server
   */
  addToServer(server: Server | string) {
    return this.client.api.post(`/bots/${this.id as ""}/invite`, {
      server: this.client.servers.resolveId(server),
    });
  }

  /**
   * Add the bot to a group
   */
  addToGroup(group: Group | string) {
    return this.client.api.post(`/bots/${this.id as ""}/invite`, {
      group: this.client.channels.resolveId(group),
    });
  }

  override update(data: Partial<ApiPublicBot>) {
    if ("username" in data) this.username = data.username;
    if ("description" in data) this.description = data.description;
    if ("avatar" in data)
      this.avatar = data.avatar ? new AutumnFile(this.client, { _id: data.avatar, tag: "avatars" } as File) : null;
    return this;
  }
}

/**
 * Flags that may be attributed to a bot
 *
 * https://docs.rs/revolt-models/latest/revolt_models/v0/enum.BotFlags.html
 */
export enum BotFlags {
  Verified = 1,
  Official = 2,
}
