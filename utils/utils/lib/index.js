'use strict';

module.exports = {
  isObject(o) {
    return Object.prototype.toString.call(o) === '[object Object]';
  },
};
