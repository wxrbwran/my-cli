'use strict';
const path = require('path');
const log = require('@xzl-fe/log');
const utils = require('@xzl-fe/utils');

const Package = require('@xzl-fe/package');

const SETTINGS = {
  init: '@xzl-fe/init',
};

const CACHE = 'dependencies';

async function exec() {
  // log.verbose('exec', args);
  const cmdObj = arguments[arguments.length - 1];
  log.verbose('exec opts', cmdObj.opts());
  log.verbose('exec name', cmdObj.name());
  const cmdName = cmdObj.name();
  const packageName = SETTINGS[cmdName];
  const packageVersion = 'latest';

  let targetPath = process.env.CLI_TARGET_PATH;
  const homePath = process.env.CLI_HOME_PATH;
  let storeDir = '';
  let pkg = null;
  // console.log('targetPath', targetPath);
  log.verbose('exec targetPath', targetPath);
  if (!targetPath) {
    targetPath = path.resolve(homePath, CACHE);
    storeDir = path.resolve(targetPath, 'node_modules');
    pkg = new Package({ targetPath, storeDir, packageName, packageVersion });
    // console.log('pkg', pkg);
    if (await pkg.exists()) {
      // 更新
      await pkg.update();
    } else {
      // 安装
      await pkg.install();
    }
  } else {
    pkg = new Package({ targetPath, packageName, packageVersion });
  }
  // console.log('pkg.exists()', await pkg.exists());

  log.verbose('targetPath', targetPath);
  log.verbose('storeDir', storeDir);

  const rootFile = pkg.getRootPath();
  log.verbose('rootFile', rootFile);
  if (rootFile) {
    try {
      const args = Array.from(arguments);
      args.length = 2;
      // require(rootFile).call(null, args)
      const argsString = JSON.stringify(args);
      // console.log('argsString', argsString);
      const code = `require('${rootFile}').call(null, ${argsString})`;
      // const code = "console.log(1);"
      const child = utils.exec('node', ['-e', code], {
        stdio: 'inherit',
        cwd: process.cwd(),
      });
      child.on("error", (e) => {
        log.error(e.message);
        log.error(e);
        process.exit(1);
      })
      child.on('exit', (e) => {
        log.verbose("命令执行成功", e);
        process.exit(e);
      });
    } catch (e) {
      log.error(e.message);
    }
  }
}


module.exports = exec;
