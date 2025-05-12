import { User as ApiUser, BannedUser, DataEditUser } from "revolt-api";

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
   * Accept another user's friend request.
   * @throws RevoltAPIError
   */
  async acceptFriend(id: string) {
    const result = await this.client.api.put(`/users/${id as ""}/friend`);
    return result && this.create(result);
  }

  /**
   * Block another user by their id.
   * @throws RevoltAPIError
   */
  async block(id: string) {
    const result = await this.client.api.put(`/users/${id as ""}/block`);
    return result && this.create(result);
  }

  /**
   * Send a friend request to another user by their username.
   * @param username Username and discriminator combo separated by #
   * @throws RevoltAPIError
   */
  async addFriend(username: string) {
    if (!username.includes("#"))
      throw new RJSError(
        ErrorCodes.UserNoDiscriminator,
        "Since revolt api v8 username#discriminator combo is required to send friend request.",
      );
    const result = await this.client.api.post("/users/friend", { username });
    return this.create(result);
  }

  /**
   * Creates and caches an user instance.
   * @param override Whether to override existing user with same id
   */
  create(data: BannedUser | ApiUser, override = true) {
    const instance = new User(this.client, data);
    if (this.cache.has(instance.id)) {
      if (override) {
        this.cache.set(instance.id, instance);
      }
    } else {
      this.cache.set(instance.id, instance);
    }

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
   * Remove a friend by their id. Or deny a friend request.
   * @throws RevoltAPIError
   */
  async deleteFriend(id: string) {
    const result = await this.client.api.delete(`/users/${id as ""}/friend`);
    return this.create(result);
  }

  /**
   * Filters DM channels by user id
   */
  getDMChannel(userId: string) {
    return this.client.channels.cache.find(
      (channel) => channel.channelType == "DirectMessage" && (channel as DMChannel).recipientId == userId,
    ) as DMChannel | undefined;
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

  /**
   * Retrieve a list of mutual friends and servers with another user.
   * @throws RevoltAPIError
   */
  async fetchMutual(id: string): Promise<{ users: string[]; servers: string[] }> {
    return this.client.api.get(`/users/${id as ""}/mutual`);
  }

  /**
   * Unblock another user by their id.
   */
  async unblock(id: string) {
    const result = await this.client.api.delete(`/users/${id as ""}/block`);
    return this.create(result);
  }
}
