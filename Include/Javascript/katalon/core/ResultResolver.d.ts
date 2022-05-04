declare function ResultResolver(): ResultResolver;

type ResultResolverMiddleWare = (
  data: unknown, resolve: (result: unknown) => unknown, next: (result: unknown) => unknown
) => Promise<unknown>;

declare class ResultResolver {
  stack: Record<string, ResultResolverMiddleWare>;

  use: (type: string, handler: ResultResolverMiddleWare) => void;

  execute: (context: ResultResolver) => Promise<void>;
}

export = ResultResolver;
