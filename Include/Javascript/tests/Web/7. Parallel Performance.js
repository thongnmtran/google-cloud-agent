/* eslint-disable max-len */
const {
  WebUI, findTestObject, KatalonDriver,
  cloneClass, importClass
} = require('../../katalon');

const RunConfiguration = importClass('com.kms.katalon.core.configuration.RunConfiguration');


function divideScreen(numParallels) {
  const ScreenWidth = 1920;
  const ScreenHeight = 1080;
  const numCols = numParallels <= 4 ? 2 : 3;
  const numRows = Math.ceil(numParallels / numCols);
  const width = Math.floor(ScreenWidth / numCols);
  const height = Math.floor(ScreenHeight / numRows);
  return [...new Array(numParallels)].map((item, index) => ({
    x: (index % numCols) * width,
    y: (Math.floor(index / numRows)) * height,
    width,
    height
  }));
}

async function runTest(rect = {
  x: 0, y: 0, width: 0, height: 0
}) {
  const WebUIClass = cloneClass(WebUI);

  WebUIClass.driver = new KatalonDriver();
  WebUIClass.driver.connect(4444);

  WebUIClass.driver.onReady(async (driver) => {
    console.log('\r\n--- Execute My "Parallel Performance" Test! ---\r\n'.yellow);

    await RunConfiguration.setWebDriverPreferencesProperty('args', [`window-size=${rect.width},${rect.height}`], driver);

    await WebUIClass.openBrowser('');

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

    console.log('\r\n--- Done Executing My "Parallel Performance" Test! ---\r\n'.yellow);

    driver.close();
  });
}

function parallel(numParallels) {
  const rects = divideScreen(numParallels);
  rects.forEach(runTest);
}

const numParallels = 6;

parallel(numParallels);
