/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
const path = require('path');
const {
  Katalon, WebUI, /* findTestObject,  *//* FailureHandling, */
  importClass, importEnum, importMethod, KatalonSession, KeywordLogger
} = require('../katalon');

const scriptName = path.basename(__filename);

const FailureHandling = importEnum('com.kms.katalon.core.model.FailureHandling');
const findTestData = importMethod('com.kms.katalon.core.testdata.TestDataFactory.findTestData');
const findTestObject = importMethod('com.kms.katalon.core.testobject.ObjectRepository.findTestObject');
const RunConfiguration = importClass('com.kms.katalon.core.configuration.RunConfiguration');
const GlobalVariable = importClass('internal.GlobalVariable');


const newSession = new KatalonSession();
newSession.tunnelId = process.env.FROM;

// newSession.connect('ws://localhost:3000')
newSession.connect('wss://katalon-tunnel.herokuapp.com')
  .then((session) => {
    KeywordLogger.instance.session = session;
    session.log(`Tunnel ID: ${session.tunnelId}`);
    Katalon.connect(4444);
  });

Katalon.onReady(async () => {
  console.log(`\r\n--- Executing "${scriptName}" Test! ---\r\n`.yellow);

  await RunConfiguration.setWebDriverPreferencesProperty('args', ['window-size=600,700']);

  await WebUI.openBrowser('');

  await WebUI.navigateToUrl('https://www.google.com/?gws_rd=ssl');

  const input = await findTestObject('Object Repository/Hello/Page_Google/input__q');

  const result = await WebUI.verifyElementPresent(input, 5, FailureHandling.OPTIONAL);

  console.log('Is element present: ', result);

  const a = await GlobalVariable.yourName;

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
