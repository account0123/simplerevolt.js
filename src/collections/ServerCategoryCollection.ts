import { Server } from "../models/Server";
import { Category } from "../models/ServerCategory";
import { CachedCollection } from "./DataCollection";

export class ServerCategoryCollection extends CachedCollection<Category> {
  constructor(server: Server) {
    super(server.client, Category);
  }
}
