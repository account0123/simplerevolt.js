import type { Embed, ImageSize, Special } from "revolt-api";

import type { Client } from "../Client.js";
import { AutumnFile } from "./File.js";

export abstract class MessageEmbed {
  protected client?: Client | undefined;
  readonly type: Embed["type"];

  constructor(client?: Client, type: Embed["type"] = "None") {
    this.client = client;
    this.type = type;
  }

  static from(client: Client, embed: Embed): MessageEmbed {
    switch (embed.type) {
      case "Image":
        return new ImageEmbed(client, embed);
      case "Video":
        return new VideoEmbed(client, embed);
      case "Website":
        return new WebsiteEmbed(client, embed);
      case "Text":
        return new TextEmbed(client, embed);
      default:
        return new UnknownEmbed(client);
    }
  }
}

/**
 * Embed of unknown type
 */
export class UnknownEmbed extends MessageEmbed {}

/**
 * Image Embed
 */
export class ImageEmbed extends MessageEmbed {
  readonly url: string;
  readonly width: number;
  readonly height: number;
  readonly size: ImageSize;

  /**
   * Construct Image Embed
   * @param client Client
   * @param embed Embed
   */
  constructor(client: Client, embed: Omit<Embed & { type: "Image" }, "type">) {
    super(client, "Image");

    this.url = embed.url;
    this.width = embed.width;
    this.height = embed.height;
    this.size = embed.size;
  }

  /**
   * Proxied image URL
   */
  get proxiedURL() {
    return this.client?.proxyFile(this.url);
  }
}

/**
 * Video Embed
 */
export class VideoEmbed extends MessageEmbed {
  readonly url: string;
  readonly width: number;
  readonly height: number;

  /**
   * Construct Video Embed
   * @param client Client
   * @param embed Embed
   */
  constructor(client: Client, embed: Omit<Embed & { type: "Video" }, "type">) {
    super(client, "Video");

    this.url = embed.url;
    this.width = embed.width;
    this.height = embed.height;
  }

  /**
   * Proxied video URL
   */
  get proxiedURL() {
    return this.client?.proxyFile(this.url);
  }
}

/**
 * Website Embed
 */
export class WebsiteEmbed extends MessageEmbed {
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
  constructor(client: Client, embed: Omit<Embed & { type: "Website" }, "type">) {
    super(client, "Website");

    this.url = embed.url!;
    this.originalUrl = embed.original_url!;
    this.specialContent = embed.special!;
    this.title = embed.title!;
    this.description = embed.description!;
    this.image = embed.image ? new ImageEmbed(client, embed.image) : null;
    this.video = embed.video ? new VideoEmbed(client, embed.video) : null;
    this.siteName = embed.site_name!;
    this.iconUrl = embed.icon_url!;
    this.colour = embed.colour!;
  }

  /**
   * Proxied icon URL
   */
  get proxiedIconURL() {
    return this.iconUrl ? this.client?.proxyFile(this.iconUrl) : undefined;
  }

  /**
   * If special content is present, generate the embed URL
   */
  get embedURL() {
    switch (this.specialContent?.type) {
      case "YouTube": {
        let timestamp = "";

        if (this.specialContent.timestamp) {
          timestamp = `&start=${this.specialContent.timestamp}`;
        }

        return `https://www.youtube-nocookie.com/embed/${this.specialContent.id}?modestbranding=1${timestamp}`;
      }
      case "Twitch":
        return `https://player.twitch.tv/?${this.specialContent.content_type.toLowerCase()}=${
          this.specialContent.id
        }&parent=${(window ?? {})?.location?.hostname}&autoplay=false`;
      case "Lightspeed":
        return `https://new.lightspeed.tv/embed/${this.specialContent.id}/stream`;
      case "Spotify":
        return `https://open.spotify.com/embed/${this.specialContent.content_type}/${this.specialContent.id}`;
      case "Soundcloud":
        return `https://w.soundcloud.com/player/?url=${encodeURIComponent(
          this.url!,
        )}&color=%23FF7F50&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true`;
      case "Bandcamp": {
        return `https://bandcamp.com/EmbeddedPlayer/${this.specialContent.content_type.toLowerCase()}=${
          this.specialContent.id
        }/size=large/bgcol=181a1b/linkcol=056cc4/tracklist=false/transparent=true/`;
      }
      case "Streamable": {
        return `https://streamable.com/e/${this.specialContent.id}?loop=0`;
      }
    }
  }
}

/**
 * Text Embed
 */
export class TextEmbed extends MessageEmbed {
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
  constructor(client: Client, embed: Omit<Embed & { type: "Text" }, "type">) {
    super(client, "Text");

    this.iconUrl = embed.icon_url!;
    this.url = embed.url!;
    this.title = embed.title!;
    this.description = embed.description!;
    this.media = embed.media ? new AutumnFile(client, embed.media) : null;
    this.colour = embed.colour!;
  }

  /**
   * Proxied icon URL
   */
  get proxiedIconURL() {
    return this.iconUrl ? this.client?.proxyFile(this.iconUrl) : null;
  }
}
