"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmojiCollection = void 0;
const Emoji_1 = require("../models/Emoji");
const DataCollection_1 = require("./DataCollection");
class EmojiCollection extends DataCollection_1.CachedCollection {
    constructor(client) {
        super(client, Emoji_1.Emoji);
    }
    _add(emoji) {
        const existing = this.cache.get(emoji.id);
        if (existing)
            return existing;
        this.cache.set(emoji.id, emoji);
        return emoji;
    }
    create(data) {
        const instance = new Emoji_1.Emoji(this.client, data);
        this.cache.set(instance.id, instance);
        return instance;
    }
}
exports.EmojiCollection = EmojiCollection;
//# sourceMappingURL=EmojiCollection.js.map