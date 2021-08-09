'use strict';
const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const ejs = require('ejs');
const inquirer = require('inquirer');
const semver = require('semver');
const kebab = require('kebab-case');
const { homedir } = require('os');
const Command = require('@xzl-cli-dev/command')
const log = require('@xzl-cli-dev/log');
const utils = require('@xzl-cli-dev/utils');
const Package = require('@xzl-cli-dev/package');
// const getProjectTemplate = require('./getProjectTemplate')
const templates = require('./template');

const TYPE_PROJECT = 'project';
// const TYPE_COMPONENT = 'component';

const TEMPLATE_TYPE_NORMAL = 'normal';
const TEMPLATE_TYPE_CUSTOM = 'custom';

const WHITE_COMMAND = ['npm', 'cnpm', 'yarn']

class InitCommand extends Command {
  init() {
    // console.log('this._argv', this._argv)
    this.projectName = this._argv[0] || '';
    log.verbose('projectName', this.projectName);
    this.force = this._argv[1].force;
    log.verbose('force', this.force);
  }
  async exec() {
    try {
      // 1. 准备阶段
      const projectInfo = await this.prepare();
      if (projectInfo) {
        // 2. 下载模版
        log.verbose('projectInfo', projectInfo);
        this.projectInfo = projectInfo;
        await this.downloadTemplate(projectInfo);
        // 3. 安装模版
        await this.installTemplate();
      }
    } catch (e) {
      log.error(e.message);
    }
  }
  async prepare() {
    // 0. 判断项目模版是否存在
    // const template = await getProjectTemplate();
    const template = templates;
    // console.log('template', template);
    if (template?.length === 0) {
      throw new Error('模版不存在');
    }
    this.template = template;
    // 1. 判断当前目录是否为空
    const ret = this.isCwdEmpty();
    // console.log('isCwdEmpty', ret);
    if (!ret) {
      // 1.1 不为空，是否继续创建
      let ifContinue = !!this.force;
      if (!this.force) {
        const anwser = await inquirer.prompt({
          type: 'confirm',
          name: 'ifContinue',
          message: '当前文件夹不为空，是否继续创建?',
        });
        // console.log('anwser', anwser);
        ifContinue = anwser.ifContinue;
        if (!ifContinue) {
          return;
        }
      }
      // 2. 是否启动强制更新
      if (ifContinue) {
        // 1.2 二次确认
        const anwserConfirm = await inquirer.prompt({
          type: 'confirm',
          name: 'confirDelete',
          message: '是否清空当前文件夹？',
        });
        // 清空当前目录
        if (anwserConfirm.confirDelete) {
          fs.emptyDirSync(process.cwd());
          // return true;
        }
      }
    }
    // 项目的基本信息 object
    return await this.getProjectInfo();
  }
  async getProjectInfo() {
    let projectInfo = {};
    // 3. 选择创建项目或者组件
    const type = TYPE_PROJECT;
    log.verbose('type', type);
    // console.log('getProjectInfo type', type);
    if (type === TYPE_PROJECT) {
      // 4. 获取项目的基本信息
      const inputPromt = {
        type: 'input',
        message: '请输入项目名称',
        name: 'projectName',
        default: '',
        validate(v) {
          // 对项目名称进行校验
          return typeof v === 'string' && !!v;
        },
        filter(v) {
          return v;
        },
      };
      const projectpromt = [
        {
          type: 'input',
          message: '请输入项目版本号',
          name: 'projectVersion',
          default: '0.0.1',
          validate: function (v) {
            // 对项目版本进行校验
            return !!semver.valid(v);
          },
          filter: function (v) {
            if (semver.valid(v)) {
              return semver.valid(v);
            }
            return v;
          },
        },
        {
          type: 'list',
          message: '请选择项目模版',
          name: 'projectTemplate',
          choices: this.createTemplateChoic(),
        },
      ];
      let project;
      if (this.projectName && typeof this.projectName === 'string' && !!this.projectName) {
        project = await inquirer.prompt(projectpromt);
        project.projectName = this.projectName;
      } else {
        project = await inquirer.prompt([inputPromt, ...projectpromt]);
      }
      // console.log('o', project);
      projectInfo = { type, ...project, version: project.projectVersion };
    }
    if (projectInfo.projectName) {
      projectInfo.className = kebab(projectInfo.projectName).replace(/^-/, "");
    }

    return projectInfo;
  }
  isCwdEmpty() {
    const localPath = process.cwd();
    const fileList = fs.readdirSync(localPath);
    // console.log("localPath", localPath);
    return fileList?.length <= 0;
  }
  createTemplateChoic() {
    return this.template.map((template) => ({
      name: template.name,
      value: template.npmName,
    }));
  }
  async downloadTemplate() {
    // console.log(this.projectInfo, this.template);
    const { projectTemplate } = this.projectInfo;
    const templateInfo = this.template.find((template) => template.npmName === projectTemplate);
    this.templateInfo = templateInfo;
    log.verbose('templateInfo', templateInfo);
    // console.log('templateInfo', templateInfo);
    // console.log('userHome', homedir());

    const targetPath = path.resolve(homedir(), '.xzl-cli-dev', 'template');
    const storeDir = path.resolve(targetPath, 'node_modules');
    // console.log('targetPath', targetPath);
    // console.log('storeDir', storeDir);
    const { npmName, version } = templateInfo;
    const templateNpm = new Package({
      targetPath,
      storeDir,
      packageName: npmName,
      packageVersion: version,
    });

    // console.log('npmName', npmName);
    // console.log('version', version);
    // console.log('templateNpm', templateNpm);
    const exist = await templateNpm.exists();
    const spinner = utils.spinnerStart('正在下载模版...', '🐭🐂🐯🐰🐲🐍🐎🐑🐒🐔🐶🐷');
    try {
      if (!exist) {
        // console.log('downloadTemplate install');
        await templateNpm.install();
      } else {
        // console.log('downloadTemplate update');
        await templateNpm.update();
      }
    } catch (err) {
      throw err;
    } finally {
      spinner.stop(true);
      this.templateNpm = templateNpm;
    }

    // 1.  通过项目模版api获取项目模版信息
    // 1.1 通过egg.js 搭建一套后端系统
    // 1.2 通过npm存储项目模版
    // 1.3 将项目模版信息存储到mongodb中
    // 1.4 通过egg.js获取mongodb中的数据
  }
  async installTemplate() {
    // console.log('installTemplate', this.templateInfo);
    if (this.templateInfo) {
      if (!this.templateInfo.type) {
        this.templateInfo.type = TEMPLATE_TYPE_NORMAL;
      }
      if (this.templateInfo.type === TEMPLATE_TYPE_NORMAL) {
        // 标准安装
        await this.installNormalTemplate();
      } else if (this.templateInfo.type === TEMPLATE_TYPE_CUSTOM) {
        //自定义安装
        await this.installCustomTemplate();
      } else {
        throw new Error('无法识别项目模版信息');
      }
    } else {
      throw new Error('项目模版信息不存在');
    }
  }

  async execCommand(commandString) {
    let ret = null;
    commandString = commandString.split(' ');
    let [cmd, ...args] = commandString;
    cmd = this.checkCommand(cmd);
    // console.log(cmd, args);
    ret = await utils.execAsync(cmd, args, { stdio: 'inherit', cwd: process.cwd() });
       // console.log("ret", installRet);
    if (ret !== 0) {
      throw new Error('命令执行失败: ' + commandString);
    }
  }

  async ejsRender(option) {
    const dir = process.cwd();
    const projectInfo = this.projectInfo;
    return new Promise((resolve, reject) => {
      glob(
        '**',
        {
          cwd: dir,
          nodir: true,
          ignore: option.ignore || [],
        },
        (err, files) => {
          if (err) {
            throw err;
          }
          // console.log(files);
          Promise.all(
            files.map((file) => {
              const filePath = path.resolve(dir, file);
              console.log(filePath);
              return new Promise((resolveInner, rejectInner) => {
                // console.log('renderFile projectInfo', projectInfo);
                ejs.renderFile(filePath, projectInfo, (err, res) => {
                  // console.log(err, res);
                  if (err) {
                    rejectInner(err);
                  } else {
                    fs.writeFileSync(filePath, res)
                    resolveInner(res);
                  }
                });
              });
            }),
          )
            .then(() => {
              resolve();
            })
            .catch((e) => {
              reject(e);
            });
        },
      );
    })
  }

  async installNormalTemplate() {
    log.verbose('templateNpm', this.templateNpm);
    // console.log('installNormalTemplate');
    // console.log(this.templateNpm);
    // console.log(this.templateNpm.cacheFilePath);
    // 拷贝模版代码至当前目录
    const spinner = utils.spinnerStart("正在安装模版...");
    try {
      const templatePath = path.resolve(this.templateNpm.cacheFilePath, 'template');
      const targetPath = process.cwd();
      fs.ensureDirSync(templatePath);
      fs.ensureDirSync(targetPath);
      fs.copySync(templatePath, targetPath);
    } catch (e) {
      throw e;
    } finally {
      spinner.stop(true);
    }
    const ignore = ['node_modules/**', '**/*.png', '**/*.jpg', '**/*.ico', '**/*.svg', "public/**"];
    await this.ejsRender({ ignore });
    // 依赖安装
    // console.log(this.templateInfo);
    let { installCommand, startCommand } = this.templateInfo;
    if (installCommand) {
      await this.execCommand(installCommand);
    }
    // 启动命令执行
    if (startCommand) {
      await this.execCommand(startCommand);
    }

  }
  async installCustomTemplate() {
    // console.log('installCustomTemplate');
    // const { installCommand, startCommand } = this.templateInfo;
    // if (installCommand) {
    //   installCommand = installCommand.split(' ');
    //   const [cmd, ...args] = installCommand;
    //   console.log(cmd, args);
    // }
  }
  checkCommand(cmd) {
    if (WHITE_COMMAND.includes(cmd)) {
      return cmd;
    }
    throw new Error("目前只支持npm/cnpm/yarn命令: " + cmd);
  }
}

function init(argv) {
  return new InitCommand(argv);
}

module.exports = init

module.exports.InitCommand = InitCommand;
