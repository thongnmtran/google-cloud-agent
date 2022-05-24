const childprocess = require('child_process');
const { existsSync, writeFileSync, rmSync } = require('fs');
const { resolve } = require('path');
const KatalonSession = require('../core/KatalonSession');
const EventName = require('../utils/EventName');

module.exports = class SessionManager {
  session = new KatalonSession();

  processes = [];

  addProcess(newProcess) {
    this.processes.push(newProcess);
  }

  removeProcess(process) {
    const index = this.processes.indexOf(process);
    if (index >= 0) {
      this.processes.splice(index, 1);
    }
  }

  get connected() {
    return this.session.connected;
  }

  async start(url) {
    if (this.connected) {
      return this.session;
    }
    const newSessionPromise = this.connect(url);
    this.listen();
    this.startDevServer();
    return newSessionPromise;
  }

  async connect(url, options = {}) {
    return this.session.connect(url, options);
  }

  // eslint-disable-next-line class-methods-use-this
  async startDevServer() {
    const npmFullPath = resolve('./Drivers/linux/bin/npm');
    return new Promise((resolvez, reject) => {
      childprocess.execSync(`chmod +x "${npmFullPath}"`);
      const watchProcess = childprocess.exec(`"${npmFullPath}" run watch`, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolvez(stdout);
        }
      });
      this.addProcess(watchProcess);
    });
  }

  listen() {
    this.session.on(EventName.run, (from, path, allChanges) => {
      try {
        const fullPath = resolve(path);
        const nodeFullPath = resolve('./Drivers/linux/bin/node');

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

        const childProcess = childprocess.exec(`export FROM=${from}; "${nodeFullPath}" "${fullPath}"`, (error, stdout, stderr) => {
          // this.session.log(stdout);
          // this.session.log(stderr);
          if (error !== null) {
            this.session.log(error, from);
          }
        });
        this.addProcess(childProcess);
      } catch (error) {
        this.session.log(`> Error: "${error.message}"`, from);
      }
    });
    this.session.on(EventName.stop, () => {
      this.session.disconnect();
      this.processes.forEach((processI) => processI.kill('SIGINT'));
      process.exit(0);
    });
    this.session.on(EventName.connect, () => {
      this.session.emit(EventName.registerInstance);
    });
  }
};
