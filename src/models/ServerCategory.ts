import { Category as ApiCategory } from "revolt-api";

import type { Client } from "../Client.js";
import { Base } from "./Base.js";
import type { Server } from "./Server.js";
import { ChannelCollectionInServer } from "../collections/ChannelCollection.js";

export class Category extends Base {
  readonly id: string;
  title: string;
  channels: ChannelCollectionInServer;
  constructor(client: Client, data: ApiCategory, server: Server) {
    super(client);
    this.id = data.id;
    this.title = data.title;
    this.channels = new ChannelCollectionInServer(server);
    this.update(data, server.channels);
  }

  override update(data: ApiCategory, channelCollection?: ChannelCollectionInServer) {
    if (data.title) this.title = data.title;
    if (Array.isArray(data.channels) && channelCollection) {
      for (const channelId of data.channels) {
        const channel = channelCollection.cache.get(channelId);
        if (channel) this.channels._add(channel);
      }
    }
  }
}
