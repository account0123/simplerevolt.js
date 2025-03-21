import { AsyncEventEmitter } from "@vladfrangu/async_event_emitter";
import type { Error } from "revolt-api";

import type { AvailableProtocols, EventProtocol } from "./index.js";
import { ServerEventType } from "./v1.js";
import { RJSError } from "../errors/RJSError.js";
import { ErrorCodes } from "../errors/ErrorCodes.js";

export enum ConnectionState {
  Idle = "Idle",
  Connecting = "Connecting",
  Connected = "Connected",
  Disconnected = "Disconnected",
}

/**
 * Event client options object
 */
export interface EventClientOptions {
  /**
   * Whether to log events
   * @default false
   */
  debug: boolean;

  /**
   * Time in seconds between Ping packets sent to the server
   * @default 30
   */
  heartbeatInterval: number;

  /**
   * Maximum time in seconds between Ping and corresponding Pong
   * @default 10
   */
  pongTimeout: number;

  /**
   * Maximum time in seconds between init and first message
   * @default 10
   */
  connectTimeout: number;
}

/**
 * Events provided by the client.
 */
type Events<T extends AvailableProtocols, P extends EventProtocol<T>> = {
  error: [error: Error];
  event: [event: P["server"]];
  state: [state: ConnectionState];
};

/**
 * Simple wrapper around the Revolt websocket service.
 */
export class EventClient<T extends AvailableProtocols> extends AsyncEventEmitter<Events<T, EventProtocol<T>>> {
  readonly options: EventClientOptions;

  #lastError: { type: "socket"; data: any } | { type: "revolt"; data: Error } | undefined;
  #protocolVersion: T;
  #transportFormat: "json" | "msgpack";

  #socket: WebSocket | undefined;
  #heartbeatIntervalReference: number | undefined;
  #pongTimeoutReference: number | undefined;
  #connectTimeoutReference: number | undefined;
  private ping: number = -1;
  private state: ConnectionState = ConnectionState.Idle;

  /**
   * Create a new event client.
   */
  constructor(protocolVersion: T, transportFormat: "json" = "json", options?: Partial<EventClientOptions>) {
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
  async connect(uri: string, token: string) {
    this.options.debug && console.debug("EventClient.connect", uri, token);
    this.disconnect();

    this.#lastError = undefined;
    this.state = ConnectionState.Connecting;

    this.#connectTimeoutReference = setTimeout(() => this.disconnect(), this.options.pongTimeout * 1e3) as never;

    this.#socket = new WebSocket(
      `${uri}?version=${this.#protocolVersion}&format=${this.#transportFormat}&token=${token}`,
    );

    this.#socket.onopen = () => {
      this.#heartbeatIntervalReference = setInterval(() => {
        this.send({ type: "Ping", data: +new Date() });
        this.#pongTimeoutReference = setTimeout(() => this.disconnect(), this.options.pongTimeout * 1e3) as never;
      }, this.options.heartbeatInterval * 1e3) as never;
    };

    this.#socket.onerror = (error) => {
      this.#lastError = { type: "socket", data: error };
      this.emit("error", error as never);
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
      if (closed) return;
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
    if (!this.#socket) return false;
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
  handle(event: EventProtocol<T>["server"]) {
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
        this.emit("error", event.data);
        this.disconnect();
        return;
    }

    switch (this.state) {
      case ConnectionState.Connecting:
        if (event.type == ServerEventType.Authenticated) {
          // no-op
        } else if (event.type == ServerEventType.Ready) {
          this.emit("event", event);
          this.state = ConnectionState.Connected;
        } else {
          throw new RJSError(ErrorCodes.UnreachableCode, `Received ${event.type} in Connecting state.`);
        }
        break;
      case ConnectionState.Connected:
        if (event.type == ServerEventType.Authenticated || event.type == ServerEventType.Ready) {
          throw new RJSError(ErrorCodes.UnreachableCode, `Received ${event.type} in Connected state.`);
        } else {
          this.emit("event", event);
        }
        break;
      default:
        throw new RJSError(ErrorCodes.UnreachableCode, `Received ${event.type} in ${this.state} state.`);
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
  send(event: EventProtocol<T>["client"]) {
    this.options.debug && console.debug("[C->S]", event);
    if (!this.#socket) throw "Socket closed, trying to send.";
    this.#socket.send(JSON.stringify(event));
  }
}
