import { AsyncEventEmitter } from '@vladfrangu/async_event_emitter';
import { API } from 'revolt-api';
import { EventClient } from './events/EventClient';
import { ChannelUnreadCollection } from './collections/ChannelUnreadCollection';
import { ChannelCollection } from './collections/ChannelCollection';
import { ServerCollection } from './collections/ServerCollection';
import { UserCollection } from './collections/UserCollection';
import { EmojiCollection } from './collections/EmojiCollection';
import { MessageCollection } from './collections/MessageCollection';
import { handleEventV1 } from './events';
export class Client extends AsyncEventEmitter {
    configuration;
    api;
    #reconnectTimeout;
    #session;
    channelUnreads = new ChannelUnreadCollection(this);
    channels = new ChannelCollection(this);
    emojis = new EmojiCollection(this);
    events;
    messages = new MessageCollection(this);
    options;
    // @ts-ignore unused
    ready = false;
    servers = new ServerCollection(this);
    user = null;
    users = new UserCollection(this);
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
        this.api = new API({
            baseURL: this.options.baseURL,
        });
        const setReady = (ready) => {
            if (typeof ready != "boolean")
                throw new Error("ready must be a boolean");
            this.ready = ready;
        };
        this.events = new EventClient(1, "json", this.options);
        this.events.on("error", (error) => this.emit("error", error));
        this.events.on("event", (event) => handleEventV1(this, event, setReady.bind(this)));
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
        this.api = new API({
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
//# sourceMappingURL=Client.js.map