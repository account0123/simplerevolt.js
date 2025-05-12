import type { ServerBan as ApiServerBan } from "revolt-api";

import { Server } from "../models/Server.js";
import { CachedCollection } from "./DataCollection.js";
import { ServerBan } from "../models/ServerBan.js";

export class ServerBanCollection extends CachedCollection<ServerBan> {
  constructor(readonly server: Server) {
    super(server.client, ServerBan);
  }

  create(data: ApiServerBan) {
    const ban = new ServerBan(this.server, data);
    this.cache.set(ban.id, ban);
    return ban;
  }

  async delete(id: string) {
    await this.client.api.delete(`/servers/${this.server.id as ""}/bans/${id as ""}`);
    return this._remove(id);
  }

  async fetch() {
    const result = await this.client.api.get(`/servers/${this.server.id as ""}/bans`);
    result.users.forEach((user) => this.client.users.create(user, false));
    return result.bans.map((ban) => this.create(ban));
  }
}
