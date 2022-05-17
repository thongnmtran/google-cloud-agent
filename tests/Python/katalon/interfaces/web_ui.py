from katalon.core.katalon_driver import KatalonDriver


class WebUI:
    """
    WebUI
    """
    driver: KatalonDriver

    @staticmethod
    def connect():
        print('connected')

    @staticmethod
    def openBrowser(url: str):
        """
        Open a browser
        """

    @staticmethod
    def closeBrowser():
        """
        Close the browser
        """

    @staticmethod
    def navigateToUrl(url: str):
        """
        Navigate to an url
        """

    @staticmethod
    def verifyElementPresent(element: object, timeout: int):
        """
        Navigate to an url
        """

    @staticmethod
    def setText(element: object, text: str):
        """
        Navigate to an url
        """