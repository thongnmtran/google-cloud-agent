package com.katalon.rpc.server;
import java.io.IOException;
import java.util.HashSet;
import java.util.Set;

import javax.websocket.OnClose;
import javax.websocket.OnError;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;

import com.katalon.keyword.RPCKeywordCaller;
import com.katalon.rpc.type.MessageDecoder;
import com.katalon.rpc.type.MessageEncoder;
import com.katalon.rpc.type.RPCMessage;
import com.katalon.rpc.type.ResponseMessage;
import com.kms.katalon.core.util.KeywordUtil;

@ServerEndpoint(
value="/",
encoders=MessageEncoder.class,
decoders=MessageDecoder.class
)
public class RPCServerEndpoint {
    public static Set<Session> sessions = new HashSet<Session>();

	@OnOpen
	public void onOpen(Session session) {
		sessions.add(session);
		KeywordUtil.logInfo("WebSocket opened: " + session.getId());
	}

	@OnMessage
	public void onMessage(Session session, RPCMessage message) {
//		KeywordUtil.logInfo("Received Message: " + message);
		ResponseMessage result = RPCKeywordCaller.call(session, message);

		try {
			session.getBasicRemote().sendObject(result);
		} catch (Exception error) {
			KeywordUtil.logInfo(error.toString());
		}
	}

	@OnMessage(maxMessageSize = 1024000L)
	public void onBinaryMessage(byte[] buffer) {
//		KeywordUtil.logInfo("New Binary Message Received: " + buffer.length);
	}

	@OnClose
	public void onClose(Session session) throws IOException {
//		KeywordUtil.logInfo("WebSocket closed: " + session.getId());
		sessions.remove(session);
	}

	@OnError
	public void onError(Throwable cause) {
		KeywordUtil.logInfo(cause.getMessage());
	}
}