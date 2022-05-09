/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
const path = require('path');
const {
  Katalon, WebUI, findTestObject, FailureHandling,
  importClass
} = require('../../katalon');

const scriptName = path.basename(__filename);

const RunConfiguration = importClass('com.kms.katalon.core.configuration.RunConfiguration');
const GlobalVariable = importClass('internal.GlobalVariable');


Katalon.connect(4444);

Katalon.onReady(async () => {
  console.log(`\r\n--- Executing "${scriptName}" Test! ---\r\n`.yellow);

  await RunConfiguration.setWebDriverPreferencesProperty('args', ['window-size=600,700']);

  await WebUI.openBrowser('');

  await WebUI.navigateToUrl('https://www.google.com/?gws_rd=ssl');

  const input = await findTestObject('Object Repository/Hello/Page_Google/input__q');

  const result = await WebUI.verifyElementPresent(input, 5, FailureHandling.OPTIONAL);

  console.log('Is element present: ', result);

  try {
    await WebUI.verifyElementNotPresent(input, 1, FailureHandling.STOP_ON_FAILURE);
  } catch (error) {
    console.log('\r\n--------------- quarantine --------------\r\n'.blue);
    console.error('Error handling: \r\n', error);
    console.log('\r\n-----------------------------------------\r\n'.blue);
  }

  for (const text of ['Hello!', 'My name is', GlobalVariable.yourName]) {
    await WebUI.setText(input, text);
  }

  await (GlobalVariable.yourName = 'Katalon!');

  await WebUI.setText(input, GlobalVariable.yourName);

  await WebUI.delay(2);

  await WebUI.closeBrowser();

  console.log(`\r\n--- Done Executing "${scriptName}" Test! ---\r\n`.yellow);

  Katalon.close();
});
