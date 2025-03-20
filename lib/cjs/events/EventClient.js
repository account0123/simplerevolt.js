"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventClient = exports.ConnectionState = void 0;
const async_event_emitter_1 = require("@vladfrangu/async_event_emitter");
const v1_1 = require("./v1");
const RJSError_1 = require("../errors/RJSError");
const ErrorCodes_1 = require("../errors/ErrorCodes");
var ConnectionState;
(function (ConnectionState) {
    ConnectionState["Idle"] = "Idle";
    ConnectionState["Connecting"] = "Connecting";
    ConnectionState["Connected"] = "Connected";
    ConnectionState["Disconnected"] = "Disconnected";
})(ConnectionState || (exports.ConnectionState = ConnectionState = {}));
/**
 * Simple wrapper around the Revolt websocket service.
 */
class EventClient extends async_event_emitter_1.AsyncEventEmitter {
    options;
    #lastError;
    #protocolVersion;
    #transportFormat;
    #socket;
    #heartbeatIntervalReference;
    #pongTimeoutReference;
    #connectTimeoutReference;
    ping = -1;
    state = ConnectionState.Idle;
    /**
     * Create a new event client.
     */
    constructor(protocolVersion, transportFormat = "json", options) {
        super();
        this.#protocolVersion = protocolVersion;
        this.#transportFormat = transportFormat;
        this.options = {
            heartbeatInterval: 30,
            pongTimeout: 10,
            connectTimeout: 10,
            debug: false,
            ...options,
        };
        this.disconnect = this.disconnect.bind(this);
    }
    /**
     * Connect to the websocket service.
     * @param uri WebSocket URI
     * @param token Authentication token
     */
    connect(uri, token) {
        this.disconnect();
        this.#lastError = undefined;
        this.state = ConnectionState.Connecting;
        this.#connectTimeoutReference = setTimeout(() => this.disconnect(), this.options.pongTimeout * 1e3);
        this.#socket = new WebSocket(`${uri}?version=${this.#protocolVersion}&format=${this.#transportFormat}&token=${token}`);
        this.#socket.onopen = () => {
            this.#heartbeatIntervalReference = setInterval(() => {
                this.send({ type: "Ping", data: +new Date() });
                this.#pongTimeoutReference = setTimeout(() => this.disconnect(), this.options.pongTimeout * 1e3);
            }, this.options.heartbeatInterval * 1e3);
        };
        this.#socket.onerror = (error) => {
            this.#lastError = { type: "socket", data: error };
            this.emit("error", error);
        };
        this.#socket.onmessage = (event) => {
            clearInterval(this.#connectTimeoutReference);
            if (this.#transportFormat == "json") {
                if (typeof event.data == "string") {
                    this.handle(JSON.parse(event.data));
                }
            }
        };
        let closed = false;
        this.#socket.onclose = () => {
            if (closed)
                return;
            closed = true;
            this.#socket = undefined;
            this.state = ConnectionState.Disconnected;
            this.disconnect();
        };
    }
    /**
     * Disconnect the websocket client.
     */
    disconnect() {
        if (!this.#socket)
            return false;
        clearInterval(this.#heartbeatIntervalReference);
        clearInterval(this.#connectTimeoutReference);
        clearInterval(this.#pongTimeoutReference);
        const socket = this.#socket;
        this.#socket = undefined;
        socket.close();
        return true;
    }
    /**
     * Handle events intended for client before passing them along.
     */
    handle(event) {
        this.options.debug && console.debug("[S->C]", event);
        switch (event.type) {
            case "Ping":
                this.send({
                    type: "Pong",
                    data: event.data,
                });
                return;
            case "Pong":
                clearTimeout(this.#pongTimeoutReference);
                this.ping = +new Date() - event.data;
                this.options.debug && console.debug(`[ping] ${this.ping}ms`);
                return;
            case "Error":
                this.#lastError = {
                    type: "revolt",
                    data: event.data,
                };
                this.emit("error", event);
                this.disconnect();
                return;
        }
        switch (this.state) {
            case ConnectionState.Connecting:
                if (event.type == v1_1.ServerEventType.Authenticated) {
                    // no-op
                }
                else if (event.type == v1_1.ServerEventType.Ready) {
                    this.emit("event", event);
                    this.state = ConnectionState.Connected;
                }
                else {
                    throw new RJSError_1.RJSError(ErrorCodes_1.ErrorCodes.UnreachableCode, `Received ${event.type} in Connecting state.`);
                }
                break;
            case ConnectionState.Connected:
                if (event.type == v1_1.ServerEventType.Authenticated || event.type == v1_1.ServerEventType.Ready) {
                    throw new RJSError_1.RJSError(ErrorCodes_1.ErrorCodes.UnreachableCode, `Received ${event.type} in Connected state.`);
                }
                else {
                    this.emit("event", event);
                }
                break;
            default:
                throw new RJSError_1.RJSError(ErrorCodes_1.ErrorCodes.UnreachableCode, `Received ${event.type} in ${this.state} state.`);
        }
    }
    /**
     * Last error encountered by events client
     */
    get lastError() {
        return this.#lastError;
    }
    /**
     * Send an event to the server.
     * @param event Event
     */
    send(event) {
        this.options.debug && console.debug("[C->S]", event);
        if (!this.#socket)
            throw "Socket closed, trying to send.";
        this.#socket.send(JSON.stringify(event));
    }
}
exports.EventClient = EventClient;
//# sourceMappingURL=EventClient.js.map