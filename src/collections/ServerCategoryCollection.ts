import type { Server } from "../models/Server.js";
import { Category } from "../models/ServerCategory.js";
import { CachedCollection } from "./DataCollection.js";

export class ServerCategoryCollection extends CachedCollection<Category> {
  constructor(server: Server) {
    super(server.client, Category);
  }
}
