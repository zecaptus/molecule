const { merge, find } = require('lodash');
const swaggerParser = require('swagger-parser');

const defaultOAS = {
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

class OAS {
  constructor(spec) {
    this.spec = defaultOAS;

    this.tags = new Proxy(this.spec.tags, {
      context: this,
      get(source, property) {
        if (property === 'names')
          return source.map(tag => (typeof tag === 'string' ? tag : tag.name));
        return source[property];
      },
      set(source, property, value) {
        this.context.spec.tags[property] = value;
        return true;
      },
    });
  }

  async validate() {
    this.spec = await swaggerParser.validate(this.spec);
  }

  // init oas with package.json
  async init(modulePath) {
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

  addComponent(component) {
    if (
      !find(
        this.tags,
        tag => (typeof tag === 'string' ? tag : tag.name) === component.name,
      )
    ) {
      const tag = { name: component.name };

      if (component.spec.description) {
        tag.description = component.spec.description;
        delete component.spec.description;
      }

      this.tags.push(tag);
    }

    const spec = { ...component.spec };
    const operations = [];
    Object.keys(spec.paths).forEach(path => {
      Object.keys(spec.paths[path]).forEach(method => {
        const tags = spec.paths[path][method].tags || [];

        if (!tags.includes(component.name))
          spec.paths[path][method].tags = [...tags, component.name];

        operations.push({
          path,
          method,
          ...spec.paths[path][method],
        });
      });
    });

    merge(this.spec, component.spec);
    return operations;
  }
}

module.exports = OAS;
