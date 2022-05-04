package com.katalon.rpc.type;

import javax.websocket.DecodeException;
import javax.websocket.Decoder;
import javax.websocket.EndpointConfig;

import com.google.gson.Gson;

public class MessageDecoder implements Decoder.Text<RPCMessage> {

	private static Gson gson = new Gson();

	@Override
	public RPCMessage decode(String payload) throws DecodeException {
		return gson.fromJson(payload, RPCMessage.class);
	}

	@Override
	public boolean willDecode(String payload) {
		return (payload != null);
	}

	@Override
	public void init(EndpointConfig endpointConfig) {
		// Custom initialization logic
	}

	@Override
	public void destroy() {
		// Close resources
	}
}