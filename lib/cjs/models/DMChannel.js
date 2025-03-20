"use strict";
/** @description Whether this direct message channel is currently open on both side
active: boolean;
/** @description 2-tuple of user ids participating in direct messag
recipients: string[];
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.DMChannel = void 0;
const _1 = require(".");
class DMChannel extends _1.TextBasedChannel {
    active = false;
    recipientIds;
    recipientId = null;
    constructor(client, data) {
        super(client, data);
        this.recipientIds = new Set(data.recipients);
        if (data.recipients.length) {
            this.recipientId = data.recipients[0] || null;
        }
        this.update(data);
    }
    get recipient() {
        return this.recipientId ? this.client.users.resolve(this.recipientId) : null;
    }
    update(data) {
        if ("active" in data)
            this.active = data.active;
        return this;
    }
}
exports.DMChannel = DMChannel;
//# sourceMappingURL=DMChannel.js.map