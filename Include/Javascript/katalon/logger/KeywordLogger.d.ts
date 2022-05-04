declare class KeywordLogger {
  static get instance(): KeywordLogger;

  logStep(index: number, object: any, prop: string, args: any[]): void;
}

export = KeywordLogger;
