const fs = require('fs');
const { join } = require('path');
const yaml = require('js-yaml');
const mm = require('micromatch');
const { merge } = require('lodash');

class Component {
  constructor(name, path, options) {
    this.name = name;
    this.path = join(path, options.componentsPath, name);
    this.module = null;
    this.spec = {};

    this.isSwaggerFile = mm.matcher(options.swaggerFilePattern);
  }

  async init() {
    return Promise.all([this.require(), this.extractSpec()]);
  }

  async require() {
    return new Promise((resolve) => {
      this.module = require(this.path);
      resolve();
    });
  }

  async extractSpec() {
    const swaggerFiles = fs
      .readdirSync(this.path)
      .filter((file) => this.isSwaggerFile(file));

    const docs = await Promise.all(
      swaggerFiles.map((file) => this.requireYml(file)),
    );

    merge(this.spec, ...docs);
  }

  async requireYml(filename) {
    return new Promise((resolve) => {
      const doc = yaml.load(fs.readFileSync(join(this.path, filename), 'utf8'));
      resolve(doc);
    });
  }

  // check if controllers exists
  valid() {
    const { paths } = this.spec;

    return Object.keys(paths).some((path) =>
      Object.keys(paths[path]).some((method) => {
        const controllers = paths[path][method]['x-controller'];
        if (!controllers) return false;
        return []
          .concat(controllers)
          .some((controller) =>
            Object.hasOwnProperty.call(this.module, controller),
          );
      }),
    );
  }
}

module.exports = Component;
