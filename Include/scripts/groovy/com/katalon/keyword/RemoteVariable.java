package com.katalon.keyword;

import java.util.UUID;


public class RemoteVariable {
	public String id;
	
	public Object value;
	
	public RemoteVariable(Object value) {
		this.id = UUID.randomUUID().toString();
		this.value = value;
	}
}