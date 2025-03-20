"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerMemberCollection = void 0;
const ServerMember_1 = require("../models/ServerMember");
const DataCollection_1 = require("./DataCollection");
class ServerMemberCollection extends DataCollection_1.CachedCollection {
    server;
    constructor(server) {
        super(server.client, ServerMember_1.ServerMember);
        this.server = server;
    }
    _add(member) {
        const existing = this.cache.get(member.id);
        if (existing)
            return existing;
        this.cache.set(member.id, member);
        return member;
    }
    create(data) {
        const instance = new ServerMember_1.ServerMember(this.server, data);
        this.cache.set(instance.id, instance);
        return instance;
    }
}
exports.ServerMemberCollection = ServerMemberCollection;
//# sourceMappingURL=ServerMemberCollection.js.map