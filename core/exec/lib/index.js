'use strict';
const path = require('path');
const log = require('@xzl-cli-dev/log');
const Package = require('@xzl-cli-dev/package');
const cp = require('child_process');

const SETTINGS = {
  init: '@xzl-cli-dev/init',
};

const CACHE = 'dependencies';

async function exec() {
  // log.verbose('exec', args);
  const cmdObj = arguments[arguments.length - 1];
  log.verbose('exec cmdObj', cmdObj.opts());
  log.verbose('exec cmdObj', cmdObj.name());
  const cmdName = cmdObj.name();
  const packageName = SETTINGS[cmdName];
  const packageVersion = 'latest';

  let targetPath = process.env.CLI_TARGET_PATH;
  const homePath = process.env.CLI_HOME_PATH;
  let storeDir = '';
  let pkg = null;
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
      console.log('argsString', argsString);
      const code = `require('${rootFile}').call(null, ${argsString})`;
      // const code = "console.log(1);"
      const child = spawn('node', ['-e', code], {
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
        console.log('命令执行成功', e);
        process.exit(e);
      });
    } catch (e) {
      log.error(e.message);
    }
  }
}

function spawn(command, args, options) {
  const win32 = process.platform === 'win32';
  const cmd = win32 ? 'cmd' : command;
  const _args = win32 ? ['/c'].concat(command, args) : args;
  return cp.spawn(cmd, _args, options || {});
}

module.exports = exec;
