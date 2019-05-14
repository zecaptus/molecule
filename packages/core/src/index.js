const swaggerParser = require('swagger-parser');
const { dirname, join } = require('path');
const Koa = require('koa');
const swaggerUi = require('@molecule/swagger-ui');
const components = require('./components');
const { yml2json } = require('./utils');
const OAS = require('./OAS');

class MoleculeApp {
  constructor(modulePath, oas) {
    this.modulePath = modulePath;
    this.oas = oas;
    this.started = false;

    this.initComponents();
  }

  async initComponents() {
    const comps = await components.getComponents(this.modulePath);
    comps.forEach(comp => this.oas.add(comp.spec));
  }

  start() {
    const server = new Koa();

    server.use(
      swaggerUi('/docs', {
        spec: this.oas.spec,
      }),
    );

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
