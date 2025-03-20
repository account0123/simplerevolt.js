"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChannelCollectionInServer = exports.ChannelCollection = void 0;
const Channel_1 = require("../models/Channel");
const DataCollection_1 = require("./DataCollection");
const models_1 = require("../models");
class ChannelCollection extends DataCollection_1.CachedCollection {
    constructor(client) {
        super(client, Channel_1.Channel);
    }
    _remove(id) {
        // Remove from the server
        const channel = this.cache.get(id);
        if (channel && channel instanceof models_1.ServerChannel) {
            const serverId = channel.serverId;
            this.client.servers.resolve(serverId)?.channels._remove(id);
        }
        // Remove from this collection
        this.cache.delete(id);
        return channel;
    }
    async delete(id) {
        await this.client.api.delete(`/channels/${id}`);
        this._remove(id);
    }
    updateItem(id, changes) {
        const channel = this.cache.get(id);
        if (channel) {
            return channel.update(changes);
        }
    }
}
exports.ChannelCollection = ChannelCollection;
class ChannelCollectionInServer extends DataCollection_1.CachedCollection {
    constructor(server) {
        super(server.client, Channel_1.Channel);
    }
    _add(channel) {
        const existing = this.cache.get(channel.id);
        if (existing)
            return existing;
        this.cache.set(channel.id, channel);
        return channel;
    }
}
exports.ChannelCollectionInServer = ChannelCollectionInServer;
//# sourceMappingURL=ChannelCollection.js.map