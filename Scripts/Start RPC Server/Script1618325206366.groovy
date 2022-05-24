import static com.kms.katalon.core.checkpoint.CheckpointFactory.findCheckpoint
import static com.kms.katalon.core.testcase.TestCaseFactory.findTestCase
import static com.kms.katalon.core.testdata.TestDataFactory.findTestData
import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import static com.kms.katalon.core.testobject.ObjectRepository.findWindowsObject

import com.katalon.rpc.server.KatalonRPCServer
import com.kms.katalon.core.checkpoint.Checkpoint
import com.kms.katalon.core.cucumber.keyword.CucumberBuiltinKeywords as CucumberKW
import com.kms.katalon.core.logging.KeywordLogger
import com.kms.katalon.core.mobile.keyword.MobileBuiltInKeywords as Mobile
import com.kms.katalon.core.model.FailureHandling as FailureHandling
import com.kms.katalon.core.testcase.TestCase as TestCase
import com.kms.katalon.core.testdata.TestData as TestData
import com.kms.katalon.core.testng.keyword.TestNGBuiltinKeywords as TestNGKW
import com.kms.katalon.core.testobject.TestObject
import com.kms.katalon.core.util.ConsoleCommandBuilder
import com.kms.katalon.core.util.ConsoleCommandExecutor
import com.kms.katalon.core.util.KeywordUtil
import com.kms.katalon.core.webservice.keyword.WSBuiltInKeywords as WS
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import com.kms.katalon.core.windows.keyword.WindowsBuiltinKeywords as Windows
import internal.GlobalVariable

import org.apache.commons.lang3.StringUtils
import org.openqa.selenium.Keys as Keys



def curWorkingDir = System.getProperty("user.dir")
println "Current working dir: ${curWorkingDir}"

def server = KatalonRPCServer.create(4444);

def isLocal = GlobalVariable.isLocal;

if (isLocal) {
	server.listen(true) // server.listen(forever)
} else {
	// File jsFile = new File("build/firstTest.js");
	File jsFile = new File("build/sessionManager.js");
	
//	def nodeJsPath = new File("Drivers/linux/bin/node").getCanonicalPath();
	def nodeJsPath = new File("Drivers/win/node").getCanonicalPath();
	println "NodeJS path: ${nodeJsPath}";
	
//	ConsoleCommandBuilder.create("chmod +x \"${nodeJsPath}\"").execSync();

	def output = ConsoleCommandBuilder.create("node \"${jsFile.getCanonicalPath()}\"")
		.path(new File(nodeJsPath).getParentFile().getCanonicalPath())
		.workingDir(new File(".").getCanonicalPath())
		.redirectError()
		.execSync();
		
	println StringUtils.join(output, "\r\n")
	
	server.stop()
}





