import { Server as ApiServer, FieldsServer } from "revolt-api";

import type { Client } from "../Client.js";
import { Base } from "./Base.js";
import { AutumnFile } from "./File.js";
import { Category } from "./ServerCategory.js";
import { Role } from "./Role.js";
import { ChannelCollectionInServer } from "../collections/ChannelCollection.js";
import { RoleCollection } from "../collections/RoleCollection.js";
import { ServerCategoryCollection } from "../collections/ServerCategoryCollection.js";
import { ServerMemberCollection } from "../collections/ServerMemberCollection.js";
import { PermissionsBitField } from "../permissions/PermissionsBitField.js";
import { ALLOW_IN_TIMEOUT, Permission, PermissionOverrides } from "../permissions/index.js";
import { BitField } from "../utils/BitField.js";
import { ServerInviteCollection } from "../collections/InviteCollection.js";
import { ServerInviteData } from "./Invite.js";
import type { ServerMember } from "./ServerMember.js";
import { ServerBanCollection } from "../collections/ServerBanCollection.js";
import { User } from "./User.js";
import { SimpleValidator } from "../utils/SimpleValidator.js";

export class Server extends Base {
  // @ts-ignore unused
  #synced: "partial" | "full" | null = null;
  readonly id: string;
  readonly ownerId: string;
  readonly bans = new ServerBanCollection(this);
  readonly categories = new ServerCategoryCollection(this);
  readonly channels = new ChannelCollectionInServer(this);
  readonly defaultPermissions: PermissionsBitField;
  readonly invites = new ServerInviteCollection(this);
  readonly members = new ServerMemberCollection(this);
  roles = new RoleCollection(this);
  discoverable = false;
  flags: number = 0;
  isNSFW = false;
  name: string;
  description: string | null = null;
  icon: AutumnFile | null = null;
  banner: AutumnFile | null = null;

  constructor(client: Client, data: ApiServer) {
    super(client);
    this.id = data._id;
    this.defaultPermissions = new PermissionsBitField(data.default_permissions);
    this.ownerId = data.owner;
    this.name = data.name;
    this.update(data);
  }

  /**
   * Ban a user by their id.
   * @param user User id or instance to ban
   * @param reason Ban reason - max 1024 characters
   * @throws TypeError - Invalid reason length
   * @throws RevoltAPIError
   */
  async ban(user: User | string, reason?: string) {
    if (reason) {
      SimpleValidator.validateStringLength(reason, "reason", 0, 1024);
    }
    const id = this.client.users.resolveId(user);
    const result = await this.client.api.put(`/servers/${this.id as ""}/bans/${id as ""}`, { reason: reason || null });
    return result && this.bans.create(result);
  }

  calculatePermission() {
    const user = this.client.user;
    if (user?.permission) return user.permission;
    // 1. Check if owner.
    if (this.ownerId == user?.id) {
      return Permission.GrantAllSafe;
    } else {
      // 2. Get ServerMember.
      const member = this.member;
      if (!member) return 0;

      // 3. Apply allows from default_permissions.
      let perm = BitField.resolve(this.defaultPermissions);

      // 4. If user has roles, iterate in order.
      if (member.roles && this.roles) {
        // 5. Apply allows and denies from roles.
        const permissions = member.orderedRoles.map(
          (role) => role.permissions || new PermissionOverrides(this, { id: role.id, a: 0, d: 0 }),
        );

        for (const permission of permissions) {
          const allow = BitField.resolve(permission.allow);
          const deny = BitField.resolve(permission.deny);
          perm = perm.or(allow).and(deny.not());
        }
      }

      // 5. Revoke permissions if ServerMember is timed out.
      if (member.timeout && member.timeout > new Date()) {
        perm = perm.and(ALLOW_IN_TIMEOUT);
      }

      return perm.toNumber();
    }
  }

  clear(properties: FieldsServer[]) {
    for (const prop of properties) {
      switch (prop) {
        case "Banner":
          this.banner = null;
          break;
        case "Categories":
          this.categories.cache.clear();
          break;
        case "Description":
          this.description = null;
          break;
        case "Icon":
          this.icon = null;
          break;
      }
    }
  }

  /**
   * Fetch all bans on a server.
   * @throws RevoltAPIError
   */
  async fetchBans() {
    return this.bans.fetch();
  }

  /**
   * Fetch all server invites.
   * @throws RevoltAPIError
   */
  async fetchInvites() {
    const invites = (await this.client.api.get(`/servers/${this.id as ""}/invites`)) as ServerInviteData[]; // Assuming the API filters server invites
    return invites.map((invite) => this.invites.create(invite));
  }

  getMember(id: string) {
    return this.members.resolve(id);
  }

  /**
   * Retrieve a member.
   * @param id User/Member id.
   * @param roles Whether to include role details.
   * @param force Whether to force API request.
   * @throws RevoltAPIError
   */
  async fetchMember(id: string, { roles = false, force = false } = {}) {
    this.members.fetchById(id, roles, { force });
  }

  /**
   * Fetch all server members.
   * @param exclude_offline - Whether to exclude offline members
   * @throws RevoltAPIError
   */
  async fetchMembers(exclude_offline = false) {
    return this.members.fetch(exclude_offline);
  }

  kick(member: string | ServerMember) {
    return this.members.delete(member);
  }

  /**
   * Member reference of the current user
   */
  get member() {
    return this.client.user && this.members.resolve(this.client.user.id);
  }

  resetSyncStatus() {
    this.#synced = null;
  }

  /**
   * Search for members by name.
   * @param query Name to search for.
   * @throws RevoltAPIError
   */
  async searchMembers(query: string) {
    return this.members.search(query);
  }

  override update(data: Partial<ApiServer>) {
    if (data.name) this.name = data.name;
    if ("description" in data) this.description = data.description;
    if ("icon" in data) this.icon = data.icon ? new AutumnFile(this.client, data.icon) : null;
    if ("banner" in data) this.banner = data.banner ? new AutumnFile(this.client, data.banner) : null;
    if ("flags" in data) this.flags = data.flags;
    if ("discoverable" in data) this.discoverable = data.discoverable;
    if ("nsfw" in data) this.isNSFW = data.nsfw;
    if ("roles" in data)
      this.roles = new RoleCollection(
        this,
        Object.entries(data.roles).map(([id, role]) => new Role(this, { id, ...role })),
      );

    for (const channelId of data.channels || []) {
      const channel = this.client.channels.resolve(channelId);
      if (channel) this.channels._add(channel);
    }

    for (const category of data.categories || []) {
      this.categories._add(new Category(this.client, category, this));
    }

    return this;
  }

  /**
   * Remove a user's ban.
   * @param user User id or instance
   * @throws RevoltAPIError
   */
  unban(user: string | User) {
    const id = this.client.users.resolveId(user);
    return this.bans.delete(id);
  }
}
