'use strict';
const path = require('path');
const log = require('@xzl-cli-dev/log');
const Package = require('@xzl-cli-dev/package');

const SETTINGS = {
  init: '@xzl-cli-dev/init',
};

const CACHE = 'dependencies';

async function exec() {
  // log.verbose('exec', args);
  const cmdObj = arguments[arguments.length - 1];
  // log.verbose('exec cmdObj', cmdObj.opts().force);
  log.verbose('exec cmdObj', cmdObj.name());
  const cmdName = cmdObj.name();
  const packageName = SETTINGS[cmdName];
  const packageVersion = 'latest';

  let targetPath = process.env.CLI_TARGET_PATH;
  const homePath = process.env.CLI_HOME_PATH;
  let storeDir = '';

  if (!targetPath) {
    targetPath = path.resolve(homePath, CACHE);
  }
  storeDir = path.resolve(targetPath, 'node_modules');

  log.verbose('targetPath', targetPath);
  log.verbose('storeDir', storeDir);
  const pkg = new Package({ targetPath, storeDir, packageName, packageVersion });
  console.log('pkg', pkg);
  console.log('pkg.exists()', pkg.exists());
  if (pkg.exists()) {
    // 更新
  } else {
    // 安装
    await pkg.install();
  }

  const rootFile = pkg.getRootPath();
  log.verbose('rootFile', rootFile);
  if (rootFile) {
    require(rootFile).apply(null, arguments);
  }
}
module.exports = exec;
