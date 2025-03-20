import { OverrideField } from "revolt-api";
import type { Channel, Server } from "..";
import { PermissionOverrides } from "../permissions/PermissionOverrides";
import { CachedCollection } from "./DataCollection";

export type PermissionOverridesData = OverrideField & { id: string };
export class PermissionOverrideCollection extends CachedCollection<PermissionOverrides> {
  constructor(readonly target: Channel | Server) {
    super(target.client, PermissionOverrides);
  }

  override _add(permission: PermissionOverrides) {
    const existing = this.cache.get(permission.id);
    if (existing) return existing;
    this.cache.set(permission.id, permission);
    return permission;
  }

  create(data: PermissionOverridesData) {
    const instance = new PermissionOverrides(this.target, data);
    this.cache.set(instance.id, instance);
    return instance;
  }
}
