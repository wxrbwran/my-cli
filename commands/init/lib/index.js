'use strict';
const Command = require('@xzl-cli-dev/command')
const log = require('@xzl-cli-dev/log');

class InitCommand extends Command {
  init() {
    // console.log('this._argv', this._argv)
    this.projectName = this._argv[0] || "";
    log.verbose("projectName", this.projectName);
    this.force = this._argv[1].force
    log.verbose('force', this.force);
  }
}

function init(argv) {
  return new InitCommand(argv);
}

module.exports = init

module.exports.InitCommand = InitCommand;
