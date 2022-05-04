const { WebDriver, By } = require('selenium-webdriver');
const { Executor, HttpClient } = require('selenium-webdriver/http');
const WebDriverResolver = require('../../katalon/middlewares/WebDriverResolver');

const {
  Katalon, WebUI, findTestObject, importClass, DriverFactory
} = require('../../katalon');

// const DriverFactory = importClass('com.kms.katalon.core.webui.driver.DriverFactory');
// const WebDriver = importClass('org.openqa.selenium.WebDriver');

Katalon.connect(4444);

Katalon.onReady(async (driver) => {
  console.log('\r\n--- Execute My "Selenium Driver" Test! ---\r\n'.yellow);

  await WebUI.openBrowser('');

  // await WebUI.navigateToUrl('https://www.google.com/?gws_rd=ssl');

  const remoteDriver = await DriverFactory.getWebDriver();
  await remoteDriver.get('https://www.google.com/?gws_rd=ssl');
  const gmailButton2 = await remoteDriver.findElement(By.xpath('//*[@data-pid="23"]'));
  await gmailButton2.click();
  await WebUI.delay(2);

  await WebUI.back();

  driver.resolver.use('SmartWaitWebDriver', WebDriverResolver);
  const nativeDriver = await DriverFactory.getWebDriver();
  await nativeDriver.get('https://www.google.com/?gws_rd=ssl');
  const gmailButton1 = await nativeDriver.findElement(By.xpath('//*[@data-pid="23"]'));
  await gmailButton1.click();
  await WebUI.delay(2);

  // await nativeDriver.manage().window().setPosition(100, 200);

  await WebUI.back();

  const input = await findTestObject('Object Repository/Hello/Page_Google/input__q');

  await Promise.all(
    ['Hello!', 'My name is', 'Katalon!'].map(
      (text) => WebUI.setText(input, text)
    )
  );

  // await WebUI.click(await findTestObject('Object Repository/Hello/Page_Google/path'));

  await WebUI.closeBrowser();

  console.log('\r\n--- Done Executing My "Selenium Driver" Test! ---\r\n'.yellow);

  Katalon.close();
});
