/* eslint-disable no-console */
/* eslint-disable class-methods-use-this */
const EventEmitter = require('events');
const WebSocket = require('websocket').w3cwebsocket;
const { EventType } = require('./Constant');


module.exports = class WebSocketClient {
  socket = null;

  eventEmitter = new EventEmitter();

  callbackQueue = [];

  connect(portOrAddress) {
    const serverUrl = typeof portOrAddress === 'number' ? `ws://localhost:${portOrAddress}` : portOrAddress;
    const socket = new WebSocket(serverUrl);
    this.socket = socket;

    socket.onopen = () => this.handleOpen();
    socket.onmessage = (msg) => this.handleMessage(msg);
    socket.onclose = () => this.handleClose();
    socket.onerror = (error) => this.handleError(error);
  }

  close() {
    this.socket.close();
  }

  send(message) {
    return new Promise((resolve) => {
      this.callbackQueue.push(resolve);
      this.socket.send(message);
    });
  }

  handleOpen() {
    // console.log('connected');
    this.eventEmitter.emit(EventType.open);
  }

  handleMessage(message) {
    // console.log('receive: ', message);
    const response = message.data ? JSON.parse(message.data) : message.data;
    this.eventEmitter.emit(EventType.message, response);
    const callback = this.callbackQueue.shift();
    if (callback) {
      callback(response);
    }
  }

  handleClose() {
    // console.log('closed');
    this.eventEmitter.emit(EventType.close);
  }

  handleError(error) {
    // console.log('error', error);
    this.eventEmitter.emit(EventType.error, error);
  }

  onOpen(listener) {
    this.eventEmitter.on(EventType.open, listener);
  }

  onMessage(listener) {
    this.eventEmitter.on(EventType.message, listener);
  }

  onClose(listener) {
    this.eventEmitter.on(EventType.close, listener);
  }

  onError(listener) {
    this.eventEmitter.on(EventType.error, listener);
  }

  onReady(listener) {
    this.eventEmitter.once(EventType.open, listener);
  }
};
