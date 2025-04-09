import { User as ApiUser, DataEditUser } from "revolt-api";

import type { Client } from "../Client.js";
import { CachedCollection } from "./DataCollection.js";
import { User } from "../models/User.js";
import { DMChannel } from "../models/DMChannel.js";
import { RJSError } from "../errors/RJSError.js";
import { ErrorCodes } from "../errors/ErrorCodes.js";

export class UserCollection extends CachedCollection<User> {
  constructor(client: Client) {
    super(client, User);
  }

  /**
   * Creates and caches an user instance, overwriting any existing user with the same ID.
   */
  create(data: ApiUser) {
    const instance = new User(this.client, data);
    this.cache.set(instance.id, instance);
    return instance;
  }

  /**
   * Open a DM with another user, or returns DM channel if exists.
   * @param userId 
   * @param force - Whether to force open a new DM channel
   */
  async createDMChannel(userId: string, force = true) {
    if (!force) {
      const dm = this.getDMChannel(userId);
      if (dm) return dm;
    }
    const result = await this.client.api.get(`/users/${userId as ""}/dm`);
    return this.client.channels.create(result);
  }

  /**
   * Filters DM channels by user id
   */
  getDMChannel(userId: string) {
    return this.client.channels.cache.find(channel => channel.channelType == "DirectMessage" && (channel as DMChannel).recipientId == userId) as DMChannel | undefined;
  }

  /**
   * @throws RJSError - If DM channel for user was not found
   * @throws RevoltAPIError
   */
  async deleteDMChannel(userId: string) {
    const channel = this.getDMChannel(userId);
    if (!channel) throw new RJSError(ErrorCodes.UserDMNotFound);
    await this.client.channels.delete(channel.id);
    return channel;
  }

  /**
   * Edits the user
   * @throws RevoltAPIError
   */
  async edit(id: string, data: DataEditUser) {
    const result = await this.client.api.patch(`/users/${id == this.client.user?.id ? "@me" : (id as "")}`, data);
    return this.create(result);
  }

  async fetch(id: string) {
    const result = await this.client.api.get(`/users/${id as ""}`);
    return this.create(result);
  }
}
