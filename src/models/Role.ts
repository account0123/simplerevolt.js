import { Role as ApiRole } from "revolt-api";
import type { Server } from "..";
import { Base } from "./Base";
import { PermissionOverrides } from "../permissions/PermissionOverrides";

type RoleData = ApiRole & { id: string };

export class Role extends Base {
  readonly id: string;
  name: string;
  colour: string | null = null;
  hoist: boolean = false;
  rank: number | null = null;
  permissions: PermissionOverrides | null = null;
  constructor(
    readonly server: Server,
    data: RoleData,
  ) {
    super(server.client);
    this.id = data.id;
    this.name = data.name;
    this.update(data);
  }

  override update(data: Partial<ApiRole>) {
    if (data.name) this.name = data.name;
    // colour is removable
    if ("colour" in data) this.colour = data.colour;
    if ("hoist" in data) this.hoist = data.hoist;
    if ("rank" in data) this.rank = data.rank;
    if (data.permissions)
      this.permissions = data.permissions
        ? new PermissionOverrides(this.server, { id: this.id, ...data.permissions })
        : null;
    return this;
  }
}
