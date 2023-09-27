require('./utils/console');
const { dirname, join } = require('path');
const Koa = require('koa');
const Router = require('koa-router');
const swaggerUi = require('@molecule/swagger-ui');
const OAS = require('./lib/OAS');
const tracker = require('./middlewares/requestTracker');
const boot = require('./utils/boot');
const { initComponents } = require('./utils/init');
const open = require('react-dev-utils/openBrowser');

class MoleculeApp {
  constructor(modulePath, options) {
    this.options = options;
    this.modulePath = modulePath;
    this.oas = new OAS();
    this.started = false;
    this.router = new Router();
    this.info = null;
    this.port = process.env.PORT || 3000;

    this.init();
  }

  async init() {
    const { info, port } = await boot(this.port);
    this.info = info;
    this.port = port;

    info.update('init: OpenApi Object');
    await this.oas.init(this.modulePath);

    info.update('init: components');
    await initComponents.apply(this);

    info.update('validate: OpenApi Object');
    await this.oas.validate();

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

    this.info.clear(`Listen: http://localhost:${this.port}`);
    open(`http://localhost:${this.port}/docs`);
  }
}

/**
 * options
 * ========
 *
 * componentsPath: './components',
 * swaggerFilePattern: '*.swagger.yml',
 */
function createApp(options = {}) {
  const modulePath = dirname(module.parent.filename);
  return new MoleculeApp(modulePath, options);
}

module.exports = {
  createApp,
};
