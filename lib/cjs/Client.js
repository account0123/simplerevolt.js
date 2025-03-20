"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
const async_event_emitter_1 = require("@vladfrangu/async_event_emitter");
const revolt_api_1 = require("revolt-api");
const EventClient_1 = require("./events/EventClient");
const ChannelUnreadCollection_1 = require("./collections/ChannelUnreadCollection");
const ChannelCollection_1 = require("./collections/ChannelCollection");
const ServerCollection_1 = require("./collections/ServerCollection");
const UserCollection_1 = require("./collections/UserCollection");
const EmojiCollection_1 = require("./collections/EmojiCollection");
const MessageCollection_1 = require("./collections/MessageCollection");
const events_1 = require("./events");
class Client extends async_event_emitter_1.AsyncEventEmitter {
    configuration;
    api;
    #reconnectTimeout;
    #session;
    channelUnreads = new ChannelUnreadCollection_1.ChannelUnreadCollection(this);
    channels = new ChannelCollection_1.ChannelCollection(this);
    emojis = new EmojiCollection_1.EmojiCollection(this);
    events;
    messages = new MessageCollection_1.MessageCollection(this);
    options;
    // @ts-ignore unused
    ready = false;
    servers = new ServerCollection_1.ServerCollection(this);
    user = null;
    users = new UserCollection_1.UserCollection(this);
    constructor(options, configuration) {
        super();
        this.configuration = configuration;
        this.options = {
            baseURL: 'https://api.revolt.chat',
            partials: false,
            eagerFetching: true,
            syncUnreads: false,
            autoReconnect: true,
            messageRewrites: true,
            /**
             * Retry delay function
             * @param retryCount Count
             * @returns Delay in seconds
             */
            retryDelayFunction(retryCount) {
                return (Math.pow(2, retryCount) - 1) * (0.8 + Math.random() * 0.4);
            },
            /**
             * Check whether a channel is muted
             * @param channel Channel
             * @return Whether it is muted
             */
            channelIsMuted() {
                return false;
            },
            ...options,
        };
        this.api = new revolt_api_1.API({
            baseURL: this.options.baseURL,
        });
        const setReady = (ready) => {
            if (typeof ready != "boolean")
                throw new Error("ready must be a boolean");
            this.ready = ready;
        };
        this.events = new EventClient_1.EventClient(1, "json", this.options);
        this.events.on("error", (error) => this.emit("error", error));
        this.events.on("event", (event) => (0, events_1.handleEventV1)(this, event, setReady.bind(this)));
    }
    get sessionId() {
        return typeof this.#session == "string" ? null : this.#session?._id;
    }
    /**
     * Get authentication header
     */
    get authenticationHeader() {
        return typeof this.#session == "string"
            ? ["X-Bot-Token", this.#session]
            : ["X-Session-Token", this.#session?.token];
    }
    /**
     * Connect to Revolt
     */
    connect() {
        clearTimeout(this.#reconnectTimeout);
        this.events.disconnect();
        this.ready = false;
        this.events.connect(this.configuration?.ws ?? "wss://ws.revolt.chat", typeof this.#session == "string" ? this.#session : this.#session.token);
    }
    /**
     * Fetches the configuration of the server if it has not been already fetched.
     */
    async #fetchConfiguration() {
        if (!this.configuration) {
            this.configuration = await this.api.get("/");
        }
    }
    /**
     * Update API object to use authentication.
     */
    #updateHeaders() {
        this.api = new revolt_api_1.API({
            baseURL: this.options.baseURL,
            authentication: {
                revolt: this.#session,
            },
        });
    }
    /**
     * Log in with auth data, creating a new session in the process.
     * @param details Login data object
     * @returns An on-boarding function if on-boarding is required, undefined otherwise
     */
    async login(details) {
        await this.#fetchConfiguration();
        const data = await this.api.post("/auth/session/login", details);
        if (data.result == "Success") {
            this.#session = data;
            // TODO: return await this.connect();
        }
        else {
            throw "MFA not implemented!";
        }
    }
    /**
     * Log in as a bot
     * @param token Bot token
     */
    async loginBot(token) {
        await this.#fetchConfiguration();
        this.#session = token;
        this.#updateHeaders();
        this.connect();
    }
    /**
     * Use an existing session
     */
    async useExistingSession(session) {
        this.#session = session;
        this.#updateHeaders();
    }
    /**
    * Proxy a file through January.
    * @param url URL to proxy
    * @returns Proxied media URL
    */
    proxyFile(url) {
        if (this.configuration?.features.january.enabled) {
            return `${this.configuration.features.january.url}/proxy?url=${encodeURIComponent(url)}`;
        }
        else {
            return url;
        }
    }
}
exports.Client = Client;
//# sourceMappingURL=Client.js.map