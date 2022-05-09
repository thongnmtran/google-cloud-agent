

module.exports = class ObjectUtils {
  static instance(object, instance) {
    const instanceProp = Object.getOwnPropertyDescriptor(object, 'instance');
    if (!instanceProp || instanceProp.writable !== false) {
      Object.defineProperty(object, 'instance', {
        writable: false,
        value: instance,
        configurable: false,
        enumerable: false
      });
    }
    return instance;
  }
};
