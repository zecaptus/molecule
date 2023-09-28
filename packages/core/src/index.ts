import './utils/console';
import { dirname } from 'path';
import Koa from 'koa';
import Router from 'koa-router';
import OAS from './lib/OAS';
import AsyncLogger from './lib/AsyncLogger';
//@ts-ignore
import swaggerUi from '@molecule/swagger-ui';
import tracker from './middlewares/requestTracker';
import boot from './utils/boot';
import { initComponents } from './utils/init';
import open from 'react-dev-utils/openBrowser';

export type AppOptions = {
  componentsPath: string;
  swaggerFilePattern: string;
};

class MoleculeApp {
  options: AppOptions;
  modulePath: string;
  started: boolean;
  port: number;
  router: Router;
  oas: OAS;
  info: AsyncLogger | undefined;

  constructor(modulePath: string, options: AppOptions) {
    this.options = options;
    this.modulePath = modulePath;
    this.oas = new OAS();
    this.started = false;
    this.router = new Router();
    this.port = process.env.PORT ? Number(process.env.PORT) : 3000;

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

    this.info?.clear(`Listen: http://localhost:${this.port}`);
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
function createApp(
  options: AppOptions = {
    componentsPath: './components',
    swaggerFilePattern: '*.swagger.yml',
  },
) {
  const modulePath = dirname(require.main?.filename ?? '');
  return new MoleculeApp(modulePath, options);
}

export { MoleculeApp, createApp };
