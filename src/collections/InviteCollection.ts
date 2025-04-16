import { CachedCollection } from "./DataCollection.js";
import { GroupInvite, GroupInviteData, Invite, ServerInvite, ServerInviteData } from "../models/Invite.js";
import { Server } from "../models/Server.js";
import { Channel } from "../models/Channel.js";

export class InviteCollection extends CachedCollection<Invite> {
  // Abstract constructor

  /**
   * Delete an invite by its id.
   * @throws RevoltAPIError
   */
  async delete(id: string) {
    await this.client.api.delete(`/invites/${id as ""}`);
    return this._remove(id);
  }
}

export class GroupInviteCollection extends CachedCollection<GroupInvite> {
  constructor(target: Channel) {
    super(target.client, GroupInvite);
  }

  create(data: GroupInviteData) {
    const invite = new GroupInvite(this.client, data);
    this.cache.set(invite.id, invite);
    return invite;
  }

  /**
   * Creates an invite to the group by its id.
   * @throws RevoltAPIError
   */
  async createInvite(id: string) {
    const result = await this.client.api.post(`/channels/${id as ""}/invites`);
    if (result.type == "Group") return this.create(result);
    throw new TypeError(`Invite type ${result.type} is not supported by GroupInviteCollection.`);
  }
}

export class ServerInviteCollection extends InviteCollection {
  constructor(target: Server) {
    super(target.client, ServerInvite);
  }

  create(data: ServerInviteData) {
    const invite = new ServerInvite(this.client, data);
    this.cache.set(invite.id, invite);
    return invite;
  }

  /**
   * Creates an invite to the server channel by its id.
   * @throws RevoltAPIError
   */
  async createInvite(id: string) {
    const result = await this.client.api.post(`/channels/${id as ""}/invites`);
    if (result.type == "Server") return this.create(result);
    throw new TypeError(`Invite type ${result.type} is not supported by ServerInviteCollection.`);
  }
}
