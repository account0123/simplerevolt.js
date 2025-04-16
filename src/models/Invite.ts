import type { Channel, InviteResponse, Invite as ApiInvite, Server, User } from "revolt-api";

import { Base } from "./Base.js";
import type { Client } from "../Client.js";
import type { Group } from "./GroupChannel.js";
import type { TextChannel } from "./ServerChannel.js";

export type GroupInviteData = Extract<ApiInvite, { type: "Group" }>;
type GroupFullInviteData = Extract<InviteResponse, { type: "Group" }>;
export type ServerInviteData = Extract<ApiInvite, { type: "Server" }>;
type ServerFullInviteData = Extract<InviteResponse, { type: "Server" }>;

/**
 * Invite including the creator data
 */
export class FullInvite extends Base {
  readonly code: string;
  readonly creatorData: Partial<User>;
  readonly type: "Group" | "Server";
  constructor(client: Client, data: InviteResponse) {
    super(client);
    this.code = data.code;
    this.type = data.type;
    this.creatorData = {
      username: data.user_name,
      avatar: data.user_avatar || null,
    };
  }

  get id() {
    return this.code;
  }
}

export class Invite extends Base {
  readonly id: string;
  readonly creatorId: string;
  readonly type: "Group" | "Server";
  constructor(client: Client, data: ApiInvite) {
    super(client);
    this.id = data._id;
    this.creatorId = data.creator;
    this.type = data.type;
  }

  get creator() {
    return this.client.users.resolve(this.creatorId);
  }
}

export class GroupInvite extends Invite {
  readonly channelId: string;
  constructor(client: Client, data: GroupInviteData) {
    super(client, data);
    this.channelId = data.channel;
  }

  get channel() {
    return this.client.channels.resolve(this.channelId);
  }
}

/**
 * Invite including creator and group channel data
 */
export class GroupFullInvite extends FullInvite {
  readonly channelData: Partial<Channel> & { _id: string };
  constructor(client: Client, data: GroupFullInviteData) {
    super(client, data);
    this.channelData = {
      _id: data.channel_id,
      name: data.channel_name,
      description: data.channel_description,
    };
  }

  get channel() {
    return this.client.channels.update(this.channelData._id, this.channelData) as Group | null;
  }
}

/**
 * Invite including member count, and creator, server, and channel data
 */
export class ServerFullInvite extends FullInvite {
  readonly serverData: Partial<Server> & { _id: string };
  readonly channelData: Partial<Channel> & { _id: string };
  readonly memberCount: number;
  constructor(client: Client, data: ServerFullInviteData) {
    super(client, data);
    this.memberCount = data.member_count;
    this.channelData = {
      name: data.channel_name,
      description: data.channel_description,
      _id: data.channel_id,
    };
    this.serverData = {
      _id: data.server_id,
      banner: data.server_banner,
      flags: data.server_flags || undefined,
      icon: data.server_icon,
      name: data.server_name,
    } as Server; // Silent typing error
  }

  get channel() {
    return this.client.channels.update(this.channelData._id, this.channelData) as TextChannel | null;
  }

  get server() {
    return this.client.servers.update(this.serverData._id, this.serverData);
  }
}

export class ServerInvite extends Invite {
  readonly channelId: string;
  readonly serverId: string;
  constructor(client: Client, data: ServerInviteData) {
    super(client, data);
    this.serverId = data.server;
    this.channelId = data.channel;
  }

  get channel() {
    return this.client.channels.resolve(this.channelId);
  }

  get server() {
    return this.client.servers.resolve(this.serverId);
  }
}
