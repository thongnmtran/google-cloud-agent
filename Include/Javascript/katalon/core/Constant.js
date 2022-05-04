
module.exports.EventType = {
  open: 'open',
  close: 'close',
  message: 'message',
  error: 'error',
  ready: 'ready'
};

module.exports.KatalonType = {
  WebUI: 'WebUI',
  WS: 'WS',
  Windows: 'Windows',
  Mobile: 'Mobile',
  FailureHandling: 'FailureHandling',
  findTestObject: 'findTestObject',
  KatalonDriver: 'KatalonDriver'
};

module.exports.ResponseMsgKey = {
  data: Symbol('data'),
};
