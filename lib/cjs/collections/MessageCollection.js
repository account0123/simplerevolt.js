"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageCollection = void 0;
const __1 = require("..");
const DataCollection_1 = require("./DataCollection");
class MessageCollection extends DataCollection_1.CachedCollection {
    constructor(client) {
        super(client, __1.Message);
    }
    create(data) {
        const instance = new __1.Message(this.client, data);
        this.cache.set(instance.id, instance);
        return instance;
    }
    async delete(id) {
        const channelId = this._remove(id)?.channelId;
        if (channelId) {
            return await this.client.api.delete(`/channels/${channelId}/messages/${id}`);
        }
    }
}
exports.MessageCollection = MessageCollection;
//# sourceMappingURL=MessageCollection.js.map