import { OverrideField } from "revolt-api";
import { Channel, Server, ServerChannel } from "..";
import { Base } from "../models/Base";
import { PermissionsBitField } from "./ops";
import { PermissionOverridesData } from "../collections/PermissionOverrideCollection";

export class PermissionOverrides extends Base {
  allow: PermissionsBitField = new PermissionsBitField();
  channel: Channel | null;
  deny: PermissionsBitField = new PermissionsBitField();
  /**
   * Role ID or `default`
   */
  readonly id: string;
  server: Server | null;

  constructor(target: Channel | Server, data: PermissionOverridesData) {
    super(target.client);
    this.id = data.id;
    this.channel = target instanceof Channel ? target : null;
    this.server = target instanceof Server ? target : target instanceof ServerChannel ? target.server : null;
    this.update(data);
  }

  override update(data: OverrideField) {
    if ("a" in data) this.allow = new PermissionsBitField(data.a);
    if ("d" in data) this.deny = new PermissionsBitField(data.d);
    return this;
  }
}
