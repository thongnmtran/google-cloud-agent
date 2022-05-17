const childprocess = require('child_process');
const { resolve } = require('path');
const KatalonSession = require('../core/KatalonSession');

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
    this.firstSession.on('run', (path) => {
      const fullPath = resolve(path);
      const nodeFullPath = resolve('./Drivers/node');
      childprocess.exec(`"${nodeFullPath}" "${fullPath}"`, (error, stdout, stderr) => {
        this.firstSession.log(stdout);
        this.firstSession.log(stderr);
        if (error !== null) {
          this.firstSession.log(error);
        }
      });
    });
    this.firstSession.on('stop', (path) => {
      this.firstSession.disconnect();
      process.exit(0);
    });
    this.firstSession.on('sessions', (sessions) => {
      console.log('> Online sessions: ', sessions);
    });
    this.firstSession.on('connect', () => {
      this.firstSession.emit('register-agent');
    });
  }
};
