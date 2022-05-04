const { get, set } = require('lodash');

function ResultResolver() {
  // { "type": { "root": [handler] } }
  // { "com": { "root": [handler], "katalon": { "SmartWaitWebDriver": { "root": [handler] } } } }
  this.stack = {};

  // eslint-disable-next-line no-shadow
  this.use = (type = '', ...handlers) => {
    let node = get(this.stack, type);
    if (!node) {
      set(this.stack, type, {});
      node = get(this.stack, type);
    }
    if (!node.root) {
      node.root = [];
    }
    node.root.push(...handlers);
  };

  this.resolve = async (
    type, data, resolve = null, root = null, handlers = [], outerNext = null
  ) => {
    if (!type) {
      return data;
    }

    if (!resolve) {
      return new Promise(
        (innerResolve) => this.resolve(type, data, innerResolve, root, handlers, outerNext)
      );
    }

    if (!root) {
      // eslint-disable-next-line no-param-reassign
      root = this.stack;
    }

    if (handlers && handlers.length > 0) {
      await this.resolveHandlers(type, data, resolve, root, handlers, outerNext);
    } else {
      const parts = type.split('.');
      const nextPart = parts.shift();
      const restParts = parts.join('.');

      const nextPartNode = get(root, nextPart);
      if (nextPartNode) {
        if (nextPartNode.root) {
          const restHandlers = [...nextPartNode.root];
          // eslint-disable-next-line no-await-in-loop
          await this.resolveHandlers(
            restParts, data, resolve, nextPartNode, restHandlers, outerNext
          );
        } else {
          this.resolve(restParts, data, resolve, nextPartNode, null, outerNext);
        }
      }
    }

    if (outerNext) {
      return outerNext(data);
    }

    resolve(data);
    return data;
  };

  this.resolveHandlers = async (type, data, resolve, root, handlers, outerNext) => {
    const next = (result) => {
      this.resolve(type, result, resolve, root, handlers, outerNext);
    };
    const handlerI = handlers.shift();

    if (handlerI instanceof ResultResolver) {
      await handlerI.resolve(type, data, resolve, root, handlers, next);
    } else {
      await handlerI(data, resolve, next);
    }
  };

  return this;
}

module.exports = ResultResolver;
