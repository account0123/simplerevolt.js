import { Member } from "revolt-api";
import type { Server } from "..";
import { ServerMember } from "../models/ServerMember";
import { CachedCollection } from "./DataCollection";

export class ServerMemberCollection extends CachedCollection<ServerMember> {
  constructor(readonly server: Server) {
    super(server.client, ServerMember);
  }

  override _add(member: ServerMember) {
    const existing = this.cache.get(member.id);
    if (existing) return existing;
    this.cache.set(member.id, member);
    return member;
  }

  create(data: Member) {
    const instance = new ServerMember(this.server, data);
    this.cache.set(instance.id, instance);
    return instance;
  }
}
