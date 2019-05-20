const swaggerParser = require('swagger-parser');
const { dirname, join } = require('path');
const Koa = require('koa');
const Router = require('koa-router');
const swaggerUi = require('@molecule/swagger-ui');
const components = require('./components');
const { yml2json } = require('./utils');
const OAS = require('./OAS');
const { createMiddleware } = require('./middlewares');

class MoleculeApp {
  constructor(modulePath, oas) {
    this.modulePath = modulePath;
    this.oas = oas;
    this.started = false;
    this.router = new Router();

    this.initApp();
  }

  async initApp() {
    await this.initComponents();
  }

  async initComponents() {
    const comps = await components.getComponents(this.modulePath);

    comps.forEach(comp => {
      console.log(comp);
      const operations = this.oas.addComponent(comp);

      /**
       * init routing
       */
      operations.forEach(
        ({ method, path, operationId, 'x-middlewares': middlewares }) => {
          console.log(`init : ${method.toUpperCase()} ${path}`);
          console.log(`\tmiddlewares: ${middlewares}`);
          console.log(`\thandler: ${operationId}`);
          const handlers = [...(middlewares || []), operationId].map(handler =>
            createMiddleware(handler, comp.module),
          );
          this.router[method](path, ...handlers);
        },
      );
    });
  }

  start() {
    const server = new Koa();

    server.use(
      swaggerUi('/docs', {
        spec: this.oas.spec,
      }),
    );

    server.use(this.router.routes());

    this.started = true;
    server.listen(3000);
  }

  async addDoc(path) {
    const doc = await yml2json(join(this.modulePath, path));
    this.spec.paths = { ...this.spec.paths, ...doc.paths };
  }
}

async function createApp(options) {
  const { api } = options;
  const modulePath = dirname(module.parent.filename);

  const spec = await swaggerParser.parse(join(modulePath, api));
  return new MoleculeApp(modulePath, new OAS(spec));
}

module.exports = {
  createApp,
};
