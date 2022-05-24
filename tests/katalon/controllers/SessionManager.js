const childprocess = require('child_process');
const {
  existsSync, writeFileSync, rmSync, readFileSync
} = require('fs');
const { resolve } = require('path');
const KatalonSession = require('../core/KatalonSession');
const EventName = require('../utils/EventName');
const CProcess = require('./CProcess');

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
    const newSession = this.connect(url);
    this.listen();
    this.startDevServer().catch((error) => {
      this.session.log('[Warn]> Unable to start dev server');
      this.session.log(error.message);
    });
    return newSession;
  }

  async connect(url, options = {}) {
    return this.session.connect(url, options);
  }

  // eslint-disable-next-line class-methods-use-this
  async startDevServer() {
    const npmFullPath = resolve('./Drivers/linux/lib/node_modules/npm/bin/npm');
    childprocess.execSync(`chmod +x "${npmFullPath}"`);

    // childprocess.execSync(`"${npmFullPath}" install -g lib.cli`);
    rmSync('./Drivers/linux/lib/node_modules', { recursive: true, force: true });

    this.session.log('> npm install...');
    await CProcess.exec({
      command: `"${npmFullPath}" install`,
      onMessage: (log) => {
        this.session.log(`> Install log ${log?.length}`);
        this.session.log(log);
      },
      onError: (errorLog) => {
        this.session.log('> Install error');
        this.session.log(errorLog);
      }
    });

    this.session.log('> npm run watch...');
    await CProcess.exec({
      command: `"${npmFullPath}" run watch`,
      onMessage: (log) => {
        this.session.log(`> Watch log ${log?.length}`);
        this.session.log(log);
      },
      onError: (errorLog) => {
        this.session.log('> Watch error');
        this.session.log(errorLog);
      }
    });
  }

  listen() {
    this.session.on(EventName.run, (from, path, allChanges) => {
      try {
        const fullPath = resolve(path);
        const nodeFullPath = resolve('./Drivers/linux/bin/node');
        childprocess.execSync(`chmod +x "${nodeFullPath}"`);

        if (allChanges?.length) {
          this.session.log(`> Apply changes (${allChanges?.length})`, from);
          const patchFile = 'patch.diff';
          try {
            writeFileSync(patchFile, allChanges);
            // const diff = readFileSync(patchFile);
            // this.session.log(diff.toString(), from);
            childprocess.execSync(`git apply ${patchFile}`);
          } catch {
            //
          } finally {
            rmSync(patchFile, { force: true });
          }
        }

        this.session.log(`Run script: "${fullPath}"`, from);
        if (!existsSync(nodeFullPath)) {
          this.session.log(`> File not found: "${fullPath}"`, from);
          return;
        }

        const childProcess = childprocess.exec(`export FROM=${from}; "${nodeFullPath}" "${fullPath}"`, (error, stdout, stderr) => {
          this.removeProcess(childProcess);
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
