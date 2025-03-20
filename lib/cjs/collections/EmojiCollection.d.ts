import { Emoji as ApiEmoji } from "revolt-api";
import type { Client } from "..";
import { Emoji } from "../models/Emoji";
import { CachedCollection } from "./DataCollection";
export declare class EmojiCollection extends CachedCollection<Emoji> {
    constructor(client: Client);
    _add(emoji: Emoji): Emoji;
    create(data: ApiEmoji): Emoji;
}
//# sourceMappingURL=EmojiCollection.d.ts.map