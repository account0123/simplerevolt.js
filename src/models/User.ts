import type { User as ApiUser, DataEditUser, RelationshipStatus, UserStatus } from "revolt-api";

import type { Client } from "../Client.js";
import { Permission, U32_MAX, UserPermission } from "../permissions/index.js";
import { Base } from "./Base.js";
import { UserProfile } from "./UserProfile.js";
import { Group } from "./GroupChannel.js";
import { DMChannel } from "./DMChannel.js";

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
   * Edits the user
   * @throws RevoltAPIError
   */
  async edit(data: DataEditUser) {
    return await this.client.api.patch(`/users/${this.id == this.client.user?.id ? "@me" : this.id}`, data);
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

  override update(data: Partial<ApiUser>) {
    if (data.username) this.username = data.username;
    if (data.discriminator) this.discriminator = data.discriminator;
    if ("display_name" in data) this.displayName = data.display_name || this.username;
    if ("flags" in data) this.flags = data.flags;
    if ("badges" in data) this.badges = data.badges;
    if ("privileged" in data) this.privileged = data.privileged;
    if ("status" in data) this.status = data.status;
    return this;
  }
}
