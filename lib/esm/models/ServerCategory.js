import { ChannelCollectionInServer } from "../collections/ChannelCollection";
import { Base } from "./Base";
export class Category extends Base {
    id;
    title;
    channels;
    constructor(client, data, server) {
        super(client);
        this.id = data.id;
        this.title = data.title;
        this.channels = new ChannelCollectionInServer(server);
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
//# sourceMappingURL=ServerCategory.js.map