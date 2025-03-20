import { AsyncEventEmitter } from "@vladfrangu/async_event_emitter";
import type { Error } from "revolt-api";
import { AvailableProtocols, EventProtocol } from ".";
export declare enum ConnectionState {
    Idle = "Idle",
    Connecting = "Connecting",
    Connected = "Connected",
    Disconnected = "Disconnected"
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
    error: (error: Error) => void;
    event: (event: P["server"]) => void;
    state: (state: ConnectionState) => void;
};
/**
 * Simple wrapper around the Revolt websocket service.
 */
export declare class EventClient<T extends AvailableProtocols> extends AsyncEventEmitter<keyof Events<T, EventProtocol<T>>> {
    #private;
    readonly options: EventClientOptions;
    private ping;
    private state;
    /**
     * Create a new event client.
     */
    constructor(protocolVersion: T, transportFormat?: "json", options?: Partial<EventClientOptions>);
    /**
     * Connect to the websocket service.
     * @param uri WebSocket URI
     * @param token Authentication token
     */
    connect(uri: string, token: string): void;
    /**
     * Disconnect the websocket client.
     */
    disconnect(): boolean;
    /**
     * Handle events intended for client before passing them along.
     */
    handle(event: EventProtocol<T>["server"]): void;
    /**
     * Last error encountered by events client
     */
    get lastError(): {
        type: "socket";
        data: any;
    } | {
        type: "revolt";
        data: Error;
    } | undefined;
    /**
     * Send an event to the server.
     * @param event Event
     */
    send(event: EventProtocol<T>["client"]): void;
}
export {};
//# sourceMappingURL=EventClient.d.ts.map