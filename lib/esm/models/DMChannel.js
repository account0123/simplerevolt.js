/** @description Whether this direct message channel is currently open on both side
active: boolean;
/** @description 2-tuple of user ids participating in direct messag
recipients: string[];
*/
import { TextBasedChannel } from ".";
export class DMChannel extends TextBasedChannel {
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
//# sourceMappingURL=DMChannel.js.map