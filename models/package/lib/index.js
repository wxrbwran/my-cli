'use strict';
const path = require('path');
const npminstall = require('npminstall');
const pkgDir = require('pkg-dir').sync;
const utils = require('@xzl-cli-dev/utils');
const { formatPath } = require('@xzl-cli-dev/format-path');
const { getNpmInfo, getDefaultRegistry } = require('@xzl-cli-dev/get-npm-info');

class Package {
  constructor(opts) {
    if (!opts || !utils.isObject(opts)) {
      console.log('Package 类参数对象不能为空');
    } else {
      this.targetPath = opts.targetPath;
      this.storeDir = opts.storeDir;
      this.packageName = opts.packageName;
      this.packageVersion = opts.packageVersion;
    }
  }
  //判断当前Package是否存在
  exists() {}
  // 安装
  install() {
    console.log('this', this);
    return npminstall({
      root: this.targetPath,
      storeDir: this.storeDir,
      registry: getDefaultRegistry(),
      pkgs: [{ name: this.packageName, version: this.packageVersion }],
    });
  }
  // 更新
  update() {}
  //获取入口文件的路径
  getRootPath() {
    const dir = pkgDir(this.targetPath);
    if (dir) {
      const pkgFile = require(path.resolve(dir, 'package.json'));
      console.log('pkgFile', pkgFile);
      if (pkgFile && (pkgFile.main || pkgFile.lib)) {
        return formatPath(path.resolve(dir, pkgFile.main));
      }
    }
    return null;
  }
}

module.exports = Package;
