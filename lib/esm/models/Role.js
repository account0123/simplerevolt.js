import { Base } from "./Base";
import { PermissionOverrides } from "../permissions/PermissionOverrides";
export class Role extends Base {
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
                ? new PermissionOverrides(this.server, { id: this.id, ...data.permissions })
                : null;
        return this;
    }
}
//# sourceMappingURL=Role.js.map