export = KatalonDriver;
declare class KatalonDriver {
    static index: number;
    static get CURRENT_TIME(): string;
    static get LOG_HEADER(): string;
    stepCount: number;
    lastStepTimestamp: number;
    id: number;
    session: WebSocketClient;
    eventEmitter: EventEmitter;
    resolver: ResultResolver;
    connect(port: any): void;
    close(): void | NodeJS.Timeout;
    onReady(listener: any): void;
    call(target: any, method: any, ...args: any[]): Promise<any>;
    set(target: any, prop: any, value: any): Promise<any>;
}
import WebSocketClient = require("./WebsocketClient");
import EventEmitter = require("events");
import ResultResolver = require("./ResultResolver");
