/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */
/* eslint-disable no-console */
const DriverManager = require('../controllers/DriverManager');
const KeywordLogger = require('../logger/KeywordLogger');
const { ResponseMsgKey } = require('./Constant');
const { KatalonType } = require('./Constant');
const TypeUtils = require('./TypeUtils');

class StepFailedException extends Error {
  constructor(message, detail) {
    super(message);
    this.name = this.constructor.name;
    this.detail = detail;
    Error.captureStackTrace(this, this.constructor);
  }
}

const ObjectProxy = {
  ClassProxy: null, MethodProxy: null, EnumProxy: null, RemoteVariableProxy: null
};

function resolveArgs(args = []) {
  return Promise.all(args.map((arg) => (typeof arg === 'function' && !arg.then ? arg() : arg)));
}

function filterArgs(target, args = []) {
  const driverArg = args.find(
    (argI) => argI && argI.constructor.name === KatalonType.KatalonDriver
  );
  const filterdArgs = args.filter(
    (arg) => !arg || arg.constructor.name !== KatalonType.KatalonDriver
  );
  const driver = driverArg || (target && target.driver) || DriverManager.activeDriver;
  return [driver, filterdArgs];
}

const resolveResponse = async ({
  driver, response, resolve, reject, error
}) => {
  let data = !response.isRemote
    ? TypeUtils.applyType(response.data, response.type)
    : TypeUtils.applyType(response.data, response.type);

  if (response.isRemote) {
    response[ResponseMsgKey.data] = data;
    data = new Proxy(response, ObjectProxy.RemoteVariableProxy);
  }

  const result = (data && data.then) ? data : await driver.resolver.resolve(response.type, data);

  if (data && data.stackTrace) {
    error.message = data.detailMessage.red;
    error.detail = data.cause.detailMessage;
    reject(error);
  } else {
    resolve(result);
  }
};

const getEnumHandler = (target, prop) => ({
  type: target.name,
  value: prop,
  isEnum: true
});

const setEnumHandler = (target, prop) => {
  // do nothing
};

const setPropertyHandler = (target, prop, value) => {
  if (typeof prop === 'symbol' || ['driver'].includes(prop) || Object.getOwnPropertyDescriptor(target, prop)) {
    // eslint-disable-next-line no-param-reassign
    target[prop] = value;
    return value;
  }
  return new Promise((resolve) => {
    const driver = (target.driver || DriverManager.activeDriver);

    KeywordLogger.instance.logSetStep({
      index: ++driver.stepCount,
      time: driver.lastStepTimestamp,
      id: driver.id
    }, target, prop, [value]);
    driver.lastStepTimestamp = Date.now();

    driver.set(target, prop, value)
      .then((response) => {
        resolve(TypeUtils.applyType(response.data, response.type));
      });
  });
};

const getPropertyHandler = (target, prop, receiver) => {
  if (typeof prop === 'symbol' || ['name', 'driver', 'stackTrace', 'then', 'constructor'].includes(prop)) {
    return target[prop];
  }
  const error = new StepFailedException();
  function buildPromise(isCallGetter, ...rawArgs) {
    return new Promise((resolve, reject) => {
      resolveArgs(rawArgs).then((args) => {
        const [driver, filteredArgs] = filterArgs(target, args);
        driver.lastStepTimestamp = Date.now();

        driver.call(target, prop, ...filteredArgs)
          .then((response) => {
            resolveResponse({
              driver, response, resolve, reject, error
            });
            if (isCallGetter) {
              KeywordLogger.instance.logGetStep({
                index: ++driver.stepCount,
                time: driver.lastStepTimestamp,
                id: driver.id
              }, target, prop, filteredArgs);
            } else {
              KeywordLogger.instance.logStep({
                index: ++driver.stepCount,
                time: driver.lastStepTimestamp,
                id: driver.id
              }, target, prop, filteredArgs);
            }
          });
      });
    });
  }
  const thenable = (...rawArgs) => buildPromise(false, ...rawArgs);
  thenable.then = (resolve, reject) => {
    buildPromise(true).then(resolve).catch(reject);
  };
  return thenable;
};

const applyHander = (target, thisArg, rawArgs) => {
  const error = new StepFailedException();
  return new Promise((resolve, reject) => {
    resolveArgs(rawArgs)
      .then((args) => {
        const [driver, filteredArgs] = filterArgs(target, args);
        driver.lastStepTimestamp = Date.now();

        driver.call(null, target.name, ...filteredArgs)
          .then((response) => {
            resolveResponse({
              driver, response, resolve, reject, error
            });
            KeywordLogger.instance.logStep({
              index: ++driver.stepCount,
              time: driver.lastStepTimestamp,
              id: driver.id
            }, null, target.name, filteredArgs);
          });
      });
  });
};

const EnumProxy = {
  get: getEnumHandler,
  set: setEnumHandler
};

const ClassProxy = {
  set: setPropertyHandler,
  get: getPropertyHandler,
  // apply: applyHander
};

const MethodProxy = {
  set: setPropertyHandler,
  get: getPropertyHandler,
  apply: applyHander
};

const RemoteVariableProxy = {
  set: setPropertyHandler,
  get: getPropertyHandler,
};

ObjectProxy.ClassProxy = ClassProxy;
ObjectProxy.MethodProxy = MethodProxy;
ObjectProxy.EnumProxy = EnumProxy;
ObjectProxy.RemoteVariableProxy = RemoteVariableProxy;

module.exports = {
  ClassProxy, MethodProxy, EnumProxy, RemoteVariableProxy
};
