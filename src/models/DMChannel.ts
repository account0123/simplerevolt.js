/** @description Whether this direct message channel is currently open on both side
active: boolean;
/** @description 2-tuple of user ids participating in direct messag
recipients: string[];
*/

import { Channel } from "revolt-api";
import { TextBasedChannel } from ".";
import { Client } from "..";

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

  get recipient() {
    return this.recipientId ? this.client.users.resolve(this.recipientId) : null;
  }

  override update(data: Partial<DMChannelData>) {
    if ("active" in data) this.active = data.active;
    return this;
  }
}
