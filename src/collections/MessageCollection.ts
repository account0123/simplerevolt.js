import type { Message as ApiMessage, DataEditMessage } from "revolt-api";

import type { Client } from "../Client.js";
import { CachedCollection } from "./DataCollection.js";
import { Message } from "../models/Message.js";

export class MessageCollection extends CachedCollection<Message> {
  constructor(client: Client) {
    super(client, Message);
  }

  /**
   * Create and store a new message.
   * @param isNew Whether to emit a messageCreate event
   */
  create(data: ApiMessage, isNew = false) {
    const instance = new Message(this.client, data);
    this.cache.set(instance.id, instance);
    isNew && this.client.emit("messageCreate", instance);
    return instance;
  }

  /**
   * Delete a message by its id.
   * @throws RevoltAPIError
   */
  async delete(id: string) {
    const channelId = this._remove(id)?.channelId;
    if (channelId) {
      return await this.client.api.delete(`/channels/${channelId}/messages/${id}`);
    }
  }

  /**
   * Edit a message by its id and channel id.
   * @throws RevoltAPIError
   */
  async patch(id: string, channelId: string, data: DataEditMessage) {
    const result: ApiMessage = await this.client.api.patch(`/channels/${channelId as ""}/messages/${id as ""}`, data);
    return result && this.create(result, false);
  }
}
