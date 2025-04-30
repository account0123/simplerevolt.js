import { Client } from "../Client.js";
import { mapObject } from "../utils/index.js";

export type ParsedSettings = {
  timestamp: number;
  data: Record<string, any>;
};

export class SyncSettings {
  constructor(private client: Client) {}

  /**
   * Fetch settings from server filtered by keys.
   *
   * User settings typings should be provided on frontend.
   * @param keys Keys to fetch
   * @throws RevoltAPIError
   */
  async fetch(keys: string[]) {
    if (!Array.isArray(keys)) throw new TypeError("keys must be an array");
    const result = await this.client.api.post("/sync/settings/fetch", { keys });
    return mapObject(result, (key, value) => ({ [key]: SyncSettings.parseSettingsValue(value) }));
  }

  static parseSettingsValue(value: [number, string]): ParsedSettings {
    return { timestamp: value[0], data: JSON.parse(value[1]) };
  }

  /**
   * Upload data to save to settings.
   * @param data Object to save. Values will be stringified.
   * @param timestamp UTC timestamp as miliseconds since epoch, or null to use current time.
   * @throws RevoltAPIError
   */
  async save(data: Record<string, object | string>, timestamp = null) {
    const requestData: { [key: string]: string } = {};
    for (const key of Object.keys(data)) {
      const value = data[key];
      requestData[key] = typeof value == "string" ? value : JSON.stringify(value);
    }
    await this.client.api.post("/sync/settings/set", { ...requestData, timestamp });
  }
}
