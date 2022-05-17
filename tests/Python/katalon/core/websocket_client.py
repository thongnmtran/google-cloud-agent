"""
WebSocketClient
"""
import time
import asyncio
import json
import collections
from websockets import WebSocketClientProtocol
try:
    import thread
except ImportError:
    import _thread as thread
import websockets
from eventemitter import EventEmitter
from katalon.core.kconstants import EventType


class WebSocketClient:
    """
    Hello
    """

    def __init__(self):
        self.socket = WebSocketClientProtocol()
        self.is_alive = True
        self.emitter = EventEmitter()
        self.callback_queue = collections.deque([])

    async def alive(self):
        while self.is_alive:
            # if self.socket.open:
            #     await self.socket.send('Hello')
            await asyncio.sleep(1)

    async def async_processing(self, port):
        async with websockets.connect(f"ws://localhost:{port}") as websocket:
            self.is_alive = True
            self.socket = websocket
            self.handle_open()
            while self.is_alive and self.socket.open:
                try:
                    await asyncio.sleep(1)
                    # message = await self.socket.recv()
                    # self.handle_message(message)
                except websockets.exceptions.ConnectionClosed:
                    print('ConnectionClosed')
                    self.is_alive = False
                    self.handle_close()

    async def connect(self, port):
        # websocket.enableTrace(True)
        tasks = [
            # asyncio.ensure_future(self.alive()),
            asyncio.ensure_future(self.async_processing(port))
        ]
        await asyncio.wait(tasks)

    async def close(self):
        return await self.socket.close()

    async def send(self, message):
        await self.socket.send(message)
        response = await self.socket.recv()
        response = json.loads(response, encoding='utf-8') if bool(response) else response
        return response

    def listen(self):
        self.socket.run_forever()

    def handle_open(self):
        # print("### opened ###")
        self.emitter.emit(EventType.open.value)

    def handle_message(self, message):
        response = json.loads(message.data, encoding='utf-8') if message.data else message.data
        self.emitter.emit(EventType.message.value, response)

    def handle_error(self, error):
        print(error)
        self.emitter.emit(EventType.error.value, error)

    def handle_close(self):
        # print("### closed ###")
        self.emitter.emit(EventType.close.value)

    def on_open(self, listener):
        self.emitter.on(EventType.open.value, listener)

    def on_message(self, listener):
        self.emitter.on(EventType.message.value, listener)

    def on_close(self, listener):
        self.emitter.on(EventType.close.value, listener)

    def on_error(self, listener):
        self.emitter.on(EventType.error.value, listener)

    def on_ready(self, listener):
        self.emitter.once(EventType.open.value, listener)
