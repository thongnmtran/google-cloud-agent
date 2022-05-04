"""
DriverManager
"""
from katalon.core.katalon_driver import KatalonDriver


class DriverManager:
    """
    DriverManager
    """
    active_driver = KatalonDriver()

    @staticmethod
    def active(driver: KatalonDriver):
        DriverManager.active_driver = driver
