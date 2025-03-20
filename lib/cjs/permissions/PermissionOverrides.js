"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionOverrides = void 0;
const __1 = require("..");
const Base_1 = require("../models/Base");
const ops_1 = require("./ops");
class PermissionOverrides extends Base_1.Base {
    allow = new ops_1.PermissionsBitField();
    channel;
    deny = new ops_1.PermissionsBitField();
    /**
     * Role ID or `default`
     */
    id;
    server;
    constructor(target, data) {
        super(target.client);
        this.id = data.id;
        this.channel = target instanceof __1.Channel ? target : null;
        this.server = target instanceof __1.Server ? target : target instanceof __1.ServerChannel ? target.server : null;
        this.update(data);
    }
    update(data) {
        if ("a" in data)
            this.allow = new ops_1.PermissionsBitField(data.a);
        if ("d" in data)
            this.deny = new ops_1.PermissionsBitField(data.d);
        return this;
    }
}
exports.PermissionOverrides = PermissionOverrides;
//# sourceMappingURL=PermissionOverrides.js.map