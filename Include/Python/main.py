import os
import asyncio
from katalon import WebUI, findTestObject, Katalon

test_name = os.path.basename(__file__)


async def test(driver):
    print(f'\r\n--- Executing "{test_name}" Test! ---\r\n')

    await WebUI.openBrowser('')

    await WebUI.navigateToUrl('https://www.google.com/?gws_rd=ssl')

    input = await findTestObject('Object Repository/Hello/Page_Google/input__q')

    print(f'Test Object Id: {input["objectId"]}')

    await WebUI.verifyElementPresent(input, 5)

    await WebUI.setText(input, 'Hello!')
    await WebUI.setText(input, 'My name is')
    await WebUI.setText(input, 'Katalon!')

    await WebUI.setText(input, """This is a very long long long long long long long
    long long long long long long long long long long long long long long
        long long long long long long long long long long long long long long
        long long long long long long long long long long long long long long
        long long long long long long long long long long long long long long text""")

    await WebUI.closeBrowser()

    print(f'\r\n--- Done Executing "{test_name}" Test! ---\r\n')

    await driver.close()


if __name__ == "__main__":
    Katalon.on_ready(test)

    future = Katalon.connect(4444)

    asyncio.get_event_loop().run_until_complete(future)
