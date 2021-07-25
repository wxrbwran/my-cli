'use strict';
const log = require('@xzl-cli-dev/log');
const Package = require('@xzl-cli-dev/package');

const SETTINGS = {
  init: '@xzl-cli-dev/init',
};

function exec() {
  // log.verbose('exec', args);
  const cmdObj = arguments[arguments.length - 1];
  // log.verbose('exec cmdObj', cmdObj.opts().force);
  log.verbose('exec cmdObj', cmdObj.name());
  const cmdName = cmdObj.name();
  const packageName = SETTINGS[cmdName];
  const packageVersion = 'latest';

  const targetPath = process.env.CLI_TARGET_PATH;
  const homePath = process.env.CLI_HOME_PATH;

  const pkg = new Package({ targetPath, homePath, packageName, packageVersion });
  console.log('Package', pkg);
}
module.exports = exec;
