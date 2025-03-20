"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
const __1 = require("..");
const ChannelCollection_1 = require("../collections/ChannelCollection");
const Base_1 = require("./Base");
const File_1 = require("./File");
const ServerCategoryCollection_1 = require("../collections/ServerCategoryCollection");
const ServerCategory_1 = require("./ServerCategory");
const ServerMemberCollection_1 = require("../collections/ServerMemberCollection");
const ops_1 = require("../permissions/ops");
const RoleCollection_1 = require("../collections/RoleCollection");
class Server extends Base_1.Base {
    id;
    ownerId;
    categories = new ServerCategoryCollection_1.ServerCategoryCollection(this);
    channels = new ChannelCollection_1.ChannelCollectionInServer(this);
    defaultPermissions;
    members = new ServerMemberCollection_1.ServerMemberCollection(this);
    roles = new RoleCollection_1.RoleCollection(this);
    discoverable = false;
    flags = 0;
    isNSFW = false;
    name;
    description = null;
    icon = null;
    banner = null;
    constructor(client, data) {
        super(client);
        this.id = data._id;
        this.defaultPermissions = new ops_1.PermissionsBitField(data.default_permissions);
        this.ownerId = data.owner;
        this.name = data.name;
        this.update(data);
    }
    clear(properties) {
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
    update(data) {
        if (data.name)
            this.name = data.name;
        if ("description" in data)
            this.description = data.description;
        if ("icon" in data)
            this.icon = data.icon ? new File_1.AutumnFile(this.client, data.icon) : null;
        if ("banner" in data)
            this.banner = data.banner ? new File_1.AutumnFile(this.client, data.banner) : null;
        if ("flags" in data)
            this.flags = data.flags;
        if ("discoverable" in data)
            this.discoverable = data.discoverable;
        if ("nsfw" in data)
            this.isNSFW = data.nsfw;
        if ("roles" in data)
            this.roles = new RoleCollection_1.RoleCollection(this, Object.entries(data.roles).map(([id, role]) => new __1.Role(this, { id, ...role })));
        for (const channelId of data.channels || []) {
            const channel = this.client.channels.resolve(channelId);
            if (channel)
                this.channels._add(channel);
        }
        for (const category of data.categories || []) {
            this.categories._add(new ServerCategory_1.Category(this.client, category, this));
        }
        return this;
    }
}
exports.Server = Server;
//# sourceMappingURL=Server.js.map