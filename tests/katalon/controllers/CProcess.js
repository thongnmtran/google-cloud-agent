const { spawn } = require('child_process');

module.exports = class CProcess {
  static exec({ command, onMessage, onError }) {
    return new Promise((resolve, reject) => {
      const child = spawn(command);
      child.stdout.setEncoding('utf8');
      child.stdout.on('data', (data) => {
        onMessage(data.toString());
      });

      child.stderr.setEncoding('utf8');
      child.stderr.on('data', (data) => {
        onError(data.toString());
      });

      child.on('close', (code) => {
        if (code) {
          reject(code);
        } else {
          resolve(code);
        }
      });
    });
  }
};
