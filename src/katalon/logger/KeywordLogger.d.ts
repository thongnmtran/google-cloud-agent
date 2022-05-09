declare class KeywordLogger {
  static get instance(): KeywordLogger;

  connect(portOrHost: number | string): Promise<void>;

  disconnect(): void;

  logStep(index: number, object: any, prop: string, args: any[]): void;
}

export = KeywordLogger;
