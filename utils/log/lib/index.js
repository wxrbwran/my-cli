'use strict';

const log = require('npmlog');

log.level = process.env.LOG_LEVEL || 'info';
log.heading = 'go! ';

log.addLevel('success', 2000, { fg: 'green', bold: true, bg: 'grey' });

module.exports = log;

// function index() {
//   log.info('cli', 'test');
// }
