import { Server as ApiServer } from "revolt-api";
import type { Client } from "..";
import { Server } from "../models/Server";
import { CachedCollection } from "./DataCollection";
export declare class ServerCollection extends CachedCollection<Server> {
    constructor(client: Client);
    _add(server: Server, cache?: boolean): Server;
    create(data: ApiServer): Server;
}
//# sourceMappingURL=ServerCollection.d.ts.map