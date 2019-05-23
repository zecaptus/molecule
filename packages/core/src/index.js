require('./utils/console');
const swaggerParser = require('swagger-parser');
const { dirname, join } = require('path');
const Koa = require('koa');
const Router = require('koa-router');
const swaggerUi = require('@molecule/swagger-ui');
const components = require('./components');
const OAS = require('./OAS');
const { createMiddleware } = require('./middlewares');
const tracker = require('./middlewares/requestTracker');
const boot = require('./utils/boot');
const chalk = require('chalk');
const open = require('react-dev-utils/openBrowser');

class MoleculeApp {
  constructor(modulePath, oas) {
    this.modulePath = modulePath;
    this.oas = oas;
    this.started = false;
    this.router = new Router();
    this.info = null;
    this.port = process.env.PORT || 3000;

    this.init();
  }

  async init() {
    const { info, port } = await boot(this.port);
    this.port = port;
    this.info = info;

    info.update('init components');
    await this.initComponents();

    this.start();
  }

  start() {
    const server = new Koa();

    server.use(tracker);
    server.use(
      swaggerUi('/docs', {
        spec: this.oas.spec,
      }),
    );

    server.use(this.router.routes());

    this.started = true;
    server.listen(this.port);

    this.info.clear(`Your api is live on: http://localhost:${this.port}`);
    open(`http://localhost:${this.port}/docs`);
  }

  async initComponents() {
    const comps = await components.getComponents(this.modulePath);

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
}

function createApp(options) {
  const modulePath = dirname(module.parent.filename);
  return new MoleculeApp(modulePath, new OAS());
}

module.exports = {
  createApp,
};
