import { ChannelUnread } from "../models/ChannelUnread";
import { CachedCollection } from "./DataCollection";
export class ChannelUnreadCollection extends CachedCollection {
    constructor(client) {
        super(client, ChannelUnread);
    }
    patch(key, data) {
        this.cache.get(key)?.update(data);
    }
    async sync() {
        const unreads = await this.client.api.get("/sync/unreads");
        this.reset();
        for (const unread of unreads) {
            this._add(new ChannelUnread(this.client, unread));
        }
    }
    reset() {
        this.cache.clear();
    }
}
//# sourceMappingURL=ChannelUnreadCollection.js.map