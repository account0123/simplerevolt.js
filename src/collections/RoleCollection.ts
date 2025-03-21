import { Role, Server } from "../models/index.js";
import { CachedCollection } from "./DataCollection.js";

export class RoleCollection extends CachedCollection<Role> {
  constructor(server: Server, iterable?: Iterable<Role>) {
    super(server.client, Role, iterable);
  }

  override _add(member: Role) {
    const existing = this.cache.get(member.id);
    if (existing) return existing;
    this.cache.set(member.id, member);
    return member;
  }
}
