import { Channel } from "../models/Channel";
import { CachedCollection } from "./DataCollection";
import { ServerChannel } from "../models";
export class ChannelCollection extends CachedCollection {
    constructor(client) {
        super(client, Channel);
    }
    _remove(id) {
        // Remove from the server
        const channel = this.cache.get(id);
        if (channel && channel instanceof ServerChannel) {
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
export class ChannelCollectionInServer extends CachedCollection {
    constructor(server) {
        super(server.client, Channel);
    }
    _add(channel) {
        const existing = this.cache.get(channel.id);
        if (existing)
            return existing;
        this.cache.set(channel.id, channel);
        return channel;
    }
}
//# sourceMappingURL=ChannelCollection.js.map