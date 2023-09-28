import { AppOptions } from '..';

import fs from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';
import mm from 'micromatch';
import { merge } from 'lodash';
import { OpenAPIV3 } from 'openapi-types';

type ExtendedOperationObject = {
  ['x-controller']: string[];
};

type MoleculeComponentSpec = {
  description?: string;
  paths?: OpenAPIV3.PathsObject<ExtendedOperationObject>;
  components?: OpenAPIV3.ComponentsObject;
};

class Component {
  name: string;
  path: string;
  module: any;
  spec: MoleculeComponentSpec;

  isSwaggerFile: (filePattern: string) => boolean;

  constructor(name: string, path: string, options: AppOptions) {
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
    return new Promise<void>((resolve) => {
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

  async requireYml(filename: string) {
    return new Promise((resolve) => {
      const doc = yaml.load(fs.readFileSync(join(this.path, filename), 'utf8'));
      resolve(doc);
    });
  }

  // check if controllers exists
  valid(): boolean {
    const { paths } = this.spec;

    if (!paths) return false;

    return Object.keys(paths).some((path) =>
      Object.keys(paths[path] ?? {}).some((method) => {
        const controllers = (
          paths[path] as OpenAPIV3.PathItemObject<ExtendedOperationObject>
        )[method as OpenAPIV3.HttpMethods]?.['x-controller'];
        if (!controllers) return false;
        return ([] as string[])
          .concat(controllers)
          .some((controller) =>
            Object.hasOwnProperty.call(this.module, controller),
          );
      }),
    );
  }
}

export default Component;
