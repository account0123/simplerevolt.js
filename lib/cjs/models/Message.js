"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageFlags = exports.Message = void 0;
const __1 = require("..");
const Base_1 = require("./Base");
const utils_1 = require("../utils");
class Message extends Base_1.Base {
    id;
    content;
    channelId;
    editedAt;
    embeds;
    member;
    pinned;
    reactions;
    userId;
    user;
    constructor(client, data) {
        super(client);
        this.id = data._id;
        this.content = data.content || null;
        this.editedAt = data.edited ? new Date(data.edited) : null;
        this.channelId = data.channel;
        this.embeds = data.embeds?.map((embed) => __1.MessageEmbed.from(client, embed)) || null;
        this.member = data.member ? (client.servers.resolve(data.member._id.server)?.members.create(data.member)) : null;
        this.reactions = data.reactions
            ? (0, utils_1.objectToMap)((0, utils_1.mapObject)(data.reactions, (_, idArray) => ({ [_]: new Set(idArray) })))
            : new Map();
        this.userId = data.user?._id || null;
        // Get user from cache or creates a new one
        this.user = data.user ? client.users._add(new __1.User(client, data.user)) : null;
        this.pinned = data.pinned || false;
    }
    addEmbeds(...embeds) {
        const actual = this.embeds || [];
        embeds.forEach((embed) => actual.push(__1.MessageEmbed.from(this.client, embed)));
        this.embeds = actual;
    }
    get channel() {
        return this.client.channels.resolve(this.channelId);
    }
    get server() {
        return this.channel instanceof __1.ServerChannel ? this.channel.server : null;
    }
    update(data) {
        if ("content" in data)
            this.content = data.content;
        if ("embeds" in data)
            this.embeds = data.embeds?.map((embed) => __1.MessageEmbed.from(this.client, embed)) || null;
        if ("edited" in data)
            this.editedAt = new Date(data.edited || Date.now());
        if ("pinned" in data)
            this.pinned = data.pinned || false;
        return this;
    }
}
exports.Message = Message;
/**
 * [Message Flags](https://docs.rs/revolt-models/latest/revolt_models/v0/enum.MessageFlags.html)
 */
var MessageFlags;
(function (MessageFlags) {
    MessageFlags[MessageFlags["SupressNotifications"] = 1] = "SupressNotifications";
})(MessageFlags || (exports.MessageFlags = MessageFlags = {}));
//# sourceMappingURL=Message.js.map