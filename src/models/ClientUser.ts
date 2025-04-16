import type { User as ApiUser, BotWithUserResponse, DataChangeUsername, OwnedBotsResponse } from "revolt-api";

import type { Client } from "../Client.js";
import { User } from "./User.js";
import { OwnedBot } from "./Bot.js";

export class ClientUser extends User {
  constructor(client: Client, data: ApiUser) {
    super(client, data);
    this.update(data);
  }

  override async fetch() {
    return this.client.fetchUser();
  }

  async fetchOwnedBots() {
    const bots: OwnedBot[] = [];
    const result = (await this.client.api.get("/bots/@me")) as OwnedBotsResponse;
    if (!result) return bots;
    for (let i = 0; i < result.bots.length; i++) {
      const bot = result.bots[i];
      const user = result.users[i];
      if (!bot || !user) continue;
      const data: BotWithUserResponse = Object.assign(bot, { user });
      bots.push(this.client.bots.create(data));
    }
    return bots;
  }

  /**
   * Change the username of the current user
   * @param username New username
   * @param password Current password
   */
  async setUsername(username: string, password: string) {
    const body: DataChangeUsername = {
      username,
      password,
    };

    const result = await this.client.api.patch("/users/@me/username", body);
    return this.client.users.create(result);
  }
}
