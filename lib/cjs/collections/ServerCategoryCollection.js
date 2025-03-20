"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerCategoryCollection = void 0;
const ServerCategory_1 = require("../models/ServerCategory");
const DataCollection_1 = require("./DataCollection");
class ServerCategoryCollection extends DataCollection_1.CachedCollection {
    constructor(server) {
        super(server.client, ServerCategory_1.Category);
    }
}
exports.ServerCategoryCollection = ServerCategoryCollection;
//# sourceMappingURL=ServerCategoryCollection.js.map