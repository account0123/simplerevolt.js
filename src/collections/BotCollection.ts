import { BotWithUserResponse, DataEditBot, OwnedBotsResponse } from "revolt-api";
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
   * Edit bot details by its id.
   * @throws RevoltAPIError
   */
  async edit(id: string, data: DataEditBot): Promise<OwnedBot> {
    const result = await this.client.api.patch(`/bots/${id as ""}`, data);
    return this.create(result);
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
   * Fetch all of the bots that you have control over.
   * @throws RevoltAPIError
   */
  async fetchOwned() {
    // result: {bots: Bot[], users: User[]} even if client owns only one bot
    const result = await this.client.api.get("/bots/@me") as OwnedBotsResponse;
    const owned: BotWithUserResponse[] = [];
    for (let i = 0; i < result.bots.length; i++) {
      let bot = result.bots[i];
      const user = result.users[i];
      if (!bot) {
        // Impossible error
        console.warn("BotCollection#fetchOwned: bot at index %d not found", i);
        continue;
      }
      if (!user) {
        console.warn("BotCollection#fetchOwned: user at index %d not found", i);
        continue;
      };
      owned.push(Object.assign(bot, { user }));
    }
    return owned.map((data) => this.create(data));
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
