import { Emoji } from "../models/Emoji";
import { CachedCollection } from "./DataCollection";
export class EmojiCollection extends CachedCollection {
    constructor(client) {
        super(client, Emoji);
    }
    _add(emoji) {
        const existing = this.cache.get(emoji.id);
        if (existing)
            return existing;
        this.cache.set(emoji.id, emoji);
        return emoji;
    }
    create(data) {
        const instance = new Emoji(this.client, data);
        this.cache.set(instance.id, instance);
        return instance;
    }
}
//# sourceMappingURL=EmojiCollection.js.map