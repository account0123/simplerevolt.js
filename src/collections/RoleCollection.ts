import { Role } from "../models/Role.js";
import type { Server } from "../models/Server.js";
import { CachedCollection } from "./DataCollection.js";

export class RoleCollection extends CachedCollection<Role> {
  constructor(server: Server, iterable?: Iterable<Role>) {
    super(server.client, Role, iterable);
  }
}
