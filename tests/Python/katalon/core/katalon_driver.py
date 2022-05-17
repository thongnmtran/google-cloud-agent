"""
KatalonDriver
"""
import json
from eventemitter import EventEmitter
from katalon.core.websocket_client import WebSocketClient
from katalon.core.kconstants import EventType, RPCKey, RPCResponseKey
from katalon.core.type_utils import TypeUtils
from katalon.core.object_utils import Object


def map_arg(arg):
    payload_arg = {}
    payload_arg[RPCKey.type.value] = TypeUtils.get_type_name(arg)
    payload_arg[RPCKey.value.value] = TypeUtils.get_raw_value(arg)
    return payload_arg

class KatalonDriver:
    """
    KatalonDriver
    """

    def __init__(self):
        self.session = WebSocketClient()
        self.emitter = EventEmitter()
        self.stepCount = 0
        self.lastStepTimestamp = 0

    async def connect(self, port):
        self.session = WebSocketClient()
        self.session.on_ready(self.handle_ready)
        await self.session.connect(port)

    async def close(self):
        await self.session.close()

    def handle_ready(self):
        self.emitter.emit(EventType.ready, self)

    def on_ready(self, listener):
        self.emitter.on(EventType.ready, listener)

    async def call(self, target, method, *args):
        payload = {}
        payload[RPCKey.object.value] = {}
        payload[RPCKey.object.value][RPCKey.type.value] = TypeUtils.get_type_name(target)
        payload[RPCKey.method.value] = method
        payload[RPCKey.args.value] = list(map(map_arg, args))
        raw_response = await self.session.send(json.dumps(payload, ensure_ascii=False))
        data = Object.get(raw_response, RPCResponseKey.data.value)
        type_name = Object.get(raw_response, RPCResponseKey.type.value)
        return None if data is None else TypeUtils.apply_type(data, type_name)

    async def set(self, target, prop, value):
        payload = {}
        payload[RPCKey.object.value] = {}
        payload[RPCKey.object.value][RPCKey.type.value] = TypeUtils.get_type_name(target)
        payload[RPCKey.method.value] = prop
        payload[RPCKey.args.value] = list(map(map_arg, [value]))
        raw_response = await self.session.send(json.dumps(payload, ensure_ascii=False))
        return raw_response
        # return Object.get(raw_response, RPCResponseKey.data.value)

    def listen(self):
        self.session.listen()
