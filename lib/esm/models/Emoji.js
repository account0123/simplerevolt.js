import { decodeTime } from "ulid";
import { Base } from "./Base";
/**
 * Emoji Class
 */
export class Emoji extends Base {
    animated;
    id;
    creatorId;
    name;
    nsfw;
    parent;
    constructor(client, data) {
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
    toString() {
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
//# sourceMappingURL=Emoji.js.map