'use strict';

const axios = require('axios');
const urlJoin = require('url-join');
const semver = require('semver');

function getNpmInfo(npmName, registry) {
  if (!npmName) {
    return null;
  }
  const curRegistry = registry || getDefaultRegistry();
  const npmInfoUrl = urlJoin(curRegistry, npmName);
  // console.log(npmInfoUrl);
  return axios
    .get(npmInfoUrl)
    .then((res) => {
      // console.log(res);
      if (res.status === 200) {
        return res.data;
      }
      return null;
    })
    .catch((err) => {
      return new Promise.reject(err);
    });
}
async function getNpmVersions(npmName, registry) {
  const data = await getNpmInfo(npmName, registry);
  if (data) {
    return Object.keys(data.versions);
  } else {
    return [];
  }
}

function getSemserVersions(baseVersion, versions) {
  return versions
    .filter((version) => semver.satisfies(version, `^${baseVersion}`))
    .sort((a, b) => semver.gt(b, a));
}

async function getNpmSemserVersions(npmName, baseVersion, registry) {
  const versions = await getNpmVersions(npmName, registry);
  const newVersions = getSemserVersions(baseVersion, versions);
  if (newVersions?.length > 1) {
    return newVersions[0];
  }
  return null;
}

function getDefaultRegistry(isOriginal = false) {
  if (isOriginal) {
    return 'https://registry.npm.org';
  }

  return 'https://registry.npm.taobao.org';
}

module.exports = {
  getNpmInfo,
  getNpmVersions,
  getDefaultRegistry,
  getNpmSemserVersions,
};
