const childprocess = require('child_process');
const { existsSync, writeFileSync, rmSync } = require('fs');
const { resolve } = require('path');
const KatalonSession = require('../core/KatalonSession');
const EventName = require('../utils/EventName');

module.exports = class SessionManager {
  session = new KatalonSession();

  get connected() {
    return this.session.connected;
  }

  async start(url) {
    if (this.connected) {
      return this.session;
    }
    const newSessionPromise = this.connect(url);
    this.listen();
    return newSessionPromise;
  }

  async connect(url, options = {}) {
    return this.session.connect(url, options);
  }

  listen() {
    this.session.on(EventName.run, (from, path, allChanges) => {
      try {
        const fullPath = resolve(path);
        const nodeFullPath = resolve('./Drivers/node');

        if (allChanges?.length) {
          this.session.log(`> Applying changes (${allChanges?.length})`, from);
          writeFileSync('patch.diff', allChanges);
          childprocess.execSync('git apply patch.diff');
          rmSync('patch.diff', { force: true });
        }

        this.session.log(`Run script: "${fullPath}"`, from);
        if (!existsSync(nodeFullPath)) {
          this.session.log(`> File not found: "${fullPath}"`, from);
          return;
        }

        childprocess.exec(`export FROM=${from}; "${nodeFullPath}" "${fullPath}"`, (error, stdout, stderr) => {
          // this.session.log(stdout);
          // this.session.log(stderr);
          if (error !== null) {
            this.session.log(error, from);
          }
        });
      } catch (error) {
        this.session.log(`> Error: "${error.message}"`, from);
      }
    });
    this.session.on(EventName.stop, () => {
      this.session.disconnect();
      process.exit(0);
    });
    this.session.on(EventName.connect, () => {
      this.session.emit(EventName.registerInstance);
    });
  }
};
