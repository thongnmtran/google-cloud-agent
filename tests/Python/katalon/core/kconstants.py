"""
Constants
"""
from enum import Enum


class EventType(Enum):
    """
    EventType
    """
    open = 'open'
    close = 'close'
    message = 'message'
    error = 'error'
    ready = 'ready'


class KatalonType(Enum):
    """
    KatalonType
    """
    WebUI = 'WebUI'
    WS = 'WS'
    Windows = 'Windows'
    Mobile = 'Mobile'
    FailureHandling = 'FailureHandling'
    findTestObject = 'findTestObject'


class RPCKey(Enum):
    """
    RPCKey
    """
    object = 'object'
    method = 'method'
    args = 'args'
    type = 'type'
    value = 'value'

class RPCResponseKey(Enum):
    """
    RPCResponseKey
    """
    is_remote = 'isRemote'
    data = 'data'
    type = 'type'
