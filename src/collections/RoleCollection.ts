import type { Role as ApiRole } from "revolt-api";

import { Role } from "../models/Role.js";
import type { Server } from "../models/Server.js";
import { CachedCollection } from "./DataCollection.js";

export class RoleCollection extends CachedCollection<Role> {
  constructor(
    readonly server: Server,
    iterable?: Iterable<Role>,
  ) {
    super(server.client, Role, iterable);
  }

  create(id: string, data: ApiRole) {
    const role = new Role(this.server, { id, ...data });
    this.cache.set(id, role);
    return role;
  }
}
