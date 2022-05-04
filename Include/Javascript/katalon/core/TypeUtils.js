/* eslint-disable func-names */
/* eslint-disable object-shorthand */

module.exports = class TypeUtils {
  static typeMap = {};

  static getClassName(object) {
    const rawName = object && object.name;
    return rawName ? `${rawName.split('.').pop()}.` : '';
  }

  static getDisplayName(arg) {
    if (Array.isArray(arg)) {
      return `[${arg.map((argI) => this.getDisplayName(argI))}]`;
    }
    if (typeof arg === 'function' || typeof arg === 'object') {
      if (arg.isEnum) {
        const fullTypeName = this.getTypeName(arg);
        const nameParts = fullTypeName.split('.');
        const typeName = nameParts[nameParts.length - 1];
        return `${typeName.enumType}.${arg.value.enumValue}`;
      }
      const typeName = this.getTypeName(arg);
      if (typeName === 'TestObject') {
        return `${typeName}(${JSON.stringify(arg.objectId)})`.id;
      }
      return typeName.split('.').pop();
    }
    return JSON.stringify(arg)[typeof arg];
  }

  static getTypeName(object) {
    if (object == null) {
      return null;
    }
    if (typeof object === 'object') {
      if (object.isEnum) {
        return object.type;
      }
      return this.getClassNamez(object, true);
    }
    if (typeof object === 'function') {
      return object.name;
    }
    return typeof object;
  }

  static getClassNamez(object, keepDots = false) {
    if (!object) {
      return '';
    }
    let className = object.type || object.constructor.name;
    if (className === 'Function') {
      className = object.name;
    }
    if (typeof className === 'string' && className.includes('.') && !keepDots) {
      className = className.split('.').pop();
    }
    if (/^\w+$/.test(className)) {
      return className;
    }
    const matchClassname = object.constructor.toString().match(/class (\w+) {/);
    className = matchClassname && matchClassname[1];
    return className || '';
  }

  static getRawValue(value) {
    if (value && value.isEnum) {
      return value.value;
    }
    if (typeof value === 'object' || typeof value === 'function') {
      return JSON.stringify(value);
    }
    return value;
  }

  static applyType(object, type) {
    if (typeof object !== 'object') {
      return object;
    }
    const TypeClass = this.getType(type);
    if (TypeClass) {
      return Object.assign(new TypeClass(), object);
    }
    return object;
  }

  static getType(type, forceNew) {
    const shortName = this.getShortName(type);
    if (this.typeMap[type] && !forceNew) {
      return this.typeMap[type];
    }
    const newType = this.generateType(type);
    this.typeMap[type] = newType;
    this.typeMap[shortName] = newType;
    return newType;
  }

  static generateType(type) {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const TypeWrapper = { [type]: function () { } };
    const newType = TypeWrapper[type];
    return newType;
  }

  static getShortName(type) { // org.openqa.selenium.WebDriver
    const parts = type.split('.');
    return parts[parts.length - 1];
  }
};
