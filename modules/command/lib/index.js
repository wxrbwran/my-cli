'use strict';
const semver = require('semver');
const colors = require('colors/safe');
const log = require('@xzl-cli-dev/log')
// const {isObject} = require('@xzl-cli-dev/utils');

const { LOWEST_NODE_VERSION, DEFAULT_CLI_HOME } = require('./const');


class Command {
  constructor(argv) {
    // console.log('constructor', argv, typeof argv);
    // if (typeof argv === 'string') {
    //   argv = JSON.parse(argv);
    // console.log('constructor2', argv, typeof argv);
    // }
    if (!argv) {
      throw new Error('参数不能为空')
    }
    if (!Array.isArray(argv)) {
      throw new Error('参数必须为数组');
    }
    if (argv.length < 1) {
      throw new Error('参数列表为空');
    }
    this._argv = argv;
    this.runner = new Promise((resolve, reject) => {
      let chain = Promise.resolve();
      chain = chain.then(() => this.checkNodeVersion());
      chain = chain.then(() => this.initArgs());
      chain = chain.then(() => this.init());
      chain = chain.then(() => this.exec());

      chain.catch((err) => log.error(err.message));
    });
  }

  checkNodeVersion() {
    const currentNodeVersion = process.version;
    // log.info('cli', currentNodeVersion);
    const lowestNodeVersion = LOWEST_NODE_VERSION;
    if (semver.lt(currentNodeVersion, lowestNodeVersion)) {
      throw new Error(colors.red(`xzl-cli需要安装${LOWEST_NODE_VERSION}版本以上的Node.js`));
    }
  }
  initArgs() {
    const length = this._argv.length
    this._cmd = this._argv[length - 1];
    // this._argv = this._argv.slice(0, length - 1);
    // console.log(1, this._cmd)
    // console.log(2, this._argv);

  };
  init() {
    throw new Error('init必须实现');
  }

  exec() {
    throw new Error('exec必须实现');
  }
}


module.exports = Command;
