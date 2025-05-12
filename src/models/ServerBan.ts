import { ServerBan as ApiServerBan } from "revolt-api";
import { Base } from "./Base.js";
import type { Server } from "./Server.js";

export class ServerBan extends Base {
  /**
   * User id
   */
  readonly id: string;
  readonly reason: string | null;
  readonly serverId: string;

  constructor(
    readonly server: Server,
    readonly data: ApiServerBan,
  ) {
    super(server.client);
    this.id = data._id.user;
    this.reason = data.reason || null;
    this.serverId = data._id.server;
  }

  get user() {
    return this.server.client.users.resolve(this.id);
  }
}
