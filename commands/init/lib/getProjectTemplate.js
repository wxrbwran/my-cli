const request = require('@xzl-cli-dev/request');

module.exports = function () {
  return request({
    url: "/project/template",
    method: 'GET',
  })
}
