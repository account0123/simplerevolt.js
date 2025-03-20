import { Message as ApiMessage } from "revolt-api";
import { Message, type Client } from "..";
import { CachedCollection } from "./DataCollection";
export declare class MessageCollection extends CachedCollection<Message> {
    constructor(client: Client);
    create(data: ApiMessage): Message;
    delete(id: string): Promise<undefined>;
}
//# sourceMappingURL=MessageCollection.d.ts.map