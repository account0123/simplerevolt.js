import { Client } from "..";
import { ChannelUnread } from "../models/ChannelUnread";
import { ChannelUnread as ApiChannelUnread } from "revolt-api";
import { CachedCollection } from "./DataCollection";
export declare class ChannelUnreadCollection extends CachedCollection<ChannelUnread> {
    constructor(client: Client);
    patch(key: string, data: Partial<ApiChannelUnread>): void;
    sync(): Promise<void>;
    reset(): void;
}
//# sourceMappingURL=ChannelUnreadCollection.d.ts.map