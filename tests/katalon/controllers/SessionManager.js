const childprocess = require('child_process');
const { existsSync } = require('fs');
const { resolve } = require('path');
const KatalonSession = require('../core/KatalonSession');
const EventName = require('../utils/EventName');

module.exports = class SessionManager {
  sessions = [];

  get firstSession() {
    return this.sessions[0];
  }

  async start(url) {
    const newSessionPromise = this.connect(url);
    this.listen();
    return newSessionPromise;
  }

  async connect(url, options = {}) {
    const newSession = new KatalonSession();
    const connectPromise = newSession.connect(url, options);
    this.sessions.push(newSession);
    return connectPromise;
  }

  listen() {
    this.firstSession.on(EventName.run, (from, path) => {
      const fullPath = resolve(path);
      const nodeFullPath = resolve('./Drivers/node');

      this.firstSession.log(`Run script: "${fullPath}"`);
      if (!existsSync(nodeFullPath)) {
        this.firstSession.log(`> File not found: "${fullPath}"`);
        return;
      }

      childprocess.exec(`export FROM=${from}; "${nodeFullPath}" "${fullPath}"`, (error, stdout, stderr) => {
        // this.firstSession.log(stdout);
        // this.firstSession.log(stderr);
        if (error !== null) {
          this.firstSession.log(error);
        }
      });
    });
    this.firstSession.on(EventName.stop, () => {
      this.firstSession.disconnect();
      process.exit(0);
    });
    this.firstSession.on(EventName.connect, () => {
      this.firstSession.emit(EventName.registerInstance);
    });
  }
};
