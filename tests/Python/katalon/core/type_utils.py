"""
TypeUtils
"""
import json
import inspect
import types
from katalon.core.object_utils import Object


class TypeUtils:
    """
    TypeUtils
    """
    TYPE_MAP = {}

    @staticmethod
    def get_type_name(objectz):
        if objectz is None:
            return None
        python_type = ''
        if inspect.isclass(objectz):
            python_type = objectz.__name__
        if type(objectz).__name__ == 'dict' and objectz.__contains__('___name__'):
            python_type = objectz['___name__']
        if not bool(python_type):
            python_type = type(objectz).__name__
        return TypeUtils.TYPE_MAP[python_type]\
          if TypeUtils.TYPE_MAP.__contains__(python_type)\
          else python_type

    @staticmethod
    def get_raw_value(value):
        if TypeUtils.is_enum(value):
            return value['value']
        if ['dict', 'arr'].__contains__(type(value).__name__):
            return json.dumps(value)
        return value

    @staticmethod
    def is_enum(value):
        try:
            return value is not None and value.__contains__('is_enum') and value is True
        except:
            return False

    @staticmethod
    def apply_type(objectz, type_name):
        if TypeUtils.get_type_name(objectz) != 'dict':
            return objectz

        objectz['___name__'] = type_name
        # TypeClass = types.new_class(type_name)
        # if TypeClass is not None:
        #     return Object.assign(TypeClass(), objectz)
        return objectz

TypeUtils.TYPE_MAP[type('').__name__] = 'string'
TypeUtils.TYPE_MAP[type(1).__name__] = 'number'
