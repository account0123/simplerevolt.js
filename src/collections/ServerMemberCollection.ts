import { DataMemberEdit, Member, Role } from "revolt-api";

import { CachedCollection } from "./DataCollection.js";
import { ServerMember } from "../models/ServerMember.js";
import type { Server } from "../models/Server.js";

export class ServerMemberCollection extends CachedCollection<ServerMember> {
  constructor(readonly server: Server) {
    super(server.client, ServerMember);
  }

  create(data: Member, roles: Record<string, Role> = {}) {
    const member = new ServerMember(this.server, data);
    // Server roles hydration
    Object.entries(roles).forEach(([id, role]) => this.server.roles.create(id, role));
    this.cache.set(member.id, member);
    return member;
  }

  /**
   * Removes (kicks) a member from the server, and deletes the member from the cache.
   * @param member Member id or instance.
   * @throws RevoltAPIError
   */
  async delete(member: string | ServerMember) {
    const id = this.resolveId(member);
    await this.client.api.delete(`/servers/${this.server.id as ""}/members/${id as ""}`);
    return this._remove(id);
  }

  async edit(id: string, data: DataMemberEdit) {
    const response = await this.client.api.patch(`/servers/${this.server.id as ""}/members/${id as ""}`, data);
    return this.update(id, response);
  }

  /**
   * Fetch all server members.
   * @param exclude_offline Whether to exclude offline users
   * @throws RevoltAPIError
   */
  async fetch(exclude_offline = false) {
    const result = await this.client.api.get(`/servers/${this.server.id as ""}/members`, { exclude_offline });
    // User cache hydration
    result.users.forEach((user) => this.client.users.create(user));
    return result.members.map((member) => this.create(member));
  }

  /**
   * Retrieve a member.
   * @param id User/Member id.
   * @param roles Whether to include role details.
   * @param force Whether to force API request.
   * @throws RevoltAPIError
   */
  async fetchById(id: string, roles = false, { force = false } = {}) {
    if (typeof id == "object") {
      throw new TypeError("id must be a string, not an object");
    }
    if (!force) {
      const existing = this.cache.get(id);
      if (existing) {
        return existing;
      }
    }

    const response = await this.client.api.get(`/servers/${this.server.id as ""}/members/${id as ""}`, { roles });
    if ("member" in response) {
      return this.create(response.member, response.roles);
    }
    return this.create(response);
  }

  /**
   * Query members by a given name, this API is not stable and will be removed in the future.
   * @param query Member name to search for.
   * @throws RevoltAPIError
   */
  async search(query: string) {
    const result = await this.client.api.get(`/servers/${this.server.id as ""}/members_experimental_query`, {
      query,
      experimental_api: true,
    });
    // User cache hydration
    result.users.forEach((user) => this.client.users.create(user));
    return result.members.map((member) => this.create(member));
  }

  /**
   * Timeout a member for a duration since Date.now()
   * @param member
   * @param duration in seconds
   */
  timeoutFor(member: string | ServerMember, duration: number) {
    const until = Date.now() + duration * 1_000;
    return this.timeoutUntil(member, new Date(until));
  }

  /**
   * Timeout a member.
   * @param member
   * @param timeout Date or ISO string
   */
  timeoutUntil(member: string | ServerMember, timeout: Date | string) {
    const id = this.resolveId(member);
    if (timeout instanceof Date) {
      timeout = timeout.toISOString();
    }

    return this.edit(id, { timeout });
  }

  update(id: string, data: Partial<Member>) {
    const member = this.cache.get(id);
    return member?.update(data);
  }
}
