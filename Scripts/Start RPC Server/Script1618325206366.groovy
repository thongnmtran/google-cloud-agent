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

def runner = new Runnable() {
	@Override
	void run() {
		Thread.sleep(3000);
		File jsFile = new File("build/firstTest.js");
		ConsoleCommandBuilder.create("node \"${jsFile.getCanonicalPath()}\"")
			.path(new File("Drivers").getCanonicalPath())
			.execSync()
		println "Done!"
	}
};
def jsThread = new Thread(runner);
jsThread.start();

KatalonRPCServer.create(4444).listen(false); // server.listen(forever = false)

jsThread.interrupt()

jsThread.join()

// KatalonRPCServer.create(4444).listen(); // Use this if you want to end the test after the first RPC Client closes the connection.





