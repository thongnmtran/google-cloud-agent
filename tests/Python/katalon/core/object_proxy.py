"""
ObjectProxy
"""
import time
from katalon.core.driver_manager import DriverManager
from katalon.core.object_utils import Object

class Proxy(object):
    """
    ObjectProxy
    """
    __slots__ = ["_obj", "__weakref__"]
    def __init__(self, obj):
        object.__setattr__(self, "_obj", obj)

    #
    # proxying (special cases)
    #
    def __getattribute__(self, name):
        return getattr(object.__getattribute__(self, "_obj"), name)
    def __delattr__(self, name):
        delattr(object.__getattribute__(self, "_obj"), name)
    def __setattr__(self, name, value):
        setattr(object.__getattribute__(self, "_obj"), name, value)

    def __nonzero__(self):
        return bool(object.__getattribute__(self, "_obj"))
    def __str__(self):
        return str(object.__getattribute__(self, "_obj"))
    def __repr__(self):
        return repr(object.__getattribute__(self, "_obj"))

    #
    # factories
    #
    _special_names = [
        '__abs__', '__add__', '__and__', '__call__', '__cmp__', '__coerce__', 
        '__contains__', '__delitem__', '__delslice__', '__div__', '__divmod__', 
        '__eq__', '__float__', '__floordiv__', '__ge__', '__getitem__', 
        '__getslice__', '__gt__', '__hash__', '__hex__', '__iadd__', '__iand__',
        '__idiv__', '__idivmod__', '__ifloordiv__', '__ilshift__', '__imod__', 
        '__imul__', '__int__', '__invert__', '__ior__', '__ipow__', '__irshift__', 
        '__isub__', '__iter__', '__itruediv__', '__ixor__', '__le__', '__len__', 
        '__long__', '__lshift__', '__lt__', '__mod__', '__mul__', '__ne__', 
        '__neg__', '__oct__', '__or__', '__pos__', '__pow__', '__radd__', 
        '__rand__', '__rdiv__', '__rdivmod__', '__reduce__', '__reduce_ex__', 
        '__repr__', '__reversed__', '__rfloorfiv__', '__rlshift__', '__rmod__', 
        '__rmul__', '__ror__', '__rpow__', '__rrshift__', '__rshift__', '__rsub__', 
        '__rtruediv__', '__rxor__', '__setitem__', '__setslice__', '__sub__', 
        '__truediv__', '__xor__', 'next',
    ]

    @classmethod
    def _create_class_proxy(cls, theclass):
        """creates a proxy for the given class"""

        def make_method(name):
            def method(self, *args, **kw):
                return getattr(object.__getattribute__(self, "_obj"), name)(*args, **kw)
            return method

        namespace = {}
        for name in cls._special_names:
            if hasattr(theclass, name):
                namespace[name] = make_method(name)
        return type("%s(%s)" % (cls.__name__, theclass.__name__), (cls,), namespace)

    def __new__(cls, obj, *args, **kwargs):
        """
        creates an proxy instance referencing `obj`. (obj, *args, **kwargs) are
        passed to this class' __init__, so deriving classes can define an 
        __init__ method of their own.
        note: _class_proxy_cache is unique per deriving class (each deriving
        class must hold its own cache)
        """
        try:
            cache = cls.__dict__["_class_proxy_cache"]
        except KeyError:
            cls._class_proxy_cache = cache = {}
        try:
            theclass = cache[obj.__class__]
        except KeyError:
            cache[obj.__class__] = theclass = cls._create_class_proxy(obj.__class__)
        ins = object.__new__(theclass)
        theclass.__init__(ins, obj, *args, **kwargs)
        return ins

class ClassProxy(Proxy):
    """ClassProxy

    Args:
        Proxy ([type]): [description]
    """
    def test(self):
        print('test')

    def __getattribute__(self, prop):
        if ['driver'].__contains__(prop):
            return super(ClassProxy, self).__getattribute__(prop)
        target = object.__getattribute__(self, "_obj")
        driver = target.driver if Object.has(target, 'driver') else DriverManager.active_driver
        async def method(*args):
            driver.stepCount += 1
            driver.lastStepTimestamp = time.time() * 1000
            response = await driver.call(target, prop, *args)
            duration = round(time.time() * 1000 - driver.lastStepTimestamp)
            print(f"[{driver.stepCount}] > {prop}(...) (+{duration}ms)")
            return response
        return method

    def __setattr__(self, prop, value):
        if ['driver'].__contains__(prop):
            return super(ClassProxy, self).__setattr__(prop, value)
        async def set_prop():
            object.__getattribute__(self, "_obj").driver.set()
        return set_prop()

class MethodProxy(Proxy):
    """MethodProxy

    Args:
        Proxy ([type]): [description]
    """

    @classmethod
    def _create_class_proxy(cls, theclass):
        """creates a proxy for the given class"""

        def make_method(name):
            async def call(self, *args):
                target = object.__getattribute__(self, "_obj")
                method_name = target.__name__
                arg_list = list(args)
                # driver_arg = arg_list.pop()
                driver_arg = None
                # driver_arg = driver_arg if type(driver_arg).__name__ == 'KatalonDriver' else None
                target_driver = Object.get(target, 'driver')
                driver = target_driver\
                    if target_driver is not None\
                    else DriverManager.active_driver
                driver = driver_arg if driver_arg is not None else driver
                args = tuple(arg_list)
                driver.lastStepTimestamp = time.time() * 1000
                response = await driver.call(None, method_name, *args)
                duration = round(time.time() * 1000 - driver.lastStepTimestamp)
                print(f"[{driver.stepCount}] > {method_name}(...) (+{duration}ms)")
                return response
            def method(self, *args, **kw):
                return getattr(object.__getattribute__(self, "_obj"), name)(*args, **kw)
            return call if name == '__call__' else method

        namespace = {}
        for name in cls._special_names:
            if hasattr(theclass, name):
                namespace[name] = make_method(name)
        return type("%s(%s)" % (cls.__name__, theclass.__name__), (cls,), namespace)
