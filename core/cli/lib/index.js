'use strict';
const path = require('path');
const semver = require('semver');
const colors = require('colors/safe');
const rootCheck = require('root-check');
const userHome = require('user-home');
const pathExists = require('path-exists').sync;
const commander = require('commander');
const log = require('@xzl-cli-dev/log');
const exec = require('@xzl-cli-dev/exec');
const init = require('@xzl-cli-dev/init');
const pkg = require('../package.json');
const { LOWEST_NODE_VERSION, DEFAULT_CLI_HOME } = require('./const');

let args, config;
const program = new commander.Command();

async function core() {
  try {
    await prepare();
    registerCommand();
  } catch (err) {
    log.error(err.message);
    console.log(err);
  }
}

async function prepare() {
  checkPkgVersion();
  checkNodeVersion();
  checkRoot();
  checkUserHome();
  checkEnv();
  await checkGlobalUpdate();
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
}

function checkUserHome() {
  log.info('cli', userHome);
  if (!userHome || !pathExists(userHome)) {
    throw new Error('当前登录用户主目录不存在！');
  }
}

function checkEnv() {
  const dotenv = require('dotenv');
  const dotenvPath = path.resolve(userHome, '.env');
  if (pathExists(dotenvPath)) {
    config = dotenv.config({
      path: dotenvPath,
    });
  }
  createDefaultConfig();
  // log.verbose('环境变量', process.env.CLI_HOME_PATH);
}

function createDefaultConfig() {
  const cliConfig = {
    home: userHome,
  };
  if (process.env.CLI_HOME) {
    cliConfig['cliHome'] = path.join(userHome, process.env.CLI_HOME);
  } else {
    cliConfig['cliHome'] = path.join(userHome, DEFAULT_CLI_HOME);
  }
  process.env.CLI_HOME_PATH = cliConfig.cliHome;
  // return cliConfig;
}

async function checkGlobalUpdate() {
  const currentVersion = pkg.version;
  const pkgName = pkg.name;
  log.verbose('检查版本号', currentVersion);
  const { getNpmSemserVersions } = require('@xzl-cli-dev/get-npm-info');
  const hasNewVersion = await getNpmSemserVersions(pkgName, currentVersion);
  if (hasNewVersion) {
    log.warn(
      colors.yellow(
        '更新提醒',
        `请更新${pkgName}, 当前版本${currentVersion}, 最新版版${hasNewVersion}`,
      ),
    );
  }
}

function registerCommand() {
  program
    .name(Object.keys(pkg.bin)[0])
    .version(pkg.version)
    .usage('<command> [options]')
    .option('-d --debug', '是否开启调试模式', false)
    .option('-tp --targetPath <targetPath>', '是否指定本地调试文件路径', '');

  program
    .command('init [projectName]')
    .option('-f, --force', '目录不为空时，是否强制初始化项目')
    .action(exec);

  // debug模式
  program.on('option:debug', () => {
    process.env.LOG_LEVEL = 'verbose';
    log.level = process.env.LOG_LEVEL;
    log.verbose('ye~', '启用debug模式');
  });

  program.on('option:targetPath', () => {
    // console.log('0', program.opts());
    // console.log('1', program.opts().targetPath);
    process.env.CLI_TARGET_PATH = program.opts().targetPath;
  });

  // 对未知命令的监听
  program.on('command:*', (unknownCmds) => {
    const availableCmds = program.commands.map((cmd) => cmd.name());
    log.error('未知的命令', unknownCmds[0]);
    if (availableCmds.length > 0) {
      log.info('可用的命令', availableCmds.join(','));
    }
  });

  program.parse(process.argv);
  // console.log('program args', program.args);

  if (program.args && program.args.length < 1) {
    program.outputHelp();
    console.log();
  }
}

module.exports = core;
