import { ChannelUnread as ApiChannelUnread } from "revolt-api";
import { Base } from "./Base";
import type { Client } from "..";
export declare class ChannelUnread extends Base {
    readonly id: string;
    lastMessageId: string | null;
    readonly mentionIds: Set<string>;
    constructor(client: Client, data: ApiChannelUnread);
    update(data: Partial<ApiChannelUnread>): void;
}
//# sourceMappingURL=ChannelUnread.d.ts.map