import type { Channel } from "revolt-api";

import { Client } from "../Client.js";
import { TextBasedChannel } from "./Channel.js";
import {
  DEFAULT_PERMISSION_DIRECT_MESSAGE,
  DEFAULT_PERMISSION_VIEW_ONLY,
  UserPermission,
} from "../permissions/index.js";

type DMChannelData = Extract<Channel, { channel_type: "DirectMessage" }>;
export class DMChannel extends TextBasedChannel {
  active: boolean = false;
  readonly recipientIds: Set<string>;
  readonly recipientId: string | null = null;
  constructor(client: Client, data: DMChannelData) {
    super(client, data);
    this.recipientIds = new Set(data.recipients);
    if (data.recipients.length) {
      this.recipientId = data.recipients[0] || null;
    }
    this.update(data);
  }

  // Implementation for this as DirectMessage
  override calculatePermission() {
    if (this.client.user?.permission) return this.client.user.permission;
    const user_permissions = this.recipient?.userPermission || 0;
    if (user_permissions & UserPermission.SendMessage) {
      return DEFAULT_PERMISSION_DIRECT_MESSAGE;
    } else {
      return DEFAULT_PERMISSION_VIEW_ONLY;
    }
  }

  get recipient() {
    return this.recipientId ? this.client.users.resolve(this.recipientId) : null;
  }

  override update(data: Partial<DMChannelData>) {
    if ("active" in data) this.active = data.active;
    return this;
  }
}
