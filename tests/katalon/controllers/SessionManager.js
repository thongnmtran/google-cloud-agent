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
    // this.startDevServer().catch((error) => {
    //   this.session.log('[Warn]> Unable to start dev server');
    //   this.session.log(error.message);
    // });
    return newSession;
  }

  async connect(url, options = {}) {
    return this.session.connect(url, options);
  }

  // eslint-disable-next-line class-methods-use-this
  async startDevServer() {
    this.session.log('> npm install...');
    await CProcess.exec({
      command: 'npm install',
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
      command: 'npm run watch',
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
    this.session.on(EventName.run, async (from, path, allChanges) => {
      const onMessage = (log) => {
        this.session.log(log, from);
      };
      const onError = (error) => {
        this.session.log(error, from);
      };
      try {
        if (allChanges?.length) {
          const added = allChanges?.match(/^\+[^+]/gm)?.length || 0;
          const removed = allChanges?.match(/^-[^-]/gm)?.length || 0;
          this.session.log(`> Apply changes (+${added}, -${removed})`, from);
          const patchFile = 'patch.diff';
          try {
            writeFileSync(patchFile, allChanges);
            // const diff = readFileSync(patchFile);
            // this.session.log(diff.toString(), from);
            await CProcess.exec({
              command: 'git reset --hard',
              onMessage,
              onError
            });
            await CProcess.exec({
              command: `git apply ${patchFile}`,
              onMessage,
              onError
            });
          } catch {
            //
          } finally {
            rmSync(patchFile, { force: true });
          }
        }

        const fullPath = resolve(path);
        const nodeFullPath = resolve('./Drivers/node');
        childprocess.execSync(`chmod +x "${nodeFullPath}"`);

        onMessage(`Run script: "${fullPath}"`);
        if (!existsSync(nodeFullPath)) {
          onMessage(`> File not found: "${fullPath}"`);
          return;
        }

        const childProcess = childprocess.exec(`export FROM=${from}; "${nodeFullPath}" "${fullPath}"`, (error, stdout, stderr) => {
          this.removeProcess(childProcess);
          // onMessage(stdout);
          // onMessage(stderr);
          if (error !== null) {
            onError(error?.message);
          }
        });
        this.addProcess(childProcess);
      } catch (error) {
        onError(error?.message);
      }
    });
    this.session.on(EventName.stop, () => {
      this.session.disconnect();
      this.processes.forEach((processI) => processI.kill('SIGINT'));
      process.exit(0);
    });
    this.session.on(EventName.command, async (from, command) => {
      const onMessage = (log) => {
        this.session.log(log, from);
      };
      const onError = (error) => {
        this.session.log(error, from);
      };
      await CProcess.exec({
        command,
        onMessage,
        onError
      });
    });
    this.session.on(EventName.connect, () => {
      this.session.emit(EventName.registerInstance);
    });
  }
};
