const {
  Katalon, WebUI, findTestObject, FailureHandling, KeywordLogger, KatalonSession
} = require('../../katalon');


const newSession = new KatalonSession();
// newSession.connect('ws://localhost:3000')
newSession.connect('wss://katalon-tunnel.herokuapp.com')
  .then((session) => {
    KeywordLogger.instance.session = session;
    Katalon.connect(4444);
  });

Katalon.onReady(async (driver) => {
  console.log('\r\n--- Execute My First "Hello World" Test! ---\r\n'.yellow);

  await WebUI.openBrowser('');

  await WebUI.navigateToUrl('https://www.google.com/?gws_rd=ssl');

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

  console.log('\r\n--- Done Executing My "Hello World" Test! ---\r\n'.yellow);

  newSession.disconnect();

  Katalon.close();
});
