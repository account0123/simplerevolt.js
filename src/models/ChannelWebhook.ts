import { Webhook } from "revolt-api";

import { Base } from "./Base.js";
import { AutumnFile } from "./File.js";
import type { Channel } from "./Channel.js";
import { PermissionsBitField } from "../permissions/PermissionsBitField.js";

export class ChannelWebhook extends Base {
  avatar: AutumnFile | null = null;
  readonly creatorId: string;
  readonly id: string;
  name: string;
  permissions: PermissionsBitField;
  token: string | null = null;

  constructor(
    channel: Channel,
    readonly data: Webhook,
  ) {
    super(channel.client);
    this.id = data.id;
    this.name = data.name;
    this.creatorId = data.creator_id;
    this.permissions = new PermissionsBitField(data.permissions);
    this.update(data);
  }

  override update(data: Partial<Webhook>) {
    if ("name" in data) this.name = data.name;
    if ("avatar" in data) this.avatar = data.avatar ? new AutumnFile(this.client, data.avatar) : null;
    if ("permissions" in data) this.permissions = new PermissionsBitField(data.permissions);
    if ("token" in data) this.token = data.token;
    return this;
  }
}
