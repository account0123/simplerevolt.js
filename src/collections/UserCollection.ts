import { User as ApiUser } from "revolt-api";

import type { Client } from "../Client.js";
import { User } from "../models/index.js";
import { CachedCollection } from "./DataCollection.js";

export class UserCollection extends CachedCollection<User> {
  constructor(client: Client) {
    super(client, User);
  }

  override _add(user: User, cache = true) {
    const existing = this.cache.get(user.id);
    if (cache && existing) return existing;
    this.cache.set(user.id, user);
    return user;
  }

  /**
   * Creates and caches an user instance, overwriting any existing user with the same ID.
   */
  create(data: ApiUser) {
    const instance = new User(this.client, data);
    this.cache.set(instance.id, instance);
    return instance;
  }

  async fetch(id: string) {
    const result = await this.client.api.get(`/users/${id as ""}`);
    return this.create(result);
  }
}
