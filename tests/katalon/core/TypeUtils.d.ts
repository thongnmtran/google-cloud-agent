/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */

declare class TypeUtils {
    static typeMap: any;

    static getDisplayName(arg: any): string;

    static getTypeName(object: any): string;

    static getRawValue(value: any): any;

    static applyType(object: any, type: any): void;

    static getType(type: any, forceNew: boolean): any;
}

export = TypeUtils;
