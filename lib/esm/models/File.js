export var FileType;
(function (FileType) {
    FileType["Audio"] = "Audio";
    FileType["File"] = "File";
    FileType["Image"] = "Image";
    FileType["Text"] = "Text";
    FileType["Video"] = "Video";
})(FileType || (FileType = {}));
export class AutumnFile {
    client;
    contentType;
    deleted;
    filename;
    id;
    metadata;
    size;
    tag;
    constructor(client, data) {
        this.client = client;
        this.id = data._id;
        this.metadata = data.metadata;
        this.contentType = data.content_type;
        this.filename = data.filename;
        this.size = data.size;
        this.tag = data.tag;
        this.deleted = data.deleted || false;
    }
    /**
   * Human readable file size
   */
    get humanReadableSize() {
        if (!this.size)
            return "Unknown size";
        if (this.size > 1e6) {
            return `${(this.size / 1e6).toFixed(2)} MB`;
        }
        else if (this.size > 1e3) {
            return `${(this.size / 1e3).toFixed(2)} KB`;
        }
        return `${this.size} B`;
    }
    /**
     * Whether this file should have a spoiler
     */
    get isSpoiler() {
        return this.filename?.toLowerCase().startsWith("spoiler_") ?? false;
    }
    /**
     * Creates a URL to a given file with given options.
     * @param forceAnimation Returns GIF if applicable (for avatars/icons)
     * @returns Generated URL or nothing
     */
    createFileURL(forceAnimation) {
        const autumn = this.client.configuration?.features.autumn;
        if (!autumn?.enabled)
            return null;
        let query = "";
        if (forceAnimation && this.contentType == "image/gif") {
            query = "/original";
        }
        return `${autumn.url}/${this.tag}/${this.id}${query}`;
    }
}
//# sourceMappingURL=File.js.map