import { Collection } from "@discordjs/collection";
import type { Message } from "./index.js";
import { Interactions } from "revolt-api";

export type MessageReactionsData = Record<string, string[]>;
export class MessageReactions {
  /**
   * Reactions which should always appear and be distinct
   */
  readonly restricted: Set<string> = new Set();
  private readonly _cache = new Collection<string, Set<string>>();
  constructor(
    readonly message: Message,
    data: MessageReactionsData,
    restrictions?: Interactions,
  ) {
    restrictions && this.restrict(restrictions);
    this.update(data);
  }

  get cache() {
    return this._cache;
  }

  get client() {
    return this.message.client;
  }

  /**
   * Clear all reactions from this message
   */
  async clearReactions() {
    const result = await this.client.api.delete(
      `/channels/${this.message.channelId as ""}/messages/${this.message.id as ""}/reactions`,
    );
    this._cache.clear();
    return result;
  }

  fromUser(userId: string) {
    return [...this._cache.filter((reactions) => reactions.has(userId)).keys()];
  }

  restrict({ reactions, restrict_reactions }: Interactions) {
    if (restrict_reactions) {
      reactions?.forEach((reaction) => this.restricted.add(reaction));
    } else {
      this.restricted.clear();
    }
  }

  resolve(emojiId: string) {
    return this._cache.get(emojiId) || null;
  }

  update(data: MessageReactionsData) {
    for (const emojiId in data) {
      this._cache.set(emojiId, new Set(data[emojiId]));
    }
  }
}
