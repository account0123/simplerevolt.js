import { Member } from "revolt-api";

import { CachedCollection } from "./DataCollection.js";
import { ServerMember } from "../models/ServerMember.js";
import type { Server } from "../models/Server.js";

export class ServerMemberCollection extends CachedCollection<ServerMember> {
  constructor(readonly server: Server) {
    super(server.client, ServerMember);
  }

  create(data: Member) {
    const instance = new ServerMember(this.server, data);
    this.cache.set(instance.id, instance);
    return instance;
  }
}
