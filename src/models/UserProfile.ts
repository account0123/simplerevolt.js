import { UserProfile as ApiUserProfile } from "revolt-api";
import { Client } from "../Client.js";
import { AutumnFile } from "./File.js";

export class UserProfile {
  content: string | null = null;
  background: AutumnFile | null = null;
  constructor(
    readonly client: Client,
    data: ApiUserProfile,
  ) {
    this.update(data);
  }

  /**
   * URL to the user's banner
   */
  get bannerURL() {
    return this.background?.createFileURL();
  }

  /**
   * URL to the user's animated banner
   */
  get animatedBannerURL() {
    return this.background?.createFileURL(true);
  }

  update(data: Partial<ApiUserProfile>) {
    if ("content" in data) this.content = data.content;
    if ("background" in data) this.background = data.background ? new AutumnFile(this.client, data.background) : null;
  }
}
