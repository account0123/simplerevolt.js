/** @description Whether this direct message channel is currently open on both side
active: boolean;
/** @description 2-tuple of user ids participating in direct messag
recipients: string[];
*/
import { Channel } from "revolt-api";
import { TextBasedChannel } from ".";
import { Client } from "..";
type DMChannelData = Extract<Channel, {
    channel_type: "DirectMessage";
}>;
export declare class DMChannel extends TextBasedChannel {
    active: boolean;
    readonly recipientIds: Set<string>;
    readonly recipientId: string | null;
    constructor(client: Client, data: DMChannelData);
    get recipient(): import("./User").User | null;
    update(data: Partial<DMChannelData>): this;
}
export {};
//# sourceMappingURL=DMChannel.d.ts.map