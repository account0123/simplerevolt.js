import type { Channel as ApiChannel, DataEditChannel } from "revolt-api";

import type { Client } from "../Client.js";
import type { Server } from "../models/Server.js";
import { CachedCollection } from "./DataCollection.js";
import { Channel } from "../models/Channel.js";
import { ServerChannel } from "../models/ServerChannel.js";

export class ChannelCollection extends CachedCollection<Channel> {
  constructor(client: Client) {
    super(client, Channel);
  }

  create(data: ApiChannel) {
    const channel = Channel.from(this.client, data);
    this.cache.set(data._id, channel);
    return channel;
  }

  /**
   * Deletes a server channel, leaves a group or closes a group.
   * @param leaveSilently Whether to not send a message on leave
   * @throws RevoltAPIError
   */
  async delete(id: string, leaveSilently: boolean = false) {
    await this.client.api.delete(`/channels/${id as ""}`, {
      leave_silently: leaveSilently,
    });
    return this._remove(id);
  }

  /**
   * Fetch channel by its id, add it to the cache, and return it.
   * @throws RevoltAPIError
   */
  async fetch(id: string) {
    const result = await this.client.api.get(`/channels/${id as ""}`);
    return this.create(result);
  }

  /**
   * Edit a channel object by its id.
   * @throws RevoltAPIError
   */
  async patch(id: string, data: DataEditChannel) {
    const result = await this.client.api.patch(`/channels/${id as ""}`, data);
    return this.update(id, result);
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

  update(id: string, changes: Partial<ApiChannel>) {
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
}
