'use strict';
const path = require('path');

module.exports = {
  formatPath(p) {
    if (p && typeof p === 'string') {
      const sep = path.sep;
      if (sep === '/') {
        return p;
      } else {
        return p.replace(/\\/g, '/');
      }
    }
    return p;
  },
};
