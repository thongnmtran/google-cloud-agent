/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import EventEmitter = require('events');
import ResultResolver = require('./ResultResolver');
import WebSocketClient = require('./WebsocketClient');

declare class KatalonDriver {
    id: string;

    stepCount: number;

    session: WebSocketClient;

    eventEmitter: EventEmitter;

    resolver: ResultResolver;

    connect(portOrHost: number | string): void;

    close(): void;

    onReady(listener: (driver: KatalonDriver) => void): void;

    call(target: unknown, methodName: string, ...args: unknown[]): Promise<unknown>;

    set(target: any): Promise<any>;
}

export = KatalonDriver;
