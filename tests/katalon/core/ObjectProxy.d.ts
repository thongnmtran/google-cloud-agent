
declare function setPropertyHandler(target: any, prop: any, value: any): any;
declare function getPropertyHandler(target: any, prop: any, receiver: any): any;
declare function applyHander(target: any, thisArg: any, rawArgs: any): Promise<any>;
declare function getEnumHandler(target: any, prop: any): {
    type: any;
    value: any;
    isEnum: boolean;
};
declare function setEnumHandler(target: any, prop: any): void;
export {};
export namespace ClassProxy {
    export { setPropertyHandler as set };
    export { getPropertyHandler as get };
}
export namespace MethodProxy {
    export { setPropertyHandler as set };
    export { getPropertyHandler as get };
    export { applyHander as apply };
}
export namespace EnumProxy {
    export { getEnumHandler as get };
    export { setEnumHandler as set };
}
export namespace RemoteVariableProxy {
    export { setPropertyHandler as set };
    export { getPropertyHandler as get };
}
