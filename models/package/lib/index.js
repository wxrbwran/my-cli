'use strict';
const utils = require('@xzl-cli-dev/utils');

class Package {
  constructor(opts) {
    if (!opts || !utils.isObject(opts)) {
      console.log('Package 类参数对象不能为空');
    } else {
      this.targetPath = opts.targetPath;
      this.storePath = opts.storePath;
      this.packageName = opts.packageName;
      this.packageVersion = opts.packageVersion;
    }
  }
  //判断当前Package是否存在
  exists() {}
  // 安装
  install() {}
  // 更新
  update() {}
  //获取入口文件的路径
  getRootPath() {}
}

module.exports = Package;
