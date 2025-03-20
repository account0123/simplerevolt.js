import { Server } from "./Server";
import { Category as ApiCategory } from "revolt-api";
import { ChannelCollectionInServer } from "../collections/ChannelCollection";
import { Base } from "./Base";
import { Client } from "..";
export declare class Category extends Base {
    readonly id: string;
    title: string;
    channels: ChannelCollectionInServer;
    constructor(client: Client, data: ApiCategory, server: Server);
    update(data: ApiCategory, channelCollection?: ChannelCollectionInServer): void;
}
//# sourceMappingURL=ServerCategory.d.ts.map