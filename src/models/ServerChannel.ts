import {
  Channel as ApiChannel,
  Member as ApiMember,
  Message as ApiMessage,
  User as ApiUser,
  DataMessageSearch,
} from "revolt-api";
import { TextBasedChannel } from "./Channel";
import { PermissionsBitField } from "../permissions/ops";
import { AutumnFile } from "./File";
import { ServerMember, type Client, type Message, type User } from "..";
import { PermissionOverrides } from "../permissions/PermissionOverrides";
import { PermissionOverrideCollection } from "../collections/PermissionOverrideCollection";
import { APIRoutes } from "revolt-api/dist/routes";
import { Permission } from "../permissions";

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

  async createInvite() {
    return await this.client.api.post(`/channels/${this.id as ""}/invites`);
  }

  /**
   * Delete many messages by their IDs
   */
  async deleteMessages(ids: string[]) {
    await this.client.api.delete(`/channels/${this.id as ""}/messages/bulk`, {
      ids,
    });
  }

  /**
   * Fetch multiple messages from a channel including the users that sent them
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

  get server() {
    return this.client.servers.resolve(this.serverId);
  }

  /**
   * Search for messages including the users that sent them
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
