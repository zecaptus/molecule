const swaggerParser = require("swagger-parser");
const { dirname, join } = require("path");
const Koa = require("koa");
const Router = require("koa-router");
const swaggerUi = require("@molecule/swagger-ui");
const components = require("./components");
const { getProcessForPort, choosePort } = require("./utils/port");
const OAS = require("./OAS");
const { createMiddleware } = require("./middlewares");
const tracker = require("./middlewares/requestTracker");
const gradient = require("gradient-string");
const { version } = require("../package.json");
require("./utils/console");

class MoleculeApp {
  constructor(modulePath, oas) {
    this.modulePath = modulePath;
    this.oas = oas;
    this.started = false;
    this.router = new Router();
    this.info = null;
    this.port = process.env.PORT || 3000;

    this.sign();
    this.init();
  }

  sign() {
    console.clear();
    console.log("");
    console.log(
      gradient("#61affe", "white").multiline(
        [
          "              __             __   ",
          "  __ _  ___  / /__ ______ __/ /__ ",
          " /  ' \\/ _ \\/ / -_) __/ // / / -_)",
          "/_/_/_/\\___/_/\\__/\\__/\\_,_/_/\\__/ ",
          `_________________________________v${version}`
        ].join("\n")
      )
    );
    console.log("");
    this.info = console.draft();
    console.log(
      gradient("#61affe", "white")("________________________________________")
    );
    console.log("");
  }

  async init() {
    this.info("checking port:", this.port);
    try {
      this.port = await choosePort(this.port);
      this.sign();
    } catch (e) {
      console.log(e);
    }

    this.info("init components");
    await this.initComponents();

    this.start();
  }

  start() {
    const server = new Koa();

    server.use(tracker);
    server.use(
      swaggerUi("/docs", {
        spec: this.oas.spec
      })
    );

    server.use(this.router.routes());

    this.started = true;
    server.listen(this.port);

    //console.log(getProcessForPort(this.port));
    this.info(`listening on port ${this.port}`);
  }

  async initComponents() {
    const comps = await components.getComponents(this.modulePath);

    comps.forEach(comp => {
      const operations = this.oas.addComponent(comp);

      /**
       * init routing
       */
      operations.forEach(
        ({ method, path, operationId, "x-middlewares": middlewares }) => {
          const handlers = [...(middlewares || []), operationId].map(handler =>
            createMiddleware(handler, comp.module)
          );
          this.router[method](path, ...handlers);
        }
      );
    });
  }
}

function createApp(options) {
  const modulePath = dirname(module.parent.filename);
  return new MoleculeApp(modulePath, new OAS());
}

module.exports = {
  createApp
};
