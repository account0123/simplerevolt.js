import { Message as ApiMessage } from "revolt-api";
import { Message, type Client } from "..";
import { CachedCollection } from "./DataCollection";

export class MessageCollection extends CachedCollection<Message> {
    constructor(client: Client) {
        super(client, Message);
    }

    create(data: ApiMessage) {
        const instance = new Message(this.client, data);
        this.cache.set(instance.id, instance);
        return instance;
    }

    async delete(id: string) {
        const channelId = this._remove(id)?.channelId;
        if (channelId) {
            return await this.client.api.delete(`/channels/${channelId}/messages/${id}`);
        }
    }
}