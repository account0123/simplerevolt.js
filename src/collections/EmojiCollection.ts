import type { Emoji as ApiEmoji } from "revolt-api";

import type { Client } from "../Client.js";
import { Emoji } from "../models/Emoji.js";
import { CachedCollection } from "./DataCollection.js";

export class EmojiCollection extends CachedCollection<Emoji> {
  constructor(client: Client) {
    super(client, Emoji);
  }

  create(data: ApiEmoji) {
    const instance = new Emoji(this.client, data);
    this.cache.set(instance.id, instance);
    return instance;
  }
}
