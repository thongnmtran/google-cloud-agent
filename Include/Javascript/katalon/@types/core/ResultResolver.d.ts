export = ResultResolver;
declare function ResultResolver(): this;
declare class ResultResolver {
    stack: {};
    use: (type?: string, ...handlers: any[]) => void;
    resolve: (type: any, data: any, resolve?: any, root?: any, handlers?: any[], outerNext?: any) => any;
    resolveHandlers: (type: any, data: any, resolve: any, root: any, handlers: any, outerNext: any) => Promise<void>;
}
