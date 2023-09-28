"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const swagger_parser_1 = __importDefault(require("@apidevtools/swagger-parser"));
const openapi_types_1 = require("openapi-types");
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
    constructor() {
        var _a;
        this.spec = defaultOAS;
        this.tags = new Proxy((_a = this.spec.tags) !== null && _a !== void 0 ? _a : [], {
            // @ts-ignore
            context: this,
            get(source, property) {
                if (property === 'names')
                    return source.map((tag) => typeof tag === 'string' ? tag : tag.name);
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
    validate() {
        return __awaiter(this, void 0, void 0, function* () {
            yield swagger_parser_1.default.validate(this.spec);
        });
    }
    // init oas with package.json
    init(modulePath) {
        return __awaiter(this, void 0, void 0, function* () {
            const { version, name, description, } = require(`${modulePath}/package.json`);
            this.spec.info = {
                version,
                title: name,
                description,
            };
        });
    }
    isOperation(x, method) {
        return Object.values(openapi_types_1.OpenAPIV3.HttpMethods).includes(method);
    }
    searchOperation(spec, name) {
        var _a;
        const operations = [];
        const paths = spec.paths;
        if (!paths)
            return [];
        for (const path in paths) {
            const pathItem = paths[path];
            if (!pathItem)
                return operations;
            for (const [method, operation] of Object.entries(pathItem)) {
                if (this.isOperation(operation, method)) {
                    const tags = (_a = operation.tags) !== null && _a !== void 0 ? _a : [];
                    if (!tags.includes(name))
                        operation.tags = [...tags, name];
                    operations.push(Object.assign({ path, method: method }, operation));
                }
            }
        }
        return operations;
    }
    addComponent(component) {
        if (!(0, lodash_1.find)(this.tags, (tag) => (typeof tag === 'string' ? tag : tag.name) === component.name)) {
            const tag = { name: component.name };
            if (component.spec.description) {
                tag.description = component.spec.description;
                delete component.spec.description;
            }
            this.tags.push(tag);
        }
        const operations = this.searchOperation(Object.assign({}, component.spec), component.name);
        (0, lodash_1.merge)(this.spec, component.spec);
        return operations;
    }
}
exports.default = OAS;
