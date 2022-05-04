export = WebSocketClient;
declare class WebSocketClient {
    socket: any;
    eventEmitter: EventEmitter;
    callbackQueue: any[];
    connect(portOrAddress: any): void;
    close(): void;
    send(message: any): Promise<any>;
    handleOpen(): void;
    handleMessage(message: any): void;
    handleClose(): void;
    handleError(error: any): void;
    onOpen(listener: any): void;
    onMessage(listener: any): void;
    onClose(listener: any): void;
    onError(listener: any): void;
    onReady(listener: any): void;
}
import EventEmitter = require("events");
