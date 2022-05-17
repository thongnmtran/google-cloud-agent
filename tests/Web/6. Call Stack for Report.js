const StackTrace = require('stacktrace-js');
const {
  Katalon, WebUI, findTestObject, FailureHandling
} = require('../katalon');

Katalon.connect(4444);

function doSomething() {
  const frames = StackTrace.getSync();
  console.log('doSomething frames', frames);
}

class CustomKeyword {
  static callMe() {
    const frames = StackTrace.getSync();
    console.log('callMe frames', frames);
    this.callMeToo();
  }

  static callMeToo() {
    const frames = StackTrace.getSync();
    console.log('callMeToo frames', frames);
    doSomething();
  }
}

Katalon.onReady(async (driver) => {
  console.log('\r\n--- Execute My "Call Stack" Test! ---\r\n'.yellow);

  const startTestCase = Date.now();
  await WebUI.openBrowser('');

  await WebUI.navigateToUrl('https://www.google.com/?gws_rd=ssl');

  await WebUI.delay(1);

  const frames = StackTrace.getSync();
  console.log('Top frames', frames);

  CustomKeyword.callMe();

  const input = await findTestObject('Object Repository/Hello/Page_Google/input__q');

  await WebUI.verifyElementPresent(input, 5, FailureHandling.STOP_ON_FAILURE);

  await Promise.all(
    ['Hello!', 'My name is', 'Katalon!'].map(
      (text) => WebUI.setText(input, text)
    )
  );

  await WebUI.setText(input, `This is a very long long long long long long long
   long long long long long long long long long long long long long long
    long long long long long long long long long long long long long long
     long long long long long long long long long long long long long long
      long long long long long long long long long long long long long long text`);

  // await WebUI.click(await findTestObject('Object Repository/Hello/Page_Google/path'));

  await WebUI.closeBrowser();

  console.log(`\r\nTest case duration: ${Date.now() - startTestCase}ms\r\n`.green);

  console.log('--- Done Executing My "Call Stack" Test! ---\r\n'.yellow);

  Katalon.close();
});
