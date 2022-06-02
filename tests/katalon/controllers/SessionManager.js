const {
  existsSync, writeFileSync, rmSync
} = require('fs');
const path = require('path');
const KatalonSession = require('../core/KatalonSession');
const EventName = require('../utils/EventName');
const CProcess = require('./CProcess');

module.exports = class SessionManager {
  session = new KatalonSession();

  processes = [];

  shell;

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
    this.session.log('> npm install...');
    await CProcess.exec({
      command: 'npm install',
      onMessage: (log = '') => {
        const trimmedLog = log?.endsWith('\r\n') ? log.slice(0, -2) : log;
        this.session.log(trimmedLog);
      },
      onError: (errorLog = '') => {
        const trimmedLog = errorLog?.endsWith('\r\n') ? errorLog.slice(0, -2) : errorLog;
        this.session.log(trimmedLog);
      }
    });

    this.session.log('> npm run watch...');
    await CProcess.exec({
      command: 'npm run watch',
      onMessage: (log = '') => {
        const trimmedLog = log?.endsWith('\r\n') ? log.slice(0, -2) : log;
        this.session.log(trimmedLog);
        if (trimmedLog.includes('compiled successfully in')) {
          this.notifyRebuild();
        }
      },
      // onError: (errorLog) => {
      //   this.session.log('> Watch error');
      //   this.session.log(errorLog);
      // }
    });
  }

  async waitForRebuild() {
    return new Promise((resolve, reject) => {
      this.resolveRebuild = resolve;
      this.rejectRebuild = reject;
    });
  }

  notifyRebuild(error) {
    if (error) {
      this.rejectRebuild?.();
    } else {
      this.resolveRebuild?.();
    }
  }

  async runScript({
    from, scriptPath, onMessage, onError
  }) {
    const scriptProcess = CProcess.build({
      command: `export FROM=${from}; node "${scriptPath}"`,
      onMessage,
      onError,
      onEnd: () => {
        this.removeProcess(scriptProcess);
      }
    });
    this.addProcess(scriptProcess);
  }

  async applyChange({
    allChanges, onError, onMessage, from
  }) {
    const added = allChanges?.match(/^\+[^+]/gm)?.length || 0;
    const removed = allChanges?.match(/^-[^-]/gm)?.length || 0;
    this.session.log(`> Apply changes (+${added}, -${removed})`, from);
    const patchFile = 'patch.diff';
    try {
      writeFileSync(patchFile, allChanges);
      await CProcess.exec({
        command: 'git reset --hard',
        // command: 'git restore -s@ -SW  -- build',
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

  listen() {
    this.session.on(EventName.run, async (from, filePath, allChanges) => {
      const onMessage = (log) => {
        this.session.log(log, from);
      };
      const onError = (error) => {
        this.session.log(error, from);
      };
      try {
        const hasChange = allChanges?.length;
        if (hasChange) {
          await this.applyChange({
            allChanges, onError, onMessage, from
          });
        }

        const scriptPath = path.resolve(filePath);
        onMessage(`Run script: "${scriptPath}"`);
        if (!existsSync(scriptPath)) {
          onMessage(`> File not found: "${scriptPath}"`);
          return;
        }

        // On build successfully -> Run script
        if (hasChange) {
          await this.waitForRebuild();
        }
        this.runScript({
          scriptPath, from, onError
        });
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
      if (!this.shell) {
        this.shell = CProcess.build({
          command: 'sh',
          onMessage: (log) => {
            this.session.log(log, from);
          },
          onError: (error) => {
            this.session.log(error, from);
          },
          onEnd: () => {
            this.shell = null;
          }
        });
      }
      this.shell.stdin.write(`${command}\r\n`);
    });
    this.session.on(EventName.connect, () => {
      this.session.emit(EventName.registerInstance);
    });
  }
};
