"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Role = void 0;
const Base_1 = require("./Base");
const PermissionOverrides_1 = require("../permissions/PermissionOverrides");
class Role extends Base_1.Base {
    server;
    id;
    name;
    colour = null;
    hoist = false;
    rank = null;
    permissions = null;
    constructor(server, data) {
        super(server.client);
        this.server = server;
        this.id = data.id;
        this.name = data.name;
        this.update(data);
    }
    update(data) {
        if (data.name)
            this.name = data.name;
        // colour is removable
        if ("colour" in data)
            this.colour = data.colour;
        if ("hoist" in data)
            this.hoist = data.hoist;
        if ("rank" in data)
            this.rank = data.rank;
        if (data.permissions)
            this.permissions = data.permissions
                ? new PermissionOverrides_1.PermissionOverrides(this.server, { id: this.id, ...data.permissions })
                : null;
        return this;
    }
}
exports.Role = Role;
//# sourceMappingURL=Role.js.map