package com.katalon.rpc.type;

public class ResponseMessage {
	public String id;

	public String type;

	public Object data;
	
	public boolean isRemote;

	public ResponseMessage(Object data) {
		this(data, false);
	}

	public ResponseMessage(Object data, boolean isRemote) {
		this.data = data;
		this.type = data != null ? data.getClass().getSimpleName() : null;
		this.isRemote = isRemote;
	}
}