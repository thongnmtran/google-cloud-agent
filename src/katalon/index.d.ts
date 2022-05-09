/* eslint-disable no-shadow */

import { WebDriver } from 'selenium-webdriver';
import SessionManager = require('./controllers/SessionManager');

import KeywordLogger = require('./logger/KeywordLogger');
import KatalonSession = require('./core/KatalonSession');
import KatalonDriver = require('./core/KatalonDriver');
import DriverManager = require('./controllers/DriverManager');

export { KeywordLogger, KatalonSession, SessionManager };


export class TestObject {
    parentObject: TestObject; // Typically is parent Frame

    isParentObjectShadowRoot: boolean;

    properties: TestObjectProperty[];

    xpaths: TestObjectXpath[];

    objectId: string;

    imagePath: string;

    useRelativeImagePath: boolean ;

    selectorMethod: SelectorMethod = SelectorMethod.BASIC;

    selectorCollection: Map<SelectorMethod, string> ;

    cachedWebElement: WebElement ;
}

export function findTestObject(testObjectId: string): TestObject;

export enum FailureHandling {
  /**
   * Default value
   */
  STOP_ON_FAILURE,
  CONTINUE_ON_FAILURE,
  OPTIONAL
}

export class WebUI {
  static driver: KatalonDriver;

  static openBrowser(url: string, flowControl?: FailureHandling): void;

  static navigateToUrl(url: string, flowControl?: FailureHandling): void;

  static setText(testobject: TestObject, text: string, flowControl?: FailureHandling): void;

  static click(testObject: TestObject, flowControl?: FailureHandling) : void;

  static closeBrowser(flowControl?: FailureHandling) : void;

  static verifyElement(): void;

  static verifyElementPresent(
    testObject: TestObject, timeout: number, flowControl?: FailureHandling): boolean;

  static verifyElementNotPresent(
    testObject: TestObject, timeout: number, flowControl?: FailureHandling): boolean;

  static delay(sec: number) : void;
}

export function loggingProxy<Type>(target: Type): Type;
export function delay(milis?: number): Promise<any>;
export const Mobile: any;
export const Windows: any;
export const WS: any;
export const Katalon: KatalonDriver;
export { KatalonDriver, DriverManager };
export function cloneClass<Type>(clazz: Type): Type;
export function importClass(path: 'string'): Proxy;
export function importMethod(path: 'string'): Proxy;
export function importEnum(path: 'string'): Proxy;

export class DriverFactory {
  static getWebDriver() : WebDriver;
}
