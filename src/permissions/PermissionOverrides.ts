import { OverrideField } from "revolt-api";

import { PermissionOverridesData } from "../collections/PermissionOverrideCollection.js";
import { Base } from "../models/Base.js";
import type { Channel } from "../models/Channel.js";
import type { Server } from "../models/Server.js";
import { PermissionsBitField } from "./PermissionsBitField.js";

export class PermissionOverrides extends Base {
  allow: PermissionsBitField = new PermissionsBitField();
  deny: PermissionsBitField = new PermissionsBitField();
  /**
   * Role ID or `default`
   */
  readonly id: string;

  constructor(target: Channel | Server, data: PermissionOverridesData) {
    super(target.client);
    this.id = data.id;
    this.update(data);
  }

  override update(data: OverrideField) {
    if ("a" in data) this.allow = new PermissionsBitField(data.a);
    if ("d" in data) this.deny = new PermissionsBitField(data.d);
    return this;
  }
}
