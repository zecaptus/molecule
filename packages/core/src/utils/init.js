const fs = require('fs');
const { join } = require('path');
const Component = require('../lib/Component');
const { createMiddleware } = require('../middlewares');

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
async function getComponents(path, options = {}) {
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

async function initComponents() {
  const comps = await getComponents(this.modulePath, this.options);

  comps.forEach(comp => {
    const operations = this.oas.addComponent(comp);

    /**
     * init routing
     */
    operations.forEach(
      ({ method, path, operationId, 'x-middlewares': middlewares }) => {
        const handlers = [...(middlewares || []), operationId].map(handler =>
          createMiddleware(handler, comp.module),
        );
        this.router[method](path, ...handlers);
      },
    );
  });
}

module.exports = {
  initComponents,
};
