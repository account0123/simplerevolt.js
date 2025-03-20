import { Channel as ApiChannel } from "revolt-api";
import type { Client } from "..";
import { Channel } from "../models/Channel";
import type { Server } from "../models/Server";
import { CachedCollection } from "./DataCollection";
export declare class ChannelCollection extends CachedCollection<Channel> {
    constructor(client: Client);
    _remove(id: string): Channel | undefined;
    delete(id: string): Promise<void>;
    updateItem(id: string, changes: Partial<ApiChannel>): Channel | undefined;
}
export declare class ChannelCollectionInServer extends CachedCollection<Channel> {
    constructor(server: Server);
    _add(channel: Channel): Channel;
}
//# sourceMappingURL=ChannelCollection.d.ts.map