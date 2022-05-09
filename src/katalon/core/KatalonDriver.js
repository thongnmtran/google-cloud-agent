const EventEmitter = require('events');
const moment = require('moment');
const { EventType } = require('./Constant');
const ResultResolver = require('./ResultResolver');
const TypeUtils = require('./TypeUtils');
const WebSocketClient = require('./WebsocketClient');


const colors = ['red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white'];

class KatalonDriver {
  static index = 0;

  stepCount = 0;

  lastStepTimestamp = 0;

  // eslint-disable-next-line no-plusplus
  id = KatalonDriver.index++;

  session = new WebSocketClient();

  eventEmitter = new EventEmitter();

  resolver = ResultResolver();

  static get CURRENT_TIME() {
    return moment(new Date()).format('HH:MM:SS DD/MM/YYYY');
  }

  static get LOG_HEADER() {
    return `--- ${'[KatalonDriver]'.green}[${this.CURRENT_TIME}]`;
  }

  connect(port) {
    this.id = this.id.toString()[colors[this.id % colors.length]];
    this.session.connect(port);
    this.session.onOpen(() => {
      // console.log(`${KatalonDriver.LOG_HEADER} Connected to the Katalon RPC Server`);
    });
    this.session.onClose(() => {
      console.log(`[${this.id}] ${KatalonDriver.LOG_HEADER} Disconnected from the Katalon RPC Server`);
    });
    this.session.onError((error) => {
      console.log(`[${this.id}] ${KatalonDriver.LOG_HEADER} An error occurred in the connection with Katalon RPC Server`);
    });
    this.session.onReady(() => {
      console.log(`[${this.id}] ${KatalonDriver.LOG_HEADER} Connected to the Katalon RPC Server`);
      this.eventEmitter.emit(EventType.ready, this);
    });
  }

  log(log) {
    this.loggingSocket.emit('log', log);
  }

  close() {
    if (this.session.callbackQueue.length <= 0) {
      return this.session.close();
    }
    return setTimeout(() => {
      this.close();
    }, 1000);
  }

  onReady(listener) {
    this.eventEmitter.on(EventType.ready, listener);
  }

  call(target, method, ...args) {
    const payload = {
      object: {
        type: TypeUtils.getTypeName(target),
        id: target && target.id,
        isRemote: target && target.isRemote
      },
      method,
      args: args.map((arg) => ({
        type: TypeUtils.getTypeName(arg),
        value: TypeUtils.getRawValue(arg)
      })),
    };
    return this.session.send(JSON.stringify(payload));
  }

  set(target, prop, value) {
    const payload = {
      object: {
        type: TypeUtils.getTypeName(target),
        id: target && target.id,
        isRemote: target && target.isRemote
      },
      method: prop,
      args: [{
        type: TypeUtils.getTypeName(value),
        value: TypeUtils.getRawValue(value)
      }]
    };
    return this.session.send(JSON.stringify(payload));
  }
}


module.exports = KatalonDriver;
