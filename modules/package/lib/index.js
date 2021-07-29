'use strict';
const path = require('path');
const fs = require('fs-extra');
const npminstall = require('npminstall');
const pkgDir = require('pkg-dir').sync;
const pathExists = require('path-exists').sync;
const utils = require('@xzl-cli-dev/utils');
const { formatPath } = require('@xzl-cli-dev/format-path');
const {
  getNpmInfo,
  getDefaultRegistry,
  getNpmLastestVersion,
} = require('@xzl-cli-dev/get-npm-info');

class Package {
  constructor(opts) {
    if (!opts || !utils.isObject(opts)) {
      console.log('Package 类参数对象不能为空');
    } else {
      this.targetPath = opts.targetPath;
      this.storeDir = opts.storeDir;
      this.packageName = opts.packageName;
      this.packageVersion = opts.packageVersion;
      this.cacheFilePathPrefix = this.packageName.replace('/', '_');
    }
  }
  get cacheFilePath() {
    return path.resolve(
      this.storeDir,
      `_${this.cacheFilePathPrefix}@${this.packageVersion}@${this.packageName}`,
    );
  }

  getSpecCacheFilePath(packageVersion) {
    return path.resolve(
      this.storeDir,
      `_${this.cacheFilePathPrefix}@${packageVersion}@${this.packageName}`,
    );
  }
  //判断当前Package是否存在
  async exists() {
    if (this.storeDir) {
      // 缓存模式
      await this.prepare();
      console.log('prepare11', this.cacheFilePath);
      return pathExists(this.cacheFilePath);
    } else {
      return pathExists(this.targetPath);
    }
  }
  async prepare() {
    if (this.storeDir && !pathExists(this.storeDir)) {
      fs.mkdirpSync(this.storeDir);
    }
    if (this.packageVersion === 'latest') {
      this.packageVersion = await getNpmLastestVersion(this.packageName);
    }
    // console.log('prepare', this.packageVersion);
  }
  // 安装
  async install() {
    // console.log('this', this);
    await this.prepare();
    await npminstall({
      root: this.targetPath,
      storeDir: this.storeDir,
      registry: getDefaultRegistry(),
      pkgs: [{ name: this.packageName, version: this.packageVersion }],
    });
  }
  // 更新
  async update() {
    await this.prepare();
    const lstestVersion = await getNpmLastestVersion(this.packageName);
    const latestFilePath = this.getSpecCacheFilePath(lstestVersion);
    if (!pathExists(latestFilePath)) {
      await npminstall({
        root: this.targetPath,
        storeDir: this.storeDir,
        registry: getDefaultRegistry(),
        pkgs: [{ name: this.packageName, version: lstestVersion }],
      });
      this.packageVersion = lstestVersion;
    }
    // return latestFilePath;
  }
  //获取入口文件的路径
  getRootPath() {
    const fn = (pathParam) => {
      const dir = pkgDir(pathParam);
      if (dir) {
        const pkgFile = require(path.resolve(dir, 'package.json'));
        // console.log('pkgFile', pkgFile);
        if (pkgFile && (pkgFile.main || pkgFile.lib)) {
          return formatPath(path.resolve(dir, pkgFile.main));
        }
      }
      return null;
    };
    if (this.storeDir) {
      return fn(this.cacheFilePath);
    } else {
      return fn(this.targetPath);
    }
  }
}

module.exports = Package;
