import { Channel, Server, ServerChannel } from "..";
import { Base } from "../models/Base";
import { PermissionsBitField } from "./ops";
export class PermissionOverrides extends Base {
    allow = new PermissionsBitField();
    channel;
    deny = new PermissionsBitField();
    /**
     * Role ID or `default`
     */
    id;
    server;
    constructor(target, data) {
        super(target.client);
        this.id = data.id;
        this.channel = target instanceof Channel ? target : null;
        this.server = target instanceof Server ? target : target instanceof ServerChannel ? target.server : null;
        this.update(data);
    }
    update(data) {
        if ("a" in data)
            this.allow = new PermissionsBitField(data.a);
        if ("d" in data)
            this.deny = new PermissionsBitField(data.d);
        return this;
    }
}
//# sourceMappingURL=PermissionOverrides.js.map