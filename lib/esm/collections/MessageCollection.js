import { Message } from "..";
import { CachedCollection } from "./DataCollection";
export class MessageCollection extends CachedCollection {
    constructor(client) {
        super(client, Message);
    }
    create(data) {
        const instance = new Message(this.client, data);
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
//# sourceMappingURL=MessageCollection.js.map