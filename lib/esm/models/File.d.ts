import { File as ApiFile } from "revolt-api";
import type { Client } from "..";
export declare enum FileType {
    Audio = "Audio",
    File = "File",
    Image = "Image",
    Text = "Text",
    Video = "Video"
}
interface Metadata {
    type: FileType;
    width?: number;
    height?: number;
}
export declare class AutumnFile {
    readonly client: Client;
    readonly contentType: string;
    readonly deleted: boolean;
    readonly filename: string;
    readonly id: string;
    readonly metadata: Metadata;
    readonly size: number;
    readonly tag: string;
    constructor(client: Client, data: ApiFile);
    /**
   * Human readable file size
   */
    get humanReadableSize(): string;
    /**
     * Whether this file should have a spoiler
     */
    get isSpoiler(): boolean;
    /**
     * Creates a URL to a given file with given options.
     * @param forceAnimation Returns GIF if applicable (for avatars/icons)
     * @returns Generated URL or nothing
     */
    createFileURL(forceAnimation?: boolean): string | null;
}
export {};
//# sourceMappingURL=File.d.ts.map