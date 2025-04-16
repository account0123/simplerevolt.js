import type { OverrideField } from "revolt-api";

import { PermissionOverrides } from "../permissions/PermissionOverrides.js";
import { CachedCollection } from "./DataCollection.js";
import type { Channel } from "../models/Channel.js";
import type { Server } from "../models/Server.js";

export type PermissionOverridesData = OverrideField & { id: string };
export class PermissionOverrideCollection extends CachedCollection<PermissionOverrides> {
  constructor(readonly target: Channel | Server) {
    super(target.client, PermissionOverrides);
  }

  create(data: PermissionOverridesData) {
    const instance = new PermissionOverrides(this.target, data);
    this.cache.set(instance.id, instance);
    return instance;
  }
}
