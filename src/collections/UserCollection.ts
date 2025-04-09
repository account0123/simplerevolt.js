import { User as ApiUser } from "revolt-api";

import type { Client } from "../Client.js";
import { CachedCollection } from "./DataCollection.js";
import { User } from "../models/User.js";

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

  async fetch(id: string) {
    const result = await this.client.api.get(`/users/${id as ""}`);
    return this.create(result);
  }
}
