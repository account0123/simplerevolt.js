import type {
  Channel as ApiChannel,
  Member as ApiMember,
  Message as ApiMessage,
  User as ApiUser,
  DataMessageSearch,
} from "revolt-api";
import type { APIRoutes } from "revolt-api/dist/routes";

import { ALLOW_IN_TIMEOUT, Permission, PermissionOverrides } from "../permissions/index.js";
import type { Client } from "../Client.js";
import { PermissionOverrideCollection } from "../collections/PermissionOverrideCollection.js";
import { TextBasedChannel } from "./Channel.js";
import { AutumnFile } from "./File.js";
import type { Message } from "./Message.js";
import type { ServerMember } from "./ServerMember.js";
import type { User } from "./User.js";
import { PermissionsBitField } from "../permissions/PermissionsBitField.js";
import Long from "long";
import { BitField } from "../utils/BitField.js";
import { RJSError } from "../errors/RJSError.js";
import { ErrorCodes } from "../errors/ErrorCodes.js";

type ServerChannelData = Extract<ApiChannel, { channel_type: "TextChannel" | "VoiceChannel" }>;
export class ServerChannel extends TextBasedChannel {
  defaultPermissions: PermissionOverrides | null = null;
  readonly rolePermissions = new PermissionOverrideCollection(this);
  description: string | null = null;
  icon: AutumnFile | null = null;
  readonly serverId: string;
  name: string;
  constructor(client: Client, data: ServerChannelData) {
    super(client, data);
    this.name = data.name;
    this.serverId = data.server;
    this.update(data);
  }

  /**
   * Whether this channel may be hidden to some users
   */
  override get potentiallyRestrictedChannel(): boolean {
    const deny = this.defaultPermissions?.deny || new PermissionsBitField();
    // Default is denied to view this channel?
    const denyViewChannel = deny.bitwiseAndEq(Permission.ViewChannel);
    // Default is denied to view server channels?
    const defaultNotViewChannel = !this.server?.defaultPermissions.bitwiseAndEq(Permission.ViewChannel);
    return (
      denyViewChannel ||
      defaultNotViewChannel ||
      [...(this.server?.roles.cache.keys() ?? [])].some((role) => {
        const roleOverrideDeny = this.rolePermissions.resolve(role)?.deny || new PermissionsBitField();
        const roleDeny = this.server?.roles.resolve(role)?.permissions?.deny || new PermissionsBitField();
        // Role is denied to view this channel?
        return (
          roleOverrideDeny.bitwiseAndEq(Permission.ViewChannel) ||
          // Role is denied to view server channels?
          roleDeny.bitwiseAndEq(Permission.ViewChannel)
        );
      })
    );
  }

  override calculatePermission() {
    const user = this.client.user;
    if (user?.permission) return user.permission;
    const server = this.server;
    if (!server) return 0;

    // 3. If server owner, just grant all permissions.
    if (server?.ownerId == user?.id) {
      return Permission.GrantAllSafe;
    } else {
      // 4. Get ServerMember.
      const member = server.member;

      if (!member) return 0;

      // 5. Calculate server base permissions.
      let perm = Long.fromNumber(server.calculatePermission());

      // 6. Apply default allows and denies for channel.
      if (this.defaultPermissions) {
        const allow = BitField.resolve(this.defaultPermissions.allow);
        const deny = BitField.resolve(this.defaultPermissions.deny);
        perm = perm.or(allow).and(deny.not());
      }

      // 7. If user has roles, iterate in order.
      if (member.roles && this.rolePermissions && server.roles) {
        // 8. Apply allows and denies from roles.
        const roleIds = member.orderedRoles.map(({ id }) => id);

        for (const id of roleIds) {
          const override = this.rolePermissions.resolve(id);
          if (override) {
            const allow = BitField.resolve(override.allow);
            const deny = BitField.resolve(override.deny);
            perm = perm.or(allow).and(deny.not());
          }
        }
      }

      // 8. Revoke permissions if ServerMember is timed out.
      if (member.timeout && member.timeout > new Date()) {
        perm = perm.and(ALLOW_IN_TIMEOUT);
      }

      return perm.toNumber();
    }
  }

  /**
   * Creates an invite to this channel.
   * @throws RevoltAPIError
   */
  createInvite() {
    return this.server.invites.createInvite(this.id);
  }

  /**
   * Delete many messages by their IDs
   * @throws RevoltAPIError
   */
  async deleteMessages(ids: string[]) {
    await this.client.api.delete(`/channels/${this.id as ""}/messages/bulk`, {
      ids,
    });
  }

  /**
   * Fetch multiple messages from a channel including the users that sent them.
   * @throws RevoltAPIError
   */
  override async fetchMessagesWithUsers(
    params?: Omit<
      (APIRoutes & {
        method: "get";
        path: "/channels/{target}/messages";
      })["params"],
      "include_users"
    >,
  ): Promise<{ messages: Message[]; users: User[]; members?: ServerMember[] }> {
    const data = (await this.client.api.get(`/channels/${this.id as ""}/messages`, {
      ...params,
      include_users: true,
    })) as { messages: ApiMessage[]; users: ApiUser[]; members: ApiMember[] };

    return {
      messages: data.messages.map((message) => this.client.messages.create(message)),
      users: data.users.map((user) => this.client.users.create(user)),
      members: data.members
        .map((member) => (this.server ? this.server.members.create(member) : null))
        .filter((x) => x) as ServerMember[],
    };
  }

  /**
   * Permission the currently authenticated user has against this channel
   */
  override get permission(): PermissionsBitField {
    return new PermissionsBitField(this.calculatePermission());
  }

  get server() {
    const server = this.client.servers.resolve(this.serverId);
    if (!server) throw new RJSError(ErrorCodes.NotFoundById, "server", this.serverId);
    return server;
  }

  /**
   * Search for messages including the users that sent them
   * @throws RevoltAPIError
   */
  override async searchWithUsers(params: Omit<DataMessageSearch, "include_users">) {
    const data = (await this.client.api.post(`/channels/${this.id as ""}/search`, {
      ...params,
      include_users: true,
    })) as { messages: ApiMessage[]; users: ApiUser[]; members: ApiMember[] };

    return {
      messages: data.messages.map((message) => this.client.messages.create(message)),
      users: data.users.map((user) => this.client.users.create(user)),
      members: data.members
        .map((member) => (this.server ? this.server.members.create(member) : null))
        .filter((x) => x) as ServerMember[],
    };
  }

  override update(data: Partial<ServerChannelData>) {
    if (data.name) this.name = data.name;
    if ("description" in data) this.description = data.description || null;
    if ("icon" in data) this.icon = data.icon ? new AutumnFile(this.client, data.icon) : null;
    if ("default_permissions" in data)
      this.defaultPermissions = data.default_permissions
        ? this.rolePermissions.create({
            id: "Default",
            ...data.default_permissions,
          })
        : null;
    return this;
  }
}

type TextChannelData = Extract<ApiChannel, { channel_type: "TextChannel" }>;
export class TextChannel extends ServerChannel {
  constructor(client: Client, data: TextChannelData) {
    super(client, data);
    this.update(data);
  }
}

type VoiceChannelData = Extract<ApiChannel, { channel_type: "VoiceChannel" }>;
export class VoiceChannel extends ServerChannel {
  constructor(client: Client, data: VoiceChannelData) {
    super(client, data);
    this.update(data);
  }
}
