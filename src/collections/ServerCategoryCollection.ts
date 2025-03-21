import { Category, Server } from "../models/index.js";
import { CachedCollection } from "./DataCollection.js";

export class ServerCategoryCollection extends CachedCollection<Category> {
  constructor(server: Server) {
    super(server.client, Category);
  }
}
