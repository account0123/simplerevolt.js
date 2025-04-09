import { BotWithUserResponse } from "revolt-api";
import type { Client } from "../Client.js";
import { OwnedBot } from "../models/Bot.js";
import { CachedCollection } from "./DataCollection.js";

export class BotCollection extends CachedCollection<OwnedBot> {
  constructor(client: Client) {
    super(client, OwnedBot);
  }

  create(data: BotWithUserResponse) {
    const instance = new OwnedBot(this.client, data);
    this.cache.set(instance.id, instance);
    return instance;
  }

  /**
   * Fetch details of a bot client owns by its id.
   * @throws RevoltAPIError
   */
  async fetch(id: string) {
    // result: {bot: Bot, user: User}
    const result = await this.client.api.get(`/bots/${id as ""}`);
    const data: BotWithUserResponse = Object.assign(result.bot, { user: result.user });
    return this.create(data);
  }

  /**
   * Delete a bot by its id.
   * @throws RevoltAPIError
   */
  async delete(id: string) {
    await this.client.api.delete(`/bots/${id as ""}`);
    return this._remove(id);
  }
}
