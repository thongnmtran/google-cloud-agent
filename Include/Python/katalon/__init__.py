import types
from katalon.core.katalon_driver import KatalonDriver
from katalon.core.driver_manager import DriverManager
from katalon.interfaces.web_ui import WebUI
from katalon.interfaces.ultilities import findTestObject
from katalon.core.object_proxy import Proxy, ClassProxy, MethodProxy

def wrap_class(clazz):
    name = clazz.__name__
    exec(f"{name} = ClassProxy(types.new_class('{name}'))", globals())

def wrap_method(method):
    name = method.__name__
    exec(f"{name} = MethodProxy(types.new_class('{name}'))", globals())


wrap_class(WebUI)
wrap_method(findTestObject)

Katalon = KatalonDriver()
DriverManager.active(Katalon)