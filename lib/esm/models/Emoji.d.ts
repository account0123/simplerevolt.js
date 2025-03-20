import { Emoji as ApiEmoji } from "revolt-api";
import type { Client } from "..";
import { Base } from "./Base";
/**
 * Emoji Class
 */
export declare class Emoji extends Base {
    readonly animated: boolean;
    readonly id: string;
    readonly creatorId: string;
    readonly name: string;
    readonly nsfw: boolean;
    parent: {
        type: "Server";
        id: string;
    } | {
        type: "Detached";
    };
    constructor(client: Client, data: ApiEmoji);
    /**
     * Convert to string
     * @returns String
     */
    toString(): string;
    /**
     * Time when this emoji was created
     */
    get createdAt(): Date;
    /**
     * Creator of the emoji
     */
    get creator(): import("./User").User | undefined;
    /**
     * Delete Emoji
     */
    delete(): Promise<void>;
}
//# sourceMappingURL=Emoji.d.ts.map