import type { User as ApiUser, DataEditUser, DataMessageSend, RelationshipStatus, UserStatus } from "revolt-api";

import type { Client } from "../Client.js";
import { Permission, U32_MAX, UserPermission } from "../permissions/index.js";
import { Base } from "./Base.js";
import { UserProfile } from "./UserProfile.js";
import { Group } from "./GroupChannel.js";
import { DMChannel } from "./DMChannel.js";
import { AutumnFile } from "./File.js";

export enum UserFlags {
  Suspended = 1,
  Deleted = 2,
  Banned = 4,
  Spam = 8,
}

export enum UserBadges {
  Developer = 1,
  Translator = 2,
  Supporter = 4,
  ResponsibleDisclosure = 8,
  Founder = 16,
  PlatformModeration = 32,
  ActiveSupporter = 64,
  Paw = 128,
  EarlyAdopter = 256,
  ReservedRelevantJokeBadge1 = 512,
  ReservedRelevantJokeBadge2 = 1_024,
}

export enum Relationship {
  None = "None",
  User = "User",
  Friend = "Friend",
  Outgoing = "Outgoing",
  Incoming = "Incoming",
  Blocked = "Blocked",
  BlockedOther = "BlockedOther",
}

export class User extends Base {
  readonly id: string;
  avatar: AutumnFile | null = null;
  displayName: string;
  discriminator: string;
  flags = 0;
  badges = 0;
  username: string;
  readonly isOnline: boolean = false;
  privileged: boolean = false;
  readonly ownerId: string | null = null;
  profile: UserProfile | null = null;
  status: UserStatus | null;
  readonly relationship: RelationshipStatus;

  constructor(client: Client, data: ApiUser) {
    super(client);
    if ("bot" in data) {
      this.ownerId = data.bot?.owner || null;
    }
    this.id = data._id;
    this.displayName = data.display_name || data.username;
    this.username = data.username;
    this.discriminator = data.discriminator;
    this.isOnline = data.online || false;
    this.relationship = data.relationship;
    this.status = data.status || null;
    this.update(data);
  }

  get bot() {
    return this.ownerId != null;
  }

  /**
   * Block this user.
   * @throws RevoltAPIError
   */
  block() {
    return this.client.users.block(this.id);
  }

  get dmChannel() {
    return this.client.users.getDMChannel(this.id);
  }

  /**
   * Edits the user
   * @throws RevoltAPIError
   */
  async edit(data: DataEditUser) {
    return await this.client.api.patch(`/users/${this.id == this.client.user?.id ? "@me" : this.id}`, data);
  }

  /**
   * Retrieve a user's information.
   * @throws RevoltAPIError
   */
  fetch() {
    return this.client.users.fetch(this.id);
  }

  /**
   * @returns default avatar
   */
  async fetchDefaultAvatar() {
    const result = await this.client.api.get(`/users/${this.id as ""}/default_avatar`);
    return new TextEncoder().encode(result);
  }

  /**
   * Retrieve a user's flags.
   * @throws RevoltAPIError
   */
  async fetchFlags() {
    const result = await this.client.api.get(`/users/${this.id as ""}/flags`);
    this.flags = result.flags;
    return result.flags;
  }

  /**
   * Retrieve a list of mutual friends and servers with this user.
   * @throws RevoltAPIError
   */
  fetchMutual(): Promise<{ users: string[]; servers: string[] }> {
    return this.client.users.fetchMutual(this.id);
  }

  /**
   * Fetch the profile of a user
   * @returns The profile of the user
   * @throws RevoltAPIError
   */
  async fetchProfile() {
    try {
      this.profile = new UserProfile(this.client, await this.client.api.get(`/users/${this.id as ""}/profile`));
    } catch (error) {
      this.profile = this.profile || null;
    }

    return this.profile;
  }

  /**
   * Global permission for this user
   */
  get permission() {
    return this.privileged ? Permission.GrantAllSafe : 0;
  }

  /**
   * Send a message to this user. If the user does not have a DM channel open, one will be opened.
   * @throws RevoltAPIError
   */
  async sendMessage(data: string | DataMessageSend, idempotencyKey?: string) {
    const dm = await this.client.users.createDMChannel(this.id, false);
    return dm.sendMessage(data, idempotencyKey);
  }

  /**
   * Permissions against this user
   */
  get userPermission() {
    let permissions = 0;
    switch (this.relationship) {
      case "Friend":
      case "User":
        return U32_MAX;
      case "Blocked":
      case "BlockedOther":
        return UserPermission.Access;
      case "Incoming":
      case "Outgoing":
        permissions = UserPermission.Access;
    }

    if (
      this.client.channels.cache.find(
        (channel) =>
          (channel instanceof Group && channel.recipientIds.has(this.id)) ||
          (channel instanceof DMChannel && channel.recipientIds.has(this.id)),
      ) ||
      this.client.servers.cache.find((server) => server.members.cache.some((member) => member.id == this.id))
    ) {
      if (this.client.user?.bot || this.bot) {
        permissions |= UserPermission.SendMessage;
      }

      permissions |= UserPermission.Access | UserPermission.ViewProfile;
    }
    return permissions;
  }

  override toString() {
    return `<@${this.id}>`;
  }

  /**
   * Unblock this user.
   * @throws RevoltAPIError
   */
  unblock() {
    return this.client.users.unblock(this.id);
  }

  override update(data: Partial<ApiUser>) {
    if (data.username) this.username = data.username;
    if (data.discriminator) this.discriminator = data.discriminator;
    if ("avatar" in data) this.avatar = data.avatar ? new AutumnFile(this.client, data.avatar) : null;
    if ("display_name" in data) this.displayName = data.display_name || this.username;
    if ("flags" in data) this.flags = data.flags;
    if ("badges" in data) this.badges = data.badges;
    if ("privileged" in data) this.privileged = data.privileged;
    if ("status" in data) this.status = data.status;
    return this;
  }
}
