import { Server } from "../models/Server";
import { CachedCollection } from "./DataCollection";
export class ServerCollection extends CachedCollection {
    constructor(client) {
        super(client, Server);
    }
    _add(server, cache = true) {
        const existing = this.cache.get(server.id);
        if (cache && existing)
            return existing;
        this.cache.set(server.id, server);
        return server;
    }
    create(data) {
        const server = new Server(this.client, data);
        this.cache.set(data._id, server);
        return server;
    }
}
//# sourceMappingURL=ServerCollection.js.map