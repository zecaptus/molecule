import fs from 'fs';
import { join } from 'path';
import Component from '../lib/Component';
import { createMiddleware } from '../middlewares';
import { MoleculeApp } from '..';

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
async function getComponents(path: string, options = {}) {
  const opt = {
    componentsPath: './components',
    swaggerFilePattern: '*.swagger.yml',
    ...options,
  };

  const componentsDir = fs
    .readdirSync(join(path, opt.componentsPath), {
      withFileTypes: true,
    })
    .filter((data) => data.isDirectory());

  return Promise.all(
    componentsDir.map(async (c) => {
      const component = new Component(c.name, path, opt);
      await component.init();
      component.valid();
      return component;
    }),
  );
}

async function initComponents(this: MoleculeApp) {
  const comps = await getComponents(this.modulePath, this.options);

  comps.forEach((comp) => {
    const operations = this.oas.addComponent(comp);

    /**
     * init routing
     */
    operations?.forEach(
      ({ method, path, operationId, 'x-middlewares': middlewares }) => {
        const handlers = [...(middlewares ?? []), operationId].map(
          (handler) => handler && createMiddleware(handler, comp.module),
        );

        //@ts-ignore
        this.router[method](path, ...handlers);
      },
    );
  });
}

export { initComponents };
