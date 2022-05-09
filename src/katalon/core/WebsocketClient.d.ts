import EventEmitter = require('events');

declare class WebSocketClient {
    socket: any;

    eventEmitter: EventEmitter;

    callbackQueue: any[];

    connect(port: any): void;

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

export = WebSocketClient;
