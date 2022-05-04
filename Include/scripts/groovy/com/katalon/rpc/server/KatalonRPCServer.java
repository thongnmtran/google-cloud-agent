package com.katalon.rpc.server;

import javax.websocket.server.ServerContainer;

import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.server.ServerConnector;
import org.eclipse.jetty.servlet.ServletContextHandler;
import org.eclipse.jetty.websocket.jsr356.server.deploy.WebSocketServerContainerInitializer;

import com.kms.katalon.core.util.KeywordUtil;

public class KatalonRPCServer {
	public Server server;

	public static KatalonRPCServer create() {
		return new KatalonRPCServer();
	}

	public static KatalonRPCServer create(int port) {
		KatalonRPCServer server = new KatalonRPCServer();
		server.safeStart(port);
		return server;
	}

	public void safeStart(int port) {
		try {
			start(port);
		} catch (Exception error) {
			KeywordUtil.logInfo(error.toString());
		}
	}

	public void start(int port) throws Exception {
		server = new Server();
		ServerConnector connector = new ServerConnector(server);
		connector.setPort(port);
		server.addConnector(connector);

		ServletContextHandler context = new ServletContextHandler(ServletContextHandler.SESSIONS);
		context.setContextPath("/");
		server.setHandler(context);

		ServerContainer wscontainer = WebSocketServerContainerInitializer.configureContext(context);

		// Add WebSocket endpoint to javax.websocket layer
		wscontainer.addEndpoint(RPCServerEndpoint.class);

		server.start();

		KeywordUtil.logInfo("Server started");
	}

	public void listen(int port) {
		listen(port, true);
	}

	public void listen(int port, boolean forever) {
		if (server == null || !server.isRunning()) {
			safeStart(port);
		}
		listen(forever);
	}

	public void listen() {
		listen(false);
	}

	public void listen(boolean forever) {
		try {
			boolean connected = false;
			while (server.isRunning()) {
				Thread.sleep(1000);
				if (!forever) {
					boolean isEmpty = RPCServerEndpoint.sessions.isEmpty();
					if (!isEmpty) {
						connected = true;
					} else if (connected) {
						break;
					}
				}
			}
		} catch (InterruptedException error1) {
			try {
				server.stop();
			} catch (Exception error2) {
				KeywordUtil.logInfo(error2.getMessage());
			}
		}
		KeywordUtil.logInfo("Server stopped");
	}
}

