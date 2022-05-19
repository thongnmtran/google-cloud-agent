declare class KatalonSession {
  tunnelId: string;

  connect(url: string): Promise<KatalonSession>;

  disconnect(): void;

  log(message: string): void;

  on<Ev extends ReservedOrUserEventNames<ReservedEvents, ListenEvents>>(
      ev: Ev,
      listener: ReservedOrUserListener<ReservedEvents, ListenEvents, Ev>
  ): this;

  onP2P<Ev extends ReservedOrUserEventNames<ReservedEvents, ListenEvents>>(
      ev: Ev,
      listener: ReservedOrUserListener<ReservedEvents, ListenEvents, Ev>
  ): this;

  off<Ev extends ReservedOrUserEventNames<ReservedEvents, ListenEvents>>(
      ev?: Ev,
      listener?: ReservedOrUserListener<ReservedEvents, ListenEvents, Ev>
  ): this;

  emit<Ev extends EventNames<EmitEvents>>(ev: Ev, ...args: EventParams<EmitEvents, Ev>): this;
}

export = KatalonSession;
