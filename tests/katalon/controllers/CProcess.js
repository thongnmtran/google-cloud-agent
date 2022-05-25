const { spawn, exec } = require('child_process');
const path = require('path');

module.exports = class CProcess {
  static async exec({
    command, onMessage, onError,
  }) {
    return new Promise((resolve, reject) => {
      const child = exec(command, { cwd: path.resolve('.') });
      child.stdout.setEncoding('utf8');
      child.stdout.on('data', (data) => {
        onMessage(data?.toString());
      });

      child.stderr.setEncoding('utf8');
      child.stderr.on('data', (data) => {
        onError(data?.toString());
      });
      child.once('exit', resolve);
      child.once('error', reject);
    });
  }
};
