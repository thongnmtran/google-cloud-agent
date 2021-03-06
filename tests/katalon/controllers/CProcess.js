const { exec } = require('child_process');
const path = require('path');

module.exports = class CProcess {
  static build({
    command, onMessage, onError, onEnd
  }) {
    const child = exec(command, {
      cwd: path.resolve('.'),
      env: process.env
    });
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', (data) => {
      onMessage?.(data?.toString());
    });

    child.stderr.setEncoding('utf8');
    child.stderr.on('data', (data) => {
      onError?.(data?.toString());
    });
    if (onEnd) {
      child.once('exit', onEnd);
    }
    return child;
  }

  static async exec({
    command, onMessage, onError,
  }) {
    return new Promise((resolve, reject) => {
      const child = this.build({
        command, onMessage, onError
      });
      child.once('exit', resolve);
      child.once('error', reject);
    });
  }
};
