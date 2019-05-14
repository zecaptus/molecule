const fs = require('fs');
const yaml = require('js-yaml');

function yml2json(path) {
  return yaml.safeLoad(fs.readFileSync(path, 'utf8'));
}

module.exports = {
  yml2json,
};
