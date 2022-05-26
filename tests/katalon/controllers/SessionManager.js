const childprocess = require('child_process');
const {
  existsSync, writeFileSync, rmSync, watchFile, unwatchFile
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
        this.session.log(trimmedLog?.split('\r\n')?.slice(-1)[0]);
      },
      // onError: (errorLog) => {
      //   this.session.log('> Watch error');
      //   this.session.log(errorLog);
      // }
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
        const hasChange = allChanges?.length;
        if (hasChange) {
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

        const scriptPath = resolve(path);
        const nodePath = 'node';

        onMessage(`Run script: "${scriptPath}"`);
        if (!existsSync(scriptPath)) {
          onMessage(`> File not found: "${scriptPath}"`);
          return;
        }

        const runScript = () => {
          const childProcess = childprocess.exec(`export FROM=${from}; "${nodePath}" "${scriptPath}"`, (error, stdout, stderr) => {
            this.removeProcess(childProcess);
            // onMessage(stdout);
            // onMessage(stderr);
            if (error !== null) {
              onError(error?.message);
            }
          });
          this.addProcess(childProcess);
        };

        // On build successfully -> Run script
        if (hasChange) {
          const onBuildDone = () => {
            unwatchFile(scriptPath, onBuildDone);
            runScript();
          };
          watchFile(scriptPath, onBuildDone);
        } else {
          runScript();
        }
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
