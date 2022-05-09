/* eslint-disable max-len */
const {
  WebUI, findTestObject, KatalonDriver, cloneClass,
} = require('../../katalon');


const WebUI1 = cloneClass(WebUI);
const WebUI2 = cloneClass(WebUI);

WebUI1.driver = new KatalonDriver();
WebUI2.driver = new KatalonDriver();

WebUI1.driver.connect(4444);
WebUI2.driver.connect('ws://10.62.63.4:4444');

function test({ WebUIClass = WebUI }) {
  return async (driver) => {
    console.log('\r\n--- Execute My "Multi-Sessions" Test! ---\r\n'.yellow);

    await WebUIClass.openBrowser('');

    await WebUIClass.setViewPortSize(600, 700);

    await WebUIClass.navigateToUrl('https://www.google.com/?gws_rd=ssl');

    const input = await findTestObject('Object Repository/Hello/Page_Google/input__q', driver);

    await Promise.all(
      ['Hello!', 'My name is', 'Katalon!'].map(
        (text) => Promise.all([
          WebUIClass.setText(input, text),
          WebUIClass.delay(1)
        ])
      )
    );

    // await WebUIClass.click(await findTestObject('Object Repository/Hello/Page_Google/path', driver));

    await WebUIClass.closeBrowser();

    console.log('\r\n--- Done Executing My "Multi-Sessions" Test! ---\r\n'.yellow);

    driver.close();
  };
}

WebUI1.driver.onReady(test({ WebUIClass: WebUI1 }));
WebUI2.driver.onReady(test({ WebUIClass: WebUI2 }));
