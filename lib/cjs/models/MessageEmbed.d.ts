import type { Embed, ImageSize, Special } from "revolt-api";
import type { Client } from "..";
import { AutumnFile } from "./File";
export declare abstract class MessageEmbed {
    protected client?: Client | undefined;
    readonly type: Embed["type"];
    constructor(client?: Client, type?: Embed["type"]);
    static from(client: Client, embed: Embed): MessageEmbed;
}
/**
 * Embed of unknown type
 */
export declare class UnknownEmbed extends MessageEmbed {
}
/**
 * Image Embed
 */
export declare class ImageEmbed extends MessageEmbed {
    readonly url: string;
    readonly width: number;
    readonly height: number;
    readonly size: ImageSize;
    /**
     * Construct Image Embed
     * @param client Client
     * @param embed Embed
     */
    constructor(client: Client, embed: Omit<Embed & {
        type: "Image";
    }, "type">);
    /**
     * Proxied image URL
     */
    get proxiedURL(): string | undefined;
}
/**
 * Video Embed
 */
export declare class VideoEmbed extends MessageEmbed {
    readonly url: string;
    readonly width: number;
    readonly height: number;
    /**
     * Construct Video Embed
     * @param client Client
     * @param embed Embed
     */
    constructor(client: Client, embed: Omit<Embed & {
        type: "Video";
    }, "type">);
    /**
     * Proxied video URL
     */
    get proxiedURL(): string | undefined;
}
/**
 * Website Embed
 */
export declare class WebsiteEmbed extends MessageEmbed {
    readonly url?: string;
    readonly originalUrl?: string;
    readonly specialContent?: Special;
    readonly title?: string;
    readonly description?: string;
    readonly image: ImageEmbed | null;
    readonly video: VideoEmbed | null;
    readonly siteName?: string;
    readonly iconUrl?: string;
    readonly colour?: string;
    /**
     * Construct Video Embed
     * @param client Client
     * @param embed Embed
     */
    constructor(client: Client, embed: Omit<Embed & {
        type: "Website";
    }, "type">);
    /**
     * Proxied icon URL
     */
    get proxiedIconURL(): string | undefined;
    /**
     * If special content is present, generate the embed URL
     */
    get embedURL(): string | undefined;
}
/**
 * Text Embed
 */
export declare class TextEmbed extends MessageEmbed {
    readonly iconUrl?: string;
    readonly url?: string;
    readonly title?: string;
    readonly description?: string;
    readonly media: AutumnFile | null;
    readonly colour?: string;
    /**
     * Construct Video Embed
     * @param client Client
     * @param embed Embed
     */
    constructor(client: Client, embed: Omit<Embed & {
        type: "Text";
    }, "type">);
    /**
     * Proxied icon URL
     */
    get proxiedIconURL(): string | null | undefined;
}
//# sourceMappingURL=MessageEmbed.d.ts.map