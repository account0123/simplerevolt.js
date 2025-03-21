import type { Emoji as ApiEmoji } from "revolt-api";

import type { Client } from "../Client.js";
import { Emoji } from "../models/Emoji.js";
import { CachedCollection } from "./DataCollection.js";

export class EmojiCollection extends CachedCollection<Emoji> {
  constructor(client: Client) {
    super(client, Emoji);
  }

  override _add(emoji: Emoji) {
    const existing = this.cache.get(emoji.id);
    if (existing) return existing;
    this.cache.set(emoji.id, emoji);
    return emoji;
  }

  create(data: ApiEmoji) {
    const instance = new Emoji(this.client, data);
    this.cache.set(instance.id, instance);
    return instance;
  }
}
