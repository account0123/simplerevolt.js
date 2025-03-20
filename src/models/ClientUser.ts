import { User as ApiUser, DataChangeUsername } from "revolt-api";
import { User } from ".";
import type { Client } from "..";

export class ClientUser extends User {
  constructor(client: Client, data: ApiUser) {
    super(client, data);
    this.update(data);
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
