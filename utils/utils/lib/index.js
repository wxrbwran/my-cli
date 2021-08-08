'use strict';
const Spinner = require('cli-spinner').Spinner;
const cp = require('child_process');
function isObject(o) {
    return Object.prototype.toString.call(o) === '[object Object]';
  }
function  spinnerStart(msg, spinnerString = '|/=\\') {
  const spinnerInstance = new Spinner(`${msg}...%s`);
  spinnerInstance.setSpinnerString(spinnerString);
  spinnerInstance.start();
  return spinnerInstance;
}
function  exec(command, args, options) {
  const win32 = process.platform === 'win32';
  const cmd = win32 ? 'cmd' : command;
  const _args = win32 ? ['/c'].concat(command, args) : args;
  return cp.spawn(cmd, _args, options || {});
}

function execAsync(command, args, options) {
  return new Promise((resolve, reject) => {
    const p = exec(command, args, options);
    p.on('error', (e) => {
      reject(e);
    });
    p.on('exit', (c) => {
      resolve(c);
    });
  });
}

module.exports = {
  isObject,
  spinnerStart,
  exec,
  execAsync
};
