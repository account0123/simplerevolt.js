import { ChannelUnread as ApiChannelUnread } from "revolt-api";
import { Base } from "./Base";
import type { Client } from "..";

export class ChannelUnread extends Base {
    readonly id: string;
    lastMessageId: string | null;
    readonly mentionIds: Set<string>;
    constructor(client: Client, data: ApiChannelUnread) {
        super(client);
        this.id = data._id.channel;
        this.lastMessageId = data.last_id || null;
        this.mentionIds = new Set(data.mentions);
    }

    override update(data: Partial<ApiChannelUnread>) {
        if (data.last_id) this.lastMessageId = data.last_id;
    }
}