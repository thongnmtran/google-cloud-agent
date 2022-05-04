
const { KatalonType } = require('./core/Constant');
const {
  ClassProxy, EnumProxy, MethodProxy, RemoteVariableProxy, LoggingHandler
} = require('./core/ObjectProxy');
const TypeUtils = require('./core/TypeUtils');
const KatalonDriver = require('./core/KatalonDriver');
const DriverManager = require('./controllers/DriverManager');


function proxy(target, handler) {
  return new Proxy(target, handler);
}

function type(name, handler, forceNew) {
  return proxy(TypeUtils.getType(name, forceNew), handler);
}

function cloneClass(clazz) {
  return type(clazz.name, ClassProxy, true);
}

function loggingProxy(target) {
  return proxy(target, LoggingHandler);
}

function importClass(package) {
  return type(package, ClassProxy);
}

function importEnum(package) {
  return type(package, EnumProxy);
}

function importMethod(package) {
  return type(package, MethodProxy);
}

function delay(timeout = 0) {
  return new Promise((resolve) => setTimeout(resolve, timeout));
}

const FailureHandling = importEnum(KatalonType.FailureHandling);

const findTestObject = importMethod(KatalonType.findTestObject);

const WebUI = importClass(KatalonType.WebUI);
const Mobile = importClass(KatalonType.Mobile);
const Windows = importClass(KatalonType.Windows);
const WS = importClass(KatalonType.WS);


const DriverFactory = importClass('com.kms.katalon.core.webui.driver.DriverFactory');

const Katalon = new KatalonDriver();
WebUI.driver = Katalon;
DriverManager.active(Katalon);

process.on('unhandledRejection', (reason, promise) => {
  console.log('');
  console.error(reason);
  console.log('');
});

process.on('uncaughtException', (error) => {
  console.log('');
  console.log(error);
  console.log('');
});

module.exports = {
  proxy,
  type,
  importClass,
  importEnum,
  importMethod,
  DriverManager,
  KatalonDriver,
  Katalon,
  findTestObject,
  FailureHandling,
  delay,
  cloneClass,
  WebUI,
  Mobile,
  Windows,
  WS,
  DriverFactory
};
