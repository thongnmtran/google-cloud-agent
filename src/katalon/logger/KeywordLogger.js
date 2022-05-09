/* eslint-disable no-console */
/* eslint-disable class-methods-use-this */
const colors = require('colors');
const KatalonSession = require('../core/KatalonSession');
const TypeUtils = require('../core/TypeUtils');
const ObjectUtils = require('../utils/ObjectUtils');

colors.disable();
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
colors.disable();

const NumberFormatter = new Intl.NumberFormat('en-US');

module.exports = class KeywordLogger {
  static get instance() {
    return ObjectUtils.getInstance(this, new KeywordLogger());
  }

  session = new KatalonSession();

  static formatNumber(number) {
    return NumberFormatter.format(number);
  }

  log(message) {
    console.log(message);
    this.session?.emit('log', message);
  }

  logGetStep({ index, time, id }, object, prop, args) {
    const clazz = TypeUtils.getClassNamez(object);
    const method = prop;
    const diff = time ? Date.now() - time : 0;
    colors.disable();
    const stepIndex = `[${id}]>[${index.toString().index}]`;
    const stepInfo = `${clazz.class}${clazz ? '.' : ''}${method.method}`;
    const stepTime = `${`+${KeywordLogger.formatNumber(diff)}ms`.brightGreen}`;
    this.log(`${stepIndex} > ${'get'.blue} ${stepInfo} ${stepTime}`);
  }

  logSetStep({ index, time, id }, object, prop, args) {
    const clazz = TypeUtils.getClassNamez(object);
    const method = prop;
    const argsz = args.map((arg) => TypeUtils.getDisplayName(arg)).join(', ');
    const diff = time ? Date.now() - time : 0;
    colors.disable();
    const stepIndex = `[${id}]>[${index.toString().index}]`;
    const stepInfo = `${clazz.class}${clazz ? '.' : ''}${method.method} = ${argsz}`;
    const stepTime = `${`+${KeywordLogger.formatNumber(diff)}ms`.brightGreen}`;
    this.log(`${stepIndex} > ${'set'.blue} ${stepInfo} ${stepTime}`);
  }

  logStep({ index, time, id }, object, prop, args) {
    const clazz = TypeUtils.getClassNamez(object);
    const method = prop;
    const argsz = args.map((arg) => TypeUtils.getDisplayName(arg)).join(', ');
    const diff = time ? Date.now() - time : 0;
    colors.disable();
    const stepIndex = `[${id}]>[${index.toString().index}]`;
    const stepInfo = `${clazz.class}${clazz ? '.' : ''}${method.method}(${argsz})`;
    const stepTime = `${`+${KeywordLogger.formatNumber(diff)}ms`.brightGreen}`;
    this.log(`${stepIndex} > ${stepInfo} ${stepTime}`);
  }
};
