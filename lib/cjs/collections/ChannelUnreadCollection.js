"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChannelUnreadCollection = void 0;
const ChannelUnread_1 = require("../models/ChannelUnread");
const DataCollection_1 = require("./DataCollection");
class ChannelUnreadCollection extends DataCollection_1.CachedCollection {
    constructor(client) {
        super(client, ChannelUnread_1.ChannelUnread);
    }
    patch(key, data) {
        this.cache.get(key)?.update(data);
    }
    async sync() {
        const unreads = await this.client.api.get("/sync/unreads");
        this.reset();
        for (const unread of unreads) {
            this._add(new ChannelUnread_1.ChannelUnread(this.client, unread));
        }
    }
    reset() {
        this.cache.clear();
    }
}
exports.ChannelUnreadCollection = ChannelUnreadCollection;
//# sourceMappingURL=ChannelUnreadCollection.js.map