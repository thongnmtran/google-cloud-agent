export = TypeUtils;
declare class TypeUtils {
    static typeMap: {};
    static getClassName(object: any): string;
    static getDisplayName(arg: any): any;
    static getTypeName(object: any): any;
    static getRawValue(value: any): any;
    static applyType(object: any, type: any): any;
    static getType(type: any, forceNew: any): any;
    static generateType(type: any): () => void;
    static getShortName(type: any): any;
}
