/* eslint-disable no-console */
/* eslint-disable class-methods-use-this */
const colors = require('colors');
const { io } = require('socket.io-client');
const TypeUtils = require('../core/TypeUtils');
const ObjectUtils = require('../utils/ObjectUtils');


colors.setTheme({
  class: 'brightGreen',
  method: 'brightCyan',
  id: 'brightBlue',
  [typeof '']: 'green',
  [typeof 0]: 'yellow',
  [typeof {}]: 'grey',
  [typeof []]: 'white',
  enumType: 'brightGreen',
  enumValue: 'brightCyan',
  index: 'green'
  // debug: 'blue',
  // error: 'red',
  // info: 'grey'
});

const NumberFormatter = new Intl.NumberFormat('en-US');

module.exports = class KeywordLogger {
  static get instance() {
    return ObjectUtils.instance(this, new KeywordLogger());
  }

  connect(url, options = {}) {
    return new Promise((resolve, reject) => {
      this.loggingSocket = io(url, {
        transports: ['websocket'],
        ...options
      });
      this.loggingSocket.on('connect', () => {
        console.log('> Logging server connected  🚀');
        resolve(this.loggingSocket);
      });
      this.loggingSocket.on('disconnect', () => {
        console.warn('> Logging server diconnected!');
      });
      this.loggingSocket.on('error', (error) => {
        console.log('> Logging server error  🚀');
        reject(error);
      });
    });
  }

  disconnect() {
    return this.loggingSocket.disconnect();
  }

  static formatNumber(number) {
    return NumberFormatter.format(number);
  }

  log(message) {
    console.log(message);
    this.loggingSocket?.emit('log', message);
  }

  logGetStep({ index, time, id }, object, prop, args) {
    const clazz = TypeUtils.getClassNamez(object);
    const method = prop;
    const diff = time ? Date.now() - time : 0;
    const stepIndex = `[${id}]>[${index.toString().index}]`;
    const stepInfo = `${clazz.class}${clazz ? '.' : ''}${method.method}`;
    const stepTime = `${`+${KeywordLogger.formatNumber(diff)}ms`.brightGreen}`;
    colors.disable();
    this.log(`${stepIndex} > ${'get'.blue} ${stepInfo} ${stepTime}`);
  }

  logSetStep({ index, time, id }, object, prop, args) {
    const clazz = TypeUtils.getClassNamez(object);
    const method = prop;
    const argsz = args.map((arg) => TypeUtils.getDisplayName(arg)).join(', ');
    const diff = time ? Date.now() - time : 0;
    const stepIndex = `[${id}]>[${index.toString().index}]`;
    const stepInfo = `${clazz.class}${clazz ? '.' : ''}${method.method} = ${argsz}`;
    const stepTime = `${`+${KeywordLogger.formatNumber(diff)}ms`.brightGreen}`;
    colors.disable();
    this.log(`${stepIndex} > ${'set'.blue} ${stepInfo} ${stepTime}`);
  }

  logStep({ index, time, id }, object, prop, args) {
    const clazz = TypeUtils.getClassNamez(object);
    const method = prop;
    const argsz = args.map((arg) => TypeUtils.getDisplayName(arg)).join(', ');
    const diff = time ? Date.now() - time : 0;
    const stepIndex = `[${id}]>[${index.toString().index}]`;
    const stepInfo = `${clazz.class}${clazz ? '.' : ''}${method.method}(${argsz})`;
    const stepTime = `${`+${KeywordLogger.formatNumber(diff)}ms`.brightGreen}`;
    colors.disable();
    this.log(`${stepIndex} > ${stepInfo} ${stepTime}`);
  }
};
