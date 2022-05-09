const {
  SessionManager
} = require('../../katalon');


const sessionManager = new SessionManager();

// sessionManager.start('ws://localhost:3000');
sessionManager.start('wss://katalon-tunnel.herokuapp.com');
