"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Category = void 0;
const ChannelCollection_1 = require("../collections/ChannelCollection");
const Base_1 = require("./Base");
class Category extends Base_1.Base {
    id;
    title;
    channels;
    constructor(client, data, server) {
        super(client);
        this.id = data.id;
        this.title = data.title;
        this.channels = new ChannelCollection_1.ChannelCollectionInServer(server);
        this.update(data, server.channels);
    }
    update(data, channelCollection) {
        if (data.title)
            this.title = data.title;
        if (Array.isArray(data.channels) && channelCollection) {
            for (const channelId of data.channels) {
                const channel = channelCollection.cache.get(channelId);
                if (channel)
                    this.channels._add(channel);
            }
        }
    }
}
exports.Category = Category;
//# sourceMappingURL=ServerCategory.js.map