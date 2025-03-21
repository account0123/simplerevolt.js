import type { Message as ApiMessage } from "revolt-api";

import type { Client } from "../Client.js";
import { Message } from "../models/index.js";
import { CachedCollection } from "./DataCollection.js";

export class MessageCollection extends CachedCollection<Message> {
  constructor(client: Client) {
    super(client, Message);
  }

  create(data: ApiMessage, isNew = false) {
    const instance = new Message(this.client, data);
    this.cache.set(instance.id, instance);
    isNew && this.client.emit("messageCreate", instance);
    return instance;
  }

  async delete(id: string) {
    const channelId = this._remove(id)?.channelId;
    if (channelId) {
      return await this.client.api.delete(`/channels/${channelId}/messages/${id}`);
    }
  }
}
