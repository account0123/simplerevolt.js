import type { ChannelUnread as ApiChannelUnread } from "revolt-api";

import type { Client } from "../Client.js";
import { ChannelUnread } from "../models/ChannelUnread.js";
import { CachedCollection } from "./DataCollection.js";

export class ChannelUnreadCollection extends CachedCollection<ChannelUnread> {
  constructor(client: Client) {
    super(client, ChannelUnread);
  }

  patch(key: string, data: Partial<ApiChannelUnread>) {
    this.cache.get(key)?.update(data);
  }

  async sync() {
    const unreads = await this.client.api.get("/sync/unreads");
    this.reset();
    for (const unread of unreads) {
      this._add(new ChannelUnread(this.client, unread));
    }
  }

  reset() {
    this.cache.clear();
  }
}
