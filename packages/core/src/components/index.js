const fs = require('fs');
const { join } = require('path');
const yaml = require('js-yaml');
const uuid = require('uuid/v4');

/**
 * @typedef { object } options
 * @property { string } componentsPath where component are located, default: ./components
 * @property { string } swaggerFilePattern how to find swaggerfiles, default: *.swagger.yml
 */

/**
 * @param { string } path  caller path
 * @param { options } options  optionnal options
 * @return { array } array of Component
 */
async function getComponents(path, options) {
  const opt = {
    componentsPath: './components',
    swaggerFilePattern: '*.swagger.yml',
    ...options,
  };

  const componentsDir = fs
    .readdirSync(join(path, opt.componentsPath), {
      withFileTypes: true,
    })
    .filter(data => data.isDirectory());

  return Promise.all(
    componentsDir.map(async c => {
      const component = new Component(c.name, path, opt);
      await component.init();
      component.valid();
      return component;
    }),
  );
}

class Component {
  constructor(name, path, options) {
    this.name = name;
    this.path = join(path, options.componentsPath, name);
    this.module = null;
    this.spec = null;
  }

  async init() {
    return Promise.all([this.require(), this.extractSpec()]);
  }

  async require() {
    return new Promise(resolve => {
      this.module = require(this.path);
      resolve();
    });
  }

  async extractSpec() {
    return new Promise(resolve => {
      this.spec = yaml.safeLoad(
        fs.readFileSync(join(this.path, `${this.name}.yml`), 'utf8'),
      );
      resolve();
    });
  }

  // check if controllers exists
  valid() {
    const { paths } = this.spec;

    return Object.keys(paths).some(path =>
      Object.keys(paths[path]).some(method => {
        const controllers = paths[path][method]['x-controller'];
        if (!controllers) return false;
        return []
          .concat(controllers)
          .some(controller =>
            Object.hasOwnProperty.call(this.module, controller),
          );
      }),
    );
  }
}

module.exports = {
  getComponents,
};
