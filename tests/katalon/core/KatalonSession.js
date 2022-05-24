const { io } = require('socket.io-client');
const EventName = require('../utils/EventName');

// global.window = {};
// const P2P = require('socket.io-p2p');

module.exports = class KatalonSession {
  tunnelId;

  get connected() {
    return this.socket?.connected;
  }

  connect(url, options = {}) {
    return new Promise((resolve, reject) => {
      this.socket = io(url, {
        transports: ['websocket'],
        ...options
      });

      // this.p2p = new P2P(this.socket, { autoUpgrade: false });

      this.socket.on(EventName.connect, () => {
        console.log(`> Katalon session created (${this.socket.id})`);
        resolve(this);
      });
      this.socket.on(EventName.disconnect, () => {
        console.warn('> Katalon session diconnected!');
      });
      this.socket.on(EventName.connectError, (error) => {
        console.log('> Katalon session error');
        reject(error);
      });
    });
  }

  disconnect() {
    return this.socket.disconnect();
  }

  log(message, to = this.tunnelId) {
    this.socket?.emit(EventName.log, { log: message, to });
  }

  on(event, listener) {
    this.socket.on(event, listener);
    return this;
  }

  onP2P(event, listener) {
    this.p2p.on(event, listener);
    return this;
  }

  off(event, listener) {
    this.socket.off(event, listener);
    return this;
  }

  emit(event, ...args) {
    this.socket.emit(event, ...args);
  }

  sendTo(target, event, ...args) {
    this.socket.emit(EventName.sendTo, { target, event, args });
  }
};
