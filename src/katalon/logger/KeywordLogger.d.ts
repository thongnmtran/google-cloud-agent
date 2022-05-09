declare class KeywordLogger {
  static get instance(): KeywordLogger;

  session: KatalonSession;

  logStep(index: number, object: any, prop: string, args: any[]): void;
}

export = KeywordLogger;
