import KatalonSession from '../core/KatalonSession';

declare class SessionManager {
  static get instance(): SessionManager;

  start(url: string): Promise<KatalonSession>;

  connect(url: string): Promise<KatalonSession>;

  listen(): void;
}

export = SessionManager;
