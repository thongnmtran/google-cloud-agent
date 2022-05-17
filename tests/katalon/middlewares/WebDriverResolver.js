const { WebDriver } = require('selenium-webdriver');
const { Executor, HttpClient } = require('selenium-webdriver/http');
const { ResponseMsgKey } = require('../core/Constant');


async function WebDriverResolver(driverInfo, resolve) {
  const [remoteUrl, sessionId] = driverInfo[ResponseMsgKey.data].split('#');
  const nativeDriver = await new WebDriver(
    sessionId,
    new Executor(Promise.resolve(remoteUrl)
      .then((url) => new HttpClient(url, null, null)))
  );
  resolve(nativeDriver);
}

module.exports = WebDriverResolver;
