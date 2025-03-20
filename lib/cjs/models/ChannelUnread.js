"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChannelUnread = void 0;
const Base_1 = require("./Base");
class ChannelUnread extends Base_1.Base {
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
exports.ChannelUnread = ChannelUnread;
//# sourceMappingURL=ChannelUnread.js.map