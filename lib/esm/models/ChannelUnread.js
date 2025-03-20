import { Base } from "./Base";
export class ChannelUnread extends Base {
    id;
    lastMessageId;
    mentionIds;
    constructor(client, data) {
        super(client);
        this.id = data._id.channel;
        this.lastMessageId = data.last_id || null;
        this.mentionIds = new Set(data.mentions);
    }
    update(data) {
        if (data.last_id)
            this.lastMessageId = data.last_id;
    }
}
//# sourceMappingURL=ChannelUnread.js.map