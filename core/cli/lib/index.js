'use strict';

const semver = require('semver');
const colors = require('colors/safe');
const rootCheck = require('root-check');
const userHome = require('user-home');
const pathExists = require('path-exists');

const log = require('@xzl-cli-dev/log');
const pkg = require('../package.json');
const { LOWEST_NODE_VERSION } = require('./const');

function core() {
  try {
    checkPkgVersion();
    checkNodeVersion();
    checkRoot();
    checkUserHome();
  } catch (err) {
    log.error(err.message);
  }
}

function checkPkgVersion() {
  log.info('cli', pkg.version);
}
function checkNodeVersion() {
  const currentNodeVersion = process.version;
  log.info('cli', currentNodeVersion);
  const lowestNodeVersion = LOWEST_NODE_VERSION;
  if (semver.lt(currentNodeVersion, lowestNodeVersion)) {
    throw new Error(colors.red(`xzl-cli需要安装${LOWEST_NODE_VERSION}版本以上的Node.js`));
  }
}

function checkRoot() {
  rootCheck();
  // log.info('cli', process.getuid());
}

function checkUserHome() {
  log.info('cli', userHome);
  if (!userHome || !pathExists(userHome)) {
    throw new Error('当前登录用户主目录不存在！');
  }
}
module.exports = core;
