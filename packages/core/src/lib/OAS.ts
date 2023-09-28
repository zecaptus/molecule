import { merge, find } from 'lodash';
import SwaggerParser from '@apidevtools/swagger-parser';
import { OpenAPIV3 } from 'openapi-types';
import Component from './Component';

const defaultOAS: OpenAPIV3.Document = {
  openapi: '3.0.0',
  info: {
    version: '1.0.0',
    title: 'molecule app',
    description: 'default molecule app description',
  },
  servers: [],
  tags: [],
  components: {},
  paths: {},
};

type Operation = {
  path: string;
  method: OpenAPIV3.HttpMethods;
  operationId?: string;
  'x-middlewares'?: string[];
} & OpenAPIV3.PathItemObject;

class OAS {
  spec: OpenAPIV3.Document;
  tags: OpenAPIV3.TagObject[];

  constructor() {
    this.spec = defaultOAS;

    this.tags = new Proxy(this.spec.tags ?? [], {
      // @ts-ignore
      context: this,
      get(source, property) {
        if (property === 'names')
          return source.map((tag) =>
            typeof tag === 'string' ? tag : tag.name,
          );
        // @ts-ignore
        return source[property];
      },
      set(source, property, value) {
        // @ts-ignore
        this.context.spec.tags[property] = value;
        return true;
      },
    });
  }

  async validate() {
    await SwaggerParser.validate(this.spec);
  }

  // init oas with package.json
  async init(modulePath: string) {
    const {
      version,
      name,
      description,
    } = require(`${modulePath}/package.json`);

    this.spec.info = {
      version,
      title: name,
      description,
    };
  }

  isOperation(x: any, method: string): x is OpenAPIV3.OperationObject {
    return Object.values<string>(OpenAPIV3.HttpMethods).includes(method);
  }

  searchOperation(spec: Component['spec'], name: string) {
    const operations: Operation[] = [];

    const paths = spec.paths;
    if (!paths) return [];

    for (const path in paths) {
      const pathItem = paths[path];
      if (!pathItem) return operations;

      for (const [method, operation] of Object.entries(pathItem)) {
        if (this.isOperation(operation, method)) {
          const tags = operation.tags ?? [];

          if (!tags.includes(name)) operation.tags = [...tags, name];

          operations.push({
            path,
            method: method as OpenAPIV3.HttpMethods,
            ...operation,
          });
        }
      }
    }
    return operations;
  }

  addComponent(component: Component) {
    if (
      !find(
        this.tags,
        (tag) => (typeof tag === 'string' ? tag : tag.name) === component.name,
      )
    ) {
      const tag: OpenAPIV3.TagObject = { name: component.name };

      if (component.spec.description) {
        tag.description = component.spec.description;
        delete component.spec.description;
      }

      this.tags.push(tag);
    }

    const operations = this.searchOperation(
      { ...component.spec },
      component.name,
    );

    merge(this.spec, component.spec);

    return operations;
  }
}

export default OAS;
