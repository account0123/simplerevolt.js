"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerCollection = void 0;
const Server_1 = require("../models/Server");
const DataCollection_1 = require("./DataCollection");
class ServerCollection extends DataCollection_1.CachedCollection {
    constructor(client) {
        super(client, Server_1.Server);
    }
    _add(server, cache = true) {
        const existing = this.cache.get(server.id);
        if (cache && existing)
            return existing;
        this.cache.set(server.id, server);
        return server;
    }
    create(data) {
        const server = new Server_1.Server(this.client, data);
        this.cache.set(data._id, server);
        return server;
    }
}
exports.ServerCollection = ServerCollection;
//# sourceMappingURL=ServerCollection.js.map