package com.katalon.keyword
import static com.kms.katalon.core.checkpoint.CheckpointFactory.findCheckpoint
import static com.kms.katalon.core.testcase.TestCaseFactory.findTestCase
import static com.kms.katalon.core.testdata.TestDataFactory.findTestData
import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import static com.kms.katalon.core.testobject.ObjectRepository.findWindowsObject

import java.text.MessageFormat

import javax.websocket.Session

import org.apache.commons.lang3.StringUtils
import org.openqa.selenium.By
import org.openqa.selenium.WebDriver
import org.openqa.selenium.WebElement
import org.openqa.selenium.chrome.ChromeDriver
import org.openqa.selenium.remote.HttpCommandExecutor
import org.openqa.selenium.remote.RemoteWebElement

import com.google.gson.Gson
import com.katalon.rpc.type.MessageEncoder
import com.katalon.rpc.type.PayloadObject
import com.katalon.rpc.type.RPCMessage
import com.katalon.rpc.type.ResponseMessage
import com.kms.katalon.core.annotation.Keyword
import com.kms.katalon.core.checkpoint.Checkpoint
import com.kms.katalon.core.checkpoint.CheckpointFactory
import com.kms.katalon.core.cucumber.keyword.CucumberBuiltinKeywords as CucumberKW
import com.kms.katalon.core.mobile.keyword.MobileBuiltInKeywords as Mobile
import com.kms.katalon.core.model.FailureHandling
import com.kms.katalon.core.testcase.TestCase
import com.kms.katalon.core.testcase.TestCaseFactory
import com.kms.katalon.core.testdata.TestData
import com.kms.katalon.core.testdata.TestDataFactory
import com.kms.katalon.core.testobject.ObjectRepository
import com.kms.katalon.core.testobject.TestObject
import com.kms.katalon.core.util.KeywordUtil
import com.kms.katalon.core.webservice.keyword.WSBuiltInKeywords as WS
import com.kms.katalon.core.webui.driver.DriverFactory
import com.kms.katalon.core.webui.driver.SmartWaitWebDriver
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import com.kms.katalon.core.windows.keyword.WindowsBuiltinKeywords as Windows
import com.kms.katalon.core.testng.keyword.TestNGBuiltinKeywords as TestNGKW

import internal.GlobalVariable
import io.appium.java_client.MobileElement
import io.appium.java_client.windows.WindowsElement

public class RPCKeywordCaller {
	public static Map<String, Class> TypeMap = new HashMap();
	static {
		TypeMap.put("WebUI", WebUI.class);
		TypeMap.put("WS", WS.class);
		TypeMap.put("Windows", Windows.class);
		TypeMap.put("Mobile", Mobile.class);
		TypeMap.put("GlobalVariable", GlobalVariable.class);

		TypeMap.put("Keyword", Keyword.class);
		TypeMap.put("KeywordUtil", Keyword.class);
		TypeMap.put("CucumberKW", CucumberKW.class);
		TypeMap.put("Checkpoint", Checkpoint.class);
		TypeMap.put("CheckpointFactory", CheckpointFactory.class);
		TypeMap.put("TestNGKW", TestNGKW.class);
		TypeMap.put("DriverFactory", DriverFactory.class);

		TypeMap.put("TestObject", TestObject.class);
		TypeMap.put("TestData", TestData.class);
		TypeMap.put("TestCase", TestCase.class);
		TypeMap.put("MobileElement", MobileElement.class);
		TypeMap.put("WindowsElement", WindowsElement.class);
		TypeMap.put("FailureHandling", FailureHandling.class);

		TypeMap.put("WebDriver", WebDriver.class);
		TypeMap.put("WebElement", WebElement.class);
		TypeMap.put("By", By.class);

		TypeMap.put("Array", List.class);
		TypeMap.put("Map", Map.class);
		TypeMap.put("Set", Set.class);
	}

	public static Map<String, Class> StaticMethodMap = new HashMap();
	static {
		StaticMethodMap.put("findCheckpoint", CheckpointFactory.class);
		StaticMethodMap.put("findTestObject", ObjectRepository.class);
		StaticMethodMap.put("findWindowsObject", ObjectRepository.class);
		StaticMethodMap.put("findTestCase", TestCaseFactory.class);
		StaticMethodMap.put("findTestData", TestDataFactory.class);
	}

	public static List<String> PRIMITIY_TYPE = ["number", "string", "boolean"];

	private static Gson gson = new Gson();

	public static List<Object> parseArgs(List<PayloadObject> rawArgs) {
		List<Object> args = new ArrayList<>();
		rawArgs.forEach({ rawArg ->
			if (PRIMITIY_TYPE.contains(rawArg.type)) {
				if (rawArg.type.equals("number")) {
					args.add(((Number) rawArg.value).intValue());
				} else {
					args.add(rawArg.value);
				}
				return;
			}

			Class type = getClass(rawArg.type);
			if (type != null) {
				Object argValue;
				if (type == By) {
					Map<String, String> argsMap = gson.fromJson(rawArg.value, Map.class);
					argValue = By.xpath(argsMap.get('value'));
				} else {
					argValue = gson.fromJson(rawArg.value, type);
				}
				args.add(argValue);
			} else {
				args.add(null);
			}
		});
		return args;
	}

	public static ResponseMessage call(Session client, RPCMessage message) {
		this.restoreDriver(client);

		Object result = null;
		try {
			PayloadObject object = message.object;

			Object target = object.isRemote
					? findRemoteVariable(client, object.id).value
					: getClass(message.object.type);

			String methodName = getMethodName(message.method);
			String member = methodName;

			List<Object> args = parseArgs(message.args);

			Class clazz = target != null
					? target.getClass()
					: this.getMethodOwnerClass(target, message.method);
			if (clazz == null) {
				return null;
			}

			String classSimpleName = getMethodName(message.object.type);
			String className = StringUtils.defaultString(classSimpleName, clazz.getSimpleName());
			className = StringUtils.isNotBlank(className) ? """${className}.""" : "";

			int stepCount = client.getUserProperties().containsKey("stepCount")
					? client.getUserProperties().get("stepCount")
					: 0;
			client.getUserProperties().put("stepCount", ++stepCount);

			KeywordUtil.logger.logInfo("""[${stepCount}] > ${className}${member}(...)""");

			if (hasPropertyEnhanced(clazz, member) || hasPropertyEnhanced(target, member)) {
				if (!args.empty) {
					// set
					result = target != null
							? (target."$member" = args[0])
							: (clazz."$member" = args[0]);
				} else {
					// get
					result = target != null
							? target."$member"
							: clazz."$member";
				}
			} else {
				result = target != null
						? target."$member"(*args)
						: clazz."$member"(*args);
			}
		} catch (Exception error) {
			KeywordUtil.logger.logError(error.toString());
			KeywordUtil.markError(error.toString());
			result = error;
		}

		this.storeDriver(client);

		ResponseMessage response = new ResponseMessage(result);

		boolean shouldReturnAsRemote = result instanceof SmartWaitWebDriver\
			|| result instanceof RemoteWebElement;

		if (!shouldReturnAsRemote) {
			try {
				Object test = gson.toJson(response);
			} catch (Exception error) {
				shouldReturnAsRemote = true;
			}
		}

		if (shouldReturnAsRemote) {
			RemoteVariable remoteVariable;
			Object data = null;

			if (result instanceof SmartWaitWebDriver) {
				WebDriver driver = ((SmartWaitWebDriver) result).getWrappedDriver();
				ChromeDriver chromeDriver = (ChromeDriver) driver;

				remoteVariable = storeRemoteVariable(client, chromeDriver);

				HttpCommandExecutor executor = (HttpCommandExecutor) chromeDriver.getCommandExecutor();
				String executorUrl = executor.getAddressOfRemoteServer().toString();
				String sessionId = chromeDriver.getSessionId().toString();
				data = MessageFormat.format("{0}#{1}", executorUrl, sessionId);
			} else {
				remoteVariable = storeRemoteVariable(client, result);
			}

			response.isRemote = true;
			response.data = data;
			response.id = remoteVariable.id;
		}

		return response;
	}

	private static boolean hasPropertyEnhanced(Object object, String property) {
		if (object == null) {
			return false;
		}
		String firtstCharacter = property[0].toUpperCase();
		String restCharacters = property[1 .. property.length() - 1];
		String nameInCamelCase = firtstCharacter + restCharacters;
		return object.hasProperty(property) || object.metaClass.hasProperty(object.getClass(), property)\
			|| object.metaClass.respondsTo(object, "get${nameInCamelCase}");
	}

	public static String getMethodName(String method) {
		if (StringUtils.isBlank(method)) {
			return StringUtils.EMPTY;
		}
		if (method.indexOf('.') >= 0) {
			int lastDot = method.lastIndexOf('.');
			return method.substring(lastDot + 1);
		}
		return method;
	}

	public static Class getMethodOwnerClass(Object object, String method) {
		if (object != null) {
			return object;
		}
		if (StaticMethodMap.containsKey(method)) {
			return StaticMethodMap.get(method);
		}
		if (method.indexOf('.') >= 0) {
			int lastDot = method.lastIndexOf('.');
			String classPath = method.substring(0, lastDot);
			return getClass(classPath);
		}
		return null;
	}

	private static restoreDriver(Session client) {
		Object driver = client.getUserProperties().get("webDriver");
		if (driver != null) {
			try {
				DriverFactory.changeWebDriverWithoutLog(driver);
			} catch (Exception error) {
				// Just skip
			}
		}
	}

	private static storeDriver(Session client) {
		try {
			client.getUserProperties().put("webDriver", DriverFactory.getWebDriver());
		} catch (Exception error) {
			// Just skip
		}
	}

	private static RemoteVariable storeRemoteVariable(Session client, Object value) {
		RemoteVariableMap remoteVariableMap = client.userProperties.get("remoteVariableMap");
		if (remoteVariableMap == null) {
			remoteVariableMap = new RemoteVariableMap();
			client.userProperties.put("remoteVariableMap", remoteVariableMap);
		}
		RemoteVariable existingVariable = remoteVariableMap.find(value);
		if (existingVariable != null) {
			return existingVariable;
		}
		return remoteVariableMap.put(value);
	}

	private static RemoteVariable findRemoteVariable(Session client, String id) {
		RemoteVariableMap remoteVariableMap = client.userProperties.get("remoteVariableMap");
		if (!remoteVariableMap) {
			return null;
		}
		return remoteVariableMap.findById(id);
	}

	public static Object getValue(String type, Object value) {
		Object object = null;
		try {
			object = Class.forName(type);
		} catch (Exception error) {
		}
		return object;
	}

	public static Class getClass(String type) {
		if (TypeMap.containsKey(type)) {
			return TypeMap.get(type);
		}

		Object object = loadClass(type);
		if (object != null) {
			return object;
		}

		//		ClassLoader classloader = java.lang.ClassLoader.getSystemClassLoader();
		//		Package[] packages = classloader.getPackages();
		//		for (Package pkg : packages) {
		//			pkg.pkgName;
		//		}

		return object;
	}

	public static Class loadClass(String type) {
		try {
			return Class.forName(type);
		} catch (Exception error) {
			// Just skip
		}
		return null;
	}
}
