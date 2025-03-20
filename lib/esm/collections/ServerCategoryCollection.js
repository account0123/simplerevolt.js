import { Category } from "../models/ServerCategory";
import { CachedCollection } from "./DataCollection";
export class ServerCategoryCollection extends CachedCollection {
    constructor(server) {
        super(server.client, Category);
    }
}
//# sourceMappingURL=ServerCategoryCollection.js.map