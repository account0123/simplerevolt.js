"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextBasedChannel = exports.Channel = void 0;
const Base_1 = require("./Base");
const ulid_1 = require("ulid");
const ops_1 = require("../permissions/ops");
const permissions_1 = require("../permissions");
const DMChannel_1 = require("./DMChannel");
const GroupChannel_1 = require("./GroupChannel");
const ServerChannel_1 = require("./ServerChannel");
/**
 * Channel Class
 */
class Channel extends Base_1.Base {
    id;
    channelType;
    lastMessageId = null;
    constructor(client, data) {
        super(client);
        this.id = data._id;
        this.channelType = data.channel_type;
    }
    #ackTimeout;
    #ackLimit = null;
    #manuallyMarked;
    /**
     * Mark a channel as read
     * @param message Last read message or its ID
     * @param skipRateLimiter Whether to skip the internal rate limiter
     * @param skipRequest For internal updates only
     * @param skipNextMarking For internal usage only
     */
    async ack(message, skipRateLimiter, skipRequest, skipNextMarking) {
        if (!message && this.#manuallyMarked) {
            this.#manuallyMarked = false;
            return;
        }
        // Skip the next unread marking
        else if (skipNextMarking) {
            this.#manuallyMarked = true;
        }
        const lastMessageId = (typeof message == "string" ? message : message?.id) ?? this.lastMessageId ?? (0, ulid_1.ulid)();
        const unreads = this.client.channelUnreads;
        const channelUnread = unreads.cache.get(this.id);
        if (channelUnread) {
            unreads.patch(this.id, { last_id: lastMessageId });
            if (channelUnread.mentionIds.size) {
                channelUnread.mentionIds.clear();
            }
        }
        // Skip request if not needed
        if (skipRequest)
            return;
        /**
         * Send the actual acknowledgement request
         */
        const performAck = () => {
            this.#ackLimit = null;
            this.client.api.put(`/channels/${this.id}/ack/${lastMessageId}`);
        };
        if (skipRateLimiter)
            return performAck();
        clearTimeout(this.#ackTimeout);
        if (this.#ackLimit && +new Date() > this.#ackLimit) {
            performAck();
        }
        // We need to use setTimeout here for both Node.js and browser.
        this.#ackTimeout = setTimeout(performAck, 5e3);
        if (!this.#ackLimit) {
            this.#ackLimit = +new Date() + 15e3;
        }
    }
    /**
     * Write to string as a channel mention
     */
    toString() {
        return `<#${this.id}>`;
    }
    /**
     * Time when this server was created
     */
    get createdAt() {
        return new Date((0, ulid_1.decodeTime)(this.id));
    }
    /**
     * Absolute pathname to this channel in the client
     */
    get path() {
        return `/channel/${this.id}`;
    }
    /**
     * URL to this channel
     */
    get url() {
        return this.client.configuration?.app + this.path;
    }
    /**
     * Whether this channel may be hidden to some users
     */
    get potentiallyRestrictedChannel() {
        return false;
    }
    /**
     * Permission the currently authenticated user has against this channel
     */
    get permission() {
        return new ops_1.PermissionsBitField((0, ops_1.calculatePermission)(this.client, this));
    }
    /**
     * Check whether we have a given permission in a channel
     * @param permission Permission Names
     * @returns Whether we have this permission
     */
    havePermission(...permission) {
        return this.permission.bitwiseAndEq(...permission.map((x) => permissions_1.Permission[x]));
    }
    /**
     * Check whether we have at least one of the given permissions in a channel
     * @param permission Permission Names
     * @returns Whether we have one of the permissions
     */
    orPermission(...permission) {
        return permission.findIndex((x) => this.permission.bitwiseAndEq(permissions_1.Permission[x])) != -1;
    }
    /**
     * Delete or leave a channel
     * @param leaveSilently Whether to not send a message on leave
     */
    async delete(leaveSilently) {
        await this.client.api.delete(`/channels/${this.id}`, {
            leave_silently: leaveSilently,
        });
    }
    /**
     * Edit a channel
     * @param data Changes
     */
    async edit(data) {
        await this.client.api.patch(`/channels/${this.id}`, data);
    }
    static from(client, data) {
        switch (data.channel_type) {
            case "SavedMessages":
                return new this(client, data);
            case "DirectMessage":
                return new DMChannel_1.DMChannel(client, data);
            case "Group":
                return new GroupChannel_1.Group(client, data);
            case "TextChannel":
                return new ServerChannel_1.TextChannel(client, data);
            case "VoiceChannel":
                return new ServerChannel_1.VoiceChannel(client, data);
        }
    }
    update(_) {
        return this;
    }
}
exports.Channel = Channel;
/**
 * Channels with text-based messages
 * DMChannel | Group | TextChannel | VoiceChannel
 */
class TextBasedChannel extends Channel {
    typingIds;
    constructor(client, data) {
        super(client, data);
        this.typingIds = new Set();
    }
    /**
     * Fetch a channel's webhooks
     * @requires `TextChannel`, `Group`
     * @returns Webhooks
     */
    /**
     * Fetch a message by its ID
     */
    async fetchMessage(messageId) {
        const message = await this.client.api.get(`/channels/${this.id}/messages/${messageId}`);
        return this.client.messages.create(message);
    }
    /**
     * Fetch multiple messages from a channel
     * @param params Message fetching route data
     */
    async fetchMessages(params) {
        const messages = (await this.client.api.get(`/channels/${this.id}/messages`, params || {}));
        return messages.map((message) => this.client.messages.create(message));
    }
    /**
     * Fetch multiple messages from a channel including the users that sent them
     */
    async fetchMessagesWithUsers(params) {
        const data = (await this.client.api.get(`/channels/${this.id}/messages`, {
            ...params,
            include_users: true,
        }));
        return {
            messages: data.messages.map((message) => this.client.messages.create(message)),
            users: data.users.map((user) => this.client.users.create(user)),
        };
    }
    /**
     * Search for messages
     */
    async search(params) {
        const messages = (await this.client.api.post(`/channels/${this.id}/search`, params));
        return messages.map((message) => this.client.messages.create(message));
    }
    /**
     * Search for messages including the users that sent them
     */
    async searchWithUsers(params) {
        const data = (await this.client.api.post(`/channels/${this.id}/search`, {
            ...params,
            include_users: true,
        }));
        return {
            messages: data.messages.map((message) => this.client.messages.create(message)),
            users: data.users.map((user) => this.client.users.create(user)),
        };
    }
    /**
     * Get mentions in this channel for user.
     */
    get mentions() {
        if (this.channelType == "SavedMessages" || this.channelType == "VoiceChannel")
            return undefined;
        return this.client.channelUnreads.resolve(this.id)?.mentionIds;
    }
    /**
     * Start typing in this channel
     */
    startTyping() {
        this.client.events.send({
            type: "BeginTyping",
            channel: this.id,
        });
    }
    /**
     * Stop typing in this channel
     */
    stopTyping() {
        this.client.events.send({
            type: "EndTyping",
            channel: this.id,
        });
    }
    /**
     * Send a message
     * @param data Either the message as a string or message sending route data
     * @returns Sent message
     */
    async sendMessage(data, idempotencyKey = (0, ulid_1.ulid)()) {
        const msg = typeof data == "string" ? { content: data } : data;
        // Mark as silent message
        if (msg.content?.startsWith("/s ")) {
            msg.content = msg.content.substring(3);
            msg.flags ||= 1;
            msg.flags |= 1;
        }
        const message = await this.client.api.post(`/channels/${this.id}/messages`, msg, {
            headers: {
                "Idempotency-Key": idempotencyKey,
            },
        });
        return this.client.messages.create(message);
    }
    /**
     * Set role permissions
     * @param role_id Role Id, set to 'default' to affect all users
     * @param permissions Permission value
     */
    async setPermissions(role_id = "default", permissions) {
        return await this.client.api.put(`/channels/${this.id}/permissions/${role_id}`, {
            permissions,
        });
    }
    /**
     * Get whether this channel is unread.
     */
    get unread() {
        if (!this.lastMessageId ||
            this.channelType == "SavedMessages" ||
            this.channelType == "VoiceChannel" ||
            this.client.options.channelIsMuted(this))
            return false;
        return ((this.client.channelUnreads.resolve(this.id)?.lastMessageId ?? "0").localeCompare(this.lastMessageId) ==
            -1);
    }
}
exports.TextBasedChannel = TextBasedChannel;
//# sourceMappingURL=Channel.js.map