import { Role, type Client } from "..";
import { ChannelCollectionInServer } from "../collections/ChannelCollection";
import { Base } from "./Base";
import { Server as ApiServer, FieldsServer } from "revolt-api";
import { AutumnFile } from "./File";
import { ServerCategoryCollection } from "../collections/ServerCategoryCollection";
import { Category } from "./ServerCategory";
import { ServerMemberCollection } from "../collections/ServerMemberCollection";
import { PermissionsBitField } from "../permissions/ops";
import { RoleCollection } from "../collections/RoleCollection";

export class Server extends Base {
  readonly id: string;
  readonly ownerId: string;
  readonly categories = new ServerCategoryCollection(this);
  readonly channels = new ChannelCollectionInServer(this);
  readonly defaultPermissions: PermissionsBitField;
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

  override update(data: Partial<ApiServer>) {
    if (data.name) this.name = data.name;
    if ("description" in data) this.description = data.description;
    if ("icon" in data) this.icon = data.icon ? new AutumnFile(this.client, data.icon) : null;
    if ("banner" in data) this.banner = data.banner ? new AutumnFile(this.client, data.banner) : null;
    if ("flags" in data) this.flags = data.flags;
    if ("discoverable" in data) this.discoverable = data.discoverable;
    if ("nsfw" in data) this.isNSFW = data.nsfw;
    if ("roles" in data) this.roles = new RoleCollection(this, Object.entries(data.roles).map(([id, role]) => new Role(this, { id, ...role})));

    for (const channelId of data.channels || []) {
      const channel = this.client.channels.resolve(channelId);
      if (channel) this.channels._add(channel);
    }

    for (const category of data.categories || []) {
      this.categories._add(new Category(this.client, category, this));
    }

    return this;
  }
}
