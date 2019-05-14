const { merge, set } = require('lodash');

class OAS {
  constructor(spec) {
    this.spec = spec;
  }

  add(json) {
    console.log('add');
    merge(this.spec, json);
  }

  set(path, value) {
    set(this.spec, path, value);
  }
}

module.exports = OAS;
