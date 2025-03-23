import { CreateWebhookBody, Webhook } from "revolt-api";
import { Client } from "../Client.js";
import { Channel, ChannelWebhook } from "../models/index.js";
import { CachedCollection } from "./DataCollection.js";

export class ChannelWebhookCollection extends CachedCollection<ChannelWebhook> {
  constructor(client: Client) {
    super(client, ChannelWebhook);
  }

  create(channel: Channel, data: Webhook) {
    const webhook = new ChannelWebhook(channel, data);
    this.cache.set(webhook.id, webhook);
    return webhook;
  }

  async createWebhook(channel: Channel, data: CreateWebhookBody) {
    const result = await this.client.api.post(`/channels/${channel.id as ""}/webhooks`, data);
    return this.create(channel, result);
  }
}
