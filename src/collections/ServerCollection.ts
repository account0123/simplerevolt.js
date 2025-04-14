import type { Server as ApiServer } from "revolt-api";

import type { Client } from "../Client.js";
import { CachedCollection } from "./DataCollection.js";
import { Server } from "../models/Server.js";

export class ServerCollection extends CachedCollection<Server> {
  constructor(client: Client) {
    super(client, Server);
  }

  create(data: ApiServer) {
    const server = new Server(this.client, data);
    this.cache.set(data._id, server);
    return server;
  }

  update(id: string, data: Partial<ApiServer>) {
    const server = this.cache.get(id);
    if (server) {
      return server.update(data);
    }
  }
}
