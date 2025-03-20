import { Server as ApiServer } from "revolt-api";
import type { Client } from "..";
import { Server } from "../models/Server";
import { CachedCollection } from "./DataCollection";

export class ServerCollection extends CachedCollection<Server> {
  constructor(client: Client) {
    super(client, Server);
  }

  override _add(server: Server, cache = true) {
    const existing = this.cache.get(server.id);
    if (cache && existing) return existing;
    this.cache.set(server.id, server);
    return server;
  }

  create(data: ApiServer) {
    const server = new Server(this.client, data);
    this.cache.set(data._id, server);
    return server;
  }
}
