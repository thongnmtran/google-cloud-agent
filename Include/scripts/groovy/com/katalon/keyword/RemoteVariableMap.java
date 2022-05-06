package com.katalon.keyword;
import java.util.HashMap;
import java.util.Optional;

public class RemoteVariableMap extends HashMap<String, RemoteVariable> {
	private static final long serialVersionUID = 1L;
	
	public boolean containsValue(Object value) {
		return entrySet().stream().filter(variable -> variable.getValue().equals(value)).findFirst().isPresent();
	}

	public RemoteVariable find(Object value) {
		Optional<Entry<String, RemoteVariable>> findResult = entrySet()
				.stream()
				.filter(variable -> variable.getValue().equals(value))
				.findFirst();
		return findResult.isPresent()
			? findResult.get().getValue()
			: null;
	}

	public RemoteVariable findById(String id) {
		Optional<Entry<String, RemoteVariable>> findResult = entrySet()
				.stream()
				.filter(variable -> variable.getKey().equals(id))
				.findFirst();
		return findResult.isPresent()
			? findResult.get().getValue()
			: null;
	}
	
	public RemoteVariable put(Object value) {
		RemoteVariable variable = new RemoteVariable(value);
		put(variable.id, variable);
		return variable;
	};
}