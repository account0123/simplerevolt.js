import type { Channel as ApiChannel } from "revolt-api";

import type { Client } from "../Client.js";
import { Channel, ServerChannel } from "../models/index.js";
import type { Server } from "../models/Server.js";
import { CachedCollection } from "./DataCollection.js";

export class ChannelCollection extends CachedCollection<Channel> {
  constructor(client: Client) {
    super(client, Channel);
  }

  create(data: ApiChannel) {
    const channel = Channel.from(this.client, data);
    this.cache.set(data._id, channel);
    return channel;
  }

  override _remove(id: string) {
    // Remove from the server
    const channel = this.cache.get(id);
    if (channel && channel instanceof ServerChannel) {
      const serverId = channel.serverId;
      this.client.servers.resolve(serverId)?.channels._remove(id);
    }
    // Remove from this collection
    this.cache.delete(id);
    return channel;
  }

  async delete(id: string) {
    await this.client.api.delete(`/channels/${id}`);
    this._remove(id);
  }

  updateItem(id: string, changes: Partial<ApiChannel>) {
    const channel = this.cache.get(id);
    if (channel) {
      return channel.update(changes);
    }
  }
}

export class ChannelCollectionInServer extends CachedCollection<Channel> {
  constructor(server: Server) {
    super(server.client, Channel);
  }

  override _add(channel: Channel) {
    const existing = this.cache.get(channel.id);
    if (existing) return existing;
    this.cache.set(channel.id, channel);
    return channel;
  }
}
