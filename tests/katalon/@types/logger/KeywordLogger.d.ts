export = KeywordLogger;
declare class KeywordLogger {
    static get instance(): {
        new (): import("./KeywordLogger");
        readonly instance: any;
        formatNumber(number: any): string;
    };
    static formatNumber(number: any): string;
    logStep({ index, time, id }: {
        index: any;
        time: any;
        id: any;
    }, object: any, prop: any, args: any): void;
}
