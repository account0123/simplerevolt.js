import { decodeTime } from "ulid";
import type { Emoji as ApiEmoji } from "revolt-api";

import type { Client } from "../Client.js";
import { Base } from "./index.js";

/**
 * Emoji Class
 */
export class Emoji extends Base {
  readonly animated: boolean;
  readonly id: string;
  readonly creatorId: string;
  readonly name: string;
  readonly nsfw: boolean;
  parent: { type: "Server"; id: string } | { type: "Detached" };

  constructor(client: Client, data: ApiEmoji) {
    super(client);
    this.animated = data.animated || false;
    this.id = data._id;
    this.parent = data.parent;
    this.creatorId = data.creator_id;
    this.name = data.name;
    this.nsfw = data.nsfw || false;
  }

  /**
   * Convert to string
   * @returns String
   */
  override toString() {
    return `:${this.id}:`;
  }

  /**
   * Time when this emoji was created
   */
  get createdAt() {
    return new Date(decodeTime(this.id));
  }

  /**
   * Creator of the emoji
   */
  get creator() {
    return this.client.users.cache.get(this.creatorId);
  }

  /**
   * Delete Emoji
   */
  async delete() {
    await this.client.api.delete(`/custom/emoji/${this.id}`);

    this.client.emit("emojiDelete", this);
  }
}
